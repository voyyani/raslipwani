import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const repoRoot = path.resolve(__dirname, '../../../..');

/**
 * Glass has to come from one place, and this is what makes that true rather
 * than merely intended.
 *
 * DESIGN.md caps live blur at three composited surfaces per viewport, because
 * `backdrop-filter` is a real per-frame GPU cost on the mid-range Android this
 * market browses on — and unlike a colour mistake, a blur mistake is invisible
 * to review: the fourth frosted panel looks exactly as good as the first and
 * only shows up as jank on a device nobody testing owns. A cap is only a budget
 * if the spends are countable, and they are countable only while every frosted
 * surface comes from `GlassPanel` (or from the two primitives named below, which
 * *are* the implementation).
 *
 * The rule is not "no `backdrop-blur`". It is: **a frosted surface comes from a
 * primitive.** A page that wants glass imports `GlassPanel`; it does not
 * assemble `bg-glass backdrop-blur-glass` out of utilities, because that panel
 * would silently miss the border, the reduced-transparency fallback, the
 * no-`backdrop-filter` fallback, and the `data-glass` marker the count reads.
 */

/** The primitives that own the material. Each is the implementation, not a use. */
const ALLOWED = new Set([
  'src/components/ui/GlassPanel.jsx',
  // The `glass` variant, for controls sitting inside a panel or on a photograph.
  'src/components/ui/Button.jsx',
  // The dialog surface and its blurred scrim.
  'src/components/ui/Modal.jsx',
]);

/** Utility fragments that only ever appear on a hand-assembled glass surface. */
const GLASS_MARKERS = [/\bbackdrop-blur-glass/, /\bbg-glass/, /\bglass-surface\b/];

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

describe('glass', () => {
  it('is emitted by the primitives, never assembled at a call site', () => {
    const offenders = [];

    for (const file of sourceFiles()) {
      const rel = path.relative(repoRoot, file);
      if (ALLOWED.has(rel)) continue;

      const source = fs.readFileSync(file, 'utf8');
      if (GLASS_MARKERS.some((marker) => marker.test(source))) offenders.push(rel);
    }

    expect(
      offenders,
      `These assemble a frosted surface out of utilities. Import GlassPanel\n` +
        `instead — it carries the border, the fallbacks and the data-glass\n` +
        `marker the blur budget is counted from:\n${offenders.join('\n')}`
    ).toEqual([]);
  });

  it('keeps its stylesheet fallbacks, since a panel that cannot frost must go opaque', () => {
    // Two real cases, both of which otherwise ship body text onto an unblurred
    // photograph: a browser without `backdrop-filter`, and a visitor who asked
    // the OS to reduce transparency. `GlassPanel` tags every frosted surface
    // with `.glass-surface`; these rules are the other half of that contract,
    // and they live in CSS because neither condition is visible to React.
    const stylesheet = fs.readFileSync(path.join(repoRoot, 'src/index.css'), 'utf8');

    expect(stylesheet).toMatch(/@supports not \(\(backdrop-filter/);
    expect(stylesheet).toMatch(/@media \(prefers-reduced-transparency: reduce\)/);

    // The media ground falls back dark, not to `surface-raised`: its text is
    // white in both themes.
    expect(stylesheet).toMatch(/\.glass-surface-media\s*\{[^}]*--glass-media-solid/);
  });
});
