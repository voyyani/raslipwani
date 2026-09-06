# Block 2 — Icon Consolidation, Admin Labels, and the Admin Accessibility Gate

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove `react-icons` so the app ships one icon library, label the 65 remaining
form controls in the admin console, and extend the existing axe gate over admin — in that
order, so the gate arrives clean rather than arriving red and being switched off.

**Architecture:** Three workstreams, sequenced by dependency. The icon work follows the
argument that already paid off for the colour migration: 200 call sites across 29 files are
not 200 decisions, they are **77 distinct icon names and three sizing idioms**, so a table
plus a codemod does the repetition and a human does the four files where an icon is stored
as a *component value* rather than rendered as JSX. The label work routes admin fields
through the existing `Field`/`Input`/`Textarea`/`Select` primitives, which cannot produce
an unlabelled control, rather than hand-pairing `htmlFor`. The axe work extends
`src/test/a11y/` to the admin surfaces — measured first, fixed, and only then wired into
CI, because a gate that lands failing gets disabled.

**Tech Stack:** React 18 + Vite 5, Tailwind (semantic token layer in `src/design`),
Vitest + jsdom + Testing Library, `axe-core`, ESLint 9 flat config with a local
`design/no-raw-palette-classes` rule, `lucide-react` 0.562.

**Spec:** `ROADMAP.md` — "Block 2 — Finish the migration's long tail", plus the six
standing rules under "How to execute this". Read both before starting.

---

## Global Constraints

Copied from the spec. Every task's requirements implicitly include these.

- **Every block ends deployed, not merely written.** Commit and push as you go; do not
  leave finished tasks on an unpushed branch.
- **Guard rails land with the work, not after it.** A task that removes a defect also
  lands the thing that stops it coming back.
- **Ship a ratchet, not an error, when a defect is too large to fix at once.** A rule that
  fails the build on arrival with dozens of violations gets switched off within a day.
- **A gate scoped to what is clean beats a gate deferred until everything is.** This is why
  the labels (Tasks 7–10) come before the admin axe gate (Tasks 11–12).
- **Mechanise the repetition; keep the judgement.** The palette codemod, run without that
  discipline, quietly rewrote four doc comments, flattened a gradient, and leaked a brand
  ground onto the wrong half of a ternary — all three found by *reading its output*, none
  by a test. Every codemod task here has a mandatory human-read step. Do not skip it.
- **Measure, don't assert.** Every number below was measured on this tree on 2026-09-06.
  Re-measure rather than repeating them.
- Coverage floors in `vitest.config.js` **only go up**: statements 59, lines 60,
  functions 49, branches 49.
- Budget files **only fall**: `label-budget.json` (`max: 65`), `palette-budget.json`
  (`max: 94`), `bundle-budget.json` (`firstLoadGzipKb: 219`).
- Icon registry names stay in **FontAwesome vocabulary** (`map-marker-alt`, not `MapPin`).
  This is deliberate: several call sites store the icon as a *string* in a data array, and
  content-shaped data must stay serialisable.
- No literal Tailwind palette classes in new code — use the semantic tokens
  (`text-content`, `bg-surface-raised`, `border-line-strong`, `text-danger-content`, …).
- `npm run lint`, `npm run test:coverage`, `npm run palette:ratchet`,
  `npm run label:ratchet`, `npm run test:a11y` and `npm run build` must all pass before
  any commit is pushed. That is exactly what `.github/workflows/ci.yml` runs.

## Baseline (measured 2026-09-06 on `main` @ `2e9f16f`)

| Thing | Value |
|---|---|
| Files importing `react-icons` | **29** (28 call sites + `Icon.jsx` itself) |
| Distinct `react-icons` names in use | **77** |
| JSX icon usages | **200** — 43 sized with `text-*`, 33 with `w-*`, ~124 bare |
| Files storing an icon as a component value | **4** (`AdminLayout`, `AdminBottomNav`, `AdminHeader`, `Settings`) |
| `vendor-icons` chunk | **32.0 kB raw / 7.6 kB gzip** |
| First-load bundle | **215.3 kB gzip** of a 219 kB budget (3.7 kB headroom) |
| Main CSS bundle | **76.3 kB raw / 13.0 kB gzip** |
| Unlabelled form controls (`jsx-a11y/label-has-associated-control`) | **65**, all in admin |
| axe violations, public surfaces + chrome | **0**, enforced in CI |

Reproduce any of these with:

```bash
npm run build && npm run bundle:report      # chunk sizes, first-load budget
npm run label:ratchet                       # unlabelled controls, per file
npx eslint src --format json                # raw rule data
```

---

## File Structure

**Created**

- `scripts/codemod-icons.mjs` — the react-icons → `<Icon>` codemod. Owns the name table
  and the size-class table; refuses anything it cannot decide. Sibling of
  `scripts/codemod-palette.mjs` and follows its conventions (`--dry` reports, no flag
  writes, idempotent).
- `scripts/__tests__/codemod-icons.test.js` — unit tests for the transform, so the table
  is proven before it touches 200 call sites.
- `src/components/BrandMarks.jsx` — the three Simple Icons marks (WhatsApp, TikTok,
  Pinterest) as local SVG components. `lucide-react` has no mark for these three, and they
  are the only reason `Icon.jsx` still reaches for `react-icons`.
- `src/test/a11y/adminSurfaces.axe.test.jsx` — the admin accessibility gate, mirroring
  `publicSurfaces.axe.test.jsx`.
- `src/test/utils/authenticatedAdmin.jsx` — a render helper that puts an admin session in
  place, so admin surfaces render their real interface under test instead of a loading
  state.

**Modified**

- `src/components/Icon.jsx` — +37 registry entries; the `react-icons/si` import is replaced
  by `./BrandMarks`.
- `src/components/__tests__/Icon.test.jsx` — new coverage assertions; a "react-icons stays
  gone" guard alongside the existing FontAwesome one.
- 28 call-site files — see Tasks 4 and 5 for the exact lists.
- `src/pages/admin/settings/*.jsx` (6 files), `src/pages/admin/AdminProperties.jsx`,
  `src/pages/admin/AdminBookings.jsx`, `src/pages/admin/BookingDetailModal.jsx`,
  `src/components/CommunicationTimeline.jsx`, `src/components/PropertyInterests.jsx` —
  fields routed through the `ui/` primitives.
- `package.json` — `react-icons` dropped from `dependencies`; `a11y:admin` script added.
- `vite.config.js` — `vendor-icons` manual chunk loses `react-icons`.
- `eslint.config.js` — `jsx-a11y/label-has-for` disabled once the labels are done.
- `label-budget.json` — ratcheted 65 → 0.
- `.github/workflows/ci.yml` — the axe step covers admin.
- `ROADMAP.md` — Block 2 checkboxes and the gaps table updated with re-measured numbers.

