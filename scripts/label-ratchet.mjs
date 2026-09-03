#!/usr/bin/env node
/**
 * Enforces a falling ceiling on form controls with no associated label.
 *
 * This is the same instrument as `palette-ratchet.mjs`, pointed at the largest
 * remaining accessibility defect in the codebase. A screen reader announces an
 * unlabelled control as nothing at all — "edit text", with no clue what it wants
 * — so a form full of them is not degraded, it is unusable.
 *
 * A ratchet rather than an error for the same reason the palette has one: there
 * were 96 of these, and a rule that fails the build on arrival gets switched off
 * within a day. A ceiling that only falls keeps every fix banked and makes the
 * remaining debt a number someone can watch shrink.
 *
 * The count comes from ESLint running `jsx-a11y/label-has-associated-control`,
 * not from a second definition here — two definitions of "labelled" would
 * eventually disagree, and CI would trust the one nobody reads.
 *
 * Note that `jsx-a11y/label-has-for` is deliberately *not* counted. It is
 * deprecated and double-counts this same rule, which is how the raw warning
 * total came to overstate this defect by a third.
 *
 *   node scripts/label-ratchet.mjs             check against the budget
 *   node scripts/label-ratchet.mjs --update    lower the budget to current
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { ESLint } from 'eslint';

const BUDGET_FILE = 'label-budget.json';
const RULE = 'jsx-a11y/label-has-associated-control';

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

console.log(`Unlabelled form controls in src/: ${total} (ceiling ${budget.max})`);
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
    `\n${total - budget.max} unlabelled control(s) over the ceiling of ${budget.max}.\n` +
      'Pair the label with its control (htmlFor + a matching id), or use the\n' +
      `Field primitive in src/components/ui, which does it for you.`
  );
  process.exit(1);
}

if (total < budget.max) {
  console.log(
    `\n${budget.max - total} under the ceiling. Run \`npm run label:ratchet -- --update\` ` +
      'to bank the gain so it cannot be given back.'
  );
}
