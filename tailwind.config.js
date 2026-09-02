/**
 * Tailwind is bound to the semantic token layer, not to hexes.
 *
 * Every colour below resolves to a CSS custom property defined in
 * `src/styles/tokens.css`, which is generated from `src/design/tokens.js`. That
 * indirection is the whole point: `bg-surface-raised` means "the ground a card
 * sits on" and picks up whichever theme is active, where `bg-white` has already
 * decided and cannot be themed.
 *
 * The `<alpha-value>` slot is why the properties hold channels rather than hex —
 * it lets `bg-surface/80` and `border-border/50` work exactly like a built-in
 * colour.
 *
 * The literal palette (`bg-gray-100`, `text-blue-800`, …) is still reachable;
 * removing it outright would break ~3,000 call sites in one commit. It is fenced
 * instead by `eslint-rules/no-raw-palette-classes.js` under a ratcheting ceiling,
 * so the count can only fall. Slice 4C spends that budget.
 */

/** `rgb(var(--x) / <alpha-value>)` for each name, so opacity modifiers work. */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const semantic = (...names) =>
  Object.fromEntries(names.map((name) => [name, token(name)]));

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  // Class, not media. A media-query theme can only ever offer what the OS says;
  // a class lets the provider offer light / dark / system, which is what people
  // expect from a theme control.
  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        // ---- Semantic roles. Prefer these everywhere. --------------------
        ...semantic(
          'surface',
          'surface-raised',
          'surface-sunken',
          'surface-overlay',
          'surface-inverse',
          'content',
          'content-muted',
          'content-subtle',
          'content-inverse',
          'content-on-brand',
          'content-on-accent',
          'border-strong',
          'brand-hover',
          'brand-subtle',
          'brand-content',
          'accent-hover',
          'focus-ring'
        ),

        // `border` collides with Tailwind's `border` utility if declared flat —
        // `border-border` reads badly, so the default of the object gives
        // `border-line` a home while keeping `border-line-strong` available.
        line: {
          DEFAULT: token('border'),
          strong: token('border-strong'),
        },

        // ---- Status. One map, four intents, three parts each. -------------
        success: {
          DEFAULT: token('success-content'),
          surface: token('success-surface'),
          content: token('success-content'),
          border: token('success-border'),
        },
        warning: {
          DEFAULT: token('warning-content'),
          surface: token('warning-surface'),
          content: token('warning-content'),
          border: token('warning-border'),
        },
        danger: {
          DEFAULT: token('danger-content'),
          surface: token('danger-surface'),
          content: token('danger-content'),
          border: token('danger-border'),
        },
        info: {
          DEFAULT: token('info-content'),
          surface: token('info-surface'),
          content: token('info-content'),
          border: token('info-border'),
        },

        // ---- Brand. ------------------------------------------------------
        //
        // `primary`, `secondary`, `accent`, `light` and `dark` are kept because
        // ~470 call sites use them and Slice 4C is where those move. `primary`
        // and `accent` are now theme-aware — the brand hex is 2.1:1 on a dark
        // ground, so dark mode resolves a lighter one rather than shipping an
        // unreadable button.
        brand: {
          DEFAULT: token('brand'),
          hover: token('brand-hover'),
          subtle: token('brand-subtle'),
          content: token('brand-content'),
        },
        primary: {
          DEFAULT: token('brand'),
          dark: token('brand-hover'),
          light: '#1A6E9E',
        },
        secondary: {
          DEFAULT: '#1A7CA5',
          dark: '#146384',
          light: '#3D9CC4',
        },
        accent: {
          DEFAULT: token('accent'),
          dark: token('accent-hover'),
          light: '#FFD149',
        },
        light: '#F5F9FC',
        dark: '#0A2E46',
      },

      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },

  plugins: [],
};
