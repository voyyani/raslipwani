import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const repoRoot = path.resolve(__dirname, '../../../..');

/**
 * Eleven `fixed inset-0` dialog overlays shipped, each hand-rolled, and every
 * one of them was missing the same four things: focus never entered the panel,
 * Tab walked out of it, focus was never returned to the opener, and Escape did
 * nothing. `ROADMAP.md` recorded four of them; the census found eleven, which
 * is the argument for a test over a count in a document.
 *
 * The rule this enforces is not "no `fixed inset-0`" — drawers, click-catchers
 * and full-bleed loading states legitimately use it. It is: **a dialog must go
 * through `Modal`, or through `useDialog` if it cannot wear `Modal`'s chrome.**
 *
 * A file is treated as declaring a dialog if it contains a `fixed inset-0`
 * overlay *and* names itself a modal or dialog in that markup. That is
 * deliberately narrow — the goal is to catch the next hand-rolled booking
 * dialog, not to police every absolutely-positioned element.
 */

const ALLOWED = new Set([
  // The primitives themselves — they *are* the implementation.
  'src/components/ui/Modal.jsx',
]);

/**
 * Surfaces whose overlay is not a dialog: navigation drawers, dropdown
 * click-catchers, the app-level loading and maintenance screens, and the
 * property gallery's fullscreen mode, which is a view of the page rather than
 * a dialog over it.
 */
const NOT_DIALOGS = new Set([
  'src/App.jsx',
  'src/components/Header.jsx',
  'src/pages/admin/AdminLayout.jsx',
  'src/pages/admin/AdminHeader.jsx',
  'src/components/admin/MobileBookingCard.jsx',
  'src/components/admin/MobilePropertyCard.jsx',
  'src/pages/PropertyDetail.jsx',
]);

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

describe('dialogs', () => {
  it('are rendered by Modal or useDialog, never hand-rolled', () => {
    const offenders = [];

    for (const file of sourceFiles()) {
      const rel = path.relative(repoRoot, file);
      if (ALLOWED.has(rel) || NOT_DIALOGS.has(rel)) continue;

      const source = fs.readFileSync(file, 'utf8');
      if (!/fixed inset-0/.test(source)) continue;

      // An overlay that darkens the page behind it is a dialog backdrop.
      const isBackdrop = /fixed inset-0[^"'`]*bg-(black|surface-inverse)/.test(source);
      if (!isBackdrop) continue;

      const usesPrimitive = /from ['"][^'"]*\/(Modal|useDialog)['"]/.test(source);
      if (!usesPrimitive) offenders.push(rel);
    }

    expect(
      offenders,
      `These render their own dialog overlay. Use Modal — or useDialog if the\n` +
        `surface cannot wear Modal's chrome:\n${offenders.join('\n')}`
    ).toEqual([]);
  });
});
