/**
 * Bans Tailwind's literal colour palette in application source.
 *
 * `bg-gray-100` names a value. `bg-surface-sunken` names a role. Only the second
 * can be themed, and this codebase has ~3,000 of the first — which is precisely
 * why dark mode has never worked here: a literal class has already decided what
 * it looks like before the theme gets a say.
 *
 * The rule is a `warn`, not an `error`, on purpose. Turning ~3,000 call sites red
 * in one commit forces either a mega-PR nobody can review or a blanket disable
 * comment, and both end with the debt intact. Instead the count is enforced by
 * `scripts/palette-ratchet.mjs` against `palette-budget.json` — the number may
 * fall and may not rise, exactly like the coverage floor. Slice 4C spends it
 * surface by surface, and each PR lowers the ceiling.
 *
 * What it looks at: every string literal and template chunk, not only JSX
 * `className` attributes. Half the palette debt here lives in configuration
 * objects (`{ color: 'bg-yellow-100 text-yellow-800' }`) that a className-only
 * check would never see.
 */

const HUES = [
  'slate', 'gray', 'zinc', 'neutral', 'stone',
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal',
  'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
];

const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

// The utilities that take a colour. `shadow` and `ring-offset` are included
// because a shadow tinted with a literal grey is as untheme-able as a background.
const UTILITIES = [
  'bg', 'text', 'border', 'ring', 'ring-offset', 'divide', 'placeholder',
  'outline', 'decoration', 'accent', 'caret', 'fill', 'stroke', 'shadow',
  'from', 'via', 'to',
];

// Any leading variant chain (`hover:`, `md:`, `dark:`, `group-hover:`, `[&>*]:`)
// then a colour utility, then either a hue/shade pair or bare white/black.
// Built from `String.raw` pieces on both sides of the interpolations: a plain
// template literal silently turns `\w` into `w`, which quietly narrowed the
// trailing boundary to a two-character character class.
const PALETTE_CLASS = new RegExp(
  String.raw`(?:^|\s)((?:[-a-z0-9[\]&>_.!:]+:)*` +
    `(?:${UTILITIES.join('|')})-` +
    `(?:(?:${HUES.join('|')})-(?:${SHADES.join('|')})|white|black))` +
    String.raw`(?![-\w])`,
  'g'
);

/** Where each hue family usually wants to land, so the warning is actionable. */
const SUGGESTIONS = {
  slate: 'surface-* / content-* / line',
  gray: 'surface-* / content-* / line',
  zinc: 'surface-* / content-* / line',
  neutral: 'surface-* / content-* / line',
  stone: 'surface-* / content-* / line',
  green: 'success-surface / success-content / success-border',
  emerald: 'success-surface / success-content / success-border',
  teal: 'success-surface / success-content / success-border',
  lime: 'success-surface / success-content / success-border',
  amber: 'warning-surface / warning-content / warning-border',
  yellow: 'warning-surface / warning-content / warning-border',
  orange: 'warning-surface / warning-content / warning-border',
  red: 'danger-surface / danger-content / danger-border',
  rose: 'danger-surface / danger-content / danger-border',
  blue: 'info-* or brand / brand-subtle / brand-content',
  sky: 'info-* or brand / brand-subtle / brand-content',
  cyan: 'info-* or brand / brand-subtle / brand-content',
  indigo: 'brand / brand-subtle / brand-content',
  violet: 'brand / brand-subtle / brand-content',
  purple: 'brand / brand-subtle / brand-content',
  fuchsia: 'brand / brand-subtle / brand-content',
  pink: 'brand / brand-subtle / brand-content',
};

const suggestionFor = (className) => {
  if (/-(white|black)$/.test(className)) {
    return 'surface-raised / content-inverse / content-on-brand';
  }
  const hue = HUES.find((h) => className.includes(`-${h}-`));
  return SUGGESTIONS[hue] ?? 'a semantic token';
};

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow literal Tailwind palette classes; use the semantic tokens in src/design/tokens.js',
    },
    schema: [],
    messages: {
      rawPalette:
        '`{{className}}` is a literal colour and cannot be themed. Use a semantic token ({{suggestion}}) — see src/design/tokens.js.',
    },
  },

  create(context) {
    /** Report every occurrence separately: the ratchet counts warnings. */
    const scan = (node, text) => {
      if (typeof text !== 'string' || !text.includes('-')) return;

      for (const [, className] of text.matchAll(PALETTE_CLASS)) {
        context.report({
          node,
          messageId: 'rawPalette',
          data: { className, suggestion: suggestionFor(className) },
        });
      }
    };

    return {
      Literal(node) {
        scan(node, node.value);
      },
      TemplateElement(node) {
        scan(node, node.value.cooked);
      },
    };
  },
};
