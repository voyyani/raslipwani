import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  ThemeProvider,
  useTheme,
  readStoredPreference,
  THEME_STORAGE_KEY,
} from '../ThemeContext';
import ThemeToggle from '../../components/ui/ThemeToggle';

/**
 * The behaviours worth testing here are the ones a theme implementation
 * habitually gets wrong: losing "follow the system" the moment anyone touches a
 * toggle, ignoring the OS after mount, and falling over when storage is blocked.
 * Painting a colour is Tailwind's job and is proven in contrast.test.js.
 */

/** A controllable `prefers-color-scheme`, since jsdom has no real one. */
const mockMatchMedia = (dark) => {
  const listeners = new Set();
  const query = {
    matches: dark,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_, fn) => listeners.add(fn),
    removeEventListener: (_, fn) => listeners.delete(fn),
    addListener: (fn) => listeners.add(fn),
    removeListener: (fn) => listeners.delete(fn),
  };
  window.matchMedia = vi.fn(() => query);
  return {
    query,
    /** Simulates the OS flipping while the page is open. */
    flip: (nowDark) => {
      query.matches = nowDark;
      act(() => listeners.forEach((fn) => fn(query)));
    },
  };
};

const Probe = () => {
  const { preference, resolved } = useTheme();
  return (
    <div>
      <span data-testid="preference">{preference}</span>
      <span data-testid="resolved">{resolved}</span>
    </div>
  );
};

const renderTheme = (ui = <Probe />) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.className = '';
  document.documentElement.style.colorScheme = '';
  mockMatchMedia(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ThemeProvider', () => {
  it('defaults to following the system rather than to a hardcoded light', () => {
    renderTheme();
    expect(screen.getByTestId('preference')).toHaveTextContent('system');
  });

  it('resolves system to whatever the OS currently says', () => {
    mockMatchMedia(true);
    renderTheme();
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('follows the OS when it changes mid-session', () => {
    const media = mockMatchMedia(false);
    renderTheme();
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');

    media.flip(true);
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('stops following the OS once someone has chosen explicitly', async () => {
    // The bug this guards: a person picks light, then their laptop hits sunset
    // and switches the site out from under them.
    const media = mockMatchMedia(false);
    renderTheme(
      <>
        <Probe />
        <ThemeToggle />
      </>
    );

    await userEvent.click(screen.getByRole('radio', { name: 'Light theme' }));
    media.flip(true);

    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('sets color-scheme so controls and scrollbars follow the theme', () => {
    mockMatchMedia(true);
    renderTheme();
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('persists the choice', async () => {
    renderTheme(<ThemeToggle />);
    await userEvent.click(screen.getByRole('radio', { name: 'Dark theme' }));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('restores a stored choice on the next mount', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    renderTheme();
    expect(screen.getByTestId('preference')).toHaveTextContent('dark');
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });

  it('falls back to system when storage holds something unrecognised', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'chartreuse');
    expect(readStoredPreference()).toBe('system');
  });

  it('survives storage being blocked entirely', () => {
    // Private windows and "block all site data" throw on access rather than
    // returning null. Losing persistence is acceptable; crashing is not.
    const getItem = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('SecurityError');
      });
    expect(() => renderTheme()).not.toThrow();
    expect(screen.getByTestId('preference')).toHaveTextContent('system');
    getItem.mockRestore();
  });

  it('refuses to be used outside its provider rather than silently defaulting', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/within a ThemeProvider/);
    quiet.mockRestore();
  });
});

describe('ThemeToggle', () => {
  it('offers all three options, so "follow the system" stays reachable', () => {
    renderTheme(<ThemeToggle />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Match system theme' })).toBeInTheDocument();
  });

  it('marks exactly one option as checked', () => {
    renderTheme(<ThemeToggle />);
    const checked = screen
      .getAllByRole('radio')
      .filter((option) => option.getAttribute('aria-checked') === 'true');
    expect(checked).toHaveLength(1);
  });

  it('is one tab stop, not three', () => {
    renderTheme(<ThemeToggle />);
    const reachable = screen
      .getAllByRole('radio')
      .filter((option) => option.getAttribute('tabindex') === '0');
    expect(reachable).toHaveLength(1);
  });

  it('moves and selects with the arrow keys, as a radiogroup should', async () => {
    renderTheme(
      <>
        <Probe />
        <ThemeToggle />
      </>
    );
    // Starts on `system`, the last option; ArrowRight wraps to the first.
    screen.getByRole('radio', { name: 'Match system theme' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByTestId('preference')).toHaveTextContent('light');

    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByTestId('preference')).toHaveTextContent('dark');

    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('preference')).toHaveTextContent('light');
  });

  it('jumps to the ends with Home and End', async () => {
    renderTheme(
      <>
        <Probe />
        <ThemeToggle />
      </>
    );
    screen.getByRole('radio', { name: 'Match system theme' }).focus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByTestId('preference')).toHaveTextContent('light');

    await userEvent.keyboard('{End}');
    expect(screen.getByTestId('preference')).toHaveTextContent('system');
  });

  it('names every option, since each is icon-only', () => {
    renderTheme(<ThemeToggle />);
    for (const option of screen.getAllByRole('radio')) {
      expect(option).toHaveAccessibleName();
    }
  });
});
