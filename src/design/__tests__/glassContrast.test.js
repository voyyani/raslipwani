import { describe, it, expect } from 'vitest';

import { compositeOver, contrastRatio, WCAG } from '../contrast';
import { MATERIAL_TOKENS } from '../materials';
import { THEME_TOKENS, THEMES } from '../tokens';

/**
 * A translucent panel has no fixed colour.
 *
 * White at 72% over a bright sky is nearly white; over a dark doorway in the same
 * photograph it is mid-grey. The contrast test next door proves `content` against
 * `surface-raised` — a colour the browser stops painting the moment a panel goes
 * translucent.
 *
 * So this composites: it takes the glass tint, lays it over the darkest and the
 * lightest ground a photograph can present, and demands the text survive both.
 * If it cannot, the panel needs a different material underneath it, not a darker
 * font.
 *
 * This suite has already earned its place. Dark-theme `glass-bg` over a white
 * backdrop measured **1.13:1** — invisible text on the hero, the International
 * cards and every property image — which is why `glass-bg-media` exists.
 */

/** The extremes a photograph can put behind a panel. */
const BACKDROPS = {
  darkest: '#000000',
  lightest: '#FFFFFF',
};

/** Split `rgb(255 255 255 / 0.72)` into the hex and alpha the compositor needs. */
const parseGlass = (value) => {
  const match = value.match(/rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/);
  if (!match) throw new Error(`Not a glass value: ${value}`);

  const [, r, g, b, a] = match;
  const hex = `#${[r, g, b]
    .map((channel) => Number(channel).toString(16).padStart(2, '0'))
    .join('')}`;

  return { hex, alpha: Number(a) };
};

describe('compositeOver', () => {
  it('returns the backdrop when the overlay is fully transparent', () => {
    expect(compositeOver('#FFFFFF', 0, '#0D4B6E')).toBe('#0d4b6e');
  });

  it('returns the overlay when it is fully opaque', () => {
    expect(compositeOver('#FFFFFF', 1, '#0D4B6E')).toBe('#ffffff');
  });

  it('lands halfway at 50%', () => {
    expect(compositeOver('#FFFFFF', 0.5, '#000000')).toBe('#808080');
  });
});

describe('text on glass, composited', () => {
  it('keeps light-theme body text readable over any backdrop', () => {
    const { hex, alpha } = parseGlass(MATERIAL_TOKENS.light['glass-bg']);
    const text = THEME_TOKENS.light.content;

    for (const [name, backdrop] of Object.entries(BACKDROPS)) {
      const ground = compositeOver(hex, alpha, backdrop);

      expect(
        contrastRatio(text, ground),
        `light content on glass over the ${name} backdrop (${ground})`
      ).toBeGreaterThanOrEqual(WCAG.AA_TEXT);
    }
  });

  it('keeps dark-theme body text readable over the app ground', () => {
    // `glass-bg` in dark is white at 8%, which is correct over the app's own dark
    // ground and catastrophic over a bright photograph — so it is asserted only
    // over the ground it is actually for. Media is the next test.
    const { hex, alpha } = parseGlass(MATERIAL_TOKENS.dark['glass-bg']);
    const ground = compositeOver(hex, alpha, THEME_TOKENS.dark.surface);

    expect(
      contrastRatio(THEME_TOKENS.dark.content, ground),
      `dark content on glass over the app ground (${ground})`
    ).toBeGreaterThanOrEqual(WCAG.AA_TEXT);
  });

  it('keeps text on media glass readable over any photograph, in both themes', () => {
    // The case that made `glass-bg-media` exist. White-at-8% over a white
    // backdrop composites to #ffffff and its text measures 1.13:1 — invisible.
    // Media glass tints toward surface-inverse instead and carries white text,
    // which is why it is the same value in both themes: a photograph does not
    // flip with the lights.
    for (const theme of THEMES) {
      const { hex, alpha } = parseGlass(MATERIAL_TOKENS[theme]['glass-bg-media']);

      for (const [name, backdrop] of Object.entries(BACKDROPS)) {
        const ground = compositeOver(hex, alpha, backdrop);

        expect(
          contrastRatio('#FFFFFF', ground),
          `${theme} content-on-media over the ${name} backdrop (${ground})`
        ).toBeGreaterThanOrEqual(WCAG.AA_TEXT);
      }
    }
  });
});
