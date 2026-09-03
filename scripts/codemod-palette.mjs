#!/usr/bin/env node
/**
 * Mechanically rewrites literal Tailwind palette classes to semantic tokens.
 *
 * Why a codemod rather than 59 hand-migrated files: the 2,772 literal palette
 * sites this codebase carries are not 2,772 decisions. They are ~240 distinct
 * classes, and the top twenty account for two thirds of every occurrence. That
 * shape — a tiny vocabulary repeated everywhere — is exactly what a codemod is
 * for, and hand-editing it would take dozens of review rounds while introducing
 * the inconsistency the token layer exists to remove.
 *
 * Two rules keep this honest:
 *
 * 1. **Only unambiguous classes are mapped.** A literal class carries no
 *    information about the ground it sits on, and some grounds do not flip with
 *    the theme. `text-white` over a dark photo overlay must stay light in dark
 *    mode; `text-white` on a brand button must follow the button. One class, two
 *    answers, so the table cannot hold it. Those live in AMBIGUOUS below, are
 *    left alone, and are named in ROADMAP.md as hand work.
 * 2. **The mapping is applied to every variant of a class uniformly.** The table
 *    is keyed by the bare class, and matching ignores any `hover:` / `focus:` /
 *    `md:` / `group-hover:` prefix, so a class cannot mean one thing at rest and
 *    another on hover.
 *
 * A second, context-aware pass then resolves the single largest ambiguous case:
 * `text-white` sitting in the *same class attribute* as a brand or status
 * ground is text on that ground, and becomes `content-on-brand`. That inference
 * is local and checkable, which is why it is allowed where the general case is
 * not.
 *
 *   node scripts/codemod-palette.mjs --dry     report what would change
 *   node scripts/codemod-palette.mjs           write the changes
 *
 * Idempotent: token names contain no palette hue, so a second run is a no-op.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';

/**
 * Literal class → semantic token.
 *
 * Grays carry the neutral roles, blue is the brand, and green/red/yellow are the
 * three status intents. The grays deliberately collapse: `text-gray-600` and
 * `text-gray-700` were never a considered distinction, they were two people
 * reaching for "muted body text" on different days, and the token layer has one
 * name for that.
 */
const MAP = {
  // ---- Neutrals: content -------------------------------------------------
  'text-gray-900': 'text-content',
  'text-gray-800': 'text-content',
  'text-gray-700': 'text-content-muted',
  'text-gray-600': 'text-content-muted',
  'text-gray-500': 'text-content-subtle',
  // gray-400 is used for placeholder and decorative iconography. `content-subtle`
  // is darker than gray-400, so this move raises contrast rather than lowering it.
  'text-gray-400': 'text-content-subtle',
  'placeholder-gray-500': 'placeholder-content-subtle',
  'placeholder-gray-400': 'placeholder-content-subtle',

  // ---- Neutrals: grounds -------------------------------------------------
  'bg-white': 'bg-surface-raised',
  'bg-gray-50': 'bg-surface',
  'bg-gray-100': 'bg-surface-sunken',
  'bg-gray-200': 'bg-surface-sunken',
  'bg-gray-300': 'bg-surface-sunken',

  // ---- Neutrals: lines ---------------------------------------------------
  // 100/200 separate content; 300/400 are control boundaries and take
  // `line-strong`, which is held to WCAG 1.4.11's 3:1 where `line` is not.
  'border-gray-100': 'border-line',
  'border-gray-200': 'border-line',
  'border-gray-300': 'border-line-strong',
  'border-gray-400': 'border-line-strong',
  'divide-gray-100': 'divide-line',
  'divide-gray-200': 'divide-line',
  'divide-gray-300': 'divide-line',

  // ---- Brand -------------------------------------------------------------
  'text-blue-500': 'text-brand',
  'text-blue-600': 'text-brand',
  'text-blue-700': 'text-brand',
  'text-blue-800': 'text-brand-content',
  'text-blue-900': 'text-brand-content',
  'bg-blue-50': 'bg-brand-subtle',
  'bg-blue-100': 'bg-brand-subtle',
  'bg-blue-200': 'bg-brand-subtle',
  'bg-blue-500': 'bg-brand',
  'bg-blue-600': 'bg-brand',
  'bg-blue-700': 'bg-brand-hover',
  'bg-blue-800': 'bg-brand-hover',
  'bg-blue-900': 'bg-brand-hover',
  'border-blue-100': 'border-brand-subtle',
  'border-blue-200': 'border-brand-subtle',
  'border-blue-300': 'border-brand-subtle',
  'border-blue-400': 'border-brand',
  'border-blue-500': 'border-brand',
  'border-blue-600': 'border-brand',
  'border-blue-700': 'border-brand',
  'accent-blue-600': 'accent-brand',
  // Focus is its own token precisely so a focus ring stays visible when the
  // theme changes; a blue ring on a dark ground is the case that fails.
  'ring-blue-500': 'ring-focus-ring',
  'ring-blue-600': 'ring-focus-ring',

  // ---- Success -----------------------------------------------------------
  'text-green-500': 'text-success-content',
  'text-green-600': 'text-success-content',
  'text-green-700': 'text-success-content',
  'text-green-800': 'text-success-content',
  'text-green-900': 'text-success-content',
  'bg-green-50': 'bg-success-surface',
  'bg-green-100': 'bg-success-surface',
  // A saturated green ground carries white text, so it maps to the dark
  // `success-content` hex rather than to the tint.
  'bg-green-500': 'bg-success-content',
  'bg-green-600': 'bg-success-content',
  'bg-green-700': 'bg-success-content',
  'border-green-100': 'border-success-border',
  'border-green-200': 'border-success-border',
  'border-green-400': 'border-success-border',
  'border-green-500': 'border-success-border',
  'accent-green-600': 'accent-success',

  // ---- Danger ------------------------------------------------------------
  'text-red-500': 'text-danger-content',
  'text-red-600': 'text-danger-content',
  'text-red-700': 'text-danger-content',
  'text-red-800': 'text-danger-content',
  'text-red-900': 'text-danger-content',
  'bg-red-50': 'bg-danger-surface',
  'bg-red-100': 'bg-danger-surface',
  'bg-red-500': 'bg-danger-content',
  'bg-red-600': 'bg-danger-content',
  'bg-red-700': 'bg-danger-content',
  'bg-red-900': 'bg-danger-content',
  'border-red-200': 'border-danger-border',
  'border-red-300': 'border-danger-border',
  'border-red-400': 'border-danger-border',
  'border-red-500': 'border-danger-border',

  // ---- Warning (yellow / amber / orange all meant the same thing) ---------
  'text-yellow-600': 'text-warning-content',
  'text-yellow-700': 'text-warning-content',
  'text-yellow-800': 'text-warning-content',
  'text-yellow-900': 'text-warning-content',
  'text-amber-800': 'text-warning-content',
  'text-amber-900': 'text-warning-content',
  'text-orange-600': 'text-warning-content',
  'text-orange-700': 'text-warning-content',
  'text-orange-800': 'text-warning-content',
  'bg-yellow-50': 'bg-warning-surface',
  'bg-yellow-100': 'bg-warning-surface',
  'bg-amber-50': 'bg-warning-surface',
  'bg-amber-100': 'bg-warning-surface',
  'bg-orange-50': 'bg-warning-surface',
  'border-yellow-100': 'border-warning-border',
  'border-yellow-200': 'border-warning-border',
  'border-yellow-500': 'border-warning-border',
  'border-amber-200': 'border-warning-border',
  'border-orange-200': 'border-warning-border',
  'accent-orange-600': 'accent-warning',

  // ---- Accent ------------------------------------------------------------
  // Saturated yellow in this codebase is never a warning — it is the brand's
  // accent: rating stars, the highlighted CTA. It has its own token, with a
  // dark `content-on-accent` because #FFC107 on white is 1.7:1 and always was.
  'text-yellow-400': 'text-accent',
  'text-yellow-500': 'text-accent',
  'fill-yellow-400': 'fill-accent',
  'fill-yellow-500': 'fill-accent',
  'bg-yellow-400': 'bg-accent',
  'bg-yellow-500': 'bg-accent',
  'bg-yellow-600': 'bg-accent-hover',
};

