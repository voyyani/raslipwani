import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { render, screen, fireEvent } from '@/test/utils/renderWithProviders';
import HeroSection from '../HeroSection';

/**
 * The global setup stubs `useNavigate` with a fresh spy per call, so a
 * navigation cannot be observed through it. This file substitutes one spy the
 * test can read — which is also the only assertion worth making here: what
 * matters is the URL the criteria become, not that jsdom's history moved.
 */
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigate,
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
    useParams: () => ({}),
    BrowserRouter: ({ children }) => <actual.MemoryRouter>{children}</actual.MemoryRouter>,
  };
});

describe('HeroSection', () => {
  beforeEach(() => {
    navigate.mockClear();
  });

  it('takes a position instead of naming its own category', () => {
    render(<HeroSection heroLoaded onHeroLoad={() => {}} />);

    const headline = screen.getByRole('heading', { level: 1 });
    expect(headline).toHaveTextContent(/coastal property/i);
    // The outgoing headline was a sentence any competitor could have run
    // unchanged, which is what made it worth nothing.
    expect(headline).not.toHaveTextContent(/trusted real estate partner/i);
  });

  it('carries the criteria to the listings as query parameters', async () => {
    const user = userEvent.setup();
    render(<HeroSection heroLoaded onHeroLoad={() => {}} />);

    await user.type(screen.getByLabelText(/location/i), 'Kikambala');
    await user.selectOptions(screen.getByLabelText(/looking for/i), 'un-diplomatic');
    await user.type(screen.getByLabelText(/budget/i), '8500000');
    await user.click(screen.getByRole('button', { name: /search properties/i }));

    // Query parameters rather than router state, so a search is a link the
    // visitor can send to someone else.
    expect(navigate).toHaveBeenCalledTimes(1);
    const [target] = navigate.mock.calls[0];
    const [path, query] = target.split('?');

    expect(path).toBe('/properties');
    const params = new URLSearchParams(query);
    expect(params.get('search')).toBe('Kikambala');
    expect(params.get('segment')).toBe('un-diplomatic');
    expect(params.get('maxPrice')).toBe('8500000');
  });

  it('does not send an empty budget as a maximum of zero', async () => {
    const user = userEvent.setup();
    render(<HeroSection heroLoaded onHeroLoad={() => {}} />);

    await user.click(screen.getByRole('button', { name: /search properties/i }));

    expect(navigate).toHaveBeenCalledWith('/properties');
  });

  it('spends exactly one of the three live blur surfaces the page is allowed', () => {
    // DESIGN.md caps blur at three composited surfaces per viewport. The hero
    // gets one; the header gets the second; nothing else on Home may blur.
    const { container } = render(<HeroSection heroLoaded onHeroLoad={() => {}} />);
    expect(container.querySelectorAll('[data-glass]:not([data-glass="off"])')).toHaveLength(1);
  });

  it('reports the photograph as loaded so the skeleton can go', () => {
    const onHeroLoad = vi.fn();
    const { container } = render(<HeroSection heroLoaded={false} onHeroLoad={onHeroLoad} />);

    fireEvent.load(container.querySelector('img'));
    expect(onHeroLoad).toHaveBeenCalled();
  });
});
