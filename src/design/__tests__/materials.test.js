import { describe, it, expect } from 'vitest';

import { MATERIAL_TOKENS, INVARIANT_MATERIALS, materialsFor } from '../materials';
import { THEMES } from '../tokens';

/**
 * Materials are the half of the design layer a contrast formula cannot check: a
 * blur radius is not right or wrong, it is only consistent or not.
 *
 * So what is asserted here is structure — every theme defines every key, and
 * every value is well-formed CSS — which is the failure mode that actually
 * happens. A token defined in light and forgotten in dark paints nothing in
 * dark, silently, and only in the theme nobody has open.
 */
describe('material tokens', () => {
  it('defines the same keys in every theme', () => {
    const [first, ...rest] = THEMES.map((theme) =>
      Object.keys(MATERIAL_TOKENS[theme]).sort()
    );

    for (const keys of rest) {
      expect(keys).toEqual(first);
    }
  });

  it('gives every theme a glass ground, a border, a blur and a shadow', () => {
    for (const theme of THEMES) {
      const material = MATERIAL_TOKENS[theme];

      expect(material['glass-bg'], `${theme} glass-bg`).toMatch(/^rgb\(/);
      expect(material['glass-border'], `${theme} glass-border`).toMatch(/^rgb\(/);
      expect(material['glass-blur'], `${theme} glass-blur`).toMatch(/^\d+px$/);
      expect(material['shadow-glass'], `${theme} shadow-glass`).toMatch(/px/);
    }
  });

  it('makes dark glass more translucent and more blurred than light', () => {
    // Dark glass separates by blur where light glass separates by opacity: a
    // white panel at 72% reads instantly on a bright ground, but a white panel
    // at 72% on a dark ground is just a white panel.
    const alpha = (value) => Number(value.match(/\/\s*([\d.]+)\)/)[1]);
    const px = (value) => Number(value.replace('px', ''));

    expect(alpha(MATERIAL_TOKENS.dark['glass-bg'])).toBeLessThan(
      alpha(MATERIAL_TOKENS.light['glass-bg'])
    );
    expect(px(MATERIAL_TOKENS.dark['glass-blur'])).toBeGreaterThan(
      px(MATERIAL_TOKENS.light['glass-blur'])
    );
  });

  it('gives media glass the same value in both themes', () => {
    // A photograph does not flip with the lights, so the panel over it must not
    // either. Measured: white-at-8% dark glass over a white backdrop is 1.13:1.
    expect(MATERIAL_TOKENS.light['glass-bg-media']).toBe(
      MATERIAL_TOKENS.dark['glass-bg-media']
    );
  });

  it('holds radius, motion and elevation as theme-invariant', () => {
    // A corner radius does not change with the lights. Keeping these out of the
    // per-theme maps is what stops someone "fixing" dark mode by rounding a
    // corner differently in one theme only.
    expect(INVARIANT_MATERIALS['radius-lg']).toBe('20px');
    expect(INVARIANT_MATERIALS['ease-spring']).toBe('cubic-bezier(0.32, 0.72, 0, 1)');
  });

  it('merges invariants into every theme via materialsFor', () => {
    for (const theme of THEMES) {
      expect(materialsFor(theme)).toMatchObject(INVARIANT_MATERIALS);
      expect(materialsFor(theme)['glass-bg']).toBe(MATERIAL_TOKENS[theme]['glass-bg']);
    }
  });
});
