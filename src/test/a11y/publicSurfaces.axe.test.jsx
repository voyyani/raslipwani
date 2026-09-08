import React from 'react';
import { describe, it, afterEach } from 'vitest';

import { render } from '../utils/renderWithProviders';
import { expectNoAxeViolations } from '../utils/axe';

import Home from '@/pages/Home';
import Properties from '@/pages/Properties';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import International from '@/pages/International';
import UNHousing from '@/pages/UNHousing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * The accessibility gate.
 *
 * ROADMAP.md carried "axe violations: not measured" through four revisions
 * while the block above it claimed an accessibility bar. This file is the
 * difference between the two: every visitor-facing surface, rendered, in both
 * themes, asserted against the WCAG A/AA rule set on every run of the suite —
 * so CI holds it without a separate job.
 *
 * Both themes are exercised because the token layer resolves per theme, and a
 * defect that only exists in dark mode is still a defect. Structure is mostly
 * theme-invariant, so most rules give the same answer twice; the ones that do
 * not — anything reading a computed style — are the reason to pay for it.
 */
const SURFACES = [
  ['Home', Home, '/'],
  ['Properties', Properties, '/properties'],
  ['About', About, '/about'],
  ['Contact', Contact, '/contact'],
  ['International', International, '/international'],
  ['UN housing', UNHousing, '/international/un-housing'],
];

const THEMES = ['light', 'dark'];

const applyTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dataset.theme = theme;
};

describe('public surfaces have no WCAG A/AA violations', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
    delete document.documentElement.dataset.theme;
  });

  for (const [name, Surface, route] of SURFACES) {
    for (const theme of THEMES) {
      it(`${name} — ${theme}`, async () => {
        applyTheme(theme);
        const { container } = render(<Surface />, { route });
        await expectNoAxeViolations(container);
      }, 60000);
    }
  }
});

/**
 * The chrome is checked separately because it appears on every one of the
 * surfaces above. A defect in the header is not one defect; it is a defect on
 * every page of the site, and naming it here says so.
 */
describe('site chrome has no WCAG A/AA violations', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
    delete document.documentElement.dataset.theme;
  });

  for (const [name, Chrome] of [['Header', Header], ['Footer', Footer]]) {
    for (const theme of THEMES) {
      it(`${name} — ${theme}`, async () => {
        applyTheme(theme);
        const { container } = render(<Chrome />);
        await expectNoAxeViolations(container);
      }, 60000);
    }
  }
});
