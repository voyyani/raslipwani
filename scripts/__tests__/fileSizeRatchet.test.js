import { describe, it, expect } from 'vitest';
import { largestFiles, nextCeiling } from '../file-size-ratchet.mjs';

describe('largestFiles', () => {
  it('reports files by line count, largest first', () => {
    const files = { 'a.jsx': 'x\ny\nz', 'b.jsx': 'x' };
    expect(largestFiles(files)).toEqual([
      { path: 'a.jsx', lines: 3 },
      { path: 'b.jsx', lines: 1 },
    ]);
  });

  it('ignores test files, which are allowed to be long', () => {
    const files = { 'src/x/__tests__/a.test.jsx': 'x\ny\nz\nq' };
    expect(largestFiles(files)).toEqual([]);
  });

  it('ignores files under src/test/, which are allowed to be long', () => {
    const files = { 'src/test/utils/supabaseQueryMock.js': 'x\ny\nz\nq' };
    expect(largestFiles(files)).toEqual([]);
  });
});

describe('nextCeiling', () => {
  it('allows lowering the ceiling', () => {
    expect(nextCeiling(900, 1000)).toBe(900);
  });

  it('allows holding the ceiling steady', () => {
    expect(nextCeiling(1000, 1000)).toBe(1000);
  });

  it('refuses to raise the ceiling', () => {
    expect(nextCeiling(1100, 1000)).toBeNull();
  });
});
