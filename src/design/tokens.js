/**
 * The semantic token layer — the single source of truth for colour in this app.
 *
 * Two rules govern everything in this file.
 *
 * 1. **Tokens are named for their role, never for their value.** `surface-raised`
 *    survives a theme swap; `bg-white` cannot, because a literal name has already
 *    decided what it looks like. The ~3,000 raw palette classes this codebase
 *    accumulated are literal names, and every one of them has to be touched twice
 *    if the replacement is also literal.
 * 2. **Every value here is proven, not chosen.** `contrast.test.js` computes WCAG
 *    2.1 contrast for every content-on-surface pair in both themes and fails below
 *    4.5:1 (below 3:1 for UI boundaries). Editing a hex here without running that
 *    test is how a theme ships unreadable — it is the one part of a colour system a
 *    test genuinely can verify, so it does.
 *
 * Consumed two ways, both generated from this file so they cannot drift:
 *   - `src/styles/tokens.css`  — CSS custom properties, written by
 *     `scripts/generate-tokens.mjs`. `tokens.test.js` fails if it is stale.
 *   - `tailwind.config.js`     — utility names bound to those properties.
 *
 * Values are hex here because hex is what a designer reads and what a contrast
 * formula needs. The generator emits them as space-separated RGB channels so
 * Tailwind's `<alpha-value>` slot works (`bg-surface/80`).
 */

/** Role tokens. Every key exists in both themes — `tokens.test.js` asserts it. */
export const THEME_TOKENS = {
  light: {
    // Grounds, from the page backwards to the thing furthest in front of it.
    surface: '#F5F9FC',
    'surface-raised': '#FFFFFF',
    'surface-sunken': '#E7F0F7',
    'surface-overlay': '#FFFFFF',
    'surface-inverse': '#0A2E46',

    // Text and iconography.
    content: '#0B2537',
    'content-muted': '#42606F',
    'content-subtle': '#556F80',
    'content-inverse': '#F5F9FC',

    // Lines. `border` separates, `border-strong` is a control boundary and is
    // held to WCAG 1.4.11's 3:1 rather than to decorative taste.
    border: '#D6E3ED',
    'border-strong': '#6D8697',

    // Brand, as a role rather than a hex. `brand` is the interactive colour,
    // `brand-subtle` its tinted ground, `brand-content` text on that ground.
    brand: '#0D4B6E',
    'brand-hover': '#0A3A56',
    'brand-subtle': '#E4EFF6',
    'brand-content': '#0D4B6E',
    'content-on-brand': '#FFFFFF',

    // Accent carries dark text: #FFC107 against white is 1.7:1 and always was.
    accent: '#FFC107',
    'accent-hover': '#D9A106',
    'content-on-accent': '#3D2B00',

    // Focus is a token because a focus ring that inherits the theme is the
    // difference between visible and invisible in dark mode.
    'focus-ring': '#0D4B6E',
  },

  dark: {
    surface: '#08161F',
    'surface-raised': '#102636',
    'surface-sunken': '#050F16',
    'surface-overlay': '#16334A',
    'surface-inverse': '#F5F9FC',

    content: '#E9F2F8',
    'content-muted': '#A9C0D0',
    'content-subtle': '#93ADBF',
    'content-inverse': '#0B2537',

    border: '#1E394D',
    'border-strong': '#6B899E',

    // The brand hex is unreadable on a dark ground (2.1:1), so dark mode gets a
    // lighter brand rather than the same one at lower opacity.
    brand: '#5CB0DC',
    'brand-hover': '#84C6E8',
    'brand-subtle': '#0D2C3F',
    'brand-content': '#8ECAE9',
    'content-on-brand': '#04212F',

    accent: '#FFC107',
    'accent-hover': '#FFD149',
    'content-on-accent': '#3D2B00',

    'focus-ring': '#7FC4E8',
  },
};

/**
 * Status tokens.
 *
 * These exist because three components each decided independently what a
 * confirmed booking looks like, and they disagreed: `BookingStatusBadge` renders
 * confirmed in blue, `BookingList` renders it in green. A visitor-facing colour
 * that means two things means nothing. One map, consumed everywhere.
 *
 * Each status is a triple — its tinted ground, its text, its boundary — because a
 * badge needs all three and splitting them invites the same drift back in.
 */
export const STATUS_TOKENS = {
  light: {
    'success-surface': '#E7F6EE',
    'success-content': '#0E5C36',
    'success-border': '#8FCFB0',

    'warning-surface': '#FFF5E0',
    'warning-content': '#6E4604',
    'warning-border': '#E8C171',

    'danger-surface': '#FDEBEB',
    'danger-content': '#96181A',
    'danger-border': '#EFA7A7',

    'info-surface': '#E6F0F9',
    'info-content': '#124A76',
    'info-border': '#9CC3E3',
  },

  dark: {
    'success-surface': '#0B2A1B',
    'success-content': '#7BD7A3',
    'success-border': '#1F5738',

    'warning-surface': '#2B2005',
    'warning-content': '#F3C75F',
    'warning-border': '#5C4611',

    'danger-surface': '#2E1214',
    'danger-content': '#F3A2A2',
    'danger-border': '#61262A',

    'info-surface': '#0C2336',
    'info-content': '#8CC4EE',
    'info-border': '#204B71',
  },
};

/** The statuses the app models, in the order a booking moves through them. */
export const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

/**
 * Which status token each booking status wears.
 *
 * `confirmed` is info and `completed` is success deliberately: confirmed means
 * "on the calendar", completed means "done". Rendering both green — which two
 * components did — erases the distinction the admin actually acts on.
 */
export const BOOKING_STATUS_INTENT = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'danger',
};

/** Every token name, in emit order. Used by the generator and by the tests. */
export const THEMES = ['light', 'dark'];

export const tokensFor = (theme) => ({
  ...THEME_TOKENS[theme],
  ...STATUS_TOKENS[theme],
});
