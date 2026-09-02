import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const repoRoot = path.resolve(__dirname, '../../..');
const pagesDir = path.join(repoRoot, 'src/pages');

/**
 * Roadmap principle 5: "Route or delete — never orphan."
 *
 * 2,074 unreachable lines accumulated in src/pages because finished pages were
 * built and then never wired into the router. Release 3 cleared them. This test
 * is what stops them coming back: every page module must be reachable from
 * App.jsx, either routed directly or imported by something that is.
 */
function listPageModules(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__tests__') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listPageModules(full, acc);
    else if (/\.jsx?$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

/** Every module App.jsx can reach, following relative imports transitively. */
function reachableFromApp() {
  const seen = new Set();
  const queue = [path.join(repoRoot, 'src/App.jsx')];

  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);

    let source;
    try {
      source = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    // Static `from './x'` and dynamic `import('./x')` alike.
    const specifiers = [...source.matchAll(/from\s+['"](\.[^'"]+)['"]/g), ...source.matchAll(/import\(\s*['"](\.[^'"]+)['"]\s*\)/g)].map((m) => m[1]);

    for (const spec of specifiers) {
      const base = path.resolve(path.dirname(file), spec);
      const resolved = [base, `${base}.jsx`, `${base}.js`, path.join(base, 'index.jsx'), path.join(base, 'index.js')].find(
        (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()
      );
      if (resolved) queue.push(resolved);
    }
  }
  return seen;
}

describe('page reachability', () => {
  it('has no orphaned pages — every module in src/pages is reachable from App.jsx', () => {
    const reachable = reachableFromApp();
    const orphans = listPageModules(pagesDir)
      .filter((file) => !reachable.has(file))
      .map((file) => path.relative(repoRoot, file));

    expect(orphans).toEqual([]);
  });
});
