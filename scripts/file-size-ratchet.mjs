#!/usr/bin/env node
/**
 * Enforces a falling ceiling on the longest source file.
 *
 * ROADMAP.md Block 3.2 wants nothing over 300 lines. A hard 300-line rule
 * would fail the build on arrival for every file already over it and be
 * switched off the same afternoon, so this is a ceiling that only falls — the
 * same instrument as palette-budget.json and bundle-budget.json.
 *
 * Tests are excluded. A thorough test file is long for a good reason, and a
 * ceiling that punishes it teaches people to write fewer assertions.
 *
 *   node scripts/file-size-ratchet.mjs            check against the budget
 *   node scripts/file-size-ratchet.mjs --update   lower the budget to current
 *
 * `--update` refuses to raise the ceiling. That is the ratchet.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const BUDGET_FILE = 'file-size-budget.json';
const ROOT = 'src';

/** @param {Record<string,string>} files @returns {{path:string,lines:number}[]} */
export function largestFiles(files) {
  return Object.entries(files)
    .filter(([path]) => !path.includes('__tests__') && !path.includes('/test/'))
    .map(([path, source]) => ({ path, lines: source.split('\n').length }))
    .sort((a, b) => b.lines - a.lines);
}

/**
 * The ratchet's decision, isolated from I/O so it can be tested directly:
 * lowering and holding are both allowed, raising is refused. Returns the new
 * ceiling, or `null` as the refusal sentinel when `currentMax` exceeds
 * `budgetMax`.
 * @param {number} currentMax @param {number} budgetMax @returns {number|null}
 */
export function nextCeiling(currentMax, budgetMax) {
  return currentMax > budgetMax ? null : currentMax;
}

function readTree(dir, acc = {}) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) readTree(full, acc);
    else if (/\.jsx?$/.test(entry)) acc[relative(process.cwd(), full)] = readFileSync(full, 'utf8');
  }
  return acc;
}

if (process.argv[1]?.endsWith('file-size-ratchet.mjs')) {
  const ranked = largestFiles(readTree(ROOT));
  const largest = ranked[0]?.lines ?? 0;
  const budget = JSON.parse(readFileSync(BUDGET_FILE, 'utf8'));
  const over = ranked.filter((entry) => entry.lines > budget.max);

  console.log(`Largest source file: ${largest} lines (ceiling ${budget.max})`);
  console.log('Ten largest:');
  for (const { path, lines } of ranked.slice(0, 10)) {
    console.log(`  ${String(lines).padStart(5)}  ${path}`);
  }

  if (process.argv.includes('--update')) {
    const updated = nextCeiling(largest, budget.max);
    if (updated === null) {
      console.error(
        `\nRefusing to raise the ceiling from ${budget.max} to ${largest}. ` +
          'This budget only falls — that is what makes it a ratchet.'
      );
      process.exit(1);
    }
    writeFileSync(BUDGET_FILE, `${JSON.stringify({ ...budget, max: updated }, null, 2)}\n`);
    console.log(`\nCeiling lowered ${budget.max} -> ${updated}.`);
    process.exit(0);
  }

  if (over.length > 0) {
    console.error(`\n${over.length} file(s) over the ceiling of ${budget.max}:`);
    for (const { path, lines } of over) console.error(`  ${lines}  ${path}`);
    console.error('\nSplit by responsibility, not by line count. See ROADMAP.md Block 3.2.\n');
    process.exit(1);
  }

  if (largest < budget.max) {
    console.log(
      `\n${budget.max - largest} under the ceiling. Run \`npm run size:ratchet -- --update\` ` +
        'to bank the gain so it cannot be given back.'
    );
  }
}
