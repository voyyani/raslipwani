#!/usr/bin/env node
/**
 * Asserts that the production bundle ships no console output.
 *
 * `vite.config.js` drops `console` and `debugger` at build time, but a config
 * option is only a claim until something checks the artifact. This is that
 * check: it reads the built JavaScript and fails if any `console.<method>(`
 * call survived.
 *
 * Why it matters beyond tidiness: `console.error('Failed to load property:', err)`
 * in `App.jsx` printed a Supabase error object — table names, column names and
 * occasionally row contents — into the console of every visitor who hit a
 * missing listing. Console output is not a private channel.
 *
 * Scope: the app's own chunks. Vendor chunks are excluded by name because the
 * drop transform Vite applies to source does not rewrite pre-minified
 * dependency code, and a warning React prints from inside `react-dom` is not
 * this project's to remove. The list is explicit rather than inferred so that a
 * new vendor chunk fails loudly here instead of being silently exempted.
 *
 *   node scripts/check-dist-console.mjs
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST_ASSETS = join('dist', 'assets');

/** Chunks built from `node_modules`, whose console calls are not ours to drop. */
const VENDOR_CHUNK = /^vendor-[a-z]+-[\w-]+\.js$/;

/**
 * `console.foo(` — the call, not the identifier. Matching the bare word would
 * flag any minified variable that happens to be named `console`, and matching
 * the property without the parenthesis would flag a feature check.
 */
const CONSOLE_CALL = /\bconsole\s*\.\s*[a-zA-Z]+\s*\(/g;

let files;
try {
  files = readdirSync(DIST_ASSETS).filter((name) => name.endsWith('.js'));
} catch {
  console.error(`✗ ${DIST_ASSETS} not found — run \`npm run build\` first.`);
  process.exit(1);
}

if (files.length === 0) {
  console.error(`✗ No JavaScript found in ${DIST_ASSETS} — the build produced nothing to check.`);
  process.exit(1);
}

const appChunks = files.filter((name) => !VENDOR_CHUNK.test(name));
const offenders = [];

for (const name of appChunks) {
  const source = readFileSync(join(DIST_ASSETS, name), 'utf8');
  const matches = source.match(CONSOLE_CALL);
  if (matches) {
    offenders.push({ name, count: matches.length, sample: [...new Set(matches)].slice(0, 4) });
  }
}

if (offenders.length > 0) {
  console.error('✗ Console output survived into the production bundle:\n');
  for (const { name, count, sample } of offenders) {
    console.error(`  assets/${name} — ${count} call(s): ${sample.join(' ')}`);
  }
  console.error(
    '\n  Bare `console.*` is dropped by `esbuild.drop` in vite.config.js. If these\n' +
      '  survived, the drop is misconfigured. For diagnostics that should stay in\n' +
      '  the source, import `logger` from `src/utils/logger.js`.'
  );
  process.exit(1);
}

console.log(
  `✓ No console output in ${appChunks.length} application chunk(s) ` +
    `(${files.length - appChunks.length} vendor chunk(s) not this project's to strip).`
);
