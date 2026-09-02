#!/usr/bin/env node
/**
 * Measures first-load transfer weight and enforces a budget.
 *
 * "First load" is not the size of `dist/` — most of that is lazy chunks a
 * visitor never fetches. It is exactly what `dist/index.html` tells the
 * browser to request before the app can render: the entry module, every
 * `modulepreload`, and the stylesheet. Reading it from the HTML means the
 * measurement tracks whatever the bundler actually decided, including new
 * vendor chunks nobody remembered to account for.
 *
 * Sizes are gzip, because that is what crosses the network.
 *
 * Why a budget file rather than a diff against main: Phase 6.1 recovered a
 * regression from ~275 kB to a fraction of it, and that gain is only durable
 * if exceeding it fails a build. Lowering `bundle-budget.json` is a deliberate
 * ratchet; raising it should require saying why in a commit message.
 *
 *   node scripts/bundle-report.mjs            check against budget
 *   node scripts/bundle-report.mjs --update   rewrite the budget to current
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const DIST = 'dist';
const BUDGET_FILE = 'bundle-budget.json';
const html = readFileSync(join(DIST, 'index.html'), 'utf8');

// The three tags that produce a blocking request for the initial render.
const patterns = [
  /<script[^>]+src="\/([^"]+)"/g,
  /<link[^>]+rel="modulepreload"[^>]+href="\/([^"]+)"/g,
  /<link[^>]+rel="stylesheet"[^>]+href="\/([^"]+)"/g,
];

const assets = [];
for (const re of patterns) {
  for (const [, path] of html.matchAll(re)) {
    const raw = readFileSync(join(DIST, path));
    assets.push({ path, raw: raw.length, gzip: gzipSync(raw).length });
  }
}

if (assets.length === 0) {
  console.error('✗ bundle report: no first-load assets found in dist/index.html');
  console.error('  Did the build run? Has the output format changed?');
  process.exit(1);
}

assets.sort((a, b) => b.gzip - a.gzip);
const totalGzip = assets.reduce((n, a) => n + a.gzip, 0);
const kb = (bytes) => (bytes / 1024).toFixed(1);
const currentKb = Number(kb(totalGzip));

if (process.argv.includes('--update')) {
  writeFileSync(
    BUDGET_FILE,
    JSON.stringify({ firstLoadGzipKb: currentKb }, null, 2) + '\n'
  );
  console.log(`✓ budget updated to ${currentKb} kB`);
  process.exit(0);
}

let budget;
try {
  budget = JSON.parse(readFileSync(BUDGET_FILE, 'utf8')).firstLoadGzipKb;
} catch {
  console.error(`✗ bundle report: ${BUDGET_FILE} is missing or unreadable.`);
  console.error('  Create it with: node scripts/bundle-report.mjs --update');
  process.exit(1);
}

const overBy = currentKb - budget;
const rows = assets
  .map((a) => `| \`${a.path}\` | ${kb(a.raw)} kB | **${kb(a.gzip)} kB** |`)
  .join('\n');

const verdict =
  overBy > 0
    ? `🔴 **Over budget by ${overBy.toFixed(1)} kB** (${currentKb} kB vs ${budget} kB)`
    : `✅ Within budget — ${currentKb} kB of ${budget} kB (${Math.abs(overBy).toFixed(1)} kB of headroom)`;

const report = `### First-load bundle

${verdict}

| Asset | Raw | Gzip |
|---|---:|---:|
${rows}
| **Total** | | **${currentKb} kB** |

<sub>First load = the entry module, its \`modulepreload\` graph, and the stylesheet, as declared by \`dist/index.html\`. Lazy chunks are excluded — a visitor does not pay for them.</sub>
`;

console.log(report);

// GitHub renders this on the workflow run page, so the number is visible
// without opening logs.
if (process.env.GITHUB_STEP_SUMMARY) {
  writeFileSync(process.env.GITHUB_STEP_SUMMARY, report, { flag: 'a' });
}

if (overBy > 0) {
  console.error(
    `\nBundle budget exceeded. Either trim the first-load graph — usually a\n` +
      `top-level import that should be lazy — or, if the growth is genuinely\n` +
      `warranted, raise ${BUDGET_FILE} in the same commit and say why.\n`
  );
  process.exit(1);
}
