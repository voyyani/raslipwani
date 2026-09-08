import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { render, waitFor } from '../utils/renderWithProviders';
import { expectNoAxeViolations } from '../utils/axe';
import { signInAsAdmin } from '../utils/authenticatedAdmin';

import Dashboard from '@/pages/admin/Dashboard';
import AdminProperties from '@/pages/admin/AdminProperties';
import AdminBookings from '@/pages/admin/AdminBookings';
import Settings from '@/pages/admin/Settings';
import ClientManagement from '@/pages/admin/ClientManagement';
import AdminHeader from '@/pages/admin/AdminHeader';
import AdminBottomNav from '@/pages/admin/AdminBottomNav';

/**
 * The accessibility gate, extended over the admin console.
 *
 * The public half of this gate landed two blocks early because those surfaces
 * were already clean, and fencing what is clean beats waiting for everything to
 * be. Admin was the other half of that argument: it held all 65 of the
 * unlabelled controls, so it could not be fenced until they were gone. They are
 * gone, so this is the rest of the gate.
 *
 * Both themes, same as the public suite, for the same reason: the token layer
 * resolves per theme and a defect that only exists in dark mode is a defect.
 */
const SURFACES = [
  ['Dashboard', Dashboard, '/admin'],
  ['Properties', AdminProperties, '/admin/properties'],
  ['Bookings', AdminBookings, '/admin/bookings'],
  ['Settings', Settings, '/admin/settings'],
  ['Clients', ClientManagement, '/admin/clients'],
];

const CHROME = [
  ['AdminHeader', AdminHeader],
  ['AdminBottomNav', AdminBottomNav],
];

const THEMES = ['light', 'dark'];

const applyTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dataset.theme = theme;
};

const clearTheme = () => {
  document.documentElement.classList.remove('dark');
  delete document.documentElement.dataset.theme;
};

describe('admin surfaces have no WCAG A/AA violations', () => {
  beforeEach(() => signInAsAdmin());
  afterEach(clearTheme);

  // 60s per surface, not the global 15s: axe walks a fully rendered admin page
  // (FullCalendar and all), and `npm run test:coverage` runs it under v8
  // instrumentation, which roughly triples it. These are the slowest tests in
  // the suite by an order of magnitude and the number is sized for the slowest
  // way they are run, on the smallest machine that runs them.
  for (const [name, Surface, route] of SURFACES) {
    for (const theme of THEMES) {
      it(`${name} — ${theme}`, async () => {
        applyTheme(theme);
        const { container } = render(<Surface />, { route });

        // A gate that inspects an empty container passes and asserts nothing.
        // Several of these pages gate their whole render on a query's
        // isLoading and paint only a spinner until it settles, so axe run on
        // the first paint would report zero violations on a blank page. Wait
        // for real content, then assert there is some — the wait is what makes
        // the test correct, and the assertion is what stops it silently
        // degrading if a page later starts rendering nothing at all.
        await waitFor(
          () => {
            expect(
              container.textContent.trim().length,
              `${name} rendered almost nothing — axe would pass by inspecting an empty page`
            ).toBeGreaterThan(50);
          },
          { timeout: 10000 }
        );

        await expectNoAxeViolations(container);
      }, 60000);
    }
  }
});

/**
 * The chrome is checked separately because it appears on every admin surface.
 * A defect in the admin header is not one defect; it is a defect on every page
 * of the console, and naming it here says so.
 */
describe('admin chrome has no WCAG A/AA violations', () => {
  beforeEach(() => signInAsAdmin());
  afterEach(clearTheme);

  for (const [name, Chrome] of CHROME) {
    for (const theme of THEMES) {
      it(`${name} — ${theme}`, async () => {
        applyTheme(theme);
        const { container } = render(<Chrome />);
        await expectNoAxeViolations(container);
      }, 60000);
    }
  }
});