**Explicitly out of scope** (still open in Block 2, not in this plan's ask): the last 94
raw palette classes, the by-eye third-party dark-mode audit (FullCalendar, react-quill,
`.custom-calendar`), live regions for async status, and the CSS-under-50 kB target. Task 6
*measures* what the icon removal does to the CSS bundle and writes the answer down, because
the roadmap currently predicts a win there and that prediction should be checked rather
than inherited.

---

## Task 1: Extend the Icon registry to cover the admin vocabulary

The registry has 54 names, built for the public surfaces. The 28 admin call-site files use
77 distinct `react-icons` names; 40 of them already map onto existing registry entries, and
**37 need new ones**. Adding them all first means every later task is a pure call-site
change with nothing to decide.

Every `lucide-react` export named below was verified present in the installed 0.562.0.

**Files:**
- Modify: `src/components/Icon.jsx`
- Test: `src/components/__tests__/Icon.test.jsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `ICON_NAMES` grows from 54 to 91 entries. The 37 new registry names, which
  Tasks 3–5 use as the right-hand side of the codemod table:
  `ban`, `bars`, `bug`, `building`, `calendar`, `calendar-day`, `calendar-week`, `check`,
  `chevron-left`, `chevron-right`, `cloud`, `cloud-upload-alt`, `cog`, `compress`,
  `dollar-sign`, `download`, `edit`, `ellipsis-v`, `exclamation-triangle`, `expand`,
  `external-link-alt`, `filter`, `globe`, `info-circle`, `landmark`, `list`, `plus`,
  `plus-circle`, `question-circle`, `sign-out-alt`, `tachometer-alt`, `th`, `times-circle`,
  `tools`, `trash`, `upload`, `user-friends`.

- [ ] **Step 1: Write the failing test**

Add this to `src/components/__tests__/Icon.test.jsx`, inside the existing
`describe('Icon registry', ...)` block, after the last `it`:

```jsx
  it('covers the vocabulary the admin console uses', () => {
    // Named explicitly rather than counted: a count passes if someone adds
    // thirty-seven of the wrong names. These are the 37 entries the react-icons
    // call sites in src/pages/admin and src/components need, in the FontAwesome
    // vocabulary the registry keys already use.
    const ADMIN_VOCABULARY = [
      'ban', 'bars', 'bug', 'building', 'calendar', 'calendar-day', 'calendar-week',
      'check', 'chevron-left', 'chevron-right', 'cloud', 'cloud-upload-alt', 'cog',
      'compress', 'dollar-sign', 'download', 'edit', 'ellipsis-v',
      'exclamation-triangle', 'expand', 'external-link-alt', 'filter', 'globe',
      'info-circle', 'landmark', 'list', 'plus', 'plus-circle', 'question-circle',
      'sign-out-alt', 'tachometer-alt', 'th', 'times-circle', 'tools', 'trash',
      'upload', 'user-friends',
    ];

    const missing = ADMIN_VOCABULARY.filter((name) => !ICON_NAMES.includes(name));
    expect(missing).toEqual([]);
  });
```

- [ ] **Step 2: Run the test and watch it fail**

```bash
npx vitest run src/components/__tests__/Icon.test.jsx -t 'admin console'
```

Expected: FAIL, listing all 37 names in the `missing` array.

- [ ] **Step 3: Add the 37 entries**

In `src/components/Icon.jsx`, extend the `lucide-react` import with these names, keeping
the list alphabetical as it already is:

```jsx
  Ban,
  Bug,
  Calendar,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CirclePlus,
  CircleX,
  Cloud,
  CloudUpload,
  DollarSign,
  EllipsisVertical,
  ExternalLink,
  Info,
  Landmark,
  LayoutDashboard,
  LayoutGrid,
  List,
  ListFilter,
  LogOut,
  Maximize,
  Menu,
  Minimize,
  Plus,
  Settings as SettingsGear,
  SquarePen,
  Trash2,
  TriangleAlert,
  Upload,
  UsersRound,
  Wrench,
```

`Settings` is aliased to `SettingsGear` because `Settings` is also the name of an admin
page in this codebase, and an unaliased import here is a trap for the next reader.

Then add these entries to `REGISTRY`, grouped under new comment headings that match the
file's existing style:

```jsx
  // Admin navigation and shell
  'tachometer-alt': LayoutDashboard,
  'bars': Menu,
  'th': LayoutGrid,
  'list': List,
  'cog': SettingsGear,
  'sign-out-alt': LogOut,
  'ellipsis-v': EllipsisVertical,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,

  // Admin record actions
  'check': Check,
  'edit': SquarePen,
  'trash': Trash2,
  'plus': Plus,
  'plus-circle': CirclePlus,
  'ban': Ban,
  'filter': ListFilter,
  'download': Download,
  'upload': Upload,
  'cloud-upload-alt': CloudUpload,
  'expand': Maximize,
  'compress': Minimize,
  'external-link-alt': ExternalLink,

  // Admin status and diagnostics
  'exclamation-triangle': TriangleAlert,
  'times-circle': CircleX,
  'info-circle': Info,
  'question-circle': CircleHelp,
  'bug': Bug,
  'tools': Wrench,

  // Scheduling and money
  'calendar': Calendar,
  'calendar-day': CalendarDays,
  'calendar-week': CalendarRange,
  'dollar-sign': DollarSign,

  // Places and people, admin flavour
  'building': Building2,
  'landmark': Landmark,
  'globe': Globe,
  'cloud': Cloud,
  'user-friends': UsersRound,
```

`Building2` and `Globe` are already imported for `city` and `globe-africa`; do not import
them twice. `Download` is already imported for `file-export`. Three registry names now map
to the same component in each of those cases, which is correct — they are distinct words in
the call-site vocabulary that happen to draw the same glyph.

- [ ] **Step 4: Run the tests and watch them pass**

```bash
npx vitest run src/components/__tests__/Icon.test.jsx
```

Expected: PASS. The pre-existing `renders an SVG for every registered name` test now
renders 94 icons and is the thing that catches a typo in any lucide name above.

- [ ] **Step 5: Commit**

```bash
git add src/components/Icon.jsx src/components/__tests__/Icon.test.jsx
git commit -m "feat(icons): extend the registry to the admin vocabulary

Adds the 37 names the 28 react-icons call sites in the admin console need,
so the migration that follows is a pure call-site change with nothing left
to decide. Names stay in FontAwesome vocabulary because several call sites
store the icon as a string in a data array.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01J7hDmLcJ9hsWGatRa6a4iF"
```

---

## Task 2: Cut the last `react-icons` import out of `Icon.jsx`

`Icon.jsx` imports `SiPinterest`, `SiTiktok` and `SiWhatsapp` from `react-icons/si`.
`lucide-react` carries no mark for these three brands, so removing the dependency means
these paths have to live locally. Simple Icons is CC0, so copying the path data is fine;
the marks below were extracted from the installed `react-icons@5.5.0` on 2026-09-06, so
they are byte-identical to what ships today and this task changes no pixels.

**Files:**
- Create: `src/components/BrandMarks.jsx`
- Modify: `src/components/Icon.jsx`
- Test: `src/components/__tests__/Icon.test.jsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `src/components/BrandMarks.jsx` default-exports nothing and named-exports
  `Pinterest`, `TikTok`, `WhatsApp` — each a component with the same call signature
  `lucide-react` icons have, i.e. `({ size, className, ...rest })` rendering an `<svg>`.
  This matters: `Icon` spreads `size`, `className` and the ARIA attributes onto whatever
  the registry holds, so a brand mark that does not accept them silently loses its sizing.

- [ ] **Step 1: Write the failing test**

Add a new top-level `describe` to `src/components/__tests__/Icon.test.jsx`:

```jsx
describe('brand marks are local, not a dependency', () => {
  it('sizes a brand mark the same way it sizes a lucide icon', () => {
    // The bug this catches: a brand mark that ignores `size` renders at its
    // viewBox default and is visibly wrong next to its neighbours, which no
    // snapshot in this repo would notice.
    const { container: brand } = render(<Icon name="whatsapp" size={32} />);
    const { container: lucide } = render(<Icon name="facebook" size={32} />);

    expect(brand.querySelector('svg')).toHaveAttribute('width', '32');
    expect(lucide.querySelector('svg')).toHaveAttribute('width', '32');
  });

  it('hides a brand mark from assistive technology by default', () => {
    const { container } = render(<Icon name="tiktok" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws all three marks that lucide does not carry', () => {
    for (const name of ['whatsapp', 'tiktok', 'pinterest']) {
      const { container, unmount } = render(<Icon name={name} />);
      const path = container.querySelector('svg path');
      expect(path, `<Icon name="${name}"> drew no path`).not.toBeNull();
      expect(path.getAttribute('d').length).toBeGreaterThan(100);
      unmount();
    }
  });
});
```

- [ ] **Step 2: Run it and watch the sizing assertion fail**

```bash
npx vitest run src/components/__tests__/Icon.test.jsx -t 'brand marks'
```

Expected: FAIL on `sizes a brand mark the same way`. `react-icons` renders `1em`, not
`32` — which is precisely the mismatch this migration exists to remove.

- [ ] **Step 3: Create `src/components/BrandMarks.jsx`**

```jsx
import React from 'react';
import PropTypes from 'prop-types';

/**
 * The three brand marks `lucide-react` does not carry.
 *
 * Facebook, Instagram, Twitter and LinkedIn all exist in lucide, so they are
 * imported there. WhatsApp, TikTok and Pinterest do not, and they were the only
 * reason `Icon.jsx` still imported from `react-icons` — one dependency, three
 * glyphs. The path data below is Simple Icons (CC0), copied verbatim from
 * `react-icons@5.5.0` so this change draws exactly what shipped before it.
 *
 * The signature deliberately matches a lucide icon's: `Icon` spreads `size`,
 * `className` and the ARIA attributes onto whatever the registry holds, so a
 * mark that did not accept them would silently render at the wrong size.
 */
const Mark = ({ size = 16, className = '', d, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
    {...rest}
  >
    <path d={d} />
  </svg>
);

Mark.propTypes = {
  size: PropTypes.number,
  className: PropTypes.string,
  d: PropTypes.string.isRequired,
};

const WHATSAPP_PATH =
  'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z';

const TIKTOK_PATH =
  'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z';

const PINTEREST_PATH =
  'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z';

export const WhatsApp = (props) => <Mark {...props} d={WHATSAPP_PATH} />;
export const TikTok = (props) => <Mark {...props} d={TIKTOK_PATH} />;
export const Pinterest = (props) => <Mark {...props} d={PINTEREST_PATH} />;
```

- [ ] **Step 4: Point the registry at the local marks**

In `src/components/Icon.jsx`, delete this line:

```jsx
import { SiPinterest, SiTiktok, SiWhatsapp } from 'react-icons/si';
```

and add, after the `lucide-react` import:

```jsx
import { Pinterest, TikTok, WhatsApp } from './BrandMarks';
```

Then change the three registry entries and update the comment above them, which currently
says these come from `react-icons`:

```jsx
  // Brand marks. Lucide carries these four; it has no mark for TikTok,
  // WhatsApp or Pinterest, so those three are drawn locally from Simple Icons
  // path data — see BrandMarks.jsx.
  'facebook': Facebook,
  'instagram': Instagram,
  'twitter': Twitter,
  'linkedin': Linkedin,
  'whatsapp': WhatsApp,
  'tiktok': TikTok,
  'pinterest': Pinterest,
```

- [ ] **Step 5: Run the tests and watch them pass**

```bash
npx vitest run src/components/__tests__/Icon.test.jsx
npm run test:a11y
```

Expected: both PASS. The a11y run matters here because `Footer` renders the social marks
on every public page, so this is where a broken mark shows up first.

- [ ] **Step 6: Commit**

```bash
git add src/components/BrandMarks.jsx src/components/Icon.jsx src/components/__tests__/Icon.test.jsx
git commit -m "refactor(icons): draw the three non-lucide brand marks locally

react-icons was a whole dependency held open by three glyphs lucide does not
carry. The Simple Icons path data (CC0) is copied verbatim from react-icons
5.5.0, so this draws exactly what shipped before it, and the local marks take
a numeric size prop like every other icon rather than react-icons' 1em.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01J7hDmLcJ9hsWGatRa6a4iF"
```

---

## Task 3: Write the icon codemod, and prove the table before it runs

200 call sites, 77 names, three sizing idioms. That is a vocabulary, not 200 judgements —
the same shape the palette migration had, where a table applied mechanically took an
afternoon instead of 59 review rounds *and* produced a consistent result that
hand-migration did not.

The judgement this codemod is not allowed to make: an icon that is stored as a **component
value** (`{ icon: FaHome }`) rather than rendered as JSX. Converting those means changing
the shape of a data array *and* its render site, which is two coordinated edits in one
file. The codemod refuses those files by name and Task 5 does them by hand.

This task writes and tests the codemod. It does not run it over `src/`.

**Files:**
- Create: `scripts/codemod-icons.mjs`
- Test: `scripts/__tests__/codemod-icons.test.js`

**Interfaces:**
- Consumes: the 37 registry names from Task 1.
- Produces: `scripts/codemod-icons.mjs` named-exports
  `transform(source: string, iconImportPath: string) -> { code: string, refusals: string[], reviews: string[] }`
  and `NAME_MAP: Record<string, string>`. `refusals` non-empty means the file was left
  untouched; `reviews` names things that were converted but a human must look at.

- [ ] **Step 1: Write the failing tests**

Create `scripts/__tests__/codemod-icons.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { transform, NAME_MAP } from '../codemod-icons.mjs';

const ICON = '@/components/Icon';

describe('the name table', () => {
  it('maps every react-icons name in use to a registry name', () => {
    // 74 names: the 77 distinct names measured in src/ on 2026-09-06 minus the
    // three Si* brand marks, which live in Icon.jsx and are handled by Task 2.
    expect(Object.keys(NAME_MAP)).toHaveLength(74);
  });

  it('sends every FontAwesome and Feather spelling of one glyph to one name', () => {
    // FaTimes and FiX are the same X. Two registry names for it would be two
    // slightly different X icons on adjacent admin screens, which is the exact
    // inconsistency this consolidation exists to remove.
    expect(NAME_MAP.FaTimes).toBe(NAME_MAP.FiX);
    expect(NAME_MAP.FaHome).toBe(NAME_MAP.FiHome);
    expect(NAME_MAP.FaSearch).toBe(NAME_MAP.FiSearch);
    expect(NAME_MAP.FaPhone).toBe(NAME_MAP.FiPhone);
    expect(NAME_MAP.FaGlobe).toBe(NAME_MAP.FiGlobe);
  });
});

describe('rewriting call sites', () => {
  it('rewrites a bare icon and its import', () => {
    const source = [
      "import { FaSave } from 'react-icons/fa';",
      '',
      'const C = () => <FaSave />;',
    ].join('\n');

    const { code, refusals } = transform(source, ICON);

    expect(refusals).toEqual([]);
    expect(code).toContain("import Icon from '@/components/Icon';");
    expect(code).not.toContain('react-icons');
    expect(code).toContain('<Icon name="save" />');
  });

  it('keeps a className that carries no sizing', () => {
    const source = [
      "import { FaTimes } from 'react-icons/fa';",
      'const C = () => <FaTimes className="mr-1" />;',
    ].join('\n');

    expect(transform(source, ICON).code).toContain('<Icon name="times" className="mr-1" />');
  });

  it('translates a text-size class into an explicit size prop', () => {
    // The whole reason a codemod is safer than 200 hand edits: react-icons
    // renders at 1em so `text-3xl` sized it, and an SVG with width/height
    // attributes ignores font-size entirely. Every one of these 43 call sites
    // would silently shrink to 16px if the class were merely carried over.
    const source = [
      "import { FaSpinner } from 'react-icons/fa';",
      'const C = () => <FaSpinner className="animate-spin text-3xl text-brand" />;',
    ].join('\n');

    const { code } = transform(source, ICON);

    expect(code).toContain('size={30}');
    expect(code).toContain('className="animate-spin text-brand"');
    expect(code).not.toContain('text-3xl');
  });

  it('translates a matched w-/h- pair into a size prop', () => {
    const source = [
      "import { FaEye } from 'react-icons/fa';",
      'const C = () => <FaEye className="w-5 h-5" />;',
    ].join('\n');

    const { code } = transform(source, ICON);

    expect(code).toContain('<Icon name="eye" size={20} />');
    expect(code).not.toContain('w-5');
  });

  it('leaves a mismatched w-/h- pair alone and flags it for review', () => {
    const source = [
      "import { FaEye } from 'react-icons/fa';",
      'const C = () => <FaEye className="w-6 h-4" />;',
    ].join('\n');

    const { code, reviews } = transform(source, ICON);

    expect(code).toContain('className="w-6 h-4"');
    expect(code).not.toContain('size=');
    expect(reviews.join(' ')).toMatch(/w-6 h-4/);
  });

  it('carries other props through untouched', () => {
    const source = [
      "import { FaTrash } from 'react-icons/fa';",
      'const C = () => <FaTrash onClick={remove} title="Delete" />;',
    ].join('\n');

    const { code } = transform(source, ICON);

    expect(code).toContain('onClick={remove}');
    expect(code).toContain('title="Delete"');
    expect(code).toContain('name="trash"');
  });

  it('refuses a file that stores an icon as a component value', () => {
    // This is the case the codemod must not touch: converting it means editing
    // the data array AND the render site that does `const Icon = item.icon`.
    const source = [
      "import { FaHome } from 'react-icons/fa';",
      "const items = [{ path: '', label: 'Dashboard', icon: FaHome }];",
      'const C = () => items.map((i) => { const I = i.icon; return <I />; });',
    ].join('\n');

    const { code, refusals } = transform(source, ICON);

    expect(refusals).toHaveLength(1);
    expect(refusals[0]).toMatch(/FaHome/);
    expect(code).toBe(source);
  });

  it('refuses an icon name that is not in the table', () => {
    const source = [
      "import { FaUnicorn } from 'react-icons/fa';",
      'const C = () => <FaUnicorn />;',
    ].join('\n');

    const { code, refusals } = transform(source, ICON);

    expect(refusals[0]).toMatch(/FaUnicorn/);
    expect(code).toBe(source);
  });

  it('does not add a second Icon import when one is already there', () => {
    const source = [
      "import Icon from '@/components/Icon';",
      "import { FaSave } from 'react-icons/fa';",
      'const C = () => <><Icon name="home" /><FaSave /></>;',
    ].join('\n');

    const { code } = transform(source, ICON);

    expect(code.match(/import Icon from/g)).toHaveLength(1);
  });

  it('is idempotent', () => {
    const source = [
      "import { FaSave } from 'react-icons/fa';",
      'const C = () => <FaSave className="text-xl" />;',
    ].join('\n');

    const once = transform(source, ICON).code;
    const twice = transform(once, ICON).code;

    expect(twice).toBe(once);
  });

  it('does not rewrite a name that only appears in a comment', () => {
    // The palette codemod quietly rewrote four doc comments. Same trap, so:
    // same test.
    const source = ['// FaSave used to live here.', 'const C = () => null;'].join('\n');

    expect(transform(source, ICON).code).toBe(source);
  });
});
```

- [ ] **Step 2: Run them and watch them fail**

```bash
npx vitest run scripts/__tests__/codemod-icons.test.js
```

Expected: FAIL — `Failed to resolve import "../codemod-icons.mjs"`.

- [ ] **Step 3: Write the codemod**

Create `scripts/codemod-icons.mjs`:

```js
#!/usr/bin/env node
/**
 * Mechanically rewrites `react-icons` call sites to the `<Icon>` registry.
 *
 * Why a codemod rather than 28 hand-migrated files: the 200 icon call sites in
 * this codebase are not 200 decisions. They are 77 distinct names — 74 after the
 * three brand marks move into `BrandMarks.jsx` — and three sizing idioms. That
 * shape is what a codemod is for, and it is the same argument that turned the
 * colour migration from five days of surface-by-surface PRs into an afternoon.
 *
 * The sizing translation is the part a human would get wrong at scale.
 * `react-icons` renders at `1em`, so 43 call sites size their icon with a
 * `text-*` class. `lucide-react` emits explicit `width`/`height` attributes and
 * an SVG ignores font-size, so carrying those classes across unchanged would
 * silently shrink 43 icons to 16px — a defect no test in this repo would catch
 * and no reviewer would reliably spot in a 200-site diff.
 *
 * Two rules keep this honest:
 *
 * 1. **Only JSX call sites are rewritten.** Four files store an icon as a
 *    *component value* (`{ icon: FaHome }`) and render it via
 *    `const Icon = item.icon`. Converting those means two coordinated edits —
 *    the data array becomes strings, the render site becomes
 *    `<Icon name={item.icon} />` — which is judgement, not repetition. Those
 *    files are refused by name and migrated by hand.
 * 2. **A name not in the table refuses its whole file.** A partial rewrite that
 *    leaves one `react-icons` import behind looks finished and is not.
 *
 *   node scripts/codemod-icons.mjs --dry     report what would change
 *   node scripts/codemod-icons.mjs           write the changes
 *
 * Idempotent: `<Icon name="...">` matches nothing here, so a second run is a
 * no-op. `scripts/__tests__/codemod-icons.test.js` asserts that.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * react-icons component → registry name, in the FontAwesome vocabulary the
 * registry keys use. Every Feather (`Fi`) and Material (`Md`) spelling collapses
 * onto the FontAwesome name for the same glyph: two registry names for one X
 * would be two slightly different X icons on adjacent screens.
 */
export const NAME_MAP = {
  // Navigation and shell
  FaHome: 'home', FiHome: 'home',
  FaBars: 'bars', FiMenu: 'bars',
  FaTh: 'th', FiGrid: 'th',
  FaList: 'list',
  FaCog: 'cog',
  FaSignOutAlt: 'sign-out-alt',
  FaEllipsisV: 'ellipsis-v',
  MdDashboard: 'tachometer-alt',
  FaChevronLeft: 'chevron-left',
  FaChevronRight: 'chevron-right',
  FaChevronDown: 'chevron-down', FiChevronDown: 'chevron-down',
  FaChevronUp: 'chevron-up', FiChevronUp: 'chevron-up',

  // Record actions
  FaCheck: 'check',
  FaTimes: 'times', FiX: 'times',
  FaEdit: 'edit',
  FaTrash: 'trash',
  FaSave: 'save',
  FaPlus: 'plus',
  FaPlusCircle: 'plus-circle',
  FaBan: 'ban',
  FaEye: 'eye',
  FaArchive: 'archive',
  FaTrashRestore: 'trash-restore',
  FaFilter: 'filter', FiFilter: 'filter',
  FaSearch: 'search', FiSearch: 'search',
  FaDownload: 'download',
  FaUpload: 'upload',
  FaCloudUploadAlt: 'cloud-upload-alt',
  FiMaximize: 'expand',
  FiMinimize: 'compress',
  FiExternalLink: 'external-link-alt',

  // Status and diagnostics
  FaSpinner: 'spinner',
  FaCheckCircle: 'check-circle',
  FaTimesCircle: 'times-circle',
  FaExclamationTriangle: 'exclamation-triangle',
  FiInfo: 'info-circle',
  FiHelpCircle: 'question-circle',
  FaBug: 'bug',
  FaTools: 'tools', FiTool: 'tools',
  FaCloud: 'cloud',

  // Scheduling and money
  FaCalendar: 'calendar',
  FaCalendarAlt: 'calendar',
  FaCalendarDay: 'calendar-day',
  FaCalendarWeek: 'calendar-week',
  FaCalendarCheck: 'calendar-check',
  FaClock: 'clock',
  FaDollarSign: 'dollar-sign',
  FaStar: 'star',

  // People and correspondence
  FaUser: 'user',
  FaUsers: 'users',
  FaUserFriends: 'user-friends',
  FaEnvelope: 'envelope',
  FaPhone: 'phone', FiPhone: 'phone',

  // Places and property
  FaBuilding: 'building',
  FaCity: 'city',
  FaLandmark: 'landmark',
  FaGlobe: 'globe', FiGlobe: 'globe',
  FaMap: 'map',
  FaMapMarkerAlt: 'map-marker-alt', FiMapPin: 'map-marker-alt',
  FaBed: 'bed',
  FaBath: 'bath',
  FaRuler: 'ruler-combined',
};

/**
 * Tailwind text sizes in pixels. These are the sizes the icons actually render
 * at today, because react-icons draws at 1em and inherits the font-size this
 * class sets. Translating rather than guessing is what makes this migration
 * pixel-neutral.
 */
const TEXT_SIZE_PX = {
  'text-xs': 12,
  'text-sm': 14,
  'text-base': 16,
  'text-lg': 18,
  'text-xl': 20,
  'text-2xl': 24,
  'text-3xl': 30,
  'text-4xl': 36,
};

/** `w-5` is 1.25rem is 20px. The scale is linear at 4px per step. */
const spacingPx = (n) => Number(n) * 4;

const IMPORT_RE = /^import\s*\{([^}]*)\}\s*from\s*'react-icons\/\w+';?[ \t]*\n/gm;

/**
 * Pulls the sizing out of a literal className and returns the class list with
 * it removed. Returns `size: null` when there is nothing to translate, and
 * `review` when the class list sizes the icon in a way the table cannot decide.
 */
function extractSize(classList) {
  const classes = classList.split(/\s+/).filter(Boolean);

  const textClass = classes.find((c) => c in TEXT_SIZE_PX);
  if (textClass) {
    return {
      size: TEXT_SIZE_PX[textClass],
      className: classes.filter((c) => c !== textClass).join(' '),
      review: null,
    };
  }

  const w = classes.find((c) => /^w-\d+$/.test(c));
  const h = classes.find((c) => /^h-\d+$/.test(c));
  if (w && h) {
    const wn = w.slice(2);
    const hn = h.slice(2);
    if (wn !== hn) {
      return { size: null, className: classList, review: `non-square sizing: ${w} ${h}` };
    }
    return {
      size: spacingPx(wn),
      className: classes.filter((c) => c !== w && c !== h).join(' '),
      review: null,
    };
  }

  if (w || h) {
    return { size: null, className: classList, review: `half a sizing pair: ${w || h}` };
  }

  return { size: null, className: classList, review: null };
}

/** Rewrites one `<FaThing ... />` element into `<Icon name="thing" ... />`. */
function rewriteElement(match, component, attrs, reviews) {
  const name = NAME_MAP[component];
  let rest = attrs;
  let sizeProp = '';

  const classMatch = rest.match(/\sclassName="([^"]*)"/);
  if (classMatch) {
    const { size, className, review } = extractSize(classMatch[1]);
    if (review) reviews.push(`<${component}> — ${review}`);
    if (size !== null) sizeProp = ` size={${size}}`;
    rest = className
      ? rest.replace(classMatch[0], ` className="${className}"`)
      : rest.replace(classMatch[0], '');
  } else if (/\sclassName=\{/.test(rest)) {
    reviews.push(`<${component}> — className is an expression; sizing not translated`);
  }

  return `<Icon name="${name}"${sizeProp}${rest.replace(/\s+$/, '')} />`;
}

/**
 * @param {string} source           the file's contents
 * @param {string} iconImportPath   how this file should import Icon
 */
export function transform(source, iconImportPath) {
  const refusals = [];
  const reviews = [];

  const imported = [];
  for (const [, names] of source.matchAll(IMPORT_RE)) {
    for (const raw of names.split(',')) {
      const name = raw.trim();
      if (name) imported.push(name);
    }
  }

  if (imported.length === 0) return { code: source, refusals, reviews };

  for (const name of imported) {
    if (!(name in NAME_MAP)) {
      refusals.push(`${name} is not in NAME_MAP — add it to the registry and the table first`);
      continue;
    }
    // Every reference must be a JSX opening tag. Anything else is the
    // component-as-value case, which is hand work.
    const all = (source.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length;
    const asImport = 1;
    const asElement = (source.match(new RegExp(`<${name}[\\s/>]`, 'g')) || []).length;
    if (all - asImport !== asElement) {
      refusals.push(`${name} is referenced as a value, not only as JSX — migrate this file by hand`);
    }
  }

  if (refusals.length > 0) return { code: source, refusals, reviews };

  let code = source.replace(
    /<(Fa|Fi|Md)([A-Z][A-Za-z0-9]*)((?:\s[^>]*?)?)\s*\/>/g,
    (match, prefix, rest, attrs) => {
      const component = prefix + rest;
      if (!(component in NAME_MAP)) return match;
      return rewriteElement(match, component, attrs, reviews);
    }
  );

  code = code.replace(IMPORT_RE, '');

  if (!/^import\s+Icon\s+from/m.test(code)) {
    // Place it where the deleted import was: after the last remaining import.
    const imports = [...code.matchAll(/^import .*;?$/gm)];
    const last = imports[imports.length - 1];
    const at = last ? last.index + last[0].length : 0;
    code = `${code.slice(0, at)}\nimport Icon from '${iconImportPath}';${code.slice(at)}`;
  }

  return { code, refusals, reviews };
}

/** Every `.jsx`/`.js` under `src/`, excluding tests. */
function sourceFiles(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__') sourceFiles(full, acc);
    } else if (/\.jsx?$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

const isMain = process.argv[1] && process.argv[1].endsWith('codemod-icons.mjs');
if (isMain) {
  const dry = process.argv.includes('--dry');
  const root = process.cwd();
  const iconFile = path.join(root, 'src/components/Icon.jsx');

  let changed = 0;
  const allRefusals = [];
  const allReviews = [];

  for (const file of sourceFiles(path.join(root, 'src'))) {
    if (file === iconFile) continue;
    const source = readFileSync(file, 'utf8');
    if (!source.includes('react-icons')) continue;

    let rel = path.relative(path.dirname(file), iconFile).replace(/\.jsx$/, '');
    if (!rel.startsWith('.')) rel = `./${rel}`;

    const { code, refusals, reviews } = transform(source, rel);
    const short = path.relative(root, file);

    if (refusals.length > 0) {
      allRefusals.push(`  ${short}\n${refusals.map((r) => `      ${r}`).join('\n')}`);
      continue;
    }
    if (reviews.length > 0) {
      allReviews.push(`  ${short}\n${reviews.map((r) => `      ${r}`).join('\n')}`);
    }
    if (code !== source) {
      changed += 1;
      if (!dry) writeFileSync(file, code);
      console.log(`${dry ? 'would rewrite' : 'rewrote'}  ${short}`);
    }
  }

  console.log(`\n${changed} file(s) ${dry ? 'would be ' : ''}rewritten.`);

  if (allReviews.length > 0) {
    console.log(`\nConverted, but read these before committing:\n${allReviews.join('\n')}`);
  }
  if (allRefusals.length > 0) {
    console.log(`\nRefused — migrate by hand:\n${allRefusals.join('\n')}`);
  }
}
```

- [ ] **Step 4: Run the tests and watch them pass**

```bash
npx vitest run scripts/__tests__/codemod-icons.test.js
```

Expected: PASS, 13 tests. If `maps every react-icons name in use` fails on the count, do
not adjust the number to match — re-measure with the command in the Baseline section and
find the name you missed.

- [ ] **Step 5: Commit**

```bash
git add scripts/codemod-icons.mjs scripts/__tests__/codemod-icons.test.js
git commit -m "build(icons): add the react-icons codemod, table proven first

200 call sites, 74 distinct names, three sizing idioms. The part worth
mechanising is the sizing: react-icons draws at 1em so 43 sites size with a
text-* class, and an SVG with width/height attributes ignores font-size — every
one would silently shrink to 16px if the class were merely carried over.

Refuses the four files that store an icon as a component value; those are two
coordinated edits each and go by hand.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01J7hDmLcJ9hsWGatRa6a4iF"
```

---

## Task 4: Run the codemod, and read every line of what it did

The palette codemod's three real mistakes — a rewritten doc comment, a flattened gradient,
a brand ground on the wrong half of a ternary — were all found by *reading its output*, and
none by a test. Budget real time for Step 3 here. It is the task.

**Files:**
- Modify: the ~24 files the codemod rewrites. Expect it to refuse
  `src/pages/admin/AdminLayout.jsx`, `src/pages/admin/AdminBottomNav.jsx`,
  `src/pages/admin/AdminHeader.jsx` and `src/pages/admin/Settings.jsx` — those are Task 5.
- Test: the whole suite; no new test file.

**Interfaces:**
- Consumes: `transform` and `NAME_MAP` from Task 3; the registry from Task 1.
- Produces: no `react-icons` import outside `AdminLayout`, `AdminBottomNav`, `AdminHeader`
  and `Settings`.

- [ ] **Step 1: Dry-run it and record the refusals**

```bash
node scripts/codemod-icons.mjs --dry
```

Expected: ~24 files listed as "would rewrite", and a "Refused" section naming exactly the
four component-as-value files. **If it refuses anything else, stop and read why** — a name
missing from `NAME_MAP` means Task 1 missed a registry entry, and the fix belongs there,
not here.

- [ ] **Step 2: Run it for real**

```bash
node scripts/codemod-icons.mjs
git diff --stat
```

- [ ] **Step 3: Read the diff — all of it**

```bash
git diff
```

Four specific things to check, drawn from what went wrong last time:

1. **Sizing.** Every `size={N}` should match the `text-*` class it replaced:
   `text-xs`→12, `text-sm`→14, `text-base`→16, `text-lg`→18, `text-xl`→20, `text-2xl`→24,
   `text-3xl`→30, `text-4xl`→36. A `size={16}` where the old class was `text-3xl` is the
   failure mode.
2. **Colour survived.** `className="animate-spin text-3xl text-brand"` must become
   `size={30} className="animate-spin text-brand"` — the `text-brand` is colour, not size,
   and must still be there.
3. **Empty classNames.** `className=""` left behind by a class list that was *only* sizing
   should be gone, not empty. Search the diff for `className=""` and delete any.
4. **Prose.** Search for `Fa`/`Fi`/`Md` names in comments and JSDoc:
   ```bash
   git diff -U0 | grep -nE '^\+.*\b(Fa|Fi|Md)[A-Z][A-Za-z]+' || echo 'no stray names'
   ```
   Anything that comes back is either a missed call site or a comment that now describes
   code that no longer exists.

Also read the codemod's own "Converted, but read these" section from Step 2's output and
resolve each one by hand — non-square `w-6 h-4` pairs and expression classNames were left
as they were on purpose.

- [ ] **Step 4: Verify**

```bash
npm run lint
npm run test:coverage
npm run palette:ratchet
npm run build
```

Expected: all pass. `no-unused-vars` is an **error** in this config, so any icon import the
codemod failed to remove fails the lint step rather than sitting unnoticed.

- [ ] **Step 5: Look at it running**

Two of these surfaces have no test that renders them, so this is the only check that
catches a 16px icon where a 30px one belongs:

```bash
npm run dev
```

Open `/`, `/properties`, `/contact`, and `/admin/bookings`, in **both themes**, and confirm
no icon has changed size or colour. This migration is meant to be pixel-neutral.

- [ ] **Step 6: Commit**

```bash
git add -A src
git commit -m "refactor(icons): route the JSX call sites through the Icon registry

Applies scripts/codemod-icons.mjs to the 24 files whose icons are all rendered
as JSX. The four files that store an icon as a component value were refused by
the codemod and are migrated by hand next.

Sizing is translated rather than carried: react-icons drew at 1em, so a text-*
class sized the glyph; lucide emits width/height attributes and ignores
font-size, so each of those became an explicit size prop at the same pixel
value. Verified by eye on both themes.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01J7hDmLcJ9hsWGatRa6a4iF"
```

---

## Task 5: Migrate the four files that store an icon as a value

`AdminLayout`, `AdminBottomNav`, `AdminHeader` and `Settings` each hold a nav or tab array
with `{ icon: FaHome }` and render it via `const Icon = item.icon; ... <Icon />`. This is
the exact case `Icon.jsx`'s own documentation anticipated: **content-shaped data should not
hold React components**, and the registry keys are strings so that it does not have to.
`AdminHeader` already does it the right way for its social links (`<Icon name={social.icon} />`)
and the wrong way for its nav items, in the same file.

**Files:**
- Modify: `src/pages/admin/AdminLayout.jsx` (~6 items, render site at line ~147)
- Modify: `src/pages/admin/AdminBottomNav.jsx` (render site at line ~82)
- Modify: `src/pages/admin/AdminHeader.jsx` (render sites at lines ~115 and ~272)
- Modify: `src/pages/admin/Settings.jsx` (6 tabs, render sites at lines ~135 and ~201)
- Test: `src/pages/admin/__tests__/adminNavigation.test.jsx` (create)

**Interfaces:**
- Consumes: the registry names from Task 1; `NAME_MAP` from Task 3 as the lookup for which
  string replaces which component.
- Produces: nav/tab arrays whose `icon` field is a **registry name string**, and render
  sites that read `<Icon name={item.icon} />`. Nothing else consumes these arrays.

- [ ] **Step 1: Write the failing test**

Create `src/pages/admin/__tests__/adminNavigation.test.jsx`:

```jsx
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

import { ICON_NAMES } from '@/components/Icon';

const repoRoot = path.resolve(__dirname, '../../../..');

const FILES = [
  'src/pages/admin/AdminLayout.jsx',
  'src/pages/admin/AdminBottomNav.jsx',
  'src/pages/admin/AdminHeader.jsx',
  'src/pages/admin/Settings.jsx',
];

describe('admin navigation data holds icon names, not components', () => {
  it.each(FILES)('%s stores every icon as a registry name', (file) => {
    const source = fs.readFileSync(path.join(repoRoot, file), 'utf8');

    // A component reference in a data array is the defect: it makes the array
    // unserialisable, so these lists could never move to the database.
    const componentValued = source.match(/icon:\s*(Fa|Fi|Md)[A-Z][A-Za-z]*/g) || [];
    expect(componentValued).toEqual([]);

    // And every string it does hold must actually be in the registry, or the
    // nav renders an invisible gap and a dev-only console warning.
    const named = [...source.matchAll(/icon:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]);
    expect(named.length).toBeGreaterThan(0);
    expect(named.filter((n) => !ICON_NAMES.includes(n))).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run src/pages/admin/__tests__/adminNavigation.test.jsx
```

Expected: FAIL on all four files, listing the component-valued icons.

- [ ] **Step 3: Migrate `AdminLayout.jsx`**

Delete the `react-icons/fa` import. Add `import Icon from '../../components/Icon';` if it
is not already there. Change the nav array (around line 125):

```jsx
        { path: '', label: 'Dashboard', icon: 'home', badge: null }
```
```jsx
        { path: '/properties', label: 'Properties', icon: 'building', badge: null },
        { path: '/bookings', label: 'Bookings', icon: 'calendar', badge: pendingCount > 0 ? pendingCount : null },
        { path: '/viewings', label: 'Viewings', icon: 'eye', badge: null },
        { path: '/clients', label: 'Clients', icon: 'users', badge: null }
```
```jsx
        { path: '/settings', label: 'Settings', icon: 'cog', badge: null }
```

At the render site (around line 147), replace:

```jsx
    const Icon = item.icon;
```

with nothing, and change the JSX that used it from `<Icon ... />` to
`<Icon name={item.icon} ... />`, keeping whatever `size`/`className` the surrounding code
already passes. **Read the surrounding lines before editing** — the local `const Icon`
shadows the imported one, so deleting the line without changing the JSX leaves code that
compiles and renders nothing.

- [ ] **Step 4: Migrate the other three the same way**

`AdminBottomNav.jsx` — nav array around line 29, render site around line 82
(`const Icon = item.icon`).

`AdminHeader.jsx` — the nav array uses `MdDashboard`, `FiHome`, `FiGrid`, `FiTool`,
`FiInfo`, `FiHelpCircle`; those become `'tachometer-alt'`, `'home'`, `'th'`, `'tools'`,
`'info-circle'`, `'question-circle'`. Two render sites read `const IconComponent = item.icon`
(lines ~115 and ~272). Note this file **already** imports `Icon` for its social links, so do
not add a second import.

`Settings.jsx` — the tab array's `FaCog`, `FaCloud`, `FaEnvelope`, `FaClock`, `FaGlobe`,
`FaTools` become `'cog'`, `'cloud'`, `'envelope'`, `'clock'`, `'globe'`, `'tools'`. Two
render sites read `const Icon = tab.icon` (lines ~135 and ~201).

- [ ] **Step 5: Run the tests and watch them pass**

```bash
npx vitest run src/pages/admin/__tests__/adminNavigation.test.jsx
npm run lint
grep -rn "react-icons" src/ || echo 'react-icons is gone from src/'
```

Expected: the test passes, lint is clean, and the grep prints the "gone" message.

- [ ] **Step 6: Look at it running**

```bash
npm run dev
```

Open `/admin`, `/admin/settings`, and resize to a phone width so `AdminBottomNav` renders.
Every nav item and every settings tab must still show its icon. A missing icon here is a
registry-name typo and prints a dev console warning naming it.

- [ ] **Step 7: Commit**

```bash
git add -A src
git commit -m "refactor(icons): admin nav data holds icon names, not components

The four files the codemod refused each stored a React component inside a
content-shaped array and rendered it through a local \`const Icon = item.icon\`
that shadowed the imported one. Icon.jsx's registry keys are strings precisely
so this data can stay serialisable; AdminHeader was already doing it correctly
for its social links and incorrectly for its nav, in the same file.

src/ no longer imports react-icons.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01J7hDmLcJ9hsWGatRa6a4iF"
```

---

## Task 6: Remove the dependency, and measure what it bought

Removing the imports is not removing the dependency. This task drops it from
`package.json` and `vite.config.js`, lands the guard that stops it coming back, and
re-measures — including the CSS bundle, which the roadmap currently *predicts* this work
will shrink. That prediction is worth checking rather than inheriting.

**Files:**
- Modify: `package.json`, `package-lock.json`, `vite.config.js`
- Modify: `src/components/__tests__/Icon.test.jsx`
- Modify: `ROADMAP.md`
- Test: `src/components/__tests__/Icon.test.jsx`

**Interfaces:**
- Consumes: Tasks 2, 4 and 5 — every `react-icons` import is gone.
- Produces: one icon library. Nothing downstream depends on this task's output.

- [ ] **Step 1: Write the failing guard test**

The existing `describe('FontAwesome stays gone', ...)` in
`src/components/__tests__/Icon.test.jsx` is the model — removing a dependency is only
durable if re-adding it fails something. Add alongside it:

```jsx
describe('react-icons stays gone', () => {
  it('is not imported anywhere in src/', () => {
    const offenders = [];
    for (const file of sourceFiles()) {
      if (/react-icons/.test(fs.readFileSync(file, 'utf8'))) {
        offenders.push(path.relative(repoRoot, file));
      }
    }
    expect(offenders).toEqual([]);
  });

  it('is not a dependency', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    expect(deps['react-icons']).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run it and watch the dependency assertion fail**

```bash
npx vitest run src/components/__tests__/Icon.test.jsx -t 'react-icons stays gone'
```

Expected: `is not imported anywhere` passes (Tasks 4 and 5 did that);
`is not a dependency` FAILS.

- [ ] **Step 3: Drop the dependency and the chunk entry**

```bash
npm uninstall react-icons
```

In `vite.config.js`, change line 27:

```js
          'vendor-icons': ['react-icons', 'lucide-react'],
```

to:

```js
          'vendor-icons': ['lucide-react'],
```

- [ ] **Step 4: Run everything**

```bash
npm run lint
npm run test:coverage
npm run palette:ratchet
npm run label:ratchet
npm run test:a11y
npm run build
npm run bundle:report
```

Expected: all pass. `test:coverage` enforces the floors in `vitest.config.js`; deleting a
dependency should not move them, and if coverage *fell*, find out why before continuing.

- [ ] **Step 5: Measure, and write the answer down**

Record the real numbers:

```bash
npm run bundle:report
ls -l dist/assets/index-*.css
gzip -c dist/assets/index-*.css | wc -c
```

Compare against the Baseline table: `vendor-icons` was **32.0 kB raw / 7.6 kB gzip**,
first-load **215.3 kB gzip**, CSS **76.3 kB raw / 13.0 kB gzip**.

Then update `ROADMAP.md`:

- Tick **"Finish the icon consolidation"** in Block 2.
- In the gaps table, set **Icon libraries** to `1` and mark it `✅ 2`.
- Set the **CSS bundle (raw)** row to whatever you just measured.
- **If the CSS did not fall meaningfully**, say so in the Block 2 CSS bullet rather than
  leaving the prediction standing. Icons are JavaScript, and the honest expectation is that
  the whole win lands in `vendor-icons` and none of it in the stylesheet — which would
  retire the second half of "the remaining win is the icon consolidation and unused-utility
  pruning" and leave unused-utility pruning as the only remaining lead. A roadmap that gets
  more accurate is working.

- [ ] **Step 6: Commit and push**

```bash
git add package.json package-lock.json vite.config.js src/components/__tests__/Icon.test.jsx ROADMAP.md
git commit -m "build(icons): drop react-icons — one icon library

Two icon libraries shipped in one 32.0 kB vendor-icons chunk since Release 4A.
Every call site now goes through the Icon registry, so the dependency goes, and
a guard test keeps it gone the way the FontAwesome one does.

ROADMAP.md re-measured rather than assumed: see the CSS bundle row.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01J7hDmLcJ9hsWGatRa6a4iF"
git push
```

---

## Task 7: Label the six settings tabs (30 controls)

65 unlabelled controls remain, all in admin, and the shape is uniform: a
`<div>` wrapping a hand-written `<label>` with no `htmlFor` and an input with no `id`,
sometimes followed by a hint `<p>` that is visible but not programmatically linked. A
screen reader announces every one of these as "edit text" with no clue what it wants.

Route them through the `ui/` primitives rather than hand-pairing `htmlFor`. That is not
tidiness: `Field` mints the id with `useId()`, the label consumes it and the control
receives it, so **a caller cannot produce an unlabelled control**. Hand-pairing fixes 65
call sites once; the primitive fixes the next one too.

Four of the 65 controls are checkboxes, and `Field`'s layout puts the label above a
full-width control — wrong for a checkbox. This task lands the `Checkbox` primitive that
`AdvancedSettings` needs, and Task 8 reuses it.

**Files:**
- Create: `src/components/ui/Checkbox.jsx`
- Create: `src/components/ui/__tests__/Checkbox.test.jsx`
- Modify: `src/pages/admin/settings/GeneralSettings.jsx` (13 controls, lines 163–345)
- Modify: `src/pages/admin/settings/LocalizationSettings.jsx` (7, six of them `<select>`)
- Modify: `src/pages/admin/settings/AdvancedSettings.jsx` (5, lines 153–223; one checkbox, one textarea)
- Modify: `src/pages/admin/settings/BusinessHoursSettings.jsx` (2)
- Modify: `src/pages/admin/settings/CloudinarySettings.jsx` (2)
- Modify: `src/pages/admin/settings/EmailSettings.jsx` (1)
- Modify: `label-budget.json`

**Interfaces:**
- Consumes: `Field`, `controlClasses` (`src/components/ui/Field.jsx`); `Input`, `Textarea`,
  `Select` — all `({ label, hint, error, required, id, className, ...rest })`, with
  `Textarea` also taking `rows` and `Select` taking `children`.
- Produces: `src/components/ui/Checkbox.jsx`, default export, signature
  `({ label, hint, id, className, ...rest })` rendering `<input type="checkbox">` with the
  label beside it. Task 8 uses it.

- [ ] **Step 1: Write the failing Checkbox test**

Create `src/components/ui/__tests__/Checkbox.test.jsx`:

```jsx
import React from 'react';
import { describe, it, expect } from 'vitest';

import { render, screen } from '../../../test/utils/renderWithProviders';
import Checkbox from '../Checkbox';

describe('Checkbox', () => {
  it('is labelled even when the caller passes no id', () => {
    render(<Checkbox label="Enable maintenance mode" />);

    // getByRole with a name is the assertion that matters: it is the same
    // lookup a screen reader does, and it fails on a label that merely sits
    // next to the control without being associated with it.
    expect(screen.getByRole('checkbox', { name: 'Enable maintenance mode' })).toBeInTheDocument();
  });

  it('links its hint with aria-describedby rather than leaving it floating', () => {
    render(<Checkbox label="Enable maintenance mode" hint="Visitors see a holding page" />);

    const box = screen.getByRole('checkbox', { name: 'Enable maintenance mode' });
    const describedBy = box.getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy)).toHaveTextContent('Visitors see a holding page');
  });

  it('honours an explicit id', () => {
    render(<Checkbox id="maintenance" label="Enable maintenance mode" />);
    expect(screen.getByRole('checkbox', { name: 'Enable maintenance mode' })).toHaveAttribute('id', 'maintenance');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run src/components/ui/__tests__/Checkbox.test.jsx
```

Expected: FAIL — `Failed to resolve import "../Checkbox"`.

- [ ] **Step 3: Write the Checkbox primitive**

Create `src/components/ui/Checkbox.jsx`:

```jsx
import React, { useId } from 'react';
import PropTypes from 'prop-types';

/**
 * A checkbox with the same labelling guarantee as `Input`, and a different
 * layout.
 *
 * `Field` puts the label above a full-width control, which is right for a text
 * input and wrong for a checkbox — a checkbox reads as a box with a sentence
 * beside it, not as a caption over a widget. So this composes the same
 * `useId()` guarantee rather than composing `Field` itself: the id is minted
 * here, the label consumes it, the control receives it, and a caller who passes
 * nothing still gets a correctly labelled control.
 */
const Checkbox = ({ id: providedId, label, hint, className = '', ...rest }) => {
  const generatedId = useId();
  const id = providedId ?? `checkbox-${generatedId}`;
  const hintId = `${id}-hint`;

  return (
    <div className={className}>
      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          id={id}
          aria-describedby={hint ? hintId : undefined}
          className="mt-0.5 h-4 w-4 rounded border-line-strong text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          {...rest}
        />
        <label htmlFor={id} className="text-sm font-medium text-content">
          {label}
        </label>
      </div>

      {hint && (
        <p id={hintId} className="mt-1.5 ml-6.5 text-xs text-content-subtle">
          {hint}
        </p>
      )}
    </div>
  );
};

Checkbox.propTypes = {
  id: PropTypes.string,
  label: PropTypes.node.isRequired,
  hint: PropTypes.node,
  className: PropTypes.string,
};

export default Checkbox;
```

- [ ] **Step 4: Run the Checkbox tests and watch them pass**

```bash
npx vitest run src/components/ui/__tests__/Checkbox.test.jsx
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Migrate `GeneralSettings.jsx` — 13 controls**

Add the import:

```jsx
import Input from '../../../components/ui/Input';
```

Then replace each field. The first one, at lines 161–171, currently reads:

```jsx
          <div>
            <label className="block text-sm font-medium text-content-muted mb-1">
              Business Name <span className="text-xs text-brand">(Header &amp; Footer)</span>
            </label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="w-full px-3 py-2 border border-line-strong rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
              placeholder="Raslipwani Properties"
            />
          </div>
```

and becomes:

```jsx
          <Input
            label={
              <>
                Business Name <span className="text-xs text-brand">(Header &amp; Footer)</span>
              </>
            }
            type="text"
            value={formData.business_name}
            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
            placeholder="Raslipwani Properties"
          />
```

`Field.propTypes.label` is `PropTypes.node`, so the fragment with its `<span>` is fine —
keep the parenthetical, it is doing real work for the admin reading the form.

Where a field has a trailing hint paragraph — Company Tagline at lines 183–186 has
`<p className="text-xs text-content-subtle mt-1">A short slogan…</p>` — pass it as the
`hint` prop instead of leaving it as a sibling. That is the second half of the defect: text
that is visible but not announced.

```jsx
          <Input
            label={
              <>
                Company Tagline <span className="text-xs text-brand">(Header subtitle)</span>
              </>
            }
            type="text"
            value={formData.company_tagline}
            onChange={(e) => setFormData({ ...formData, company_tagline: e.target.value })}
            placeholder="Your Premier Real Estate Partner"
            hint="A short slogan that appears under your logo in the header"
          />
```

Repeat for all 13. Two of them sit inside a `flex gap-2` next to a button (Company Logo
URL, at line 190) — `Input` renders a `w-full` wrapper, so keep the flex row and pass
`className="flex-1"` to the `Input` rather than to the `<input>`.

**Note the visual change and accept it deliberately:** `controlClasses` renders
`rounded-lg px-4 py-2.5 bg-surface-raised border-line-strong` where these hand-written
fields had `rounded-md px-3 py-2` and no explicit ground, and `Field`'s label is
`text-content` where these were `text-content-muted`. The admin forms will look slightly
different — specifically, they will look like the rest of the app. That is the point of a
primitive; do not add overrides to preserve the old look.

- [ ] **Step 6: Migrate the other five tabs**

`LocalizationSettings.jsx` (7 controls, six `<select>`): import `Select`, and move the
`<option>` children through unchanged.

```jsx
          <Select
            label="Currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          >
            <option value="KES">KES — Kenyan Shilling</option>
            <option value="USD">USD — US Dollar</option>
          </Select>
```

`AdvancedSettings.jsx` (5 controls, lines 153–223): one is a checkbox → `Checkbox`, one is
a textarea → `Textarea`, the rest → `Input`.

`BusinessHoursSettings.jsx` (2), `CloudinarySettings.jsx` (2), `EmailSettings.jsx` (1):
same treatment.

- [ ] **Step 7: Verify the count fell by exactly 30**

```bash
npm run label:ratchet
```

Expected: `Unlabelled form controls in src/: 35 (ceiling 65)` and a note that 30 are under
the ceiling. **If it says anything other than 35, stop** — either a field was missed or a
migration introduced a new one, and both are worth finding now rather than at the end.

- [ ] **Step 8: Bank the gain**

```bash
npm run label:ratchet -- --update
```

This rewrites `label-budget.json` to `"max": 35`. Also update its `note` field, which
currently describes the 2026-09-03 measurement, to say the six settings tabs now go through
the `ui/` primitives.

- [ ] **Step 9: Run everything and look at it**

```bash
npm run lint && npm run test:coverage && npm run palette:ratchet && npm run test:a11y && npm run build
npm run dev
```

Open `/admin/settings` and click through all six tabs in both themes. Then **tab through
one form with the keyboard** and confirm focus rings appear and each field announces its
name — `controlClasses` carries `focus-visible:ring-2 focus-visible:ring-focus-ring`, and
this is the first time these fields have had it.

- [ ] **Step 10: Commit**

```bash
git add -A src label-budget.json
git commit -m "fix(a11y): route the settings tabs through the Field primitives

30 of the 65 remaining unlabelled controls, all six settings tabs. Routed
through Input/Select/Textarea and the new Checkbox rather than hand-paired with
htmlFor: Field mints the id with useId and hands it to both halves, so a caller
cannot produce an unlabelled control. Hand-pairing would fix these 65 once; the
primitive fixes the next one too.

Hint text that was visible but not programmatically linked now goes through the
hint prop, so it is announced rather than merely displayed.

Label ratchet 65 -> 35.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01J7hDmLcJ9hsWGatRa6a4iF"
```

---

## Task 8: Label `AdminProperties.jsx` (19 controls)

The single heaviest file — 19 of the remaining 35, at lines 758, 776, and 972–1217. It is
also 1,294 lines, the largest file in the repo. Do **not** decompose it here; that is Block
3's job and mixing the two makes both diffs unreviewable.

**Files:**
- Modify: `src/pages/admin/AdminProperties.jsx`
- Modify: `label-budget.json`

**Interfaces:**
- Consumes: `Input`, `Select`, `Textarea`, `Checkbox` from `src/components/ui/`.
- Produces: nothing new.

- [ ] **Step 1: Find the exact lines**

```bash
npx eslint src/pages/admin/AdminProperties.jsx --format json \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{for(const f of JSON.parse(d))for(const m of f.messages)if(m.ruleId==='jsx-a11y/label-has-associated-control')console.log(m.line);});"
```

Expected: 19 line numbers. Work down the list.

- [ ] **Step 2: Migrate the two filter controls at 758 and 776**

These sit in the toolbar above the table, not in the modal form. Read the surrounding
markup before editing: a filter control whose label is visually hidden by design should get
`Select`/`Input` with a real `label` and the label styled down, **not** an `aria-label`
bolted onto a bare control. The primitive is what keeps the next one right.

- [ ] **Step 3: Migrate the 17 controls in the property form (972–1217)**

Import at the top of the file:

```jsx
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Checkbox from '../../components/ui/Checkbox';
```

The pattern is the same as Task 7. There are 4 `<select>`, 1 `<textarea>` and 3
`type="checkbox"` among them; the rest are text/number inputs. Number fields keep their
`type="number"`, `min` and `step` — `Input` spreads every unrecognised prop onto the
`<input>`.

Where a field is genuinely required, pass `required` rather than typing an asterisk into
the label. `Field` draws the asterisk `aria-hidden` and puts `required` on the control,
which is what assistive technology actually reads.

- [ ] **Step 4: Verify the count fell by exactly 19**

```bash
npm run label:ratchet
```

Expected: `Unlabelled form controls in src/: 16 (ceiling 35)`.

- [ ] **Step 5: Bank it**

```bash
npm run label:ratchet -- --update
```

- [ ] **Step 6: Run everything and exercise the form**

```bash
npm run lint && npm run test:coverage && npm run palette:ratchet && npm run test:a11y && npm run build
npm run dev
```

Open `/admin/properties`, open the add-property modal, and **create a property end to end**.
This form has the most state in the admin console and the migration touches every control
in it; a `value`/`onChange` pair dropped in the rewrite produces a field that looks fine and
silently discards what you type.

- [ ] **Step 7: Commit**

```bash
git add -A src label-budget.json
git commit -m "fix(a11y): label the 19 controls in AdminProperties

The heaviest remaining file. Ratchet 35 -> 16. Required fields now carry
\`required\` on the control rather than a typed asterisk in the label text,
which is what assistive technology actually reads.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01J7hDmLcJ9hsWGatRa6a4iF"
```

---

## Task 9: Label the last 16 controls

`AdminBookings.jsx` (6), `CommunicationTimeline.jsx` (5, lines 204–254),
`PropertyInterests.jsx` (3), `BookingDetailModal.jsx` (2). Two of these live under
`src/components/`, not `src/pages/admin/`, which is worth noticing: they are admin-only
components that happen not to sit in the admin folder.

**Files:**
- Modify: `src/pages/admin/AdminBookings.jsx`, `src/components/CommunicationTimeline.jsx`,
  `src/components/PropertyInterests.jsx`, `src/pages/admin/BookingDetailModal.jsx`
- Modify: `label-budget.json`

**Interfaces:**
- Consumes: `Input`, `Select`, `Textarea` from `src/components/ui/`.
- Produces: **the label ratchet reaches 0**, which is what unblocks Task 11.

- [ ] **Step 1: Find the exact lines**

```bash
npm run label:ratchet
```

Expected: 16, across those four files.

- [ ] **Step 2: Migrate all four**

Same pattern as Tasks 7 and 8. `CommunicationTimeline` has one `<select>` and one
`<textarea>`; `PropertyInterests` has two `<select>` and one `<textarea>`;
`AdminBookings` has two `<select>` in its filter bar.

- [ ] **Step 3: Verify zero**

```bash
npm run label:ratchet
```

Expected: `Unlabelled form controls in src/: 0 (ceiling 16)`.

- [ ] **Step 4: Bank it**

```bash
npm run label:ratchet -- --update
```

`label-budget.json` is now `"max": 0`. Rewrite its `note` — it currently describes a
ceiling that is being spent down, and from here it is a floor that must not rise:

```json
{
  "max": 0,
  "note": "Form controls with no associated label, counted by jsx-a11y/label-has-associated-control. Reached 0 on 2026-09-06, from 96 at the start of Release 4. It stays at 0: every control in this codebase now goes through the Field primitives in src/components/ui, which mint the id with useId and hand it to both the label and the control, so an unlabelled control is not something a caller can produce by forgetting. A rise here means someone hand-wrote a field — route it through Input/Select/Textarea/Checkbox instead of pairing htmlFor by hand."
}
```

- [ ] **Step 5: Run everything**

```bash
npm run lint && npm run test:coverage && npm run palette:ratchet && npm run label:ratchet && npm run test:a11y && npm run build
```

- [ ] **Step 6: Commit and push**

```bash
git add -A src label-budget.json
git commit -m "fix(a11y): the last 16 unlabelled controls — ratchet reaches 0

From 96 at the start of Release 4 to 0. The budget file changes meaning with
this commit: it was a ceiling being spent down, and it is now a floor that must
not rise.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01J7hDmLcJ9hsWGatRa6a4iF"
git push
```

---

## Task 10: Retire `jsx-a11y/label-has-for`

It is deprecated, it double-counts `label-has-associated-control`, and it contributes 100
of the 375 lint warnings. The roadmap listed it **last rather than first** on purpose:
turning it off while the real defect existed would have deleted 100 warnings and fixed
nothing. Now that the real count is 0, switching it off removes noise instead of evidence.

**Files:**
- Modify: `eslint.config.js`
- Modify: `ROADMAP.md`

**Interfaces:**
- Consumes: Task 9's zero.
- Produces: nothing downstream.

- [ ] **Step 1: Measure before**

```bash
npx eslint src 2>&1 | tail -3
npx eslint src --format json | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const r=JSON.parse(d);const n={};for(const f of r)for(const m of f.messages)n[m.ruleId]=(n[m.ruleId]||0)+1;console.log(Object.entries(n).sort((a,b)=>b[1]-a[1]).slice(0,10));});"
```

Write down the total and the `label-has-for` count. `label-has-associated-control` should
now read 0; if it does not, Task 9 is not finished.

- [ ] **Step 2: Turn it off**

In `eslint.config.js`, after the existing `'jsx-a11y/label-has-associated-control'` line,
add:

```js
      // Deprecated by the plugin, and it double-counts the rule above: every
      // control it flags is either already reported there or is a label whose
      // control is a sibling rather than a child, which `label-has-associated-control`
      // with `depth: 3` decides correctly. It contributed 100 of 375 warnings
      // and zero information.
      //
      // It is off now rather than earlier on purpose. Turning it off while
      // controls were genuinely unlabelled would have deleted 100 warnings and
      // fixed nothing — the deprecated rule was noise, but it was noise sitting
      // on top of a real defect. That defect reached 0 first; see
      // label-budget.json.
      'jsx-a11y/label-has-for': 'off',
```

- [ ] **Step 3: Measure after**

```bash
npx eslint src 2>&1 | tail -3
```

Expected: the total falls by exactly the `label-has-for` count from Step 1 — no more, no
less. If it falls by more, something else was switched off by accident.

- [ ] **Step 4: Verify nothing regressed**

```bash
npm run lint && npm run label:ratchet && npm run test:coverage
```

`label:ratchet` still reads 0: it counts `label-has-associated-control` only, and never
counted the deprecated rule. That independence is why turning this off is safe.

- [ ] **Step 5: Update `ROADMAP.md`**

- Tick **"Label the remaining 65 controls"** and **"Retire `jsx-a11y/label-has-for`"**.
- Gaps table: **Unlabelled form controls** → `0`, marked `✅ 2`.
- Gaps table: **`jsx-a11y/label-has-for`** → `rule removed ✅`.
- Gaps table: **`jsx-a11y/control-has-associated-label`** → re-measure it. It read 87 and
  is a *different* rule with a *different* defect (a control with no accessible name at
  all, typically an icon-only button), so do not assume this work moved it. Whatever it
  reads now is what goes in the table.

- [ ] **Step 6: Commit**

```bash
git add eslint.config.js ROADMAP.md
git commit -m "chore(lint): retire jsx-a11y/label-has-for now that it costs information

Deprecated, and double-counted label-has-associated-control: 100 of 375
warnings and zero information. Listed last rather than first because turning it
off while controls were genuinely unlabelled would have deleted 100 warnings
and fixed nothing.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01J7hDmLcJ9hsWGatRa6a4iF"
```

---

## Task 11: Measure the admin console with axe, before enforcing anything

The public gate exists because the public surfaces were already clean; scoping it to them
turned it on two blocks early. Admin is now labelled, so it is the next candidate — but
"labelled" is not "passes axe". axe checks around ninety WCAG A/AA rules and labels are
one. This task **only measures**. Task 12 fixes and enforces.

Writing a green gate you have not seen fail is how you end up with a gate that asserts
nothing.

**Files:**
- Create: `src/test/utils/authenticatedAdmin.jsx`
- Create: `src/test/a11y/adminSurfaces.axe.test.jsx`

**Interfaces:**
- Consumes: `render` from `src/test/utils/renderWithProviders`, `expectNoAxeViolations` and
  `AXE_OPTIONS` from `src/test/utils/axe`, and the global Supabase mock in
  `src/test/setup.jsx`.
- Produces: `src/test/utils/authenticatedAdmin.jsx` named-exports
  `signInAsAdmin(): void` — call it in `beforeEach` to put a session on the mocked
  `supabase.auth` before rendering an admin surface.

- [ ] **Step 1: Write the auth helper**

Admin pages are guarded at the *route* level by `ProtectedRoute`, not inside the page
components, so rendering a page component directly reaches its real interface. But
`AdminLayout` reads `useAuth().user`, and `AuthContext` starts with `loading: true` until
`getSession` resolves — so without this helper the chrome renders a loading state and axe
inspects an empty page while reporting zero violations. That is the failure this file
exists to prevent.

Create `src/test/utils/authenticatedAdmin.jsx`:

```jsx
import { supabase } from '@/utils/supabaseClient';

/**
 * Puts an admin session on the mocked Supabase client.
 *
 * Without this, `AuthContext` resolves `getSession` to `{ session: null }`, the
 * admin chrome renders its signed-out branch, and axe cheerfully reports zero
 * violations on a page that is mostly a spinner. A gate that passes by
 * inspecting nothing is worse than no gate, so every admin axe test calls this
 * first and the suite asserts the surface actually rendered.
 */
export function signInAsAdmin() {
  const user = {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'admin@example.test',
    role: 'authenticated',
  };
  const session = { user, access_token: 'test-token', expires_at: 4102444800 };

  supabase.auth.getSession.mockResolvedValue({ data: { session }, error: null });
  supabase.auth.onAuthStateChange.mockImplementation((callback) => {
    callback('SIGNED_IN', session);
    return { data: { subscription: { unsubscribe: () => {} } } };
  });
  // AuthContext resolves admin status through an RPC; the global mock answers
  // `false`, which would render the "not authorised" branch.
  supabase.rpc.mockResolvedValue({ data: true, error: null });
}
```

**Before writing this, open `src/contexts/AuthContext.jsx` and confirm how it decides
`isAdmin`** — if it reads a table rather than calling `rpc`, mock `from` accordingly. Do
not guess; the whole value of this helper is that the page really renders.

- [ ] **Step 2: Write the suite, expecting it to fail**

Create `src/test/a11y/adminSurfaces.axe.test.jsx`:

```jsx
import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { render, screen } from '../utils/renderWithProviders';
import { expectNoAxeViolations } from '../utils/axe';
import { signInAsAdmin } from '../utils/authenticatedAdmin';

import Dashboard from '@/pages/admin/Dashboard';
import AdminProperties from '@/pages/admin/AdminProperties';
import AdminBookings from '@/pages/admin/AdminBookings';
import Settings from '@/pages/admin/Settings';
import ClientManagement from '@/pages/admin/ClientManagement';
import AdminHeader from '@/pages/admin/AdminHeader';
import AdminBottomNav from '@/pages/admin/AdminBottomNav';

/**
 * The accessibility gate, extended over the admin console.
 *
 * The public half of this gate landed two blocks early because those surfaces
 * were already clean and fencing what is clean beats waiting for everything to
 * be. Admin was the other half of that argument: it held all 65 of the
 * unlabelled controls, so it could not be fenced until they were gone. They are
 * gone, so this is the rest of the gate.
 *
 * Both themes, same as the public suite, for the same reason: the token layer
 * resolves per theme and a defect that only exists in dark mode is a defect.
 */
const SURFACES = [
  ['Dashboard', Dashboard, '/admin'],
  ['Properties', AdminProperties, '/admin/properties'],
  ['Bookings', AdminBookings, '/admin/bookings'],
  ['Settings', Settings, '/admin/settings'],
  ['Clients', ClientManagement, '/admin/clients'],
];

const CHROME = [
  ['AdminHeader', AdminHeader],
  ['AdminBottomNav', AdminBottomNav],
];

const THEMES = ['light', 'dark'];

const applyTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dataset.theme = theme;
};

describe('admin surfaces have no WCAG A/AA violations', () => {
  beforeEach(() => signInAsAdmin());

  afterEach(() => {
    document.documentElement.classList.remove('dark');
    delete document.documentElement.dataset.theme;
  });

  for (const [name, Surface, route] of SURFACES) {
    for (const theme of THEMES) {
      it(`${name} — ${theme}`, async () => {
        applyTheme(theme);
        const { container } = render(<Surface />, { route });

        // A gate that inspects an empty container passes and asserts nothing.
        // This is the assertion that makes the rest of the test mean something.
        expect(container.textContent.trim().length).toBeGreaterThan(50);

        await expectNoAxeViolations(container);
      }, 30000);
    }
  }
});

describe('admin chrome has no WCAG A/AA violations', () => {
  beforeEach(() => signInAsAdmin());

  afterEach(() => {
    document.documentElement.classList.remove('dark');
    delete document.documentElement.dataset.theme;
  });

  for (const [name, Chrome] of CHROME) {
    for (const theme of THEMES) {
      it(`${name} — ${theme}`, async () => {
        applyTheme(theme);
        const { container } = render(<Chrome />);
        await expectNoAxeViolations(container);
      }, 30000);
    }
  }
});
```

- [ ] **Step 3: Run it and write down everything it finds**

```bash
npx vitest run src/test/a11y/adminSurfaces.axe.test.jsx 2>&1 | tee /tmp/admin-axe-baseline.txt
```

`expectNoAxeViolations` prints each violation with its rule id, impact, help URL and the
exact failing node, so this output is the work list for Task 12.

Expect it to be red. The likely finds, given what
`jsx-a11y/control-has-associated-label` reported at 87:

- **`button-name`** — icon-only buttons. This is where Tasks 4 and 5 connect: the fix is
  `<Icon name="trash" label="Delete property" />`, which turns the SVG into
  `role="img"` with an accessible name, or better, an `aria-label` on the button itself
  with the icon left decorative. Prefer the latter — the *button* is what gets announced.
- **`aria-required-children` / `aria-allowed-attr`** — hand-rolled tabs and dropdowns.
- **`region`** — content outside a landmark.
- **`duplicate-id`** — likely in `Settings`, if a tab renders more than one instance.
- **A page that renders almost nothing** — if the `textContent` assertion fails rather than
  axe, the fix is in the helper from Step 1, not in the page.

- [ ] **Step 4: Do not fix anything yet. Commit the measurement.**

Commit the suite as-is, red, on a branch — **do not merge it to main and do not add it to
CI**. This is the one commit in this plan that is allowed to be failing, and it exists so
Task 12's diff shows exactly what each fix bought.

```bash
git add src/test/a11y/adminSurfaces.axe.test.jsx src/test/utils/authenticatedAdmin.jsx
git commit -m "test(a11y): measure the admin console with axe

Red on purpose, and not yet in CI. The public half of this gate landed early
because those surfaces were already clean; admin held all 65 unlabelled
controls and could not be fenced until they were gone. They are, so this
measures what is actually left before anything claims to enforce it.

The textContent assertion is load-bearing: admin pages behind a loading state
render almost nothing, and axe reports zero violations on an empty container.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01J7hDmLcJ9hsWGatRa6a4iF"
```

---

## Task 12: Fix what axe found, and put the admin gate in CI

**Files:**
- Modify: whichever admin files Task 11's output named
- Modify: `package.json` (the `test:a11y` script)
- Modify: `.github/workflows/ci.yml`
- Modify: `ROADMAP.md`
- Test: `src/test/a11y/adminSurfaces.axe.test.jsx`

**Interfaces:**
- Consumes: `/tmp/admin-axe-baseline.txt` from Task 11; `Icon`'s `label` prop from Task 1.
- Produces: `npm run test:a11y` covering public **and** admin.

- [ ] **Step 1: Work the list, one rule at a time**

Take the violations in impact order — `critical`, then `serious`, then `moderate` — and fix
one rule id across all surfaces before moving to the next. Re-run after each:

```bash
npx vitest run src/test/a11y/adminSurfaces.axe.test.jsx
```

For `button-name`, the fix is on the button, not the icon:

```jsx
<button type="button" aria-label="Delete property" onClick={() => remove(property.id)}>
  <Icon name="trash" size={16} />
</button>
```

not `<Icon name="trash" label="Delete" />` inside an unlabelled button — that gives the
*image* a name and leaves the *control* unnamed, which is a different and worse thing. Use
`Icon`'s `label` prop only where the icon is genuinely standalone content.

If a violation is one you decide not to fix, it does not get suppressed quietly. Either fix
it or take the surface out of `SURFACES` with a comment saying why and what would put it
back. A gate with an undocumented exclusion is a gate nobody trusts.

- [ ] **Step 2: Confirm green, and confirm it can still go red**

```bash
npx vitest run src/test/a11y/adminSurfaces.axe.test.jsx
```

Expected: PASS.

Then prove the gate works, because a green suite proves nothing on its own. Temporarily
add a bare `<button><Icon name="trash" /></button>` to `Dashboard.jsx`, re-run, and confirm
it fails with `button-name`. **Revert it.**

- [ ] **Step 3: Widen the CI script**

`package.json`'s `test:a11y` is `vitest run src/test/a11y`, which already picks up any file
in that directory — so it covers the new suite with no change. Verify rather than assume:

```bash
npm run test:a11y
```

Expected: both suites run — 16 public tests plus the admin ones.

- [ ] **Step 4: Update the CI comment**

The `Accessibility (axe)` step in `.github/workflows/ci.yml` describes the gate as "every
public surface plus the header and footer". Extend that paragraph to say the admin console
is now inside the gate, and why it arrived later:

```yaml
      # Every public surface plus the header and footer, and — since Block 2 —
      # the admin console, in both themes, against WCAG 2.1 A and AA. Admin
      # arrived later on purpose: it held all 65 of the codebase's unlabelled
      # form controls, and a gate that lands with 65 known violations gets
      # switched off within a day. The labels reached 0 first; this covers what
      # was then clean. Contrast is excluded because jsdom has no layout for
      # axe to measure; it is asserted over the token pairs in src/design.
```

- [ ] **Step 5: Run the full CI sequence locally**

```bash
npm run lint \
  && npm run test:coverage \
  && npm run palette:ratchet \
  && npm run label:ratchet \
  && npm run test:a11y \
  && npm run build \
  && npm run check:console
```

Expected: every one passes. The admin axe suite renders five more full pages, so
**coverage will move** — almost certainly up, since these pages had no suite. If it rose,
ratchet the floors in `vitest.config.js` to ~1 point under the new measurement and add a
short comment saying what moved them, matching the style of the entries already there.

- [ ] **Step 6: Update `ROADMAP.md`**

- Block 2: tick the axe bullet's "Extend it to admin as the labels land" and say it landed.
- Gaps table: rename the **axe violations (public + chrome)** row to
  **axe violations (public + admin + chrome)**, keep it at `0 ✅ enforced in CI`.
- Update the **Test coverage** row with the re-measured number.
- Block 2's **Exit** line: mark off "label ratchet at 0", "axe extended over the admin
  console, still at zero", and "one icon library". Leave the raw-palette, keyboard-flow and
  CSS items open — this plan did not do them, and ticking them would make the roadmap less
  accurate, which is the one thing rule 3 forbids.

- [ ] **Step 7: Commit and push**

```bash
git add -A
git commit -m "feat(a11y): extend the axe gate over the admin console

The other half of the argument that put the public gate in two blocks early.
Admin held all 65 unlabelled controls, so it could not be fenced until they
were gone; they are, so the gate now covers five admin surfaces and the admin
chrome in both themes, and CI holds it.

Verified the gate can still fail by planting a nameless icon button and
watching button-name catch it.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01J7hDmLcJ9hsWGatRa6a4iF"
git push
```

- [ ] **Step 8: Deploy**

Block 2 ends *deployed*, not written — Version 9 existed partly because two finished slices
sat on an unpushed branch for a week. Open the PR, get CI green, merge, and confirm the
Vercel deployment succeeded before calling this done.

---

## Exit criteria for this plan

Measured, not asserted. Run these and compare:

| Check | Command | Expected |
|---|---|---|
| One icon library | `grep -rn "react-icons" src/ package.json` | no matches |
| `vendor-icons` shrank | `npm run build && npm run bundle:report` | below 32.0 kB raw |
| First load still in budget | `npm run bundle:report` | ✅ within 219 kB |
| Label ratchet at zero | `npm run label:ratchet` | `0 (ceiling 0)` |
| Deprecated rule gone | `npx eslint src 2>&1 \| tail -3` | ~100 fewer warnings |
| axe over public **and** admin | `npm run test:a11y` | all green |
| The gate can fail | plant a nameless icon button | `button-name` fires |
| Everything CI runs | the Step 5 chain in Task 12 | all pass |
| Deployed | Vercel dashboard | current commit live |

Still open in Block 2 after this plan, and deliberately so: the last 94 raw palette classes,
the by-eye third-party dark-mode audit, live regions for async status, and CSS under 50 kB.
