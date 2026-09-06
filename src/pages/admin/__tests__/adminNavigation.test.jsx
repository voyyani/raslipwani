import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

import { ICON_NAMES } from '@/components/Icon';

const repoRoot = path.resolve(__dirname, '../../../..');

/**
 * The seven files the icon codemod refused.
 *
 * Each one stores an icon as a *component value* rather than rendering it as
 * JSX — a nav array (`{ icon: FaHome }`) or a status lookup table
 * (`{ pending: FaClock }`) — and renders it through a local
 * `const Icon = item.icon`. The codemod refuses these on purpose: converting
 * one means two coordinated edits, the data and its render site, which is
 * judgement rather than repetition.
 *
 * Three of these were found by the codemod's refusal rule and not by the hand
 * survey that preceded it, which is the argument for having the rule.
 */
const FILES = [
  'src/pages/admin/AdminLayout.jsx',
  'src/pages/admin/AdminBottomNav.jsx',
  'src/pages/admin/AdminHeader.jsx',
  'src/pages/admin/Settings.jsx',
  'src/components/Header.jsx',
  'src/components/BookingStatusBadge.jsx',
  'src/components/admin/MobilePropertyCard.jsx',
];

describe('icon data holds registry names, not components', () => {
  it.each(FILES)('%s stores every icon as a registry name', (file) => {
    const source = fs.readFileSync(path.join(repoRoot, file), 'utf8');

    // A component reference in a data structure is the defect: it makes the
    // structure unserialisable, so these lists could never move to the database
    // — which is exactly why Icon.jsx keys its registry by string.
    const componentValued = source.match(/:\s*(Fa|Fi|Md)[A-Z][A-Za-z]*/g) || [];
    expect(componentValued).toEqual([]);

    // And every string it does hold must actually be in the registry, or the
    // surface renders an invisible gap and a dev-only console warning.
    //
    // Two shapes carry icon names here: a nav entry keyed `icon:`, and a lookup
    // table keyed by domain value (`pending: 'clock'`, `residential: 'home'`)
    // declared under a name containing "icon". Both are collected.
    const named = [...source.matchAll(/\bicon:\s*'([a-z0-9-]+)'/gi)].map((m) => m[1]);

    for (const [, body] of source.matchAll(/\w*icons\w*\s*=\s*\{([^}]*)\}/gi)) {
      for (const [, value] of body.matchAll(/:\s*'([a-z0-9-]+)'/g)) named.push(value);
    }

    expect(named.length).toBeGreaterThan(0);
    expect(named.filter((n) => !ICON_NAMES.includes(n))).toEqual([]);
  });
});
