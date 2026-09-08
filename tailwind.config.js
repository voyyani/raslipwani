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
  // Tests are excluded deliberately. A class name that appears only inside an
  // assertion — `expect(className).toMatch(/rounded-lg/)` — is not a class the
  // app ships, but the scanner cannot tell the difference and generates the rule
  // anyway. That is dead CSS in every visitor's first load, paid for by nobody's
  // benefit, and the stylesheet is this build's tightest line.
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '!./src/**/__tests__/**',
    '!./src/**/*.test.{js,jsx}',
    '!./src/test/**',
  ],

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
          'focus-ring',
          // Theme-invariant by design — the ground beneath them is a photograph
          // or a brand gradient, which does not flip. See FIXED_TOKENS.
          'content-on-media',
          'scrim',
          'surface-chrome',
          'surface-chrome-raised'
        ),

        // `border` collides with Tailwind's `border` utility if declared flat —
        // `border-border` reads badly, so the default of the object gives
        // `border-line` a home while keeping `border-line-strong` available.
        line: {
          DEFAULT: token('border'),
          strong: token('border-strong'),
          media: token('line-on-media'),
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

      // ---- Glass grounds. ---------------------------------------------------
      //
      // Declared on `backgroundColor` and `borderColor` rather than on `colors`,
      // and that is a budget decision with a measurement behind it. A name under
      // `colors` is generated for every colour property Tailwind knows —
      // text-, ring-, divide-, from-, via-, to-, caret-, accent- — which for six
      // glass names is a few hundred rules nothing will ever use. Glass is a
      // ground and an edge; it is never a text colour or a gradient stop.
      //
      // Values are full `rgb()` rather than channels, because their alpha is part
      // of the material rather than a modifier a caller chooses. `bg-glass/50` is
      // therefore deliberately not a thing: a caller who wants a different
      // opacity wants a different material, and these are the ones DESIGN.md
      // sanctions.
      backgroundColor: {
        glass: {
          DEFAULT: 'var(--glass-bg)',
          strong: 'var(--glass-bg-strong)',
          subtle: 'var(--glass-bg-subtle)',
          // Over photography. Not interchangeable with the others — see
          // DESIGN.md, "Why glass-bg-media exists".
          media: 'var(--glass-bg-media)',
          // The media ground with the alpha removed, for the panels that cannot
          // composite: no backdrop-filter, or reduced transparency requested.
          'media-solid': 'var(--glass-media-solid)',
        },
      },

      borderColor: {
        glass: {
          DEFAULT: 'var(--glass-border)',
          highlight: 'var(--glass-highlight)',
        },
      },

      fontFamily: {
        // The UI face is the platform's own. On iOS and macOS this resolves to
        // SF Pro, which is the actual typeface the "premium native" brief is
        // reaching for -- not an imitation of it, and optically sized by the OS.
        // It also costs zero bytes and zero requests, which is the first
        // instalment on this revamp's obligation to hold its own budget.
        //
        // The outgoing face was Poppins: a geometric sans, and the default of
        // roughly every startup landing page since 2018. See DESIGN.md.
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"Segoe UI Variable Text"',
          '"Segoe UI"',
          'Inter',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],

        // Poppins survives for display headlines only, where its geometry reads
        // as confident rather than generic. Loaded non-blocking in index.html:
        // a slow network gets the system face and loses nothing structural.
        display: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },

      // ---- Materials. ------------------------------------------------------
      //
      // These resolve to the custom properties generated from
      // src/design/materials.js, exactly as the colours do — so a component
      // writes `rounded-lg` and gets whatever DESIGN.md currently says that is,
      // rather than whatever Tailwind's default scale happened to mean.
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },

      boxShadow: {
        glass: 'var(--shadow-glass)',
        raised: 'var(--shadow-raised)',
        pressed: 'var(--shadow-pressed)',
      },

      backdropBlur: {
        glass: 'var(--glass-blur)',
        'glass-strong': 'var(--glass-blur-strong)',
      },

      backdropSaturate: {
        glass: 'var(--glass-saturate)',
      },

      transitionTimingFunction: {
        spring: 'var(--ease-spring)',
        'out-soft': 'var(--ease-out-soft)',
      },

      transitionDuration: {
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
        slow: 'var(--dur-slow)',
      },
    },
  },

  plugins: [],
};
