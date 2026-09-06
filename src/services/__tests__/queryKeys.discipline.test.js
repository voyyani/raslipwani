import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Every .jsx/.js under src/, excluding tests and the registry itself. */
function sourceFiles(dir = 'src', acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry !== '__tests__' && entry !== 'test') sourceFiles(full, acc);
    } else if (/\.jsx?$/.test(entry) && !full.includes('queryKeys')) {
      acc.push(full);
    }
  }
  return acc;
}

// Un-skipped in Task 17, once every call site is migrated. It is skipped rather
// than absent so the intent is on the record while Phase 1 is in flight.
describe.skip('query key discipline', () => {
  it('builds no query key from an inline string literal', () => {
    const offenders = sourceFiles().filter((file) =>
      /queryKey:\s*\[\s*['"`]/.test(readFileSync(file, 'utf8'))
    );
    expect(offenders).toEqual([]);
  });

  it('sets no staleTime that did not come from cachePolicy', () => {
    const offenders = sourceFiles().filter(
      (file) =>
        /staleTime:\s*[0-9]/.test(readFileSync(file, 'utf8')) && !file.endsWith('cachePolicy.js')
    );
    expect(offenders).toEqual([]);
  });
});
