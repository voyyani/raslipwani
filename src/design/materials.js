/**
 * The material layer — glass, elevation, radius and motion.
 *
 * `tokens.js` answers "what colour is this?"; this file answers "what is it made
 * of?". They are separate files because they are emitted differently: a colour
 * becomes space-separated RGB channels so Tailwind's `<alpha-value>` slot works,
 * while a blur radius, a shadow list and a cubic-bézier are raw CSS values that
 * would be destroyed by that treatment.
 *
 * The world these values describe is recorded in DESIGN.md as "Coastal Light":
 * frosted layers over coastal photography, lifted by a bright top edge and a
 * shadow tinted with the content colour rather than with black. Black shadows on
 * a warm ground read as dirt; #0B2537 reads as depth.
 *
 * Rule, from DESIGN.md: glass is a layer, not a texture. These tokens are for
 * content that floats over something else. Content on flat ground uses
 * `surface-raised` and always did.
 */

/** Per-theme materials. Every key must exist in both — `materials.test.js` asserts it. */
export const MATERIAL_TOKENS = {
  light: {
    // Light glass separates by opacity: white at 72% over a bright coastal
    // photograph is unmistakably a pane of something.
    'glass-bg': 'rgb(255 255 255 / 0.72)',
    'glass-bg-strong': 'rgb(255 255 255 / 0.88)',
    'glass-bg-subtle': 'rgb(255 255 255 / 0.55)',

    // Glass laid over PHOTOGRAPHY rather than over the app's own ground.
    //
    // It is a separate token because a photograph can be any colour, and a panel
    // that takes its tint from the backdrop cannot guarantee contrast against
    // one. This tints toward `surface-inverse` and carries `content-on-media`
    // text, measured at 15.94:1 over black and 7.05:1 over white.
    //
    // Identical in both themes, because a photograph does not flip with the
    // lights. See the dark theme's copy of this value and glassContrast.test.js.
    'glass-bg-media': 'rgb(10 46 70 / 0.78)',


    // The same ground with the alpha taken out, for the two cases where the
    // browser will not composite: no `backdrop-filter` support, and a visitor
    // who has asked the OS to reduce transparency. Translucency without blur is
    // washed-out text, and `content-on-media` is white in both themes — so the
    // fallback has to stay dark in both themes too, which no `surface-*` token
    // does. Identical in light and dark for the same reason `glass-bg-media` is.
    'glass-media-solid': 'rgb(10 46 70)',

    'glass-border': 'rgb(255 255 255 / 0.60)',
    'glass-highlight': 'rgb(255 255 255 / 0.90)',

    'glass-blur': '20px',
    'glass-blur-strong': '32px',
    // Saturation is the difference between glass and fog. Backdrop content seen
    // through a real pane keeps its colour; through fog it goes grey.
    'glass-saturate': '180%',

    // Three stops: a contact edge, a lift, and an ambient pool. Tinted with the
    // content colour (#0B2537) rather than black.
    'shadow-glass':
      '0 1px 2px rgb(11 37 55 / 0.04), 0 8px 24px -4px rgb(11 37 55 / 0.10), 0 24px 48px -12px rgb(11 37 55 / 0.14)',
    'shadow-raised':
      '0 1px 2px rgb(11 37 55 / 0.05), 0 4px 12px -2px rgb(11 37 55 / 0.08)',
    'shadow-pressed': 'inset 0 1px 2px rgb(11 37 55 / 0.12)',
  },

  dark: {
    // Dark glass separates by blur, not opacity. A white panel at 72% on a dark
    // ground is not glass, it is a white panel — so the tint drops to 8% and the
    // blur climbs to carry the separation instead.
    'glass-bg': 'rgb(255 255 255 / 0.08)',
    'glass-bg-strong': 'rgb(255 255 255 / 0.14)',
    'glass-bg-subtle': 'rgb(255 255 255 / 0.05)',

    // The same value as light, and that is the point.
    //
    // White-at-8% over a bright photograph composites to nearly white and its
    // text disappears — measured at 1.13:1 before this token existed, which is
    // invisible, on exactly the surfaces this design is built around: the hero,
    // the International cards, every property image. The ordinary contrast test
    // could never have caught it, because it compares two opaque tokens against
    // a colour the browser stops painting the moment a panel goes translucent.
    'glass-bg-media': 'rgb(10 46 70 / 0.78)',


    // The same ground with the alpha taken out, for the two cases where the
    // browser will not composite: no `backdrop-filter` support, and a visitor
    // who has asked the OS to reduce transparency. Translucency without blur is
    // washed-out text, and `content-on-media` is white in both themes — so the
    // fallback has to stay dark in both themes too, which no `surface-*` token
    // does. Identical in light and dark for the same reason `glass-bg-media` is.
    'glass-media-solid': 'rgb(10 46 70)',

    'glass-border': 'rgb(255 255 255 / 0.14)',
    'glass-highlight': 'rgb(255 255 255 / 0.22)',

    'glass-blur': '32px',
    'glass-blur-strong': '48px',
    'glass-saturate': '140%',

    // Black on dark, because there is no warm ground left to muddy.
    'shadow-glass':
      '0 1px 2px rgb(0 0 0 / 0.24), 0 8px 24px -4px rgb(0 0 0 / 0.40), 0 24px 48px -12px rgb(0 0 0 / 0.52)',
    'shadow-raised':
      '0 1px 2px rgb(0 0 0 / 0.28), 0 4px 12px -2px rgb(0 0 0 / 0.36)',
    'shadow-pressed': 'inset 0 1px 2px rgb(0 0 0 / 0.40)',
  },
};

/**
 * Theme-invariant materials. A corner radius does not change with the lights, and
 * neither does an easing curve. Keeping them out of the per-theme maps is what
 * prevents someone "fixing" dark mode by rounding a corner differently in it.
 */
export const INVARIANT_MATERIALS = {
  // iOS proportions. The outgoing 8px `rounded-lg` was the second-most-obvious
  // tell after the typeface.
  'radius-sm': '10px',
  'radius-md': '14px',
  'radius-lg': '20px',
  'radius-xl': '28px',
  'radius-2xl': '36px',

  // One signature curve: the decelerating spring iOS uses for sheets and pushes.
  // Everything that moves uses this or ease-out-soft. Nothing uses linear.
  'ease-spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
  'ease-out-soft': 'cubic-bezier(0.16, 1, 0.30, 1)',

  'dur-fast': '150ms',
  'dur-base': '250ms',
  'dur-slow': '400ms',
};

/** Every material for one theme, invariants merged in. Mirrors `tokensFor`. */
export const materialsFor = (theme) => ({
  ...MATERIAL_TOKENS[theme],
  ...INVARIANT_MATERIALS,
});