/**
 * Left alone deliberately, with the reason. Each needs the ground it sits on,
 * which a class name does not carry.
 *
 *   text-white / border-white   over a photo overlay it must stay light in both
 *                               themes; on a brand button it must follow the
 *                               button. Pass 2 resolves the button case only.
 *   bg-black / gradients        scrims and decorative gradients are compositions,
 *                               not roles; they need a design pass, not a table.
 *   text-gray-100..300          light text, so it is on a dark ground the class
 *                               name does not name.
 *   bg-gray-500..900            intentionally dark grounds that must not invert.
 *   purple / indigo / pink      no role in the token layer yet — deciding whether
 *                               they are brand, info, or decoration is a design
 *                               call, not a mechanical one.
 */
const AMBIGUOUS_NOTE = 'see ROADMAP.md — hand work, not table work';

/** Grounds that make a sibling `text-white` mean "text on this ground". */
const ON_BRAND_GROUNDS = [
  'bg-brand',
  'bg-brand-hover',
  'bg-primary',
  'bg-primary-dark',
  'bg-success-content',
  'bg-danger-content',
  'bg-warning-content',
];

/** `hover:`, `focus:`, `md:`, `group-hover:` … all precede the bare class. */
const boundary = (cls) =>
  new RegExp(`(?<![-\\w])${cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![-\\w])`, 'g');

const PATTERNS = Object.entries(MAP).map(([from, to]) => [boundary(from), to, from]);

/** Class attribute values, however they are written. */
const CLASS_ATTR = /(className\s*=\s*)(["'`])([\s\S]*?)\2/g;

/**
 * Pass 2 — `text-white` on a brand or status ground, resolved locally.
 *
 * Only fires when the ground is in the *same* class value, which is the one
 * place the relationship is visible without rendering the page.
 */
const resolveTextOnGround = (source) =>
  source.replace(CLASS_ATTR, (whole, head, quote, value) => {
    if (!value.includes('text-white')) return whole;
    if (!ON_BRAND_GROUNDS.some((g) => boundary(g).test(value))) return whole;
    const rewritten = value.replace(boundary('text-white'), 'text-content-on-brand');
    return `${head}${quote}${rewritten}${quote}`;
  });

const files = globSync('src/**/*.{js,jsx}', { exclude: (p) => p.includes('/design/tokens.js') });

let filesChanged = 0;
const perClass = new Map();

for (const file of files) {
  const before = readFileSync(file, 'utf8');
  let after = before;

  for (const [pattern, to, from] of PATTERNS) {
    const hits = after.match(pattern);
    if (!hits) continue;
    perClass.set(from, (perClass.get(from) || 0) + hits.length);
    after = after.replace(pattern, to);
  }

  after = resolveTextOnGround(after);

  if (after !== before) {
    filesChanged += 1;
    if (!process.argv.includes('--dry')) writeFileSync(file, after);
  }
}

const total = [...perClass.values()].reduce((a, b) => a + b, 0);
const verb = process.argv.includes('--dry') ? 'would rewrite' : 'rewrote';
console.log(`${verb} ${total} literal palette sites across ${filesChanged} files`);
console.log(`(ambiguous classes left in place — ${AMBIGUOUS_NOTE})`);
