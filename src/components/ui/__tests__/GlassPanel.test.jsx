import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import GlassPanel from '../GlassPanel';

/**
 * Glass is the one material in this design that can fail invisibly: a panel
 * whose filter never drew still renders, still looks approximately intentional
 * in a screenshot, and puts body text straight onto a photograph. So the
 * assertions below are less about the happy path than about every route by
 * which the frost can be absent — the caller disabling it, the browser refusing
 * it, and the visitor asking the OS to stop it.
 */
describe('GlassPanel', () => {
  it('renders its children', () => {
    render(<GlassPanel>Kikambala</GlassPanel>);
    expect(screen.getByText('Kikambala')).toBeInTheDocument();
  });

  it('always carries a border', () => {
    // Translucency is not a boundary. A panel whose only edge is a change in
    // opacity disappears against a light-coloured photograph, which is exactly
    // the case this design puts it in most often.
    const { container } = render(<GlassPanel>x</GlassPanel>);
    expect(container.firstChild.className).toMatch(/border border-glass-border/);
  });

  it('applies the blur filter by default', () => {
    const { container } = render(<GlassPanel>x</GlassPanel>);
    expect(container.firstChild.className).toMatch(/backdrop-blur-glass/);
    // Saturation is the difference between glass and fog: backdrop content seen
    // through a real pane keeps its colour.
    expect(container.firstChild.className).toMatch(/backdrop-saturate-glass/);
  });

  it('drops the filter when blur is disabled, keeping the ground opaque', () => {
    // The budget rule caps live blur surfaces per viewport. Beyond the cap a
    // panel keeps the look and loses the filter -- and must then go opaque,
    // because translucency without blur is just washed-out text.
    const { container } = render(<GlassPanel blur={false}>x</GlassPanel>);
    expect(container.firstChild.className).not.toMatch(/backdrop-blur/);
    expect(container.firstChild.className).toMatch(/bg-surface-raised/);
  });

  it('renders the requested element', () => {
    render(
      <GlassPanel as="section" aria-label="Search">
        x
      </GlassPanel>
    );
    expect(screen.getByRole('region', { name: 'Search' })).toBeInTheDocument();
  });

  it('honours a tone', () => {
    const { container } = render(<GlassPanel tone="strong">x</GlassPanel>);
    expect(container.firstChild.className).toMatch(/bg-glass-strong/);
  });

  it('gives the media tone a dark ground and its own text colour', () => {
    // Over a photograph the backdrop can be any colour, so this tone cannot
    // inherit the page's text colour and hope. It measured 1.13:1 when it did.
    const { container } = render(<GlassPanel tone="media">x</GlassPanel>);
    expect(container.firstChild.className).toMatch(/bg-glass-media\b/);
    expect(container.firstChild.className).toMatch(/text-content-on-media/);
  });

  it('keeps the media fallback dark, not surface-raised', () => {
    // `content-on-media` is white in BOTH themes. Falling back to the ordinary
    // opaque ground would therefore paint white text on a white panel in light
    // mode -- the failure this tone exists to prevent, reintroduced by its own
    // fallback.
    const { container } = render(
      <GlassPanel tone="media" blur={false}>
        x
      </GlassPanel>
    );
    expect(container.firstChild.className).toMatch(/bg-glass-media-solid/);
    expect(container.firstChild.className).not.toMatch(/bg-surface-raised/);
  });

  it('carries the stylesheet fallback hook whenever it is actually frosted', () => {
    // `.glass-surface` is what the no-backdrop-filter and
    // prefers-reduced-transparency rules in index.css bind to. Without it those
    // visitors get a translucent panel with nothing blurred behind it.
    const { container: frosted } = render(<GlassPanel>x</GlassPanel>);
    expect(frosted.firstChild.className).toMatch(/\bglass-surface\b/);

    const { container: media } = render(<GlassPanel tone="media">x</GlassPanel>);
    expect(media.firstChild.className).toMatch(/\bglass-surface-media\b/);

    // Already opaque: the fallback has nothing left to substitute, and the hook
    // would only override a ground that is deliberately not the default one.
    const { container: opaque } = render(<GlassPanel blur={false}>x</GlassPanel>);
    expect(opaque.firstChild.className).not.toMatch(/\bglass-surface\b/);
  });

  it('marks each panel so live blur surfaces can be counted', () => {
    // DESIGN.md caps composited blur at three per viewport. A cap nobody can
    // count is a preference, not a budget.
    const { container } = render(
      <div>
        <GlassPanel tone="subtle">chrome</GlassPanel>
        <GlassPanel tone="media">hero</GlassPanel>
        <GlassPanel blur={false}>fourth</GlassPanel>
      </div>
    );

    expect(container.querySelectorAll('[data-glass]:not([data-glass="off"])')).toHaveLength(2);
    expect(container.querySelector('[data-glass="off"]')).toBeInTheDocument();
  });

  it('passes className and the rest of its props through', () => {
    const { container } = render(
      <GlassPanel className="p-6" id="hero-search">
        x
      </GlassPanel>
    );
    expect(container.firstChild).toHaveAttribute('id', 'hero-search');
    expect(container.firstChild.className).toMatch(/p-6/);
  });

  it('drops the radius and the drop shadow when it is a bar', () => {
    // Chrome pinned to a viewport edge. A radius there leaves four gaps against
    // the window and a drop shadow doubles the border it already has.
    const { container } = render(
      <GlassPanel as="header" shape="bar" tone="subtle">
        chrome
      </GlassPanel>
    );

    expect(container.firstChild.tagName).toBe('HEADER');
    expect(container.firstChild.className).toMatch(/border-b border-glass-border/);
    expect(container.firstChild.className).not.toMatch(/rounded-xl/);
    expect(container.firstChild.className).not.toMatch(/shadow-glass/);
  });

  it('emits no material at all for tone="none", and is not counted as a blur surface', () => {
    // The header before the page has scrolled anything underneath it. Absence of
    // a material, not a lighter one — so no filter, no edge, and nothing for the
    // three-surfaces-per-viewport cap to count.
    const { container } = render(
      <GlassPanel as="header" shape="bar" tone="none">
        chrome
      </GlassPanel>
    );

    expect(container.firstChild).toHaveAttribute('data-glass', 'off');
    expect(container.firstChild.className).toMatch(/bg-transparent/);
    expect(container.firstChild.className).not.toMatch(/backdrop-blur/);
    expect(container.firstChild.className).not.toMatch(/border-glass-border/);
  });

  it('carries its media text colour down onto the labels inside it', () => {
    // A `Field` label hard-codes `text-content` — correct on every opaque ground
    // in the app, and wrong on this one, which is dark in *both* themes. Without
    // this the hero search panel ships near-black labels on a near-black panel.
    const { container } = render(<GlassPanel tone="media">x</GlassPanel>);
    expect(container.firstChild.className).toMatch(/\[&_label\]:text-content-on-media/);
  });

  it('falls back to the default ground for an unknown tone', () => {
    // PropTypes already shouts about this in development; the point here is that
    // the panel still renders a sanctioned material rather than no ground at
    // all, which would be an unreadable transparent box in production.
    const warn = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<GlassPanel tone="chartreuse">x</GlassPanel>);
    expect(container.firstChild.className).toMatch(/bg-glass\b/);
    warn.mockRestore();
  });
});
