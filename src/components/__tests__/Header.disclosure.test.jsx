import React from 'react';
import { readFileSync, readdirSync } from 'node:fs';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// The global setup mock pins `useLocation` to `/admin`; this suite renders the
// public header and needs the real hook reading the MemoryRouter below.
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}) };
});

vi.mock('../../hooks/useSettings', () => ({
  useSettings: () => ({
    loading: false,
    logo: () => '',
    siteName: () => 'Raslipwani Properties',
    tagline: () => 'Test tagline',
    phone: () => '+254700000000',
    email: () => 'info@example.com',
    address: () => 'Nairobi',
    socialMedia: () => ({}),
    serviceLocations: () => ['Nairobi'],
    whatsapp: () => '+254700000000',
  }),
}));

// AuthButtons reaches for Supabase auth state; the disclosures are what this
// suite is about.
vi.mock('../AuthButtons', () => {
  const AuthButtonsStub = () => <div data-testid="auth-buttons" />;
  return { default: AuthButtonsStub };
});

const { default: Header } = await import('../Header');

function renderHeader() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Header />
    </MemoryRouter>
  );
}

/** The desktop nav's only dropdown trigger. */
function trigger() {
  return screen
    .getAllByRole('button')
    .find((button) => button.getAttribute('aria-haspopup') === 'true');
}

describe('the header dropdown', () => {
  /**
   * The defect: the trigger was a `<button>` with **no `onClick`**. The menu
   * opened on `onMouseEnter` of its wrapper and nothing else, so a keyboard
   * visitor could focus the control, press Enter, and have nothing happen —
   * the International section was unreachable without a pointer.
   *
   * These tests drive it by keyboard deliberately. `userEvent.click` fires
   * `mouseenter` before the click, which hover-opens the menu and makes the
   * click read as a close — correct mouse behaviour, and not the path that
   * was broken.
   */
  it('opens on Enter, so it is reachable without a pointer', async () => {
    const user = userEvent.setup();
    renderHeader();

    const button = trigger();
    expect(button).toBeDefined();
    expect(button).toHaveAttribute('aria-expanded', 'false');

    button.focus();
    await user.keyboard('{Enter}');

    expect(button).toHaveAttribute('aria-expanded', 'true');
    const menu = document.getElementById(button.getAttribute('aria-controls'));
    expect(menu).not.toBeNull();
    expect(within(menu).getAllByRole('link').length).toBeGreaterThan(0);
  });

  it('closes on a second Enter', async () => {
    const user = userEvent.setup();
    renderHeader();

    const button = trigger();
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');

    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    renderHeader();

    const button = trigger();
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{Escape}');

    expect(button).toHaveAttribute('aria-expanded', 'false');
    // Focus must not be stranded on a link that has just been unmounted.
    expect(document.activeElement).toBe(button);
  });

  it('names the panel it controls', async () => {
    const user = userEvent.setup();
    renderHeader();

    const button = trigger();
    const controls = button.getAttribute('aria-controls');
    expect(controls).toBeTruthy();

    // The id must exist once the panel is open, or `aria-controls` points at
    // nothing and announces nothing.
    button.focus();
    await user.keyboard('{Enter}');
    expect(document.getElementById(controls)).not.toBeNull();
  });
});

describe('the mobile menu toggle', () => {
  it('announces its state and names its panel', async () => {
    const user = userEvent.setup();
    renderHeader();

    const toggle = screen.getByRole('button', { name: /open menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 'mobile-nav');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById('mobile-nav')).not.toBeNull();
  });

  it('imports no animation library, because it is in every first load', () => {
    // Header is rendered by PublicLayout, which App.jsx imports statically. Any
    // library it touches is downloaded before the first paint on every route,
    // including the ones that never animate anything. The header's own parts
    // count too: they are static imports of the same eager module.
    const sources = [
      'src/components/Header.jsx',
      ...readdirSync('src/components/header')
        .filter((f) => f.endsWith('.jsx'))
        .map((f) => `src/components/header/${f}`),
    ];

    // Imports, not prose: these files explain in comments why they no longer
    // reach for one.
    const offenders = sources.filter((f) =>
      /^\s*import\b[^\n]*['"]framer-motion['"]/m.test(readFileSync(f, 'utf8'))
    );
    expect(offenders).toEqual([]);
  });
});
