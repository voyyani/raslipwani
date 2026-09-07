import { describe, it, expect } from 'vitest';
import { largestFiles } from '../file-size-ratchet.mjs';

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
});
