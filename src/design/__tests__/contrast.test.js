import { describe, it, expect } from 'vitest';

import {
  THEME_TOKENS,
  STATUS_TOKENS,
  THEMES,
  STATUSES,
  BOOKING_STATUS_INTENT,
  tokensFor,
} from '../tokens';
import { contrastRatio, hexToRgb, relativeLuminance, WCAG } from '../contrast';

/**
 * A colour system is the one part of a design system a test can actually prove.
 * No assertion catches "this card feels cramped", but "this text is 3.9:1 against
 * the ground it sits on" is arithmetic — and it is the failure that makes a dark
 * theme unusable rather than merely ugly.
 *
 * So every pair the app can actually render is checked here, in both themes,
 * before a single component depends on it. That ordering is the point of Slice
 * 4B: the layer is provably correct before anything is migrated onto it.
 */

/** Grounds a piece of content can legitimately sit on. */
const GROUNDS = ['surface', 'surface-raised', 'surface-sunken', 'surface-overlay'];

/** Text roles that must be readable on any of those grounds. */
const TEXT_ROLES = ['content', 'content-muted', 'content-subtle'];

const INTENTS = ['success', 'warning', 'danger', 'info'];

/** Reports the measured ratio in the failure message, not just "false". */
const expectContrast = (fg, bg, min, label) => {
  const ratio = contrastRatio(fg, bg);
  expect(
    ratio,
    `${label}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min}:1`
  ).toBeGreaterThanOrEqual(min);
};

describe('contrast maths', () => {
  it('expands shorthand hex and parses both forms', () => {
    expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
    expect(hexToRgb('#0D4B6E')).toEqual([13, 75, 110]);
  });

  it('rejects anything that is not a colour, rather than guessing', () => {
    expect(() => hexToRgb('rebeccapurple')).toThrow(/Not a hex colour/);
    expect(() => hexToRgb('#12345')).toThrow(/Not a hex colour/);
  });

  it('anchors on the two ratios everyone knows', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#0D4B6E', '#0D4B6E')).toBeCloseTo(1, 5);
  });

  it('is symmetric — order of arguments cannot change the answer', () => {
    expect(contrastRatio('#0B2537', '#F5F9FC')).toBeCloseTo(
      contrastRatio('#F5F9FC', '#0B2537'),
      10
    );
  });

  it('matches the WCAG luminance reference points', () => {
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
  });
});

describe.each(THEMES)('%s theme meets WCAG AA', (theme) => {
  const T = tokensFor(theme);

  it.each(
    GROUNDS.flatMap((ground) => TEXT_ROLES.map((role) => [role, ground]))
  )('%s reads on %s', (role, ground) => {
    expectContrast(T[role], T[ground], WCAG.AA_TEXT, 'body text');
  });

  it('inverted content reads on the inverted surface', () => {
    expectContrast(
      T['content-inverse'],
      T['surface-inverse'],
      WCAG.AA_TEXT,
      'inverse pair'
    );
  });

  it.each(GROUNDS)('the brand colour reads as a link on %s', (ground) => {
    expectContrast(T.brand, T[ground], WCAG.AA_TEXT, 'brand as text');
  });

  it('text on a brand-filled button reads', () => {
    expectContrast(T['content-on-brand'], T.brand, WCAG.AA_TEXT, 'button label');
  });

  it('text on an accent-filled surface reads', () => {
    // #FFC107 against white is 1.7:1 and has always been. The accent carries
    // dark text; this asserts nobody quietly puts white on it again.
    expectContrast(
      T['content-on-accent'],
      T.accent,
      WCAG.AA_TEXT,
      'accent label'
    );
  });

  it('brand text reads on its own tinted ground', () => {
    expectContrast(
      T['brand-content'],
      T['brand-subtle'],
      WCAG.AA_TEXT,
      'brand on brand-subtle'
    );
  });

  it.each(GROUNDS)(
    'a control boundary is distinguishable on %s (WCAG 1.4.11)',
    (ground) => {
      expectContrast(
        T['border-strong'],
        T[ground],
        WCAG.AA_NON_TEXT,
        'control boundary'
      );
    }
  );

  it('the focus ring is visible against the page', () => {
    expectContrast(
      T['focus-ring'],
      T.surface,
      WCAG.AA_NON_TEXT,
      'focus indicator'
    );
  });

  describe.each(INTENTS)('%s status', (intent) => {
    it('reads on its own tinted ground', () => {
      expectContrast(
        T[`${intent}-content`],
        T[`${intent}-surface`],
        WCAG.AA_TEXT,
        `${intent} badge`
      );
    });

    // A badge is not always on its own tint — `AdminBookings` renders the
    // status text directly on a card. Both cases have to hold.
    it.each(GROUNDS)('reads directly on %s', (ground) => {
      expectContrast(
        T[`${intent}-content`],
        T[ground],
        WCAG.AA_TEXT,
        `${intent} text on page`
      );
    });
  });
});

describe('the token layer is complete and coherent', () => {
  it('defines exactly the same token names in both themes', () => {
    const [light, dark] = THEMES.map((theme) => Object.keys(tokensFor(theme)).sort());
    expect(dark).toEqual(light);
  });

  it('holds only parseable hex values', () => {
    for (const theme of THEMES) {
      for (const [name, value] of Object.entries(tokensFor(theme))) {
        expect(() => hexToRgb(value), `${theme}.${name} = ${value}`).not.toThrow();
      }
    }
  });

  it('actually differs between themes — a "dark" theme that is a copy is not one', () => {
    const changed = Object.keys(THEME_TOKENS.light).filter(
      (name) => THEME_TOKENS.light[name] !== THEME_TOKENS.dark[name]
    );
    // Only `accent` and `content-on-accent` are deliberately shared: the brand's
    // yellow is the same yellow in both themes and already carries dark text.
    expect(changed.length).toBeGreaterThan(Object.keys(THEME_TOKENS.light).length - 4);
  });

  it('inverts its grounds — dark surfaces are darker than light ones', () => {
    for (const ground of GROUNDS) {
      expect(
        relativeLuminance(THEME_TOKENS.dark[ground]),
        `${ground} should be darker in the dark theme`
      ).toBeLessThan(relativeLuminance(THEME_TOKENS.light[ground]));
    }
  });

  it('gives every status a triple in both themes', () => {
    for (const theme of THEMES) {
      for (const intent of INTENTS) {
        for (const part of ['surface', 'content', 'border']) {
          expect(STATUS_TOKENS[theme]).toHaveProperty(`${intent}-${part}`);
        }
      }
    }
  });

  it('maps every booking status to a real intent', () => {
    expect(Object.keys(BOOKING_STATUS_INTENT).sort()).toEqual([...STATUSES].sort());
    for (const intent of Object.values(BOOKING_STATUS_INTENT)) {
      expect(INTENTS).toContain(intent);
    }
  });

  it('does not render confirmed and completed identically', () => {
    // They were both green in two components, which erased the distinction the
    // admin acts on: confirmed means "on the calendar", completed means "done".
    expect(BOOKING_STATUS_INTENT.confirmed).not.toBe(BOOKING_STATUS_INTENT.completed);
  });
});
