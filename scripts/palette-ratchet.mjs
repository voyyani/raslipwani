#!/usr/bin/env node
/**
 * Enforces a falling ceiling on literal Tailwind palette classes.
 *
 * A ~3,000-site colour migration is the one kind of work a test suite cannot
 * verify: no assertion catches "this card now renders dark text on a dark
 * ground." What *can* be verified is that the debt only ever shrinks. So the
 * count is a budget, like `bundle-budget.json` and the coverage floor — CI fails
 * if it rises, and lowering it is a deliberate commit.
 *
 * The count comes from ESLint running the real rule, not from a second regex
 * here. Two independent definitions of "a palette class" would eventually
 * disagree, and the one CI trusted would be the one nobody was reading.
 *
 *   node scripts/palette-ratchet.mjs            check against the budget
 *   node scripts/palette-ratchet.mjs --update    lower the budget to current
 *
 * `--update` refuses to raise the ceiling. That is the ratchet.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { ESLint } from 'eslint';

const BUDGET_FILE = 'palette-budget.json';
const RULE = 'design/no-raw-palette-classes';

const eslint = new ESLint();
const results = await eslint.lintFiles(['src']);

const byFile = results
  .map((result) => ({
    file: result.filePath.replace(`${process.cwd()}/`, ''),
    count: result.messages.filter((m) => m.ruleId === RULE).length,
  }))
  .filter((entry) => entry.count > 0)
  .sort((a, b) => b.count - a.count);

const total = byFile.reduce((sum, entry) => sum + entry.count, 0);
const budget = JSON.parse(readFileSync(BUDGET_FILE, 'utf8'));

console.log(`Literal palette classes in src/: ${total} (ceiling ${budget.max})`);
console.log(`Across ${byFile.length} files. Heaviest:`);
for (const { file, count } of byFile.slice(0, 10)) {
  console.log(`  ${String(count).padStart(4)}  ${file}`);
}

if (process.argv.includes('--update')) {
  if (total > budget.max) {
    console.error(
      `\nRefusing to raise the ceiling from ${budget.max} to ${total}. ` +
        'This budget only falls — that is what makes it a ratchet.'
    );
    process.exit(1);
  }
  writeFileSync(
    BUDGET_FILE,
    `${JSON.stringify({ ...budget, max: total }, null, 2)}\n`
  );
  console.log(`\nCeiling lowered ${budget.max} → ${total}.`);
  process.exit(0);
}

if (total > budget.max) {
  console.error(
    `\n${total - budget.max} literal palette class(es) over the ceiling of ${budget.max}.\n` +
      'Use a semantic token from src/design/tokens.js, or explain the rise in a commit\n' +
      `that also edits ${BUDGET_FILE}.`
  );
  process.exit(1);
}

if (total < budget.max) {
  console.log(
    `\n${budget.max - total} under the ceiling. Run \`npm run palette:ratchet -- --update\` ` +
      'to bank the gain so it cannot be given back.'
  );
}
