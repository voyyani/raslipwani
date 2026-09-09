import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { render, screen } from '@/test/utils/renderWithProviders';
import Header from '../Header';

/**
 * The header is the site's one persistent surface and the place glass actually
 * earns its keep — it is the only element that genuinely floats over whatever is
 * scrolling beneath it. These tests hold its three states apart, because the
 * failure mode is invisible in review: a header that frosts from the first pixel
 * looks fine in a screenshot and covers the top of every photograph on the site.
 *
 * The global setup pins `useLocation` to `/admin` for every test in the suite,
 * which is fine for components that only read the route to close a dropdown and
 * useless here, where the route is half the behaviour. This file substitutes a
 * mock it can drive instead.
 */
const route = vi.hoisted(() => ({ pathname: '/admin' }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: route.pathname, search: '', hash: '', state: null }),
    useParams: () => ({}),
    BrowserRouter: ({ children }) => <actual.MemoryRouter>{children}</actual.MemoryRouter>,
  };
});

describe('Header', () => {
  beforeEach(() => {
    route.pathname = '/';
  });

  it('is transparent at the top of a page with a hero photograph', () => {
    // Over a hero photograph the header should be invisible.
    const { container } = render(<Header scrolled={false} />);

    expect(container.firstChild.className).not.toMatch(/backdrop-blur/);
    expect(container.firstChild).toHaveAttribute('data-glass', 'off');
  });

  it('frosts once scrolled', () => {
    // Over content it needs a ground, or the links land on whatever happens to
    // be scrolling past.
    const { container } = render(<Header scrolled />);

    expect(container.firstChild.className).toMatch(/backdrop-blur-glass/);
    expect(container.firstChild.className).toMatch(/border-glass/);
  });

  it('comes from GlassPanel rather than assembling the material itself', () => {
    // `data-glass` is what makes DESIGN.md's three-blur-surfaces-per-viewport cap
    // countable. A hand-rolled header would look identical and count for nothing.
    const { container } = render(<Header scrolled />);

    expect(container.firstChild).toHaveAttribute('data-glass', 'subtle');
  });

  it('floats over the hero on a media route and sits in the flow elsewhere', () => {
    // Fixed, so the photograph starts at the top of the viewport rather than
    // below a reserved band; sticky everywhere else, where the header has the
    // page's own ground behind it and should occupy its own height.
    const { container: home } = render(<Header scrolled={false} />);
    expect(home.firstChild.className).toMatch(/\bfixed\b/);

    route.pathname = '/about';
    const { container: about } = render(<Header scrolled={false} />);
    expect(about.firstChild.className).toMatch(/\bsticky\b/);
  });

  it('does not change position when it frosts, which would jump the page', () => {
    // The material changes on scroll; the box model must not. A header that
    // swapped `fixed` for `sticky` at 24px would take its own height out of the
    // document mid-scroll.
    const { container } = render(<Header scrolled />);
    expect(container.firstChild.className).toMatch(/\bfixed\b/);
  });

  it('drops the on-media link colours as soon as it has a ground', () => {
    // White links are correct on a photograph and invisible on `surface`.
    const { container: overPhoto } = render(<Header scrolled={false} />);
    expect(overPhoto.firstChild.className).toMatch(/text-content-on-media/);

    const { container: overContent } = render(<Header scrolled />);
    expect(overContent.firstChild.className).not.toMatch(/text-content-on-media/);
  });

  it('never goes on-media on a route with no photograph behind it', () => {
    route.pathname = '/about';
    const { container } = render(<Header scrolled={false} />);
    expect(container.firstChild.className).not.toMatch(/text-content-on-media/);
  });

  it('keeps the menu button labelled and its state announced', () => {
    render(<Header scrolled={false} />);

    const toggle = screen.getByRole('button', { name: /open menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 'mobile-nav');
  });
});
