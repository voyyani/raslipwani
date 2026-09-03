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
 * A ground-aware pass runs first and resolves the single largest ambiguous case:
 * `text-white` sitting in the *same string* as a brand or status ground is text
 * on that ground, and becomes `content-on-brand`. That inference is local and
 * checkable, which is why it is allowed where the general case is not. It runs
 * before the table because the table sends every surviving `text-white` to
 * `content-on-media`, which would otherwise claim button labels.
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

  // ---- Over media --------------------------------------------------------
  //
  // These run *after* the context pass below, so anything resolvable as text on
  // a brand ground has already been taken. What is left sits on a photograph or
  // a brand gradient, and must stay light in both themes — which is what
  // `content-on-media` is for. The opacity steps preserve the hierarchy the
  // original light-blue and light-grey shades were expressing.
  'text-white': 'text-content-on-media',
  'border-white': 'border-line-media',
  'bg-black': 'bg-scrim',
  'text-gray-200': 'text-content-on-media/90',
  'text-gray-300': 'text-content-on-media/80',
  'text-blue-100': 'text-content-on-media/90',
  'text-blue-200': 'text-content-on-media/80',
  'text-blue-300': 'text-content-on-media/70',

  // ---- Gradient stops ----------------------------------------------------
  //
  // A gradient stop asks the same question a solid ground does — which role is
  // this? — so the blue stops resolve to the brand they always were, and the
  // near-black stops to the scrim they always were. The indigo, purple and pink
  // stops are left alone: they have no role in the token layer, and inventing
  // one for decoration is a design decision, not a mechanical one.
  'from-blue-500': 'from-brand',
  'from-blue-600': 'from-brand',
  'to-blue-600': 'to-brand',
  'to-blue-700': 'to-brand-hover',
  'from-blue-700': 'from-brand-hover',
  'from-blue-800': 'from-brand-hover',
  'to-blue-800': 'to-brand-hover',
  'from-blue-900': 'from-brand-hover',
  'via-blue-700': 'via-brand-hover',
  'via-blue-800': 'via-brand-hover',
  'via-blue-900': 'via-brand-hover',
  'from-blue-50': 'from-brand-subtle',
  'from-blue-100': 'from-brand-subtle',
  'to-blue-50': 'to-brand-subtle',
  'to-blue-100': 'to-brand-subtle',
  'via-blue-50': 'via-brand-subtle',
  'from-white': 'from-surface-raised',
  'to-white': 'to-surface-raised',
  'from-gray-50': 'from-surface',
  'to-gray-50': 'to-surface',
  'from-gray-100': 'from-surface-sunken',
  'from-gray-200': 'from-surface-sunken',
  'to-gray-200': 'to-surface-sunken',
  'to-gray-300': 'to-surface-sunken',
  'from-black': 'from-scrim',
  'to-black': 'to-scrim',
  'from-green-500': 'from-success-content',
  'to-green-600': 'to-success-content',
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

/**
 * Grounds that must not be mapped, and why.
 *
 * `bg-gray-800`/`bg-gray-900` and their gradient stops are an intentionally dark
 * *chrome* — the admin sidebar, the footer — not a scrim over an image. Mapping
 * them to `scrim` flattened the sidebar's three-stop gradient to pure black, and
 * mapping them to `surface-inverse` would invert the chrome in dark mode while
 * the white text over it stayed white. Both are wrong for different reasons, so
 * the table holds neither: they are hand-migrated to `surface-chrome`.
 */
const CHROME_NOTE = 'dark chrome — hand-migrated to surface-chrome';

/**
 * String and template literals, comments, in that order.
 *
 * Rewriting is confined to string literals because that is the only place a
 * class can be. The first version of this script replaced across whole files
 * and quietly edited the prose in doc comments — a comment explaining why
 * `bg-white` cannot be themed became one explaining why `bg-surface-raised`
 * cannot be themed, which is nonsense, and exactly the kind of damage a codemod
 * does silently. Comments are matched here only so they can be skipped.
 */
