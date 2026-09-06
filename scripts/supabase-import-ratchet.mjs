#!/usr/bin/env node
/**
 * Enforces a falling ceiling on components and pages that import the Supabase
 * client directly.
 *
 * ROADMAP.md Block 3.1 asks for one module per domain under src/services/, with
 * every query behind a named, testable function. Twenty-two files stand between
 * here and there, and a lint rule that fails the build on arrival with
 * twenty-two violations gets switched off within a day — so this is a ceiling
 * that only falls, exactly like palette-budget.json.
 *
 * When it reaches 0, Task 17 deletes this script and replaces it with a
 * `no-restricted-imports` ESLint error, which is strictly better: an error
 * cannot be satisfied by deleting a file.
 *
 *   node scripts/supabase-import-ratchet.mjs            check against the budget
 *   node scripts/supabase-import-ratchet.mjs --update   lower the budget to current
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const BUDGET_FILE = 'supabase-import-budget.json';
const ROOTS = ['src/components', 'src/pages'];

// `from '<anything>supabaseClient'` — alias or relative, single or double quotes,
// static import or dynamic. A bare mention of the word in prose does not match.
const IMPORT_RE = /from\s+['"][^'"]*supabaseClient['"]|import\(\s*['"][^'"]*supabaseClient['"]/;

/**
 * @param {Record<string,string>} files path -> source text
 * @returns {string[]} the paths that import the client, sorted
 */
export function countDirectImports(files) {
  return Object.entries(files)
    .filter(([path]) => ROOTS.some((root) => path.startsWith(root)))
    .filter(([path]) => !path.includes('__tests__'))
    .filter(([, source]) => IMPORT_RE.test(source))
    .map(([path]) => path)
    .sort();
}

function readTree(dir, acc = {}) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) readTree(full, acc);
    else if (/\.jsx?$/.test(entry)) acc[relative(process.cwd(), full)] = readFileSync(full, 'utf8');
  }
  return acc;
}

// Guarded so the unit test can import `countDirectImports` without running the CLI.
if (process.argv[1]?.endsWith('supabase-import-ratchet.mjs')) {
  const files = ROOTS.reduce((acc, root) => readTree(root, acc), {});
  const offenders = countDirectImports(files);
  const total = offenders.length;
  const budget = JSON.parse(readFileSync(BUDGET_FILE, 'utf8'));

  console.log(`Direct Supabase imports in components/pages: ${total} (ceiling ${budget.max})`);
  for (const file of offenders) console.log(`  ${file}`);

  if (process.argv.includes('--update')) {
    if (total > budget.max) {
      console.error(
        `\nRefusing to raise the ceiling from ${budget.max} to ${total}. ` +
          'This budget only falls — that is what makes it a ratchet.'
      );
      process.exit(1);
    }
    writeFileSync(BUDGET_FILE, `${JSON.stringify({ ...budget, max: total }, null, 2)}\n`);
    console.log(`\nCeiling lowered ${budget.max} -> ${total}.`);
    process.exit(0);
  }

  if (total > budget.max) {
    console.error(
      `\n${total - budget.max} file(s) over the ceiling of ${budget.max}.\n` +
        'Query through a module in src/services/ instead of importing the client here.\n'
    );
    process.exit(1);
  }

  if (total < budget.max) {
    console.log(
      `\n${budget.max - total} under the ceiling. Run ` +
        '`npm run supabase:ratchet -- --update` to bank the gain so it cannot be given back.'
    );
  }
}
