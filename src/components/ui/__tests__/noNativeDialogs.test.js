import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const repoRoot = path.resolve(__dirname, '../../../..');

/** Every `.jsx`/`.js` under `src/`, excluding tests. */
function sourceFiles(dir = path.join(repoRoot, 'src'), acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__') sourceFiles(full, acc);
    } else if (/\.jsx?$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

/**
 * Strip block comments, line comments and template/quoted strings before
 * matching. Several of the files that *removed* a native dialog explain in prose
 * what they removed, and a guard rail that trips on its own documentation
 * teaches people to delete the documentation.
 */
function code(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
}

describe('native browser dialogs', () => {
  /**
   * Ten of these shipped: five `alert()` and five `confirm()` across eight
   * files. Two were not admin conveniences but live booking confirmations —
   * the highest-value moment in the customer journey, delivered as an unstyled,
   * thread-blocking browser dialog that no theme and no test could reach.
   *
   * They are replaced by `toast` and `useConfirm`. This test is what stops the
   * eleventh from being added, because each one individually always looks like
   * the pragmatic choice.
   */
  it('are not used anywhere in src/', () => {
    const offenders = [];

    for (const file of sourceFiles()) {
      const body = code(fs.readFileSync(file, 'utf8'));
      const rel = path.relative(repoRoot, file);

      // `window.alert(` / `alert(` / `confirm(` / `prompt(`, but not
      // `useConfirm(`, the hooks' own `confirm({` / `prompt({`, or a method
      // named `.confirm(`.
      const pattern = /(?:^|[^.\w])(?:window\s*\.\s*)?(alert|confirm|prompt)\s*\(/g;

      for (const match of body.matchAll(pattern)) {
        const line = body.slice(0, match.index).split('\n').length;
        // The hooks' call sites read `await confirm({ … })` / `await prompt({ … })`
        // — an object-literal argument is this codebase's dialog, not the
        // browser's, which takes a string.
        const rest = body.slice(match.index + match[0].length).trimStart();
        if ((match[1] === 'confirm' || match[1] === 'prompt') && rest.startsWith('{')) continue;
        offenders.push(`${rel}:${line} — ${match[1]}()`);
      }
    }

    expect(offenders, `Use toast or useConfirm instead:\n${offenders.join('\n')}`).toEqual([]);
  });
});