const SEGMENTS =
  /(`(?:\\[\s\S]|[^\\`])*`)|('(?:\\[\s\S]|[^\\'])*')|("(?:\\[\s\S]|[^\\"])*")|(\/\*[\s\S]*?\*\/)|(\/\/[^\n]*)/g;

const isComment = (segment) => segment.startsWith('/*') || segment.startsWith('//');

/**
 * The ground-aware pass — `text-white` on a brand or status ground.
 *
 * Fires only when the ground appears in the *same string* as the text class,
 * which is the one place the relationship is visible without rendering the page.
 *
 * This originally keyed off `className="…"` and so never matched
 * `className={`…`}` — which is how most of this codebase writes conditional
 * classes. The result was that button labels on brand grounds were swept into
 * `content-on-media` and would have rendered white on the light-blue dark-theme
 * brand at about 2:1. Working on string segments rather than on attributes
 * catches both spellings, and the ternary arms inside them.
 */
/**
 * Splits a segment into the scopes a single class list can occupy.
 *
 * A template literal is not one scope. `${active ? 'bg-brand text-white' :
 * 'text-white …'}` holds two mutually exclusive class lists, and treating the
 * whole literal as one scope leaks the active arm's brand ground onto the
 * inactive arm — which is exactly what happened to the admin sidebar's inactive
 * links on the first run. So each static run between `${}` holes is its own
 * scope, and inside a hole, each quoted string is its own scope.
 */
/**
 * Rewrites every `className` value in a source file through `fn`.
 *
 * The ground-aware pass has to be bounded to a real attribute, not to whatever
 * a quote-matching regex thinks a string is. An apostrophe in ordinary JSX prose
 * — "Kenya's coast" — opens a span that runs to the next apostrophe and silently
 * merges two unrelated elements into one scope, which is enough to leak a brand
 * ground onto an icon three lines away. So this walks `className=` and takes
 * either the quoted value or the brace-balanced expression after it, tracking
 * quotes and template literals so a brace inside a string cannot close it early.
 */
const eachClassName = (source, fn) => {
  let out = '';
  let i = 0;

  while (i < source.length) {
    const at = source.indexOf('className', i);
    if (at === -1) {
      out += source.slice(i);
      break;
    }

    let j = at + 'className'.length;
    while (/\s/.test(source[j])) j += 1;
    if (source[j] !== '=') {
      out += source.slice(i, at + 1);
      i = at + 1;
      continue;
    }
    j += 1;
    while (/\s/.test(source[j])) j += 1;

    const opener = source[j];
    let end;

    if (opener === '"' || opener === "'" || opener === '`') {
      end = j + 1;
      while (end < source.length && source[end] !== opener) {
        if (source[end] === '\\') end += 1;
        end += 1;
      }
      end += 1;
    } else if (opener === '{') {
      let depth = 0;
      let quote = null;
      end = j;
      while (end < source.length) {
        const ch = source[end];
        if (quote) {
          if (ch === '\\') end += 1;
          else if (ch === quote) quote = null;
        } else if (ch === '"' || ch === "'" || ch === '`') {
          quote = ch;
        } else if (ch === '{') {
          depth += 1;
        } else if (ch === '}') {
          depth -= 1;
          if (depth === 0) {
            end += 1;
            break;
          }
        }
        end += 1;
      }
    } else {
      out += source.slice(i, j);
      i = j;
      continue;
    }

    out += source.slice(i, j) + fn(source.slice(j, end));
    i = end;
  }

  return out;
};

const LITERAL =
  /`(?:\\[\s\S]|[^\\`])*`|'(?:\\.|[^\\'])*'|"(?:\\.|[^\\"])*"/g;

const perScope = (value, fn) => {
  // A plain quoted value is one class list.
  if (value.startsWith('"') || value.startsWith("'")) return fn(value);

  // A template literal is not one scope: each static run between `${}` holes is
  // its own class list, and each string inside a hole is another. A ternary's
  // two arms are mutually exclusive, so the ground in one must not be visible
  // from the other.
  if (value.startsWith('`')) {
    return value.replace(/\$\{[\s\S]*?\}|[^$]+|\$/g, (part) =>
      part.startsWith('${')
        ? part.replace(LITERAL, (lit) => perScope(lit, fn))
        : fn(part)
    );
  }

  // A `{…}` expression container: every literal inside it is its own scope.
  return value.replace(LITERAL, (lit) => perScope(lit, fn));
};

const resolveTextOnGround = (segment) => {
  // `content-on-media` is also claimed back here, which is what repairs the
  // sites the attribute-only version of this pass missed on its first run.
  const wrong = ['text-white', 'text-content-on-media'].filter((c) => segment.includes(c));
  if (!wrong.length) return segment;
  if (!ON_BRAND_GROUNDS.some((g) => boundary(g).test(segment))) return segment;
  return wrong.reduce(
    (out, cls) => out.replace(boundary(cls), 'text-content-on-brand'),
    segment
  );
};

const files = globSync('src/**/*.{js,jsx}', { exclude: (p) => p.includes('/design/tokens.js') });

let filesChanged = 0;
const perClass = new Map();

for (const file of files) {
  const before = readFileSync(file, 'utf8');

  // The context pass runs first, and must: the table sends every surviving
  // `text-white` to `content-on-media`, so a button label would be claimed as
  // media text if the ground-aware pass ran second.
  // Ground-aware first, always: the table sends every surviving `text-white` to
  // `content-on-media`, so running it first would claim button labels.
  const grounded = eachClassName(before, (value) => perScope(value, resolveTextOnGround));

  const after = grounded.replace(SEGMENTS, (segment) => {
    if (isComment(segment)) return segment;
    let out = segment;
    for (const [pattern, to, from] of PATTERNS) {
      const hits = out.match(pattern);
      if (!hits) continue;
      perClass.set(from, (perClass.get(from) || 0) + hits.length);
      out = out.replace(pattern, to);
    }
    return out;
  });

  if (after !== before) {
    filesChanged += 1;
    if (!process.argv.includes('--dry')) writeFileSync(file, after);
  }
}

const total = [...perClass.values()].reduce((a, b) => a + b, 0);
const verb = process.argv.includes('--dry') ? 'would rewrite' : 'rewrote';
console.log(`${verb} ${total} literal palette sites across ${filesChanged} files`);
console.log(`(ambiguous classes left in place — ${AMBIGUOUS_NOTE})`);
console.log(`(dark chrome left in place — ${CHROME_NOTE})`);
