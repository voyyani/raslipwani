# Block 3 — Release 5: Data Layer, Decomposition, and the Rest of the Budget

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put every Supabase query behind a named, tested service function; break the
oversized components apart on top of it; cut first-load JavaScript from 215.9 kB gzip to
under 100 kB; and move the UN housing inventory out of a hardcoded array into the database.

**Architecture:** One module per domain under `src/services/`. Each module exports plain
async data functions (testable with no React in the room) *and* TanStack Query
`queryOptions` factories built from a single central key registry, so a query key and its
`staleTime` are decided once rather than at each call site. Components stop importing
`@/utils/supabaseClient` entirely — enforced first by a falling ratchet, finally by an
ESLint error. Because every query then lives behind one boundary, making the Supabase
client lazily-imported becomes a one-file change instead of a twenty-two-file one; that is
why the data layer is sequenced before the performance work rather than beside it.

**Tech Stack:** React 18, Vite 5, TanStack Query v5, Supabase JS v2, Vitest + Testing
Library, ESLint flat config with local rules, Tailwind with the project's semantic token
layer.

**Spec:** [`ROADMAP.md`](../../../ROADMAP.md) — "Block 3 — Release 5 · Data layer,
decomposition, and the rest of the budget". Read it alongside this plan: it carries the
*why*, the numeric exit criteria, and the standing rules this plan obeys.

---

## Global Constraints

Every task's requirements implicitly include this section.

- **Every phase ends deployable.** Not "ends written" — merged and pushed. (ROADMAP rule 1.)
- **Guard rails land with the work, not after it.** Where a defect is too large to fix in
  one task, ship a *ratchet* — a ceiling CI refuses to let rise — not an error that will be
  switched off within a day. (ROADMAP rule 2.) This plan adds two:
  `supabase-import-budget.json` and `file-size-budget.json`, both modelled exactly on the
  existing `scripts/palette-ratchet.mjs` / `palette-budget.json` pair.
- **Measure, don't assert.** Every number in this plan was measured on the merged tree at
  `2e9f16f` on 2026-09-06. When a task's measurement disagrees with this document, the
  measurement wins and the document is corrected in the same commit. (ROADMAP rule 3.)
- **Never lower the coverage floor to make a task pass.** `vitest.config.js` thresholds
  (lines 46 / functions 35 / branches 37 / statements 45) may only go *up* in this block.
  Block 3 is where Block 2's two give-backs are repaid: services and hooks are pure units
  with no jsdom rendering cost, so they raise the numerator without inflating the
  denominator. Raise the floor at the end of each phase, quoting the measured number in the
  commit body.
- **Do not raise `bundle-budget.json`.** It is 219 kB and Phase 3 drives it down. A task
  that would raise it is a wrong task.
- **Do not touch the palette ratchet or the label ratchet.** `palette-budget.json` is Block
  2's ledger and `label-budget.json` is at 0. Decomposition must move markup *verbatim*; a
  raw palette class that reappears because a class string was retyped is a regression in
  someone else's block.
- **Supabase table and column names are fixed by the live schema.** `properties.id` is
  `SERIAL` (integer, **not** uuid); `bookings.id` is `uuid`; `images` and `amenities` are
  `TEXT[]`, not `jsonb`. See `supabase/migrations/000_baseline.sql:80-155`.
- **No new runtime dependencies.** One new devDependency only: `@lhci/cli` (Task 32). The
  rest of the block is a rearrangement of code that already exists.
- **The `@` alias resolves to `src/`** in both `vite.config.js` and `vitest.config.js`.
  Import services as `@/services/<domain>`, never by relative path — the global Supabase
  mock in `src/test/setup.jsx` is keyed on the `@` specifier, and a relative import silently
  loads the real module and takes the suite down.
- **Phase 4 is blocked on ROADMAP Block 1** (the owner must apply migrations `009`–`012`
  first). Do not start it against an unclosed database.

---

## File Structure

**Created — the data layer (Phase 1)**

| File | Responsibility |
|---|---|
| `src/services/unwrap.js` | Turn `{ data, error }` into a value or a thrown `ServiceError`. One place decides what a failed query looks like. |
| `src/services/cachePolicy.js` | The three `staleTime` values the app may use. Resolves the `Home.jsx` / `App.jsx` disagreement. |
| `src/services/queryKeys.js` | The single registry of TanStack query keys. Nothing else may build one. |
| `src/services/properties.js` | `properties` table: reads, writes, and its `queryOptions` factories. |
| `src/services/bookings.js` | `bookings` and `booking_notes`. |
| `src/services/clients.js` | `clients` table and its per-client counts. |
| `src/services/clientInterests.js` | `client_property_interests`. |
| `src/services/clientCommunications.js` | `client_communications`. |
| `src/services/settings.js` | `admin_settings`, `email_templates`, and the settings realtime channel. |
| `src/services/dashboard.js` | *(Task 12)* Composes the property and booking counters into the dashboard's one call. |
| `src/services/auth.js` | `supabase.auth` and the `is_admin` RPC. |
| `src/services/client.js` | *(Phase 3)* `getSupabase()` — the lazily, dynamically imported client. |
| `scripts/supabase-import-ratchet.mjs` | Falling ceiling on direct client imports in `src/components` + `src/pages`. |
| `supabase-import-budget.json` | That ceiling. Starts at 22, ends at 0, then both files are deleted. |

**Created — decomposition (Phase 2)**

| File | Responsibility |
|---|---|
| `src/hooks/useFilters.js` | Filter state, reset, and active-filter count. |
| `src/hooks/usePagination.js` | Page/pageSize state and the derived `{ from, to }` Supabase range. |
| `src/hooks/useCsvExport.js` | Wrap `src/utils/exportUtils.js` with pending state and error handling. |
| `scripts/file-size-ratchet.mjs` | Falling ceiling on the largest source file's line count. |
| `file-size-budget.json` | That ceiling. Starts at 1,253, ends at 300. |
| `src/pages/admin/properties/*` | The pieces of `AdminProperties.jsx`. |
| `src/pages/admin/bookings/*` | The pieces of `AdminBookings.jsx` and `BookingDetailModal.jsx`. |
| `src/components/services/*` | The pieces of `ServicesMain.jsx` and `ViewingExperience.jsx`. |

**Modified — every current call site**

`src/App.jsx` · `src/contexts/AuthContext.jsx` · `src/contexts/SettingsContext.jsx` ·
`src/pages/Home.jsx` · `Properties.jsx` · `PropertyDetail.jsx` · `Contact.jsx` ·
`ServicesMain.jsx` · `UNHousing.jsx` · `src/components/services/ViewingExperience.jsx` ·
`src/components/CommunicationTimeline.jsx` · `src/components/PropertyInterests.jsx` ·
`src/pages/admin/{AdminLayout,Dashboard,AdminProperties,AdminBookings,BookingDetailModal,ClientManagement,ClientDetail,ClientForm}.jsx` ·
`src/pages/admin/settings/{General,Email,Advanced,Localization,BusinessHours,Cloudinary}Settings.jsx` ·
`vite.config.js` · `vitest.config.js` · `eslint.config.js` · `.github/workflows/ci.yml` ·
`package.json` · `bundle-budget.json`

**Created — Phase 4**

`supabase/migrations/013_property_segments.sql` · `supabase/seeds/013_un_inventory.sql`

---

## Measured starting state (2026-09-06, tree `2e9f16f`)

| Fact | Value | How it was measured |
|---|---|---|
| Files in `src/components` + `src/pages` importing the client | **22** (+1 test file, which is legitimate) | `grep -rl supabaseClient src/components src/pages` |
| Other direct importers | **3** — `App.jsx`, `AuthContext.jsx`, `SettingsContext.jsx` | the same grep over `src/` |
| Largest file | `src/pages/admin/AdminProperties.jsx` — **1,253 lines** | `wc -l` |
| Files over 700 lines | **7** | `find src -name '*.jsx' \| xargs wc -l \| sort -rn` |
| Files over 300 lines | **24** | the same |
| First-load JS + CSS | **215.9 kB gzip** | `npm run build && npm run bundle:report` |
| — `vendor-supabase` | 54.9 kB | pulled in eagerly by `AuthContext` and `SettingsContext` |
| — `vendor-react` | 52.9 kB | react + react-dom + react-router-dom |
| — `vendor-ui` | 50.4 kB | framer-motion **plus react-calendar**, glued together by `manualChunks` |
| — `index` | 36.0 kB | the app entry and the eager chrome |
| — CSS | 13.0 kB | 76.4 kB raw |
| — `vendor-icons` | 8.6 kB | lucide-react — every route's icons in one eager chunk |

> ROADMAP.md says 24 files import the client and this plan says 22. Both are right about
> different sets: 22 is `src/components` + `src/pages` excluding the one test file, which is
> what the block's exit criterion greps for. `App.jsx` and the two contexts are three more
> call sites outside that grep, and Tasks 10 and 16 fix them anyway. Total call sites: 25.

**The single most valuable finding of the survey:** `react-calendar` is imported by exactly
one component (`src/components/BookingCalendar.jsx`, admin-only), but `vite.config.js`
`manualChunks` assigns it to `vendor-ui` alongside `framer-motion` — and `framer-motion` is
imported by `src/components/Header.jsx`, which `PublicLayout` loads eagerly. So every
first-time visitor downloads an admin calendar library. Phase 3 opens by deleting that
grouping and measuring, before anything cleverer is attempted.

---

## Phase order, and why

1. **Phase 1 — the data layer.** Everything else is cheaper afterwards. Decomposition of a
   1,253-line file is mostly a matter of moving JSX once the 200 lines of query bodies have
   left it, and the Supabase lazy-load in Phase 3 touches one file instead of twenty-five.
2. **Phase 2 — decomposition.** Needs Phase 1; produces the seams Phase 3 splits on.
3. **Phase 3 — the bundle.** Needs Phase 1 for the client, Phase 2 for the route seams.
4. **Phase 4 — UN inventory.** Blocked on ROADMAP Block 1 (owner-applied migrations). It is
   last because it is the only part that cannot be finished by an agent alone.

Each phase is independently deployable and ends with a coverage-floor raise and a push.

---

# Phase 1 — The data-access layer

**Exit:** `grep -rl supabaseClient src/components src/pages` returns nothing but the one
test file; `src/services/` covers every table the app touches; every query key comes from
one registry; ESLint fails the build on a direct client import from a component or page.

---

### Task 1: The import ratchet

The guard rail lands **before** the work it guards, so every later task's progress is
banked and cannot be given back. Modelled line-for-line on `scripts/palette-ratchet.mjs`.

**Files:**
- Create: `scripts/supabase-import-ratchet.mjs`
- Create: `scripts/__tests__/supabaseImportRatchet.test.js`
- Create: `supabase-import-budget.json`
- Modify: `package.json` (scripts block)
- Modify: `.github/workflows/ci.yml` (a step after "Label ratchet")

**Interfaces:**
- Consumes: nothing.
- Produces: `npm run supabase:ratchet` (check) and `npm run supabase:ratchet -- --update`
  (lower the ceiling; refuses to raise it), plus the exported
  `countDirectImports(files) -> string[]` the test drives. Every migration task in Phase 1
  ends by running the `--update` form and committing the lowered budget.

- [ ] **Step 1: Write the failing test**

Create `scripts/__tests__/supabaseImportRatchet.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { countDirectImports } from '../supabase-import-ratchet.mjs';

describe('countDirectImports', () => {
  it('counts a file that imports the client by alias', () => {
    const files = { 'src/pages/Home.jsx': "import { supabase } from '@/utils/supabaseClient';" };
    expect(countDirectImports(files)).toEqual(['src/pages/Home.jsx']);
  });

  it('counts a file that imports it by relative path', () => {
    const files = { 'src/pages/Home.jsx': "import { supabase } from '../utils/supabaseClient';" };
    expect(countDirectImports(files)).toEqual(['src/pages/Home.jsx']);
  });

  it('ignores a file that only mentions the client in a comment', () => {
    const files = { 'src/pages/Home.jsx': '// supabaseClient used to live here' };
    expect(countDirectImports(files)).toEqual([]);
  });

  it('ignores a test file, which may configure the mock directly', () => {
    const files = {
      'src/pages/admin/__tests__/AdminBookings.test.jsx':
        "import { supabase } from '@/utils/supabaseClient';",
    };
    expect(countDirectImports(files)).toEqual([]);
  });

  it('ignores a service module, which is allowed to import the client', () => {
    const files = { 'src/services/properties.js': "import { supabase } from '@/utils/supabaseClient';" };
    expect(countDirectImports(files)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run scripts/__tests__/supabaseImportRatchet.test.js`
Expected: FAIL — `Failed to resolve import "../supabase-import-ratchet.mjs"`.

- [ ] **Step 3: Write the script**

Create `scripts/supabase-import-ratchet.mjs`:

```js
#!/usr/bin/env node
/**
 * Enforces a falling ceiling on components and pages that import the Supabase
 * client directly.
 *
 * ROADMAP.md Block 3.1 asks for one module per domain under src/services/, with
 * every query behind a named, testable function. Twenty-two files stand between
 * here and there, and a lint rule that fails the build on arrival with
 * twenty-two violations gets switched off within a day — so this is a ceiling
 * that only falls, exactly like palette-budget.json.
 *
 * When it reaches 0, Task 17 deletes this script and replaces it with a
 * `no-restricted-imports` ESLint error, which is strictly better: an error
 * cannot be satisfied by deleting a file.
 *
 *   node scripts/supabase-import-ratchet.mjs            check against the budget
 *   node scripts/supabase-import-ratchet.mjs --update   lower the budget to current
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const BUDGET_FILE = 'supabase-import-budget.json';
const ROOTS = ['src/components', 'src/pages'];

// `from '<anything>supabaseClient'` — alias or relative, single or double quotes,
// static import or dynamic. A bare mention of the word in prose does not match.
const IMPORT_RE = /from\s+['"][^'"]*supabaseClient['"]|import\(\s*['"][^'"]*supabaseClient['"]/;

/**
 * @param {Record<string,string>} files path -> source text
 * @returns {string[]} the paths that import the client, sorted
 */
export function countDirectImports(files) {
  return Object.entries(files)
    .filter(([path]) => ROOTS.some((root) => path.startsWith(root)))
    .filter(([path]) => !path.includes('__tests__'))
    .filter(([, source]) => IMPORT_RE.test(source))
    .map(([path]) => path)
    .sort();
}

function readTree(dir, acc = {}) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) readTree(full, acc);
    else if (/\.jsx?$/.test(entry)) acc[relative(process.cwd(), full)] = readFileSync(full, 'utf8');
  }
  return acc;
}

// Guarded so the unit test can import `countDirectImports` without running the CLI.
if (process.argv[1]?.endsWith('supabase-import-ratchet.mjs')) {
  const files = ROOTS.reduce((acc, root) => readTree(root, acc), {});
  const offenders = countDirectImports(files);
  const total = offenders.length;
  const budget = JSON.parse(readFileSync(BUDGET_FILE, 'utf8'));

  console.log(`Direct Supabase imports in components/pages: ${total} (ceiling ${budget.max})`);
  for (const file of offenders) console.log(`  ${file}`);

  if (process.argv.includes('--update')) {
    if (total > budget.max) {
      console.error(
        `\nRefusing to raise the ceiling from ${budget.max} to ${total}. ` +
          'This budget only falls — that is what makes it a ratchet.'
      );
      process.exit(1);
    }
    writeFileSync(BUDGET_FILE, `${JSON.stringify({ ...budget, max: total }, null, 2)}\n`);
    console.log(`\nCeiling lowered ${budget.max} -> ${total}.`);
    process.exit(0);
  }

  if (total > budget.max) {
    console.error(
      `\n${total - budget.max} file(s) over the ceiling of ${budget.max}.\n` +
        'Query through a module in src/services/ instead of importing the client here.\n'
    );
    process.exit(1);
  }

  if (total < budget.max) {
    console.log(
      `\n${budget.max - total} under the ceiling. Run ` +
        '`npm run supabase:ratchet -- --update` to bank the gain so it cannot be given back.'
    );
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run scripts/__tests__/supabaseImportRatchet.test.js`
Expected: PASS, 5 tests.

- [ ] **Step 5: Create the budget from the real measurement**

```bash
echo '{ "max": 999 }' > supabase-import-budget.json
node scripts/supabase-import-ratchet.mjs --update
cat supabase-import-budget.json
```

Expected: `"max": 22`. If it is not 22, **the measurement is right and this plan is stale** —
use the measured number and say so in the commit body (ROADMAP rule 3).

Then write the budget file out with its note:

```json
{
  "max": 22,
  "note": "Files under src/components and src/pages that import the Supabase client directly. Measured 22 on 2026-09-06. ROADMAP.md Block 3.1 drives this to 0, at which point scripts/supabase-import-ratchet.mjs is deleted and eslint.config.js enforces it as an error instead. This ceiling only falls."
}
```

- [ ] **Step 6: Wire it into npm and CI**

In `package.json` scripts, after `"label:ratchet"`:

```json
"supabase:ratchet": "node scripts/supabase-import-ratchet.mjs",
```

In `.github/workflows/ci.yml`, immediately after the "Label ratchet" step:

```yaml
      # The same instrument again, pointed at Block 3's defect: twenty-two
      # components and pages that build Supabase queries inline, so nothing
      # about the app's data access is nameable, testable, or lazily loadable.
      # A rule that failed the build on arrival with twenty-two violations
      # would be switched off within a day; this ceiling only falls, and it is
      # deleted in favour of a hard ESLint error once it reaches 0.
      - name: Supabase import ratchet
        run: npm run supabase:ratchet
```

- [ ] **Step 7: Verify the gate end to end**

Run: `npm run supabase:ratchet`
Expected: `Direct Supabase imports in components/pages: 22 (ceiling 22)`, exit code 0.

- [ ] **Step 8: Commit**

```bash
git add scripts/supabase-import-ratchet.mjs scripts/__tests__/supabaseImportRatchet.test.js supabase-import-budget.json package.json .github/workflows/ci.yml
git commit -m "ci: ratchet the count of direct Supabase imports at 22"
```

---

### Task 2: `unwrap` and the service test harness

Every service function needs the same two things: one decision about what a failed query
does, and a way to test it without a network. Both land here so the eight service modules
that follow do not each invent their own.

**Files:**
- Create: `src/services/unwrap.js`
- Create: `src/services/__tests__/unwrap.test.js`
- Create: `src/test/utils/supabaseQueryMock.js`

**Interfaces:**
- Consumes: `src/utils/logger.js` (`logger.error`).
- Produces:
  - `class ServiceError extends Error` with `.table`, `.operation`, `.cause`.
  - `unwrap(result, { table, operation }) -> data` — throws `ServiceError` on `error`.
  - `unwrapList(result, { table, operation }) -> array` — as above, `[]` for null data.
  - `unwrapCount(result, { table, operation }) -> { rows, count }` — for
    `.select('*', { count: 'exact' })`.
  - `queryBuilderMock(result)` and `mockFrom(supabase, resultsByTable)` from the test
    helper. **Every service test in Tasks 4–9 uses these two and nothing else.**

- [ ] **Step 1: Write the failing test**

Create `src/services/__tests__/unwrap.test.js`:

```js
import { describe, it, expect, vi } from 'vitest';
import { unwrap, unwrapList, unwrapCount, ServiceError } from '../unwrap';

vi.mock('@/utils/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));

const ctx = { table: 'properties', operation: 'listFeatured' };

describe('unwrap', () => {
  it('returns the data when there is no error', () => {
    expect(unwrap({ data: { id: 1 }, error: null }, ctx)).toEqual({ id: 1 });
  });

  it('throws a ServiceError naming the table and the operation', () => {
    expect(() => unwrap({ data: null, error: { message: 'permission denied' } }, ctx))
      .toThrow(ServiceError);
    try {
      unwrap({ data: null, error: { message: 'permission denied' } }, ctx);
    } catch (err) {
      expect(err.table).toBe('properties');
      expect(err.operation).toBe('listFeatured');
      expect(err.message).toContain('permission denied');
    }
  });

  it('does not put the raw error payload into the message', () => {
    // The 2026-09-01 audit found Supabase error objects printed into visitors'
    // consoles. A ServiceError carries a message and a context, not a payload;
    // the payload stays on `.cause` for a developer to inspect.
    try {
      unwrap({ data: null, error: { message: 'boom', details: 'select "secret" from ...' } }, ctx);
    } catch (err) {
      expect(err.message).not.toContain('secret');
      expect(err.cause.details).toContain('secret');
    }
  });
});

describe('unwrapList', () => {
  it('returns an empty array when the query returns null data', () => {
    expect(unwrapList({ data: null, error: null }, ctx)).toEqual([]);
  });

  it('returns the rows when there are some', () => {
    expect(unwrapList({ data: [{ id: 1 }], error: null }, ctx)).toEqual([{ id: 1 }]);
  });

  it('throws rather than returning [] when the query failed', () => {
    // The bug this prevents: a failed query rendering as "no properties found",
    // which is indistinguishable from an empty database to everyone but the
    // person who wrote it.
    expect(() => unwrapList({ data: null, error: { message: 'nope' } }, ctx)).toThrow(ServiceError);
  });
});

describe('unwrapCount', () => {
  it('returns rows and count together', () => {
    expect(unwrapCount({ data: [{ id: 1 }], count: 47, error: null }, ctx))
      .toEqual({ rows: [{ id: 1 }], count: 47 });
  });

  it('reports a count of 0 rather than null when the table is empty', () => {
    expect(unwrapCount({ data: null, count: null, error: null }, ctx))
      .toEqual({ rows: [], count: 0 });
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/services/__tests__/unwrap.test.js`
Expected: FAIL — `Failed to resolve import "../unwrap"`.

- [ ] **Step 3: Write the implementation**

Create `src/services/unwrap.js`:

```js
import { logger } from '@/utils/logger';

/**
 * What a failed query looks like, decided once.
 *
 * Supabase returns `{ data, error }` rather than rejecting, so before this
 * module every call site had to remember to check `error` — and the ones that
 * forgot rendered `null` as though it were an empty result. A thrown error is
 * also what TanStack Query wants: `isError` only becomes true if the queryFn
 * rejects.
 */
export class ServiceError extends Error {
  constructor(message, { table, operation, cause } = {}) {
    super(message);
    this.name = 'ServiceError';
    this.table = table;
    this.operation = operation;
    this.cause = cause;
  }
}

function fail({ error }, { table, operation }) {
  // `logger` calls are dropped from production builds by the esbuild `drop` in
  // vite.config.js, so the full object is available in development and none of
  // it reaches a visitor's console. The thrown message carries no query text.
  logger.error(`[${table}.${operation}]`, error);
  throw new ServiceError(`${operation} failed on ${table}: ${error.message}`, {
    table,
    operation,
    cause: error,
  });
}

/** Single row or arbitrary payload. Returns `data` as-is, including null. */
export function unwrap(result, context) {
  if (result.error) fail(result, context);
  return result.data;
}

/** List query. Null data becomes `[]`, so no caller needs `data || []`. */
export function unwrapList(result, context) {
  if (result.error) fail(result, context);
  return result.data ?? [];
}

/** `.select('*', { count: 'exact' })`. Returns the page and the total together. */
export function unwrapCount(result, context) {
  if (result.error) fail(result, context);
  return { rows: result.data ?? [], count: result.count ?? 0 };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/services/__tests__/unwrap.test.js`
Expected: PASS, 8 tests.

- [ ] **Step 5: Write the service test harness**

Create `src/test/utils/supabaseQueryMock.js`:

```js
import { vi } from 'vitest';

/**
 * A stand-in for a PostgREST query builder.
 *
 * The real builder is *thenable*: `await supabase.from('x').select('*')`
 * resolves because the builder implements `then`. The global mock in
 * src/test/setup.jsx does not — its methods return `this` and nothing ever
 * resolves — which is fine for "did this component subscribe" and useless for
 * "what does this service return". Service tests use this instead.
 *
 *   import { supabase } from '@/utils/supabaseClient';
 *   const builders = mockFrom(supabase, { properties: { data: [{ id: 1 }], error: null } });
 *   await expect(listFeatured()).resolves.toEqual([{ id: 1 }]);
 *   expect(builders.properties.eq).toHaveBeenCalledWith('featured', true);
 */
const CHAINABLE = [
  'select', 'insert', 'update', 'upsert', 'delete',
  'eq', 'neq', 'in', 'is', 'gt', 'gte', 'lt', 'lte',
  'like', 'ilike', 'or', 'contains', 'order', 'range', 'limit',
];

export function queryBuilderMock(result = { data: null, error: null }) {
  const builder = {};
  for (const method of CHAINABLE) builder[method] = vi.fn(() => builder);
  builder.single = vi.fn(() => Promise.resolve(result));
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));
  // Thenable, so `await builder` and `await builder.select(...)` both resolve.
  builder.then = (onFulfilled, onRejected) =>
    Promise.resolve(result).then(onFulfilled, onRejected);
  return builder;
}

/**
 * Point `supabase.from` at one result per table, and hand back the builders so
 * a test can assert on the calls that were made.
 */
export function mockFrom(supabase, resultsByTable) {
  const builders = {};
  for (const [table, result] of Object.entries(resultsByTable)) {
    builders[table] = queryBuilderMock(result);
  }
  supabase.from.mockImplementation((table) => {
    if (!builders[table]) throw new Error(`Test did not stub a result for table "${table}"`);
    return builders[table];
  });
  return builders;
}
```

- [ ] **Step 6: Prove the harness works**

Append to `src/services/__tests__/unwrap.test.js`:

```js
import { queryBuilderMock } from '@/test/utils/supabaseQueryMock';

describe('queryBuilderMock', () => {
  it('is thenable, so an awaited chain resolves to the stubbed result', async () => {
    const builder = queryBuilderMock({ data: [{ id: 1 }], error: null });
    await expect(builder.select('*').eq('featured', true).order('created_at'))
      .resolves.toEqual({ data: [{ id: 1 }], error: null });
  });

  it('resolves .single() to the same result', async () => {
    const builder = queryBuilderMock({ data: { id: 1 }, error: null });
    await expect(builder.select('*').eq('id', 1).single())
      .resolves.toEqual({ data: { id: 1 }, error: null });
  });
});
```

Run: `npx vitest run src/services/__tests__/unwrap.test.js`
Expected: PASS, 10 tests.

- [ ] **Step 7: Commit**

```bash
git add src/services/unwrap.js src/services/__tests__/unwrap.test.js src/test/utils/supabaseQueryMock.js
git commit -m "feat(services): add ServiceError, unwrap helpers and the query-builder test mock"
```

---

### Task 3: The query-key registry and the cache policy

The `Home.jsx` / `App.jsx` `staleTime` disagreement ROADMAP.md names is a symptom, not the
disease: keys and lifetimes are decided at twelve call sites, so `'admin-bookings'` in one
file and `['admin-bookings', filters]` in another are one typo apart from a cache that
never invalidates. One registry, three named lifetimes, and a test that fails if anyone
writes a key inline.

**Files:**
- Create: `src/services/cachePolicy.js`
- Create: `src/services/queryKeys.js`
- Create: `src/services/__tests__/queryKeys.test.js`
- Create: `src/services/__tests__/queryKeys.discipline.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `STALE_TIME.live` (30 s) · `STALE_TIME.standard` (5 min) · `STALE_TIME.static` (30 min).
  - `queryKeys` — the object written out below. Every `queryKey` in the app comes from it,
    and Tasks 4–9 build their `queryOptions` factories on it.

- [ ] **Step 1: Write the failing test**

Create `src/services/__tests__/queryKeys.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { queryKeys } from '../queryKeys';
import { STALE_TIME } from '../cachePolicy';

describe('queryKeys', () => {
  it('nests every property key under one root, so a single invalidate clears them all', () => {
    expect(queryKeys.properties.featured()[0]).toBe('properties');
    expect(queryKeys.properties.detail(7)[0]).toBe('properties');
    expect(queryKeys.properties.page({ page: 2 })[0]).toBe('properties');
    expect(queryKeys.properties.all).toEqual(['properties']);
  });

  it('coerces ids to strings, so 7 and "7" are one cache entry rather than two', () => {
    expect(queryKeys.properties.detail(7)).toEqual(queryKeys.properties.detail('7'));
    expect(queryKeys.clients.detail(7)).toEqual(queryKeys.clients.detail('7'));
  });

  it('includes the filters in a filtered list key', () => {
    expect(queryKeys.bookings.list({ status: 'pending' }))
      .toEqual(['bookings', 'list', { status: 'pending' }]);
  });

  it('gives an unfiltered list a stable key rather than one built from undefined', () => {
    expect(queryKeys.bookings.list()).toEqual(['bookings', 'list', {}]);
  });

  it('keeps booking notes under the bookings root', () => {
    expect(queryKeys.bookings.notes('abc')).toEqual(['bookings', 'notes', 'abc']);
  });
});

describe('STALE_TIME', () => {
  it('names three lifetimes and nothing else', () => {
    expect(Object.keys(STALE_TIME).sort()).toEqual(['live', 'standard', 'static']);
  });

  it('orders them shortest to longest', () => {
    expect(STALE_TIME.live).toBeLessThan(STALE_TIME.standard);
    expect(STALE_TIME.standard).toBeLessThan(STALE_TIME.static);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/services/__tests__/queryKeys.test.js`
Expected: FAIL — `Failed to resolve import "../queryKeys"`.

- [ ] **Step 3: Write the cache policy**

Create `src/services/cachePolicy.js`:

```js
/**
 * Three cache lifetimes, named for what they are for.
 *
 * Before this file, App.jsx set a global staleTime of 5 minutes and Home.jsx
 * quietly overrode it to 1 minute for featured properties — a disagreement
 * nobody could see, because each half was defensible on its own screen. Naming
 * the lifetimes makes the choice reviewable: a query is `live`, `standard`, or
 * `static`, and a fourth gets added here with a reason rather than typed into a
 * component.
 */
export const STALE_TIME = {
  /** Admin counters and queues, where a stale badge is actively misleading. */
  live: 30 * 1000,
  /** Everything a visitor reads. The app's default. */
  standard: 5 * 60 * 1000,
  /** Settings and email templates: changed by one admin, a few times a year. */
  static: 30 * 60 * 1000,
};
```

- [ ] **Step 4: Write the key registry**

Create `src/services/queryKeys.js`:

```js
/**
 * Every TanStack Query key in the app.
 *
 * Keys are hierarchical on purpose: `['properties', 'detail', '7']` sits under
 * `['properties']`, so `invalidateQueries({ queryKey: queryKeys.properties.all })`
 * after a write clears the admin table, the featured strip and every open detail
 * at once. That is impossible with the flat strings this replaces —
 * 'featured-properties', 'admin-bookings', 'booking-stats', 'client',
 * 'client-stats', 'booking-notes' — where invalidating one said nothing about
 * the others, and every write had to remember its own list of them.
 *
 * Ids are coerced to strings because properties.id arrives as an integer from
 * the database and as a string from useParams(). Two spellings of one row is
 * two cache entries, one of which is always stale.
 */
const id = (value) => String(value);

export const queryKeys = {
  properties: {
    all: ['properties'],
    featured: () => ['properties', 'featured'],
    available: () => ['properties', 'available'],
    list: (sort = {}) => ['properties', 'list', sort],
    page: (params = {}) => ['properties', 'page', params],
    detail: (propertyId) => ['properties', 'detail', id(propertyId)],
    segment: (segment) => ['properties', 'segment', segment],
  },
  bookings: {
    all: ['bookings'],
    list: (filters = {}) => ['bookings', 'list', filters],
    stats: () => ['bookings', 'stats'],
    pendingCount: () => ['bookings', 'pending-count'],
    notes: (bookingId) => ['bookings', 'notes', id(bookingId)],
  },
  clients: {
    all: ['clients'],
    page: (params = {}) => ['clients', 'page', params],
    detail: (clientId) => ['clients', 'detail', id(clientId)],
    stats: (clientId) => ['clients', 'stats', id(clientId)],
    interests: (clientId) => ['clients', 'interests', id(clientId)],
    communications: (clientId) => ['clients', 'communications', id(clientId)],
  },
  settings: {
    all: ['settings'],
    category: (category) => ['settings', 'category', category],
    general: () => ['settings', 'category', 'general'],
    cloudinary: () => ['settings', 'cloudinary'],
    emailTemplates: () => ['settings', 'email-templates'],
  },
  dashboard: {
    all: ['dashboard'],
    stats: () => ['dashboard', 'stats'],
  },
};
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/services/__tests__/queryKeys.test.js`
Expected: PASS, 7 tests.

- [ ] **Step 6: Write the discipline test, skipped with its reason**

It would fail on arrival — twelve call sites still build keys inline — so it ships
`describe.skip`ped, and Task 17 removes the skip when the migration is done. A test that is
red for a whole phase is a test people learn to scroll past.

Create `src/services/__tests__/queryKeys.discipline.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Every .jsx/.js under src/, excluding tests and the registry itself. */
function sourceFiles(dir = 'src', acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry !== '__tests__' && entry !== 'test') sourceFiles(full, acc);
    } else if (/\.jsx?$/.test(entry) && !full.includes('queryKeys')) {
      acc.push(full);
    }
  }
  return acc;
}

// Un-skipped in Task 17, once every call site is migrated. It is skipped rather
// than absent so the intent is on the record while Phase 1 is in flight.
describe.skip('query key discipline', () => {
  it('builds no query key from an inline string literal', () => {
    const offenders = sourceFiles().filter((file) =>
      /queryKey:\s*\[\s*['"`]/.test(readFileSync(file, 'utf8'))
    );
    expect(offenders).toEqual([]);
  });

  it('sets no staleTime that did not come from cachePolicy', () => {
    const offenders = sourceFiles().filter(
      (file) =>
        /staleTime:\s*[0-9]/.test(readFileSync(file, 'utf8')) && !file.endsWith('cachePolicy.js')
    );
    expect(offenders).toEqual([]);
  });
});
```

- [ ] **Step 7: Run the whole suite to confirm nothing regressed**

Run: `npm run test:run`
Expected: PASS; the new file reports 2 skipped.

- [ ] **Step 8: Commit**

```bash
git add src/services/cachePolicy.js src/services/queryKeys.js src/services/__tests__/queryKeys.test.js src/services/__tests__/queryKeys.discipline.test.js
git commit -m "feat(services): centralise query keys and name three cache lifetimes"
```

---

### Task 4: `services/properties.js`

The busiest table: seven components read it and one writes it, in eight different spellings
of the same three queries.

**Files:**
- Create: `src/services/properties.js`
- Create: `src/services/__tests__/properties.test.js`

**Interfaces:**
- Consumes: `unwrap`, `unwrapList`, `unwrapCount` (Task 2); `queryKeys` and `STALE_TIME`
  (Task 3); `supabase` from `@/utils/supabaseClient`.
- Produces — data functions:
  - `listFeatured({ limit = 3 } = {}) -> Property[]`
  - `listAvailable() -> Property[]`
  - `listAll({ sortField = 'created_at', sortDirection = 'desc' } = {}) -> Property[]`
  - `listPage({ page = 1, pageSize = 10, sortField = 'created_at', sortDirection = 'desc' }) -> { rows: Property[], count: number }`
  - `getById(propertyId) -> Property`
  - `countProperties({ featured, status } = {}) -> number`
  - `createProperty(values) -> Property`
  - `updateProperty(propertyId, values) -> Property`
  - `deleteProperty(propertyId) -> void`
  - `setFeatured(propertyId, featured) -> Property`
- Produces — query options: `propertyQueries.featured()`, `.available()`, `.all(sort)`,
  `.page(params)`, `.detail(propertyId)`. Each returns `{ queryKey, queryFn, staleTime }`,
  spreadable straight into `useQuery`.

- [ ] **Step 1: Write the failing test**

Create `src/services/__tests__/properties.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/utils/supabaseClient';
import { mockFrom } from '@/test/utils/supabaseQueryMock';
import {
  listFeatured, listAll, listPage, getById, updateProperty, setFeatured, propertyQueries,
} from '../properties';
import { ServiceError } from '../unwrap';
import { queryKeys } from '../queryKeys';
import { STALE_TIME } from '../cachePolicy';

const row = { id: 7, title: 'Gigiri Apartment', featured: true };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('listFeatured', () => {
  it('asks for featured rows, newest first, three of them', async () => {
    const builders = mockFrom(supabase, { properties: { data: [row], error: null } });

    await expect(listFeatured()).resolves.toEqual([row]);

    expect(supabase.from).toHaveBeenCalledWith('properties');
    expect(builders.properties.eq).toHaveBeenCalledWith('featured', true);
    expect(builders.properties.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(builders.properties.limit).toHaveBeenCalledWith(3);
  });

  it('honours an explicit limit', async () => {
    const builders = mockFrom(supabase, { properties: { data: [], error: null } });
    await listFeatured({ limit: 6 });
    expect(builders.properties.limit).toHaveBeenCalledWith(6);
  });

  it('returns [] rather than null when there are no featured properties', async () => {
    mockFrom(supabase, { properties: { data: null, error: null } });
    await expect(listFeatured()).resolves.toEqual([]);
  });

  it('throws a ServiceError when the query fails', async () => {
    mockFrom(supabase, { properties: { data: null, error: { message: 'denied' } } });
    await expect(listFeatured()).rejects.toBeInstanceOf(ServiceError);
  });
});

describe('listAll', () => {
  it('defaults to newest first and accepts an ascending sort', async () => {
    const builders = mockFrom(supabase, { properties: { data: [row], error: null } });

    await listAll();
    expect(builders.properties.order).toHaveBeenCalledWith('created_at', { ascending: false });

    await listAll({ sortField: 'price', sortDirection: 'asc' });
    expect(builders.properties.order).toHaveBeenCalledWith('price', { ascending: true });
  });
});

describe('listPage', () => {
  it('translates a 1-based page into a Supabase range and returns the total', async () => {
    const builders = mockFrom(supabase, {
      properties: { data: [row], count: 47, error: null },
    });

    await expect(listPage({ page: 3, pageSize: 10 })).resolves.toEqual({ rows: [row], count: 47 });

    // Page 3 of 10 is rows 20..29 — the off-by-one that made the admin table
    // skip a property between every page before this function existed.
    expect(builders.properties.range).toHaveBeenCalledWith(20, 29);
    expect(builders.properties.select).toHaveBeenCalledWith('*', { count: 'exact' });
  });

  it('starts page 1 at row 0', async () => {
    const builders = mockFrom(supabase, { properties: { data: [], count: 0, error: null } });
    await listPage({ page: 1, pageSize: 12 });
    expect(builders.properties.range).toHaveBeenCalledWith(0, 11);
  });
});

describe('getById', () => {
  it('fetches one row by id', async () => {
    const builders = mockFrom(supabase, { properties: { data: row, error: null } });
    await expect(getById(7)).resolves.toEqual(row);
    expect(builders.properties.eq).toHaveBeenCalledWith('id', 7);
    expect(builders.properties.single).toHaveBeenCalled();
  });
});

describe('writes', () => {
  it('updates by id and returns the updated row', async () => {
    const builders = mockFrom(supabase, { properties: { data: { ...row, price: 10 }, error: null } });
    await expect(updateProperty(7, { price: 10 })).resolves.toEqual({ ...row, price: 10 });
    expect(builders.properties.update).toHaveBeenCalledWith({ price: 10 });
    expect(builders.properties.eq).toHaveBeenCalledWith('id', 7);
  });

  it('toggles featured and returns the updated row', async () => {
    const builders = mockFrom(supabase, { properties: { data: { ...row, featured: false }, error: null } });
    await setFeatured(7, false);
    expect(builders.properties.update).toHaveBeenCalledWith({ featured: false });
  });
});

describe('propertyQueries', () => {
  it('builds featured options from the registry and the standard lifetime', () => {
    const options = propertyQueries.featured();
    expect(options.queryKey).toEqual(queryKeys.properties.featured());
    expect(options.staleTime).toBe(STALE_TIME.standard);
    expect(typeof options.queryFn).toBe('function');
  });

  it('builds detail options keyed by the id', () => {
    expect(propertyQueries.detail(7).queryKey).toEqual(queryKeys.properties.detail(7));
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/services/__tests__/properties.test.js`
Expected: FAIL — `Failed to resolve import "../properties"`.

- [ ] **Step 3: Write the implementation**

Create `src/services/properties.js`:

```js
import { supabase } from '@/utils/supabaseClient';
import { unwrap, unwrapList, unwrapCount } from './unwrap';
import { queryKeys } from './queryKeys';
import { STALE_TIME } from './cachePolicy';

const TABLE = 'properties';

/** The three featured cards on the home page. */
export async function listFeatured({ limit = 3 } = {}) {
  return unwrapList(
    await supabase
      .from(TABLE)
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit),
    { table: TABLE, operation: 'listFeatured' }
  );
}

/** Everything a visitor may book a viewing on. */
export async function listAvailable() {
  return unwrapList(
    await supabase
      .from(TABLE)
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false }),
    { table: TABLE, operation: 'listAvailable' }
  );
}

/** The public /properties grid, which filters client-side after one fetch. */
export async function listAll({ sortField = 'created_at', sortDirection = 'desc' } = {}) {
  return unwrapList(
    await supabase
      .from(TABLE)
      .select('*')
      .order(sortField, { ascending: sortDirection === 'asc' }),
    { table: TABLE, operation: 'listAll' }
  );
}

/**
 * One page of the admin table, plus the total.
 *
 * `page` is 1-based because that is what the interface shows; Supabase's
 * `range` is 0-based and inclusive at both ends. Converting in one place is the
 * point — the previous inline version was written twice and disagreed with
 * itself by one row.
 */
export async function listPage({
  page = 1,
  pageSize = 10,
  sortField = 'created_at',
  sortDirection = 'desc',
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return unwrapCount(
    await supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order(sortField, { ascending: sortDirection === 'asc' })
      .range(from, to),
    { table: TABLE, operation: 'listPage' }
  );
}

export async function getById(propertyId) {
  return unwrap(await supabase.from(TABLE).select('*').eq('id', propertyId).single(), {
    table: TABLE,
    operation: 'getById',
  });
}

/** Counts for the dashboard tiles. `head: true` fetches no rows. */
export async function countProperties({ featured, status } = {}) {
  let query = supabase.from(TABLE).select('*', { count: 'exact', head: true });
  if (featured !== undefined) query = query.eq('featured', featured);
  if (status !== undefined) query = query.eq('status', status);
  return unwrapCount(await query, { table: TABLE, operation: 'countProperties' }).count;
}

export async function createProperty(values) {
  return unwrap(await supabase.from(TABLE).insert([values]).select().single(), {
    table: TABLE,
    operation: 'createProperty',
  });
}

export async function updateProperty(propertyId, values) {
  return unwrap(
    await supabase.from(TABLE).update(values).eq('id', propertyId).select().single(),
    { table: TABLE, operation: 'updateProperty' }
  );
}

export async function deleteProperty(propertyId) {
  unwrap(await supabase.from(TABLE).delete().eq('id', propertyId), {
    table: TABLE,
    operation: 'deleteProperty',
  });
}

export async function setFeatured(propertyId, featured) {
  return unwrap(
    await supabase.from(TABLE).update({ featured }).eq('id', propertyId).select().single(),
    { table: TABLE, operation: 'setFeatured' }
  );
}

/**
 * Query options, spreadable into useQuery:
 *   const { data = [] } = useQuery(propertyQueries.featured());
 *
 * Key and lifetime travel with the query rather than being retyped per screen,
 * which is what let Home.jsx and App.jsx disagree about staleTime unnoticed.
 */
export const propertyQueries = {
  featured: () => ({
    queryKey: queryKeys.properties.featured(),
    queryFn: () => listFeatured(),
    staleTime: STALE_TIME.standard,
  }),
  available: () => ({
    queryKey: queryKeys.properties.available(),
    queryFn: () => listAvailable(),
    staleTime: STALE_TIME.standard,
  }),
  all: (sort = {}) => ({
    queryKey: queryKeys.properties.list(sort),
    queryFn: () => listAll(sort),
    staleTime: STALE_TIME.standard,
  }),
  page: (params = {}) => ({
    queryKey: queryKeys.properties.page(params),
    queryFn: () => listPage(params),
    staleTime: STALE_TIME.live,
  }),
  detail: (propertyId) => ({
    queryKey: queryKeys.properties.detail(propertyId),
    queryFn: () => getById(propertyId),
    staleTime: STALE_TIME.standard,
    enabled: Boolean(propertyId),
  }),
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/services/__tests__/properties.test.js`
Expected: PASS, 12 tests.

- [ ] **Step 5: Commit**

```bash
git add src/services/properties.js src/services/__tests__/properties.test.js
git commit -m "feat(services): add the properties data module"
```

---

### Task 5: `services/bookings.js`

**Files:**
- Create: `src/services/bookings.js`
- Create: `src/services/__tests__/bookings.test.js`

**Interfaces:**
- Consumes: `unwrap`, `unwrapList`, `unwrapCount`, `queryKeys`, `STALE_TIME`, `supabase`.
- Produces — data functions:
  - `listBookings({ status, priority } = {}) -> Booking[]` (never archived, soonest first)
  - `getBookingStats() -> { total: number, byStatus: Record<string, number>, byPriority: Record<string, number> }`
  - `countPendingBookings() -> number`
  - `countBookings({ status } = {}) -> number`
  - `listUpcomingBookings({ limit = 5 } = {}) -> Booking[]`
  - `listRecentBookings({ limit = 5 } = {}) -> Booking[]`
  - `createBooking(record) -> void` — the public enquiry path
  - `updateBooking(bookingId, updates) -> Booking`
  - `setBookingStatus(bookingId, status) -> Booking`
  - `setBookingPriority(bookingId, priority) -> Booking`
  - `rescheduleBooking(bookingId, { appointmentAt }) -> Booking`
  - `listBookingNotes(bookingId) -> Note[]`
  - `addBookingNote({ bookingId, note, author }) -> Note`
  - `deleteBookingNote(noteId) -> void`
- Produces — query options: `bookingQueries.list(filters)`, `.stats()`, `.pendingCount()`,
  `.notes(bookingId)`.

- [ ] **Step 1: Write the failing test**

Create `src/services/__tests__/bookings.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/utils/supabaseClient';
import { mockFrom } from '@/test/utils/supabaseQueryMock';
import {
  listBookings, getBookingStats, countPendingBookings, createBooking,
  setBookingStatus, rescheduleBooking, addBookingNote, bookingQueries,
} from '../bookings';
import { queryKeys } from '../queryKeys';
import { STALE_TIME } from '../cachePolicy';

beforeEach(() => vi.clearAllMocks());

describe('listBookings', () => {
  it('excludes archived bookings and orders by appointment, soonest first', async () => {
    const builders = mockFrom(supabase, { bookings: { data: [], error: null } });
    await listBookings();
    expect(builders.bookings.eq).toHaveBeenCalledWith('is_archived', false);
    expect(builders.bookings.order).toHaveBeenCalledWith('appointment_at', { ascending: true });
  });

  it('applies a status filter when one is given', async () => {
    const builders = mockFrom(supabase, { bookings: { data: [], error: null } });
    await listBookings({ status: 'pending' });
    expect(builders.bookings.eq).toHaveBeenCalledWith('status', 'pending');
  });

  it('ignores an "all" filter rather than querying for the literal string', async () => {
    // The bug this prevents: the admin filter's default option is the string
    // 'all', and passing it through returned zero rows on every screen.
    const builders = mockFrom(supabase, { bookings: { data: [], error: null } });
    await listBookings({ status: 'all', priority: 'all' });
    expect(builders.bookings.eq).not.toHaveBeenCalledWith('status', 'all');
    expect(builders.bookings.eq).not.toHaveBeenCalledWith('priority', 'all');
  });
});

describe('getBookingStats', () => {
  it('counts by status and by priority in one pass', async () => {
    mockFrom(supabase, {
      bookings: {
        data: [
          { status: 'pending', priority: 'high' },
          { status: 'pending', priority: 'low' },
          { status: 'confirmed', priority: 'high' },
        ],
        error: null,
      },
    });

    await expect(getBookingStats()).resolves.toEqual({
      total: 3,
      byStatus: { pending: 2, confirmed: 1 },
      byPriority: { high: 2, low: 1 },
    });
  });

  it('returns zeroed maps for an empty table rather than undefined', async () => {
    mockFrom(supabase, { bookings: { data: [], error: null } });
    await expect(getBookingStats()).resolves.toEqual({ total: 0, byStatus: {}, byPriority: {} });
  });

  it('buckets a row with no priority under "unset" instead of dropping it', async () => {
    mockFrom(supabase, { bookings: { data: [{ status: 'pending', priority: null }], error: null } });
    const stats = await getBookingStats();
    expect(stats.byPriority).toEqual({ unset: 1 });
    expect(stats.total).toBe(1);
  });
});

describe('countPendingBookings', () => {
  it('counts pending, unarchived bookings without fetching their rows', async () => {
    const builders = mockFrom(supabase, { bookings: { data: null, count: 8, error: null } });
    await expect(countPendingBookings()).resolves.toBe(8);
    expect(builders.bookings.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
    expect(builders.bookings.eq).toHaveBeenCalledWith('status', 'pending');
    expect(builders.bookings.eq).toHaveBeenCalledWith('is_archived', false);
  });
});

describe('createBooking', () => {
  it('inserts the record the public forms build', async () => {
    const builders = mockFrom(supabase, { bookings: { data: null, error: null } });
    const record = { type: 'viewing', name: 'A', email: 'a@b.c', phone: '1' };
    await createBooking(record);
    expect(builders.bookings.insert).toHaveBeenCalledWith([record]);
  });
});

describe('writes', () => {
  it('stamps last_modified_at when the status changes', async () => {
    const builders = mockFrom(supabase, { bookings: { data: { id: 'x' }, error: null } });
    await setBookingStatus('x', 'confirmed');
    const [updates] = builders.bookings.update.mock.calls[0];
    expect(updates.status).toBe('confirmed');
    expect(updates.last_modified_at).toEqual(expect.any(String));
  });

  it('reschedules to the given appointment time', async () => {
    const builders = mockFrom(supabase, { bookings: { data: { id: 'x' }, error: null } });
    await rescheduleBooking('x', { appointmentAt: '2026-10-01T09:00:00.000Z' });
    const [updates] = builders.bookings.update.mock.calls[0];
    expect(updates.appointment_at).toBe('2026-10-01T09:00:00.000Z');
  });

  it('writes a note against the booking', async () => {
    const builders = mockFrom(supabase, { booking_notes: { data: { id: 1 }, error: null } });
    await addBookingNote({ bookingId: 'x', note: 'called back', author: 'admin' });
    expect(builders.booking_notes.insert).toHaveBeenCalledWith({
      booking_id: 'x',
      note: 'called back',
      author: 'admin',
    });
  });
});

describe('bookingQueries', () => {
  it('uses the registry key and the live lifetime for the pending counter', () => {
    const options = bookingQueries.pendingCount();
    expect(options.queryKey).toEqual(queryKeys.bookings.pendingCount());
    expect(options.staleTime).toBe(STALE_TIME.live);
  });

  it('includes the filters in the list key', () => {
    expect(bookingQueries.list({ status: 'pending' }).queryKey)
      .toEqual(queryKeys.bookings.list({ status: 'pending' }));
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/services/__tests__/bookings.test.js`
Expected: FAIL — `Failed to resolve import "../bookings"`.

- [ ] **Step 3: Write the implementation**

Create `src/services/bookings.js`:

```js
import { supabase } from '@/utils/supabaseClient';
import { unwrap, unwrapList, unwrapCount } from './unwrap';
import { queryKeys } from './queryKeys';
import { STALE_TIME } from './cachePolicy';

const TABLE = 'bookings';
const NOTES_TABLE = 'booking_notes';

/** The admin filter dropdowns default to this, and it means "no filter". */
const isSet = (value) => value !== undefined && value !== null && value !== '' && value !== 'all';

const now = () => new Date().toISOString();

export async function listBookings({ status, priority } = {}) {
  let query = supabase
    .from(TABLE)
    .select('*')
    .eq('is_archived', false)
    .order('appointment_at', { ascending: true });

  if (isSet(status)) query = query.eq('status', status);
  if (isSet(priority)) query = query.eq('priority', priority);

  return unwrapList(await query, { table: TABLE, operation: 'listBookings' });
}

/**
 * The four counters above the admin bookings table.
 *
 * One query fetching two columns, tallied here. The previous version ran the
 * same query and tallied it inside the component, which is why the numbers and
 * the list could disagree after a status change: two cache entries, one
 * invalidation.
 */
export async function getBookingStats() {
  const rows = unwrapList(
    await supabase.from(TABLE).select('status, priority').eq('is_archived', false),
    { table: TABLE, operation: 'getBookingStats' }
  );

  const tally = (values) =>
    values.reduce((acc, value) => {
      const key = value ?? 'unset';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

  return {
    total: rows.length,
    byStatus: tally(rows.map((row) => row.status)),
    byPriority: tally(rows.map((row) => row.priority)),
  };
}

export async function countPendingBookings() {
  return unwrapCount(
    await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .eq('is_archived', false),
    { table: TABLE, operation: 'countPendingBookings' }
  ).count;
}

export async function countBookings({ status } = {}) {
  let query = supabase.from(TABLE).select('*', { count: 'exact', head: true });
  if (isSet(status)) query = query.eq('status', status);
  return unwrapCount(await query, { table: TABLE, operation: 'countBookings' }).count;
}

export async function listUpcomingBookings({ limit = 5 } = {}) {
  return unwrapList(
    await supabase
      .from(TABLE)
      .select('id, name, appointment_at, service, viewing_type')
      .gte('appointment_at', now())
      .order('appointment_at', { ascending: true })
      .limit(limit),
    { table: TABLE, operation: 'listUpcomingBookings' }
  );
}

export async function listRecentBookings({ limit = 5 } = {}) {
  return unwrapList(
    await supabase
      .from(TABLE)
      .select('id, name, service, viewing_type, type, created_at')
      .order('created_at', { ascending: false })
      .limit(limit),
    { table: TABLE, operation: 'listRecentBookings' }
  );
}

/**
 * The public enquiry path — Contact, ServicesMain and ViewingExperience.
 *
 * Returns nothing on purpose: migration 009's INSERT policy requires every
 * admin-only column to be NULL on submission, so the row a prospect creates is
 * not theirs to read back.
 */
export async function createBooking(record) {
  unwrap(await supabase.from(TABLE).insert([record]), {
    table: TABLE,
    operation: 'createBooking',
  });
}

export async function updateBooking(bookingId, updates) {
  return unwrap(
    await supabase
      .from(TABLE)
      .update({ ...updates, last_modified_at: now() })
      .eq('id', bookingId)
      .select()
      .single(),
    { table: TABLE, operation: 'updateBooking' }
  );
}

export const setBookingStatus = (bookingId, status) => updateBooking(bookingId, { status });

export const setBookingPriority = (bookingId, priority) => updateBooking(bookingId, { priority });

export const rescheduleBooking = (bookingId, { appointmentAt }) =>
  updateBooking(bookingId, { appointment_at: appointmentAt });

export async function listBookingNotes(bookingId) {
  return unwrapList(
    await supabase
      .from(NOTES_TABLE)
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false }),
    { table: NOTES_TABLE, operation: 'listBookingNotes' }
  );
}

export async function addBookingNote({ bookingId, note, author }) {
  return unwrap(
    await supabase
      .from(NOTES_TABLE)
      .insert({ booking_id: bookingId, note, author })
      .select()
      .single(),
    { table: NOTES_TABLE, operation: 'addBookingNote' }
  );
}

export async function deleteBookingNote(noteId) {
  unwrap(await supabase.from(NOTES_TABLE).delete().eq('id', noteId), {
    table: NOTES_TABLE,
    operation: 'deleteBookingNote',
  });
}

export const bookingQueries = {
  list: (filters = {}) => ({
    queryKey: queryKeys.bookings.list(filters),
    queryFn: () => listBookings(filters),
    staleTime: STALE_TIME.live,
  }),
  stats: () => ({
    queryKey: queryKeys.bookings.stats(),
    queryFn: () => getBookingStats(),
    staleTime: STALE_TIME.live,
  }),
  pendingCount: () => ({
    queryKey: queryKeys.bookings.pendingCount(),
    queryFn: () => countPendingBookings(),
    staleTime: STALE_TIME.live,
  }),
  notes: (bookingId) => ({
    queryKey: queryKeys.bookings.notes(bookingId),
    queryFn: () => listBookingNotes(bookingId),
    staleTime: STALE_TIME.live,
    enabled: Boolean(bookingId),
  }),
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/services/__tests__/bookings.test.js`
Expected: PASS, 13 tests.

- [ ] **Step 5: Commit**

```bash
git add src/services/bookings.js src/services/__tests__/bookings.test.js
git commit -m "feat(services): add the bookings data module"
```

---

### Task 6: `services/clients.js`

**Files:**
- Create: `src/services/clients.js`
- Create: `src/services/__tests__/clients.test.js`

**Interfaces:**
- Consumes: `unwrap`, `unwrapList`, `unwrapCount`, `queryKeys`, `STALE_TIME`, `supabase`.
- Produces:
  - `listClientsPage({ page = 1, pageSize = 10, status, clientType, search }) -> { rows, count }`
  - `getClientById(clientId) -> Client`
  - `getClientStats(clientId) -> { interests: number, communications: number, bookings: number }`
  - `createClient(values) -> Client`
  - `updateClient(clientId, values) -> Client`
  - `deleteClient(clientId) -> void`
  - `clientQueries.page(params)`, `.detail(clientId)`, `.stats(clientId)`

- [ ] **Step 1: Write the failing test**

Create `src/services/__tests__/clients.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/utils/supabaseClient';
import { mockFrom } from '@/test/utils/supabaseQueryMock';
import { listClientsPage, getClientById, getClientStats, clientQueries } from '../clients';
import { queryKeys } from '../queryKeys';

beforeEach(() => vi.clearAllMocks());

describe('listClientsPage', () => {
  it('pages newest first and returns the total', async () => {
    const builders = mockFrom(supabase, { clients: { data: [{ id: 1 }], count: 31, error: null } });
    await expect(listClientsPage({ page: 2, pageSize: 10 }))
      .resolves.toEqual({ rows: [{ id: 1 }], count: 31 });
    expect(builders.clients.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(builders.clients.range).toHaveBeenCalledWith(10, 19);
  });

  it('applies status and type filters, ignoring "all"', async () => {
    const builders = mockFrom(supabase, { clients: { data: [], count: 0, error: null } });
    await listClientsPage({ status: 'active', clientType: 'all' });
    expect(builders.clients.eq).toHaveBeenCalledWith('status', 'active');
    expect(builders.clients.eq).not.toHaveBeenCalledWith('client_type', 'all');
  });

  it('searches name, email and phone with one case-insensitive OR', async () => {
    const builders = mockFrom(supabase, { clients: { data: [], count: 0, error: null } });
    await listClientsPage({ search: 'ada' });
    expect(builders.clients.or).toHaveBeenCalledWith(
      'first_name.ilike.%ada%,last_name.ilike.%ada%,email.ilike.%ada%,phone.ilike.%ada%'
    );
  });

  it('escapes a comma in the search term so it cannot inject a second filter', async () => {
    // PostgREST's `or` is comma-separated; an unescaped comma in user input
    // becomes another condition. This is the one place user text reaches a
    // filter grammar.
    const builders = mockFrom(supabase, { clients: { data: [], count: 0, error: null } });
    await listClientsPage({ search: 'a,b' });
    const [filter] = builders.clients.or.mock.calls[0];
    expect(filter).not.toContain('a,b');
  });
});

describe('getClientStats', () => {
  it('counts interests, communications and bookings for one client', async () => {
    mockFrom(supabase, {
      client_property_interests: { data: null, count: 3, error: null },
      client_communications: { data: null, count: 7, error: null },
      bookings: { data: null, count: 2, error: null },
    });
    await expect(getClientStats(4)).resolves.toEqual({
      interests: 3, communications: 7, bookings: 2,
    });
  });
});

describe('getClientById', () => {
  it('fetches one client', async () => {
    const builders = mockFrom(supabase, { clients: { data: { id: 4 }, error: null } });
    await expect(getClientById(4)).resolves.toEqual({ id: 4 });
    expect(builders.clients.eq).toHaveBeenCalledWith('id', 4);
  });
});

describe('clientQueries', () => {
  it('keys the detail query by id', () => {
    expect(clientQueries.detail(4).queryKey).toEqual(queryKeys.clients.detail(4));
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/services/__tests__/clients.test.js`
Expected: FAIL — `Failed to resolve import "../clients"`.

- [ ] **Step 3: Write the implementation**

Create `src/services/clients.js`:

```js
import { supabase } from '@/utils/supabaseClient';
import { unwrap, unwrapCount } from './unwrap';
import { queryKeys } from './queryKeys';
import { STALE_TIME } from './cachePolicy';

const TABLE = 'clients';

const isSet = (value) => value !== undefined && value !== null && value !== '' && value !== 'all';

/**
 * PostgREST parses `or=(a.ilike.%x%,b.ilike.%x%)` by splitting on commas, so a
 * comma typed into the search box would add a condition of the searcher's
 * choosing. Parentheses terminate a filter for the same reason.
 */
const sanitiseSearch = (term) => term.replace(/[,()]/g, ' ').trim();

export async function listClientsPage({
  page = 1,
  pageSize = 10,
  status,
  clientType,
  search,
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (isSet(status)) query = query.eq('status', status);
  if (isSet(clientType)) query = query.eq('client_type', clientType);

  if (isSet(search)) {
    const term = sanitiseSearch(search);
    if (term) {
      query = query.or(
        `first_name.ilike.%${term}%,last_name.ilike.%${term}%,` +
          `email.ilike.%${term}%,phone.ilike.%${term}%`
      );
    }
  }

  return unwrapCount(await query, { table: TABLE, operation: 'listClientsPage' });
}

export async function getClientById(clientId) {
  return unwrap(await supabase.from(TABLE).select('*').eq('id', clientId).single(), {
    table: TABLE,
    operation: 'getClientById',
  });
}

/** The three counters on the client detail header. */
export async function getClientStats(clientId) {
  const countFor = async (table, column, operation) =>
    unwrapCount(
      await supabase.from(table).select('id', { count: 'exact', head: true }).eq(column, clientId),
      { table, operation }
    ).count;

  const [interests, communications, bookings] = await Promise.all([
    countFor('client_property_interests', 'client_id', 'getClientStats.interests'),
    countFor('client_communications', 'client_id', 'getClientStats.communications'),
    countFor('bookings', 'client_id', 'getClientStats.bookings'),
  ]);

  return { interests, communications, bookings };
}

export async function createClient(values) {
  return unwrap(await supabase.from(TABLE).insert([values]).select().single(), {
    table: TABLE,
    operation: 'createClient',
  });
}

export async function updateClient(clientId, values) {
  return unwrap(
    await supabase.from(TABLE).update(values).eq('id', clientId).select().single(),
    { table: TABLE, operation: 'updateClient' }
  );
}

export async function deleteClient(clientId) {
  unwrap(await supabase.from(TABLE).delete().eq('id', clientId), {
    table: TABLE,
    operation: 'deleteClient',
  });
}

export const clientQueries = {
  page: (params = {}) => ({
    queryKey: queryKeys.clients.page(params),
    queryFn: () => listClientsPage(params),
    staleTime: STALE_TIME.live,
  }),
  detail: (clientId) => ({
    queryKey: queryKeys.clients.detail(clientId),
    queryFn: () => getClientById(clientId),
    staleTime: STALE_TIME.standard,
    enabled: Boolean(clientId),
  }),
  stats: (clientId) => ({
    queryKey: queryKeys.clients.stats(clientId),
    queryFn: () => getClientStats(clientId),
    staleTime: STALE_TIME.live,
    enabled: Boolean(clientId),
  }),
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/services/__tests__/clients.test.js`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add src/services/clients.js src/services/__tests__/clients.test.js
git commit -m "feat(services): add the clients data module"
```

---

### Task 7: `services/clientInterests.js` and `services/clientCommunications.js`

Two tables, two components, the same four operations each. They ship together because
neither is worth its own review pass and both are consumed by the same task later.

**Files:**
- Create: `src/services/clientInterests.js`
- Create: `src/services/clientCommunications.js`
- Create: `src/services/__tests__/clientActivity.test.js`

**Interfaces:**
- Consumes: `unwrap`, `unwrapList`, `queryKeys`, `STALE_TIME`, `supabase`.
- Produces from `clientInterests.js`:
  - `listClientInterests(clientId) -> Interest[]` — joined with the property, newest first
  - `addClientInterest(values) -> Interest`
  - `updateClientInterest(interestId, values) -> Interest`
  - `deleteClientInterest(interestId) -> void`
  - `interestQueries.forClient(clientId)`
- Produces from `clientCommunications.js`:
  - `listClientCommunications(clientId) -> Communication[]`
  - `addClientCommunication(values) -> Communication`
  - `updateClientCommunication(communicationId, values) -> Communication`
  - `deleteClientCommunication(communicationId) -> void`
  - `communicationQueries.forClient(clientId)`

- [ ] **Step 1: Write the failing test**

Create `src/services/__tests__/clientActivity.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/utils/supabaseClient';
import { mockFrom } from '@/test/utils/supabaseQueryMock';
import { listClientInterests, addClientInterest, interestQueries } from '../clientInterests';
import {
  listClientCommunications, deleteClientCommunication, communicationQueries,
} from '../clientCommunications';
import { queryKeys } from '../queryKeys';

beforeEach(() => vi.clearAllMocks());

describe('listClientInterests', () => {
  it('selects the joined property fields the timeline renders', async () => {
    const builders = mockFrom(supabase, { client_property_interests: { data: [], error: null } });
    await listClientInterests(4);
    const [selection] = builders.client_property_interests.select.mock.calls[0];
    expect(selection).toContain('properties');
    expect(selection).toContain('title');
    expect(builders.client_property_interests.eq).toHaveBeenCalledWith('client_id', 4);
    expect(builders.client_property_interests.order)
      .toHaveBeenCalledWith('created_at', { ascending: false });
  });
});

describe('addClientInterest', () => {
  it('inserts and returns the created row', async () => {
    const builders = mockFrom(supabase, { client_property_interests: { data: { id: 9 }, error: null } });
    await expect(addClientInterest({ client_id: 4, property_id: 7 })).resolves.toEqual({ id: 9 });
    expect(builders.client_property_interests.insert)
      .toHaveBeenCalledWith([{ client_id: 4, property_id: 7 }]);
  });
});

describe('listClientCommunications', () => {
  it('orders by communication_date, newest first', async () => {
    const builders = mockFrom(supabase, { client_communications: { data: [], error: null } });
    await listClientCommunications(4);
    expect(builders.client_communications.order)
      .toHaveBeenCalledWith('communication_date', { ascending: false });
  });
});

describe('deleteClientCommunication', () => {
  it('deletes by its own id, not the client id', async () => {
    const builders = mockFrom(supabase, { client_communications: { data: null, error: null } });
    await deleteClientCommunication(12);
    expect(builders.client_communications.eq).toHaveBeenCalledWith('id', 12);
  });
});

describe('query options', () => {
  it('key both lists under the clients root, scoped to the client', () => {
    expect(interestQueries.forClient(4).queryKey).toEqual(queryKeys.clients.interests(4));
    expect(communicationQueries.forClient(4).queryKey)
      .toEqual(queryKeys.clients.communications(4));
  });

  it('are disabled until a client id exists', () => {
    expect(interestQueries.forClient(undefined).enabled).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/services/__tests__/clientActivity.test.js`
Expected: FAIL — `Failed to resolve import "../clientInterests"`.

- [ ] **Step 3: Write `clientInterests.js`**

```js
import { supabase } from '@/utils/supabaseClient';
import { unwrap, unwrapList } from './unwrap';
import { queryKeys } from './queryKeys';
import { STALE_TIME } from './cachePolicy';

const TABLE = 'client_property_interests';

/**
 * The join is part of the query, not of the component: PropertyInterests.jsx
 * used to fetch interests and then fetch every referenced property separately,
 * which is one request per interest on a screen that shows a dozen.
 */
const SELECTION = `
  *,
  properties (
    id,
    title,
    location,
    price,
    bedrooms,
    bathrooms,
    images
  )
`;

export async function listClientInterests(clientId) {
  return unwrapList(
    await supabase
      .from(TABLE)
      .select(SELECTION)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false }),
    { table: TABLE, operation: 'listClientInterests' }
  );
}

export async function addClientInterest(values) {
  return unwrap(await supabase.from(TABLE).insert([values]).select().single(), {
    table: TABLE,
    operation: 'addClientInterest',
  });
}

export async function updateClientInterest(interestId, values) {
  return unwrap(
    await supabase.from(TABLE).update(values).eq('id', interestId).select().single(),
    { table: TABLE, operation: 'updateClientInterest' }
  );
}

export async function deleteClientInterest(interestId) {
  unwrap(await supabase.from(TABLE).delete().eq('id', interestId), {
    table: TABLE,
    operation: 'deleteClientInterest',
  });
}

export const interestQueries = {
  forClient: (clientId) => ({
    queryKey: queryKeys.clients.interests(clientId),
    queryFn: () => listClientInterests(clientId),
    staleTime: STALE_TIME.live,
    enabled: Boolean(clientId),
  }),
};
```

- [ ] **Step 4: Write `clientCommunications.js`**

```js
import { supabase } from '@/utils/supabaseClient';
import { unwrap, unwrapList } from './unwrap';
import { queryKeys } from './queryKeys';
import { STALE_TIME } from './cachePolicy';

const TABLE = 'client_communications';

export async function listClientCommunications(clientId) {
  return unwrapList(
    await supabase
      .from(TABLE)
      .select('*')
      .eq('client_id', clientId)
      .order('communication_date', { ascending: false }),
    { table: TABLE, operation: 'listClientCommunications' }
  );
}

export async function addClientCommunication(values) {
  return unwrap(await supabase.from(TABLE).insert([values]).select().single(), {
    table: TABLE,
    operation: 'addClientCommunication',
  });
}

export async function updateClientCommunication(communicationId, values) {
  return unwrap(
    await supabase.from(TABLE).update(values).eq('id', communicationId).select().single(),
    { table: TABLE, operation: 'updateClientCommunication' }
  );
}

export async function deleteClientCommunication(communicationId) {
  unwrap(await supabase.from(TABLE).delete().eq('id', communicationId), {
    table: TABLE,
    operation: 'deleteClientCommunication',
  });
}

export const communicationQueries = {
  forClient: (clientId) => ({
    queryKey: queryKeys.clients.communications(clientId),
    queryFn: () => listClientCommunications(clientId),
    staleTime: STALE_TIME.live,
    enabled: Boolean(clientId),
  }),
};
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/services/__tests__/clientActivity.test.js`
Expected: PASS, 6 tests.

- [ ] **Step 6: Commit**

```bash
git add src/services/clientInterests.js src/services/clientCommunications.js src/services/__tests__/clientActivity.test.js
git commit -m "feat(services): add client interests and communications modules"
```

---

### Task 8: `services/settings.js`

Six settings screens each hand-roll the same "select by id, then update or insert" dance.
That upsert is written six times and is subtly different in two of them.

**Files:**
- Create: `src/services/settings.js`
- Create: `src/services/__tests__/settings.test.js`

**Interfaces:**
- Consumes: `unwrap`, `unwrapList`, `queryKeys`, `STALE_TIME`, `supabase`.
- Produces:
  - `getSettingsByCategory(category) -> SettingRow[]`
  - `getGeneralSettings() -> SettingRow | null`
  - `getCloudinaryConfig() -> { cloud_name: string, upload_preset: string } | null`
  - `saveSettings(values, { category }) -> SettingRow` — insert or update, decided here
  - `listEmailTemplates() -> Template[]`
  - `updateEmailTemplate(templateId, { subject, body }) -> Template`
  - `subscribeToSettings(onChange) -> () => void` — the realtime channel `SettingsContext`
    owns today; returns its own unsubscribe
  - `settingsQueries.category(category)`, `.general()`, `.cloudinary()`, `.emailTemplates()`

- [ ] **Step 1: Write the failing test**

Create `src/services/__tests__/settings.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/utils/supabaseClient';
import { mockFrom } from '@/test/utils/supabaseQueryMock';
import {
  getSettingsByCategory, getCloudinaryConfig, saveSettings,
  listEmailTemplates, subscribeToSettings, settingsQueries,
} from '../settings';
import { STALE_TIME } from '../cachePolicy';

beforeEach(() => vi.clearAllMocks());

describe('getSettingsByCategory', () => {
  it('filters on setting_category', async () => {
    const builders = mockFrom(supabase, { admin_settings: { data: [], error: null } });
    await getSettingsByCategory('email');
    expect(builders.admin_settings.eq).toHaveBeenCalledWith('setting_category', 'email');
  });
});

describe('getCloudinaryConfig', () => {
  it('selects only the two public fields, never a secret', async () => {
    // The 2026-09-01 incident was a Cloudinary API secret readable by anon.
    // `select('*')` here would put it back on the wire.
    const builders = mockFrom(supabase, {
      admin_settings: { data: { cloud_name: 'x', upload_preset: 'y' }, error: null },
    });
    await getCloudinaryConfig();
    expect(builders.admin_settings.select).toHaveBeenCalledWith('cloud_name, upload_preset');
  });

  it('returns null rather than throwing when no row exists yet', async () => {
    mockFrom(supabase, { admin_settings: { data: null, error: null } });
    await expect(getCloudinaryConfig()).resolves.toBeNull();
  });
});

describe('saveSettings', () => {
  it('updates the existing row when one exists', async () => {
    const builders = mockFrom(supabase, { admin_settings: { data: { id: 3 }, error: null } });
    await saveSettings({ site_name: 'Raslipwani' }, { category: 'general' });
    expect(builders.admin_settings.update).toHaveBeenCalled();
    expect(builders.admin_settings.eq).toHaveBeenCalledWith('id', 3);
    expect(builders.admin_settings.insert).not.toHaveBeenCalled();
  });

  it('inserts when the category has no row yet', async () => {
    // `maybeSingle` resolving to null data is "no row", not an error — which is
    // the case two of the six settings screens got wrong, each in its own way.
    const builders = mockFrom(supabase, { admin_settings: { data: null, error: null } });
    await saveSettings({ site_name: 'Raslipwani' }, { category: 'general' });
    expect(builders.admin_settings.insert).toHaveBeenCalled();
  });

  it('stamps the category on the written row', async () => {
    const builders = mockFrom(supabase, { admin_settings: { data: null, error: null } });
    await saveSettings({ site_name: 'R' }, { category: 'general' });
    const [payload] = builders.admin_settings.insert.mock.calls[0];
    expect(payload.setting_category).toBe('general');
  });
});

describe('listEmailTemplates', () => {
  it('returns only active templates', async () => {
    const builders = mockFrom(supabase, { email_templates: { data: [], error: null } });
    await listEmailTemplates();
    expect(builders.email_templates.eq).toHaveBeenCalledWith('is_active', true);
  });
});

describe('subscribeToSettings', () => {
  it('opens a channel and hands back a working unsubscribe', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToSettings(onChange);
    expect(supabase.channel).toHaveBeenCalled();
    unsubscribe();
    expect(supabase.removeChannel).toHaveBeenCalled();
  });
});

describe('settingsQueries', () => {
  it('caches settings with the static lifetime', () => {
    expect(settingsQueries.general().staleTime).toBe(STALE_TIME.static);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/services/__tests__/settings.test.js`
Expected: FAIL — `Failed to resolve import "../settings"`.

- [ ] **Step 3: Write the implementation**

Create `src/services/settings.js`:

```js
import { supabase } from '@/utils/supabaseClient';
import { unwrap, unwrapList } from './unwrap';
import { queryKeys } from './queryKeys';
import { STALE_TIME } from './cachePolicy';

const TABLE = 'admin_settings';
const TEMPLATES_TABLE = 'email_templates';

export async function getSettingsByCategory(category) {
  return unwrapList(
    await supabase.from(TABLE).select('*').eq('setting_category', category),
    { table: TABLE, operation: 'getSettingsByCategory' }
  );
}

export async function getGeneralSettings() {
  return unwrap(
    await supabase
      .from(TABLE)
      .select('*')
      .eq('setting_category', 'general')
      .maybeSingle(),
    { table: TABLE, operation: 'getGeneralSettings' }
  );
}

/**
 * Exactly two fields, named explicitly.
 *
 * `admin_settings` also holds credentials. Audit finding C-1 was a Cloudinary
 * API secret readable by `anon`; migration 010 moved the secrets out, and this
 * selection is the second lock — a `select('*')` here would put whatever lands
 * in that table next back onto the wire.
 */
export async function getCloudinaryConfig() {
  return unwrap(
    await supabase
      .from(TABLE)
      .select('cloud_name, upload_preset')
      .eq('setting_category', 'general')
      .maybeSingle(),
    { table: TABLE, operation: 'getCloudinaryConfig' }
  );
}

/**
 * Insert or update, decided once.
 *
 * Six settings screens each wrote their own version of this. Two of them
 * treated "no row yet" as an error and showed a red toast on a first save that
 * had in fact succeeded; one wrote without the category and produced a second
 * uncategorised row that the next read never saw.
 */
export async function saveSettings(values, { category }) {
  const existing = unwrap(
    await supabase.from(TABLE).select('id').eq('setting_category', category).maybeSingle(),
    { table: TABLE, operation: 'saveSettings.lookup' }
  );

  const payload = { ...values, setting_category: category, updated_at: new Date().toISOString() };

  if (existing?.id) {
    return unwrap(
      await supabase.from(TABLE).update(payload).eq('id', existing.id).select().single(),
      { table: TABLE, operation: 'saveSettings.update' }
    );
  }

  return unwrap(await supabase.from(TABLE).insert(payload).select().single(), {
    table: TABLE,
    operation: 'saveSettings.insert',
  });
}

export async function listEmailTemplates() {
  return unwrapList(
    await supabase.from(TEMPLATES_TABLE).select('*').eq('is_active', true),
    { table: TEMPLATES_TABLE, operation: 'listEmailTemplates' }
  );
}

export async function updateEmailTemplate(templateId, { subject, body }) {
  return unwrap(
    await supabase
      .from(TEMPLATES_TABLE)
      .update({ subject, body })
      .eq('id', templateId)
      .select()
      .single(),
    { table: TEMPLATES_TABLE, operation: 'updateEmailTemplate' }
  );
}

/**
 * Realtime settings changes. `SettingsContext` owns the subscription; this owns
 * the channel's shape, so the context does not import the client to build one.
 * Returns an unsubscribe suitable for a useEffect cleanup.
 */
export function subscribeToSettings(onChange) {
  const channel = supabase
    .channel('admin_settings_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export const settingsQueries = {
  category: (category) => ({
    queryKey: queryKeys.settings.category(category),
    queryFn: () => getSettingsByCategory(category),
    staleTime: STALE_TIME.static,
  }),
  general: () => ({
    queryKey: queryKeys.settings.general(),
    queryFn: () => getGeneralSettings(),
    staleTime: STALE_TIME.static,
  }),
  cloudinary: () => ({
    queryKey: queryKeys.settings.cloudinary(),
    queryFn: () => getCloudinaryConfig(),
    staleTime: STALE_TIME.static,
  }),
  emailTemplates: () => ({
    queryKey: queryKeys.settings.emailTemplates(),
    queryFn: () => listEmailTemplates(),
    staleTime: STALE_TIME.static,
  }),
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/services/__tests__/settings.test.js`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add src/services/settings.js src/services/__tests__/settings.test.js
git commit -m "feat(services): add the settings data module with one upsert instead of six"
```

---

### Task 9: `services/auth.js`

**Files:**
- Create: `src/services/auth.js`
- Create: `src/services/__tests__/auth.test.js`

**Interfaces:**
- Consumes: `supabase` from `@/utils/supabaseClient`; `logger`.
- Produces:
  - `getSession() -> Session | null`
  - `signIn({ email, password }) -> Session`
  - `signOut() -> void`
  - `requestPasswordReset(email, { redirectTo }) -> void`
  - `onAuthStateChange(callback) -> () => void` — returns its own unsubscribe
  - `isAdmin() -> boolean` — the `is_admin` RPC, false on any failure

- [ ] **Step 1: Write the failing test**

Create `src/services/__tests__/auth.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/utils/supabaseClient';
import { getSession, signIn, signOut, onAuthStateChange, isAdmin } from '../auth';
import { ServiceError } from '../unwrap';

beforeEach(() => vi.clearAllMocks());

describe('getSession', () => {
  it('returns the session', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u' } } }, error: null });
    await expect(getSession()).resolves.toEqual({ user: { id: 'u' } });
  });

  it('returns null when there is no session, rather than throwing', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    await expect(getSession()).resolves.toBeNull();
  });
});

describe('signIn', () => {
  it('throws a ServiceError on bad credentials', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: null }, error: { message: 'Invalid login credentials' },
    });
    await expect(signIn({ email: 'a@b.c', password: 'x' })).rejects.toBeInstanceOf(ServiceError);
  });

  it('returns the session on success', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: { user: { id: 'u' } } }, error: null,
    });
    await expect(signIn({ email: 'a@b.c', password: 'x' })).resolves.toEqual({ user: { id: 'u' } });
  });
});

describe('signOut', () => {
  it('throws when sign-out fails, so the UI cannot show a signed-out state that is not real', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: { message: 'network' } });
    await expect(signOut()).rejects.toBeInstanceOf(ServiceError);
  });
});

describe('onAuthStateChange', () => {
  it('hands back an unsubscribe that actually unsubscribes', () => {
    const unsubscribe = vi.fn();
    supabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe } } });
    const stop = onAuthStateChange(vi.fn());
    stop();
    expect(unsubscribe).toHaveBeenCalled();
  });
});

describe('isAdmin', () => {
  it('returns what the RPC says', async () => {
    supabase.rpc.mockResolvedValue({ data: true, error: null });
    await expect(isAdmin()).resolves.toBe(true);
  });

  it('returns false rather than throwing when the RPC errors', async () => {
    // A failed admin check must deny, never crash a route guard into an
    // undefined state that renders the console while the answer is pending.
    supabase.rpc.mockResolvedValue({ data: null, error: { message: 'denied' } });
    await expect(isAdmin()).resolves.toBe(false);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/services/__tests__/auth.test.js`
Expected: FAIL — `Failed to resolve import "../auth"`.

- [ ] **Step 3: Write the implementation**

Create `src/services/auth.js`:

```js
import { supabase } from '@/utils/supabaseClient';
import { ServiceError } from './unwrap';
import { logger } from '@/utils/logger';

const TABLE = 'auth';

function assertOk(error, operation) {
  if (!error) return;
  logger.error(`[auth.${operation}]`, error);
  throw new ServiceError(`${operation} failed: ${error.message}`, {
    table: TABLE,
    operation,
    cause: error,
  });
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  assertOk(error, 'getSession');
  return data?.session ?? null;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  assertOk(error, 'signIn');
  return data?.session ?? null;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  assertOk(error, 'signOut');
}

export async function requestPasswordReset(email, { redirectTo } = {}) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  assertOk(error, 'requestPasswordReset');
}

/** Returns an unsubscribe, so no caller has to know the shape Supabase returns. */
export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => callback(event, session));
  return () => data?.subscription?.unsubscribe?.();
}

/**
 * Deny on failure, never throw.
 *
 * This answer gates a route. A thrown error would leave the guard in an
 * undefined state; `false` is the safe reading of "we could not confirm you are
 * an admin".
 */
export async function isAdmin() {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) {
    logger.error('[auth.isAdmin]', error);
    return false;
  }
  return data === true;
}
```

> **Check the RPC name before writing this.** `src/test/setup.jsx` mocks `supabase.rpc`
> generically and `supabase/migrations/011_close_definer_rpc.sql` is the file that decides
> what is callable. If the deployed function is not `is_admin`, use the deployed name and
> note the correction in the commit body.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/services/__tests__/auth.test.js`
Expected: PASS, 8 tests.

- [ ] **Step 5: Run the whole suite and the ratchet**

Run: `npm run test:run` then `npm run supabase:ratchet`
Expected: suite green; ratchet still reports 22 of 22 — no call site has moved yet, and
that is correct at this point.

- [ ] **Step 6: Commit**

```bash
git add src/services/auth.js src/services/__tests__/auth.test.js
git commit -m "feat(services): add the auth module"
```

---

## Tasks 10–16: the migration, one surface at a time

The seven tasks that follow are the same task seven times. Rather than repeat the recipe
in each, it is written once here — **and then each task still states its own files, its own
replacements and its own ceiling, because an implementer may read them out of order.**

**The recipe:**

1. Delete the `import { supabase } from '@/utils/supabaseClient'` line.
2. Replace each inline query with the named service function or query options.
3. Replace every inline `queryKey` with one from `queryKeys`, and every inline `staleTime`
   with one from `STALE_TIME` (usually by deleting it — the query options carry it).
4. Replace every `invalidateQueries({ queryKey: ['some-string'] })` with the registry's
   root key, so one invalidation covers the whole domain.
5. Run the file's own tests if it has any; run the axe suite if it is one of the eleven
   surfaces that suite renders (`src/test/a11y/publicSurfaces.axe.test.jsx` and
   `adminSurfaces.axe.test.jsx`).
6. Run `npm run supabase:ratchet -- --update` and commit the lowered ceiling with the code.

**What must not change:** rendered markup, class strings, or behaviour. These are
refactors. If a query's *semantics* look wrong, note it and leave it — changing behaviour
inside a mechanical migration is how ROADMAP rule 6's codemod flattened a gradient to pure
black without a test noticing.

**A test for each task:** every migration task adds at least one test that would have
failed before the migration, using the pattern below. This is what repays the coverage
give-backs of Block 2 — mocking a *service* is a fraction of the setup that mocking a
query builder chain took, so surfaces that were untestable become testable.

```jsx
// The shape every migration task's test uses.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/renderWithProviders';
import Home from '../Home';

vi.mock('@/services/properties', () => ({
  propertyQueries: {
    featured: () => ({
      queryKey: ['properties', 'featured'],
      queryFn: () => Promise.resolve([{ id: 1, title: 'Gigiri Apartment', price: 100 }]),
    }),
  },
}));

describe('Home', () => {
  it('renders the featured properties the service returns', async () => {
    render(<Home />);
    expect(await screen.findByText('Gigiri Apartment')).toBeInTheDocument();
  });
});
```

---

### Task 10: Public read surfaces — Home, Properties, PropertyDetail, and `App.jsx`

**Files:**
- Modify: `src/pages/Home.jsx:6-33` (the `useQuery` block and the client import)
- Modify: `src/pages/Properties.jsx:46-48`
- Modify: `src/pages/PropertyDetail.jsx:41-44`
- Modify: `src/App.jsx:21` and `:230-255` (`PropertyModalRoute`)
- Create: `src/pages/__tests__/Home.query.test.jsx`
- Modify: `supabase-import-budget.json` (22 → 19)

**Interfaces:**
- Consumes: `propertyQueries.featured()`, `.all()`, `.detail(id)` and `getById(id)` from
  Task 4.
- Produces: nothing new.

- [ ] **Step 1: Write the failing test**

Create `src/pages/__tests__/Home.query.test.jsx` using the shape above, plus:

```jsx
it('does not import the Supabase client', () => {
  const source = readFileSync('src/pages/Home.jsx', 'utf8');
  expect(source).not.toMatch(/supabaseClient/);
});
```

(`import { readFileSync } from 'node:fs';` at the top — the axe suite already reads source
files this way, so the pattern is established.)

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/pages/__tests__/Home.query.test.jsx`
Expected: FAIL — the source assertion fails because `Home.jsx` still imports the client.

- [ ] **Step 3: Migrate `Home.jsx`**

Delete `import { supabase } from '@/utils/supabaseClient';` and replace lines 18–33 with:

```jsx
import { propertyQueries } from '@/services/properties';

// ...

const {
  data: featuredProperties = [],
  isLoading: loading,
  error,
} = useQuery({
  ...propertyQueries.featured(),
  // The home page is the one screen where a returning visitor should see a new
  // listing immediately, so it opts into a refetch on focus. The lifetime
  // itself comes from cachePolicy — this file no longer sets its own.
  refetchOnWindowFocus: true,
});
```

> This deletes the `staleTime: 1000 * 60` that disagreed with `App.jsx`'s five minutes.
> Featured properties are now `STALE_TIME.standard`, matching the global default, with the
> focus refetch kept because that is the behaviour the page actually wanted.

- [ ] **Step 4: Migrate `Properties.jsx`**

Replace the `useEffect` fetch at lines 40–60 with:

```jsx
import { useQuery } from '@tanstack/react-query';
import { propertyQueries } from '@/services/properties';

const { data: properties = [], isLoading: loading, error } = useQuery(propertyQueries.all());
```

Delete the `useState` for `properties`, `loading` and `error` and the `useEffect` that set
them. Everything downstream reads the same three names, so no JSX changes.

- [ ] **Step 5: Migrate `PropertyDetail.jsx`**

Replace the `useEffect` fetch at lines 35–60 with:

```jsx
import { useQuery } from '@tanstack/react-query';
import { propertyQueries } from '@/services/properties';

const { data: property, isLoading: loading, error } = useQuery(propertyQueries.detail(id));
```

`propertyQueries.detail` already carries `enabled: Boolean(id)`, which replaces the
`if (id)` guard.

- [ ] **Step 6: Migrate `App.jsx`'s `PropertyModalRoute`**

Replace the whole `useEffect` (lines 233–255) with:

```jsx
import { useQuery } from '@tanstack/react-query';
import { propertyQueries } from '@/services/properties';

const { data: property, isLoading: loading } = useQuery(propertyQueries.detail(id));
```

and delete `import { supabase } from '@/utils/supabaseClient';` and the now-unused
`useState`/`useEffect`/`logger` imports if nothing else in the file uses them. **Check
before deleting `logger`** — `App.jsx` may use it elsewhere.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/pages/__tests__/Home.query.test.jsx src/test/a11y/publicSurfaces.axe.test.jsx`
Expected: PASS. The axe suite renders Home, Properties and PropertyDetail, so it is the
regression net for this task.

- [ ] **Step 8: Lower the ceiling and commit**

```bash
npm run supabase:ratchet -- --update
git add src/pages/Home.jsx src/pages/Properties.jsx src/pages/PropertyDetail.jsx src/App.jsx src/pages/__tests__/Home.query.test.jsx supabase-import-budget.json
git commit -m "refactor(public): read properties through the service layer"
```

Expected ceiling after this task: **19**.

---

### Task 11: Public write surfaces — Contact, ServicesMain, ViewingExperience

All three build a `bookings` row and insert it. This is the path ROADMAP Block 1.9 is about
— eight stranded enquiries — so the migration must not change the record's shape by one
field.

**Files:**
- Modify: `src/pages/Contact.jsx:115`
- Modify: `src/pages/ServicesMain.jsx:33-40, 161`
- Modify: `src/components/services/ViewingExperience.jsx:88-95, 241`
- Create: `src/components/services/__tests__/bookingSubmission.test.jsx`
- Modify: `supabase-import-budget.json` (19 → 16)

**Interfaces:**
- Consumes: `createBooking(record)` and `propertyQueries.all()` / `.available()` from
  Tasks 4 and 5.

- [ ] **Step 1: Write the failing test**

Create `src/components/services/__tests__/bookingSubmission.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
import Contact from '@/pages/Contact';
import { createBooking } from '@/services/bookings';

vi.mock('@/services/bookings', () => ({ createBooking: vi.fn().mockResolvedValue(undefined) }));

beforeEach(() => vi.clearAllMocks());

describe('Contact', () => {
  it('submits an enquiry through createBooking with every required field', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(/name/i), 'Ada Lovelace');
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
    await user.type(screen.getByLabelText(/phone/i), '+254700000000');
    await user.type(screen.getByLabelText(/message/i), 'Interested in Gigiri');
    await user.click(screen.getByRole('button', { name: /send|submit/i }));

    await waitFor(() => expect(createBooking).toHaveBeenCalledTimes(1));
    const [record] = createBooking.mock.calls[0];
    expect(record).toMatchObject({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+254700000000',
      type: expect.any(String),
    });
  });

  it('never sets an admin-only field on submission', () => {
    // Migration 009's INSERT policy requires status, admin_notes and
    // assigned_to to be NULL on a prospect's row. A form that sets one is
    // rejected by the database, and the visitor sees a generic failure.
    const source = readFileSync('src/pages/Contact.jsx', 'utf8');
    expect(source).not.toMatch(/admin_notes|assigned_to/);
  });
});
```

Adjust the label queries to the real labels — Block 2 gave every control an accessible
name, so `getByLabelText` is the right query and it will find them.

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/components/services/__tests__/bookingSubmission.test.jsx`
Expected: FAIL — `createBooking` is never called; `Contact.jsx` still inserts inline.

- [ ] **Step 3: Migrate the three insert sites**

In each of the three files, replace

```jsx
const { error } = await supabase.from('bookings').insert([record]);
if (error) throw error;
```

with

```jsx
import { createBooking } from '@/services/bookings';
// ...
await createBooking(record);
```

`createBooking` throws on failure, so the surrounding `try`/`catch` and its toast stay
exactly as they are. **Do not touch how `record` is built.**

- [ ] **Step 4: Migrate the two property reads**

`ServicesMain.jsx:33-40` becomes:

```jsx
import { useQuery } from '@tanstack/react-query';
import { propertyQueries } from '@/services/properties';

const { data: properties = [] } = useQuery(propertyQueries.available());
```

`ViewingExperience.jsx:88-95` becomes:

```jsx
const { data: properties = [] } = useQuery(propertyQueries.all());
```

> These two were different queries on purpose — `ServicesMain` filters to
> `status = 'available'` and `ViewingExperience` does not. Keep that difference; it is not
> obviously a bug and this task is not the place to decide.

- [ ] **Step 5: Run the tests**

Run: `npx vitest run src/components/services/__tests__/bookingSubmission.test.jsx src/test/a11y/publicSurfaces.axe.test.jsx`
Expected: PASS.

- [ ] **Step 6: Lower the ceiling and commit**

```bash
npm run supabase:ratchet -- --update
git add src/pages/Contact.jsx src/pages/ServicesMain.jsx src/components/services/ViewingExperience.jsx src/components/services/__tests__/bookingSubmission.test.jsx supabase-import-budget.json
git commit -m "refactor(public): submit bookings through the service layer"
```

Expected ceiling after this task: **16**.

---

### Task 12: The admin shell and dashboard — AdminLayout, Dashboard

`Dashboard.jsx` fires nine queries in one `Promise.all`. They become one composed service
function with one query key, which is also what makes the dashboard testable for the first
time.

**Files:**
- Create: `src/services/dashboard.js`
- Create: `src/services/__tests__/dashboard.test.js`
- Modify: `src/pages/admin/AdminLayout.jsx:4, 39-47`
- Modify: `src/pages/admin/Dashboard.jsx:55-110`
- Modify: `supabase-import-budget.json` (16 → 14)

**Interfaces:**
- Consumes: `countProperties` (Task 4); `countBookings`, `listUpcomingBookings`,
  `listRecentBookings`, `countPendingBookings`, `bookingQueries.pendingCount()` (Task 5);
  `queryKeys.dashboard`, `STALE_TIME` (Task 3).
- Produces:
  - `getDashboardStats() -> { properties: { total, featured, pending, sold, available }, bookings: { total, pending }, upcoming: Booking[], recentProperties: Property[], recentBookings: Booking[] }`
  - `dashboardQueries.stats()`

- [ ] **Step 1: Write the failing test**

Create `src/services/__tests__/dashboard.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardStats } from '../dashboard';
import * as properties from '../properties';
import * as bookings from '../bookings';

beforeEach(() => vi.restoreAllMocks());

describe('getDashboardStats', () => {
  it('composes the property and booking counters into one shape', async () => {
    vi.spyOn(properties, 'countProperties').mockImplementation(async (filters = {}) => {
      if (filters.featured) return 2;
      if (filters.status === 'pending') return 3;
      if (filters.status === 'sold') return 4;
      if (filters.status === 'available') return 5;
      return 14;
    });
    vi.spyOn(properties, 'listAll').mockResolvedValue([{ id: 1 }]);
    vi.spyOn(bookings, 'countBookings').mockImplementation(async (filters = {}) =>
      filters.status === 'pending' ? 8 : 20
    );
    vi.spyOn(bookings, 'listUpcomingBookings').mockResolvedValue([{ id: 'a' }]);
    vi.spyOn(bookings, 'listRecentBookings').mockResolvedValue([{ id: 'b' }]);

    const stats = await getDashboardStats();

    expect(stats.properties).toEqual({ total: 14, featured: 2, pending: 3, sold: 4, available: 5 });
    expect(stats.bookings).toEqual({ total: 20, pending: 8 });
    expect(stats.upcoming).toEqual([{ id: 'a' }]);
  });

  it('runs its queries concurrently rather than one after another', async () => {
    // Nine sequential round trips is the difference between a dashboard that
    // paints and one that hangs on a slow connection.
    let inFlight = 0;
    let peak = 0;
    const track = async () => {
      inFlight += 1;
      peak = Math.max(peak, inFlight);
      await Promise.resolve();
      inFlight -= 1;
      return 0;
    };
    vi.spyOn(properties, 'countProperties').mockImplementation(track);
    vi.spyOn(properties, 'listAll').mockImplementation(async () => (await track(), []));
    vi.spyOn(bookings, 'countBookings').mockImplementation(track);
    vi.spyOn(bookings, 'listUpcomingBookings').mockImplementation(async () => (await track(), []));
    vi.spyOn(bookings, 'listRecentBookings').mockImplementation(async () => (await track(), []));

    await getDashboardStats();
    expect(peak).toBeGreaterThan(1);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/services/__tests__/dashboard.test.js`
Expected: FAIL — `Failed to resolve import "../dashboard"`.

- [ ] **Step 3: Write `src/services/dashboard.js`**

```js
import { countProperties, listAll as listAllProperties } from './properties';
import { countBookings, listUpcomingBookings, listRecentBookings } from './bookings';
import { queryKeys } from './queryKeys';
import { STALE_TIME } from './cachePolicy';

/**
 * Everything the admin dashboard shows, in one call.
 *
 * The nine queries were previously spelled out inside the component's
 * useEffect, which meant nothing could assert on them and a slow one blocked
 * the render of all the others. They stay concurrent; only their home changes.
 */
export async function getDashboardStats() {
  const [
    total, featured, pending, sold, available,
    bookingsTotal, bookingsPending,
    upcoming, recentProperties, recentBookings,
  ] = await Promise.all([
    countProperties(),
    countProperties({ featured: true }),
    countProperties({ status: 'pending' }),
    countProperties({ status: 'sold' }),
    countProperties({ status: 'available' }),
    countBookings(),
    countBookings({ status: 'pending' }),
    listUpcomingBookings({ limit: 5 }),
    listAllProperties({ sortField: 'created_at', sortDirection: 'desc' }),
    listRecentBookings({ limit: 5 }),
  ]);

  return {
    properties: { total, featured, pending, sold, available },
    bookings: { total: bookingsTotal, pending: bookingsPending },
    upcoming,
    recentProperties: recentProperties.slice(0, 5),
    recentBookings,
  };
}

export const dashboardQueries = {
  stats: () => ({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => getDashboardStats(),
    staleTime: STALE_TIME.live,
  }),
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/services/__tests__/dashboard.test.js`
Expected: PASS, 2 tests.

- [ ] **Step 5: Migrate `AdminLayout.jsx`**

Replace lines 39–47 with:

```jsx
import { bookingQueries } from '@/services/bookings';

const { data: pendingCount = 0 } = useQuery(bookingQueries.pendingCount());
```

and delete the client import.

- [ ] **Step 6: Migrate `Dashboard.jsx`**

Replace the `useEffect` + `Promise.all` block (lines 55–110) with:

```jsx
import { useQuery } from '@tanstack/react-query';
import { dashboardQueries } from '@/services/dashboard';

const { data: stats, isLoading: loading, error } = useQuery(dashboardQueries.stats());
```

Then rename the reads in the JSX to the new shape (`stats.properties.total` in place of
whatever local `totalProperties` state held). **List every rename in the commit body** —
this is the one migration task that changes variable names in markup, so it is the one most
likely to leave a stale reference behind.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/services src/test/a11y/adminSurfaces.axe.test.jsx src/pages/admin/__tests__`
Expected: PASS. The admin axe suite renders the Dashboard, so a broken reference shows up as
a render crash rather than a silent blank tile.

- [ ] **Step 8: Lower the ceiling and commit**

```bash
npm run supabase:ratchet -- --update
git add src/services/dashboard.js src/services/__tests__/dashboard.test.js src/pages/admin/AdminLayout.jsx src/pages/admin/Dashboard.jsx supabase-import-budget.json
git commit -m "refactor(admin): compose the dashboard's nine queries into one service call"
```

Expected ceiling after this task: **14**.

---

### Task 13: Bookings admin — AdminBookings, BookingDetailModal

The most intricate migration: optimistic updates, `cancelQueries`, and six
`invalidateQueries` calls against two flat string keys.

**Files:**
- Modify: `src/pages/admin/AdminBookings.jsx:3, 55-230, 830-831`
- Modify: `src/pages/admin/BookingDetailModal.jsx:2, 32-140`
- Modify: `src/pages/admin/__tests__/AdminBookings.test.jsx` (it mocks the client directly;
  point it at the service instead)
- Modify: `supabase-import-budget.json` (14 → 12)

**Interfaces:**
- Consumes: `bookingQueries.list`, `.stats`, `.notes`; `setBookingStatus`,
  `setBookingPriority`, `rescheduleBooking`, `updateBooking`, `addBookingNote`,
  `deleteBookingNote` (Task 5); `queryKeys.bookings` (Task 3).

- [ ] **Step 1: Write the failing test**

Add to `src/pages/admin/__tests__/AdminBookings.test.jsx`:

```jsx
it('invalidates the whole bookings domain after a status change, not two named keys', async () => {
  // The bug this prevents: 'admin-bookings' and 'booking-stats' were
  // invalidated by hand at six call sites, and the seventh — the note modal —
  // forgot 'booking-stats', so the counters disagreed with the list until a
  // reload.
  const source = readFileSync('src/pages/admin/AdminBookings.jsx', 'utf8');
  expect(source).not.toMatch(/queryKey:\s*\[\s*['"]admin-bookings/);
  expect(source).toMatch(/queryKeys\.bookings\.all/);
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/pages/admin/__tests__/AdminBookings.test.jsx`
Expected: FAIL on the source assertions.

- [ ] **Step 3: Migrate the reads**

```jsx
import { bookingQueries } from '@/services/bookings';

const { data: bookings = [], isLoading } = useQuery(bookingQueries.list(filters));
const { data: stats } = useQuery(bookingQueries.stats());
```

The `stats` shape changes from whatever the component tallied to
`{ total, byStatus, byPriority }` (Task 5). Update the counter tiles to read
`stats?.byStatus?.pending ?? 0` and friends.

- [ ] **Step 4: Migrate the mutations**

```jsx
import { setBookingStatus, rescheduleBooking } from '@/services/bookings';
import { queryKeys } from '@/services/queryKeys';

const statusMutation = useMutation({
  mutationFn: ({ id, status }) => setBookingStatus(id, status),
  onSuccess: () => {
    // One invalidation for the whole domain: list, stats and the pending badge
    // in the layout all sit under this root.
    queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
  },
});

const rescheduleMutation = useMutation({
  mutationFn: ({ id, appointmentAt }) => rescheduleBooking(id, { appointmentAt }),
  onMutate: async (variables) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.bookings.all });
    const previous = queryClient.getQueryData(queryKeys.bookings.list(filters));
    // Keep the existing optimistic update body verbatim; only the key changes.
    return { previous };
  },
  onError: (_error, _variables, context) => {
    if (context?.previous) {
      queryClient.setQueryData(queryKeys.bookings.list(filters), context.previous);
    }
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
});
```

Do the same for the two invalidations at lines 830–831.

- [ ] **Step 5: Migrate `BookingDetailModal.jsx`**

```jsx
import { bookingQueries, addBookingNote, deleteBookingNote, updateBooking, setBookingPriority } from '@/services/bookings';
import { queryKeys } from '@/services/queryKeys';

const { data: notes = [] } = useQuery(bookingQueries.notes(booking.id));
```

Each of its four mutations calls the matching service function and invalidates
`queryKeys.bookings.all`.

- [ ] **Step 6: Repoint the existing test's mocks**

`AdminBookings.test.jsx` currently imports the client to configure the builder mock.
Replace that with `vi.mock('@/services/bookings', ...)` returning the query options and
mutation functions. This is the setup reduction the service layer buys — keep the
assertions, delete the chain-stubbing.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/pages/admin/__tests__ src/test/a11y/adminSurfaces.axe.test.jsx`
Expected: PASS.

- [ ] **Step 8: Lower the ceiling and commit**

```bash
npm run supabase:ratchet -- --update
git add src/pages/admin/AdminBookings.jsx src/pages/admin/BookingDetailModal.jsx src/pages/admin/__tests__/AdminBookings.test.jsx supabase-import-budget.json
git commit -m "refactor(admin): move bookings queries and mutations behind the service layer"
```

Expected ceiling after this task: **12**.

---

### Task 14: `AdminProperties.jsx`

1,253 lines, eight queries, and its own Cloudinary settings fetch. Only the data layer moves
here — Task 22 splits the file.

**Files:**
- Modify: `src/pages/admin/AdminProperties.jsx:10, 85-120, 340-440`
- Create: `src/pages/admin/__tests__/AdminProperties.data.test.jsx`
- Modify: `supabase-import-budget.json` (12 → 11)

**Interfaces:**
- Consumes: `propertyQueries.page`, `createProperty`, `updateProperty`, `deleteProperty`,
  `setFeatured` (Task 4); `settingsQueries.cloudinary()` (Task 8);
  `queryKeys.properties` (Task 3).

- [ ] **Step 1: Write the failing test**

Create `src/pages/admin/__tests__/AdminProperties.data.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('AdminProperties data access', () => {
  const source = () => readFileSync('src/pages/admin/AdminProperties.jsx', 'utf8');

  it('does not import the Supabase client', () => {
    expect(source()).not.toMatch(/supabaseClient/);
  });

  it('reads the Cloudinary config through the settings service', () => {
    // This screen used to select from admin_settings itself, which is how a
    // second copy of the "which columns are safe to read" decision came to
    // exist. There is one now, in settings.js, and it names two columns.
    expect(source()).toMatch(/settingsQueries\.cloudinary/);
    expect(source()).not.toMatch(/from\('admin_settings'\)/);
  });

  it('invalidates the properties domain after a write', () => {
    expect(source()).toMatch(/queryKeys\.properties\.all/);
    expect(source()).not.toMatch(/queryKey:\s*\[\s*['"]featured-properties/);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/pages/admin/__tests__/AdminProperties.data.test.jsx`
Expected: FAIL on all three assertions.

- [ ] **Step 3: Migrate the reads**

```jsx
import { useQuery } from '@tanstack/react-query';
import { propertyQueries } from '@/services/properties';
import { settingsQueries } from '@/services/settings';

const { data: cloudinary } = useQuery(settingsQueries.cloudinary());

const { data: { rows: properties, count: totalCount } = { rows: [], count: 0 }, isLoading } =
  useQuery(propertyQueries.page({ page: currentPage, pageSize: itemsPerPage, sortField, sortDirection }));
```

This deletes the manual `range()` arithmetic at lines 107–116 — `listPage` owns it now, and
Task 4's test pins the off-by-one.

- [ ] **Step 4: Migrate the writes**

```jsx
import { createProperty, updateProperty, deleteProperty, setFeatured } from '@/services/properties';
import { queryKeys } from '@/services/queryKeys';

const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });

// in the submit handler
if (currentProperty) await updateProperty(currentProperty.id, submitData);
else await createProperty(submitData);
invalidate();
```

The old code invalidated only `['featured-properties']` after a save (line 454), so the
admin table showed stale rows until a reload. One root key fixes it.

- [ ] **Step 5: Run the tests**

Run: `npx vitest run src/pages/admin/__tests__ src/test/a11y/adminSurfaces.axe.test.jsx`
Expected: PASS.

- [ ] **Step 6: Lower the ceiling and commit**

```bash
npm run supabase:ratchet -- --update
git add src/pages/admin/AdminProperties.jsx src/pages/admin/__tests__/AdminProperties.data.test.jsx supabase-import-budget.json
git commit -m "refactor(admin): move AdminProperties onto the properties and settings services"
```

Expected ceiling after this task: **11**.

---

### Task 15: Client surfaces — ClientManagement, ClientDetail, ClientForm, CommunicationTimeline, PropertyInterests

**Files:**
- Modify: `src/pages/admin/ClientManagement.jsx:39-90`
- Modify: `src/pages/admin/ClientDetail.jsx:3, 25-60`
- Modify: `src/pages/admin/ClientForm.jsx:6, 76-100`
- Modify: `src/components/CommunicationTimeline.jsx:30-105`
- Modify: `src/components/PropertyInterests.jsx:22-125`
- Create: `src/components/__tests__/CommunicationTimeline.test.jsx`
- Modify: `supabase-import-budget.json` (11 → 6)

**Interfaces:**
- Consumes: `clientQueries.page/.detail/.stats`, `createClient`, `updateClient`,
  `deleteClient` (Task 6); `interestQueries.forClient`, `addClientInterest`,
  `updateClientInterest`, `deleteClientInterest`, `communicationQueries.forClient`,
  `addClientCommunication`, `updateClientCommunication`, `deleteClientCommunication`
  (Task 7); `queryKeys.clients` (Task 3).

- [ ] **Step 1: Write the failing test**

Create `src/components/__tests__/CommunicationTimeline.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils/renderWithProviders';
import CommunicationTimeline from '../CommunicationTimeline';

vi.mock('@/services/clientCommunications', () => ({
  communicationQueries: {
    forClient: () => ({
      queryKey: ['clients', 'communications', '4'],
      queryFn: () => Promise.resolve([
        { id: 1, communication_type: 'call', summary: 'Discussed Gigiri', communication_date: '2026-09-01' },
      ]),
    }),
  },
  addClientCommunication: vi.fn(),
  updateClientCommunication: vi.fn(),
  deleteClientCommunication: vi.fn(),
}));

beforeEach(() => vi.clearAllMocks());

describe('CommunicationTimeline', () => {
  it('renders the communications the service returns', async () => {
    render(<CommunicationTimeline clientId={4} />);
    expect(await screen.findByText('Discussed Gigiri')).toBeInTheDocument();
  });
});
```

This component has never had a test. Mocking the service is four lines; mocking the query
builder chain it used before was not worth anyone's afternoon, which is why it had none.

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/components/__tests__/CommunicationTimeline.test.jsx`
Expected: FAIL — the component still calls Supabase, so the mocked service is never used
and nothing renders.

- [ ] **Step 3: Migrate the five files**

Replace each `useEffect` + `useState` fetch with the matching `useQuery(...)`, and each
inline insert/update/delete with the matching service function followed by
`queryClient.invalidateQueries({ queryKey: queryKeys.clients.all })`.

`ClientManagement.jsx`'s paged list becomes:

```jsx
const { data: { rows: clients, count } = { rows: [], count: 0 }, isLoading } = useQuery(
  clientQueries.page({ page, pageSize, status: statusFilter, clientType: typeFilter, search })
);
```

which also moves its `range()` arithmetic and its search string into `clients.js`, where
Task 6's test pins the comma escaping.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/components/__tests__ src/pages/admin/__tests__ src/test/a11y/adminSurfaces.axe.test.jsx`
Expected: PASS.

- [ ] **Step 5: Lower the ceiling and commit**

```bash
npm run supabase:ratchet -- --update
git add src/pages/admin/ClientManagement.jsx src/pages/admin/ClientDetail.jsx src/pages/admin/ClientForm.jsx src/components/CommunicationTimeline.jsx src/components/PropertyInterests.jsx src/components/__tests__/CommunicationTimeline.test.jsx supabase-import-budget.json
git commit -m "refactor(admin): move the client surfaces onto the service layer"
```

Expected ceiling after this task: **6**.

---

### Task 16: The six settings screens, and the two contexts

Six files that each hand-rolled the same upsert, plus the two providers outside
`components/` and `pages/` that the ratchet cannot see but the exit criterion means.

**Files:**
- Modify: `src/pages/admin/settings/GeneralSettings.jsx:42-135`
- Modify: `src/pages/admin/settings/EmailSettings.jsx:34-110`
- Modify: `src/pages/admin/settings/AdvancedSettings.jsx:29-80`
- Modify: `src/pages/admin/settings/LocalizationSettings.jsx:29-70`
- Modify: `src/pages/admin/settings/BusinessHoursSettings.jsx:30-60`
- Modify: `src/pages/admin/settings/CloudinarySettings.jsx:31-85`
- Modify: `src/contexts/SettingsContext.jsx:2, 71-100, 205-222`
- Modify: `src/contexts/AuthContext.jsx:2, 71-110`
- Modify: `supabase-import-budget.json` (6 → 0)

**Interfaces:**
- Consumes: `getSettingsByCategory`, `getGeneralSettings`, `getCloudinaryConfig`,
  `saveSettings`, `listEmailTemplates`, `updateEmailTemplate`, `subscribeToSettings`,
  `settingsQueries` (Task 8); `getSession`, `signIn`, `signOut`, `requestPasswordReset`,
  `onAuthStateChange` (Task 9).

- [ ] **Step 1: Write the failing test**

Create `src/contexts/__tests__/settingsContext.service.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { SettingsProvider, useSettings } from '../SettingsContext';

vi.mock('@/services/settings', () => ({
  getGeneralSettings: vi.fn().mockResolvedValue({ site_name: 'Raslipwani Properties' }),
  subscribeToSettings: vi.fn(() => () => {}),
}));

const Probe = () => <span>{useSettings().siteName}</span>;

describe('SettingsContext', () => {
  it('reads its settings through the service', async () => {
    render(<SettingsProvider><Probe /></SettingsProvider>);
    expect(await screen.findByText('Raslipwani Properties')).toBeInTheDocument();
  });

  it('unsubscribes on unmount', () => {
    const stop = vi.fn();
    const { subscribeToSettings } = require('@/services/settings');
    subscribeToSettings.mockReturnValue(stop);
    const { unmount } = render(<SettingsProvider><Probe /></SettingsProvider>);
    unmount();
    expect(stop).toHaveBeenCalled();
  });

  it('imports no Supabase client', () => {
    expect(readFileSync('src/contexts/SettingsContext.jsx', 'utf8')).not.toMatch(/supabaseClient/);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/contexts/__tests__/settingsContext.service.test.jsx`
Expected: FAIL — the context still imports the client and still builds its own channel.

- [ ] **Step 3: Migrate the six settings screens**

In each, the load becomes one line and the save becomes another:

```jsx
import { useQuery } from '@tanstack/react-query';
import { settingsQueries, saveSettings } from '@/services/settings';
import { queryKeys } from '@/services/queryKeys';

const { data: rows = [] } = useQuery(settingsQueries.category('email'));

const onSave = async (values) => {
  await saveSettings(values, { category: 'email' });
  queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
};
```

Each screen's category, in order: `general`, `email`, `advanced`, `localization`,
`general` (business hours live on the general row — **verify against the row before
changing it**), `general` (Cloudinary, via `settingsQueries.cloudinary()`).

> `BusinessHoursSettings.jsx:30` and `CloudinarySettings.jsx:31` both query
> `admin_settings` without a category filter today. Confirm which row they actually read in
> the live table before assigning them a category; if the answer is not obvious, keep the
> current unfiltered read by adding a documented `getSettingsRow()` to `settings.js` rather
> than guessing. Guessing here silently repoints an admin's saved configuration.

- [ ] **Step 4: Migrate `SettingsContext.jsx`**

```jsx
import { getGeneralSettings, subscribeToSettings } from '@/services/settings';

const fetchSettings = useCallback(async () => {
  // ...unchanged merging logic...
  const data = await getGeneralSettings();
  // ...
}, []);

useEffect(() => subscribeToSettings(() => fetchSettings()), [fetchSettings]);
```

The `useEffect` now returns the unsubscribe directly, replacing the manual
`supabase.removeChannel(channel)` cleanup at line 221.

- [ ] **Step 5: Migrate `AuthContext.jsx`**

```jsx
import { getSession, signIn as signInService, signOut as signOutService, requestPasswordReset, onAuthStateChange } from '@/services/auth';

useEffect(() => {
  getSession().then(setSession);
  return onAuthStateChange((_event, next) => setSession(next));
}, []);
```

Keep the context's existing error handling and its `useRef` guards exactly as they are.

- [ ] **Step 6: Run the whole suite**

Run: `npm run test:run`
Expected: PASS. This is the task most likely to break unrelated tests, because every test
that renders anything goes through these two providers.

- [ ] **Step 7: Lower the ceiling to zero and commit**

```bash
npm run supabase:ratchet -- --update
grep -rl supabaseClient src/components src/pages
```

Expected: the ceiling is **0**, and the grep prints only
`src/pages/admin/__tests__/AdminBookings.test.jsx` — or nothing at all, if Task 13 already
repointed it.

```bash
git add src/pages/admin/settings src/contexts/SettingsContext.jsx src/contexts/AuthContext.jsx src/contexts/__tests__/settingsContext.service.test.jsx supabase-import-budget.json
git commit -m "refactor(settings,contexts): finish the migration to the service layer"
```

---

### Task 17: Replace the ratchet with an error

The ceiling is at 0. A ratchet at 0 is satisfied by a file that gets deleted; a lint rule is
not. This is the swap the ratchet existed to make possible.

**Files:**
- Modify: `eslint.config.js`
- Modify: `src/services/__tests__/queryKeys.discipline.test.js` (remove the `.skip`)
- Modify: `vitest.config.js` (raise the coverage floor)
- Modify: `.github/workflows/ci.yml` (drop the ratchet step)
- Modify: `package.json` (drop the ratchet script)
- Delete: `scripts/supabase-import-ratchet.mjs`, `scripts/__tests__/supabaseImportRatchet.test.js`, `supabase-import-budget.json`
- Modify: `ROADMAP.md` (the gaps table)

- [ ] **Step 1: Un-skip the discipline test and watch it pass**

Change `describe.skip(` to `describe(` in
`src/services/__tests__/queryKeys.discipline.test.js`.

Run: `npx vitest run src/services/__tests__/queryKeys.discipline.test.js`
Expected: PASS. If it fails, it has found a call site Tasks 10–16 missed — fix the call
site, not the test.

- [ ] **Step 2: Add the ESLint restriction**

In `eslint.config.js`, after the Node override block:

```js
  // The data layer's boundary, as an error rather than a ratchet.
  //
  // Block 3.1 moved twenty-two components and pages off the client and behind
  // src/services/. A ratchet held the line while that was in flight (see the
  // deleted scripts/supabase-import-ratchet.mjs); at zero it is worth less than
  // a rule, because a ratchet is also satisfied by deleting a file.
  //
  // src/services, src/contexts and src/utils are exempt: services are the
  // boundary itself, and the two contexts consume services rather than the
  // client. Test files are exempt because configuring the mock is what they are
  // for.
  {
    files: ['src/components/**/*.{js,jsx}', 'src/pages/**/*.{js,jsx}'],
    ignores: ['**/__tests__/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/utils/supabaseClient', '@/utils/supabaseClient', '@supabase/supabase-js'],
              message:
                'Query through a module in src/services/ instead. See ROADMAP.md Block 3.1.',
            },
          ],
        },
      ],
    },
  },
```

- [ ] **Step 3: Prove the rule bites**

```bash
printf "import { supabase } from '@/utils/supabaseClient';\nexport default supabase;\n" > src/pages/__ratchet_probe.jsx
npx eslint src/pages/__ratchet_probe.jsx
rm src/pages/__ratchet_probe.jsx
```

Expected: one error, `no-restricted-imports`, quoting the message above. A rule that has
never been seen to fail is a rule nobody has tested.

- [ ] **Step 4: Remove the ratchet**

```bash
git rm scripts/supabase-import-ratchet.mjs scripts/__tests__/supabaseImportRatchet.test.js supabase-import-budget.json
```

Remove the `supabase:ratchet` script from `package.json` and the "Supabase import ratchet"
step from `.github/workflows/ci.yml`.

- [ ] **Step 5: Raise the coverage floor**

```bash
npm run test:coverage
```

Record the four measured numbers. Set each threshold in `vitest.config.js` about one point
below its measurement, and add a comment block above them in the file's established style:

```js
      // Raised at the end of Block 3 Phase 1. The data layer added ~90 pure
      // unit tests over src/services with no jsdom rendering, so unlike the two
      // give-backs of Block 2 this moves the numerator without touching the
      // denominator — which is the shape of test-writing a ratio floor rewards.
      // Measured <lines> lines / <statements> statements / <functions> functions
      // / <branches> branches on 2026-09-XX; each floor sits ~1 point under.
```

- [ ] **Step 6: Update the roadmap's gaps table**

In `ROADMAP.md`, set **Files importing Supabase directly** to `0 ✅`, and note in the Block
3 section that 3.1 is done. Leave every other number alone; they are re-measured at the end
of their own phase.

- [ ] **Step 7: Run everything**

Run: `npm run lint && npm run test:coverage && npm run build`
Expected: all green.

- [ ] **Step 8: Commit and push Phase 1**

```bash
git add -A
git commit -m "feat(services): enforce the data-layer boundary with a lint error"
git push -u origin HEAD
```

**Phase 1 exit, verified:** `grep -rl supabaseClient src/components src/pages` returns
nothing but the one test file · `npm run lint` fails on a probe import · the discipline test
is un-skipped and green · the coverage floor is higher than it was.

---

# Phase 2 — Decomposition

**Exit:** no file under `src/` over 300 lines, enforced by a ratchet in CI; `usePagination`,
`useFilters` and `useCsvExport` exist and are used rather than re-implemented per screen.

Phase 1 shrinks these files before this phase touches them — roughly 200 lines leave
`AdminProperties.jsx` and 170 leave `AdminBookings.jsx` with their query bodies. **Re-measure
before starting each task**; the numbers below are pre-Phase-1 and every one of them is an
overestimate.

**The rule for all of Phase 2:** markup moves *verbatim*. Same elements, same class strings,
same `aria-*`, same order. If a class string is retyped rather than moved, the palette
ratchet or the axe suite will catch it — but the point is not to rely on that. A
decomposition that also improves the markup is two changes wearing one commit, and a
reviewer cannot approve half of it.

---

### Task 18: `useFilters`

Six screens keep three or four pieces of filter state, a reset handler and an
"is anything filtered" flag, each written slightly differently.

**Files:**
- Create: `src/hooks/useFilters.js`
- Create: `src/hooks/__tests__/useFilters.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `useFilters(initial) -> { filters, setFilter, resetFilters, activeCount, isFiltered }`
  where `filters` is the current object, `setFilter(name, value)` replaces one entry, and
  `activeCount` counts entries differing from `initial`.

- [ ] **Step 1: Write the failing test**

Create `src/hooks/__tests__/useFilters.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilters } from '../useFilters';

const initial = { status: 'all', purpose: 'all', search: '' };

describe('useFilters', () => {
  it('starts at the initial values with nothing active', () => {
    const { result } = renderHook(() => useFilters(initial));
    expect(result.current.filters).toEqual(initial);
    expect(result.current.activeCount).toBe(0);
    expect(result.current.isFiltered).toBe(false);
  });

  it('sets one filter without disturbing the others', () => {
    const { result } = renderHook(() => useFilters(initial));
    act(() => result.current.setFilter('status', 'available'));
    expect(result.current.filters).toEqual({ ...initial, status: 'available' });
    expect(result.current.activeCount).toBe(1);
    expect(result.current.isFiltered).toBe(true);
  });

  it('stops counting a filter that is set back to its initial value', () => {
    const { result } = renderHook(() => useFilters(initial));
    act(() => result.current.setFilter('status', 'available'));
    act(() => result.current.setFilter('status', 'all'));
    expect(result.current.activeCount).toBe(0);
  });

  it('resets everything at once', () => {
    const { result } = renderHook(() => useFilters(initial));
    act(() => result.current.setFilter('status', 'sold'));
    act(() => result.current.setFilter('search', 'gigiri'));
    act(() => result.current.resetFilters());
    expect(result.current.filters).toEqual(initial);
  });

  it('keeps a stable setFilter identity across renders', () => {
    // The filters object is a query key input. A setter that changes identity
    // every render puts it in a dependency array that re-fires forever.
    const { result, rerender } = renderHook(() => useFilters(initial));
    const first = result.current.setFilter;
    rerender();
    expect(result.current.setFilter).toBe(first);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/hooks/__tests__/useFilters.test.js`
Expected: FAIL — `Failed to resolve import "../useFilters"`.

- [ ] **Step 3: Write the implementation**

Create `src/hooks/useFilters.js`:

```js
import { useCallback, useMemo, useRef, useState } from 'react';

/**
 * Filter state for a list screen.
 *
 * `filters` goes straight into a query key, so it must be a plain object whose
 * identity changes only when a value does — otherwise every render is a new key
 * and TanStack Query refetches forever.
 */
export function useFilters(initial) {
  const initialRef = useRef(initial);
  const [filters, setFilters] = useState(initial);

  const setFilter = useCallback((name, value) => {
    setFilters((current) => (current[name] === value ? current : { ...current, [name]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(initialRef.current), []);

  const activeCount = useMemo(
    () =>
      Object.entries(filters).filter(([name, value]) => value !== initialRef.current[name]).length,
    [filters]
  );

  return { filters, setFilter, resetFilters, activeCount, isFiltered: activeCount > 0 };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useFilters.test.js`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useFilters.js src/hooks/__tests__/useFilters.test.js
git commit -m "feat(hooks): add useFilters"
```

---

### Task 19: `usePagination`

**Files:**
- Create: `src/hooks/usePagination.js`
- Create: `src/hooks/__tests__/usePagination.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `usePagination({ pageSize = 20, totalCount = 0 } = {}) -> { page, pageSize, setPage, nextPage, previousPage, totalPages, range: { from, to }, reset }`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/__tests__/usePagination.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../usePagination';

describe('usePagination', () => {
  it('starts on page 1 with a zero-based range', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 20, totalCount: 47 }));
    expect(result.current.page).toBe(1);
    expect(result.current.range).toEqual({ from: 0, to: 19 });
    expect(result.current.totalPages).toBe(3);
  });

  it('moves the range with the page', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 20, totalCount: 47 }));
    act(() => result.current.nextPage());
    expect(result.current.range).toEqual({ from: 20, to: 39 });
  });

  it('will not advance past the last page', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 20, totalCount: 25 }));
    act(() => result.current.nextPage());
    act(() => result.current.nextPage());
    expect(result.current.page).toBe(2);
  });

  it('will not go below page 1', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 20, totalCount: 25 }));
    act(() => result.current.previousPage());
    expect(result.current.page).toBe(1);
  });

  it('reports one page for an empty result rather than zero', () => {
    // totalPages: 0 renders "Page 1 of 0", which is how the admin table used to
    // read on an empty filter.
    const { result } = renderHook(() => usePagination({ pageSize: 20, totalCount: 0 }));
    expect(result.current.totalPages).toBe(1);
  });

  it('clamps the current page when the total shrinks under it', () => {
    // Filtering while on page 3 of 5 used to leave the table on a page that no
    // longer existed, showing nothing and offering no way back.
    const { result, rerender } = renderHook((props) => usePagination(props), {
      initialProps: { pageSize: 10, totalCount: 50 },
    });
    act(() => result.current.setPage(5));
    rerender({ pageSize: 10, totalCount: 12 });
    expect(result.current.page).toBe(2);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/hooks/__tests__/usePagination.test.js`
Expected: FAIL — `Failed to resolve import "../usePagination"`.

- [ ] **Step 3: Write the implementation**

Create `src/hooks/usePagination.js`:

```js
import { useCallback, useMemo, useState } from 'react';

/**
 * 1-based page state, and the 0-based inclusive range Supabase wants.
 *
 * The conversion lives in src/services (listPage, listClientsPage) for the
 * query; this hook owns the same arithmetic for screens that page client-side,
 * and the two agree by construction because both are `(page - 1) * pageSize`.
 */
export function usePagination({ pageSize = 20, totalCount = 0 } = {}) {
  const [page, setPageState] = useState(1);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // A filter that shrinks the result set must not strand the view on a page
  // that no longer exists.
  const safePage = Math.min(page, totalPages);

  const setPage = useCallback(
    (next) => setPageState(() => Math.max(1, Math.min(next, Math.max(1, Math.ceil(totalCount / pageSize))))),
    [totalCount, pageSize]
  );

  const nextPage = useCallback(() => setPage(safePage + 1), [setPage, safePage]);
  const previousPage = useCallback(() => setPage(safePage - 1), [setPage, safePage]);
  const reset = useCallback(() => setPageState(1), []);

  const range = useMemo(() => {
    const from = (safePage - 1) * pageSize;
    return { from, to: from + pageSize - 1 };
  }, [safePage, pageSize]);

  return { page: safePage, pageSize, setPage, nextPage, previousPage, totalPages, range, reset };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/usePagination.test.js`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/usePagination.js src/hooks/__tests__/usePagination.test.js
git commit -m "feat(hooks): add usePagination"
```

---

### Task 20: `useCsvExport`

**Files:**
- Create: `src/hooks/useCsvExport.js`
- Create: `src/hooks/__tests__/useCsvExport.test.js`

**Interfaces:**
- Consumes: `exportToCSV` from `src/utils/exportUtils.js`.
- Produces: `useCsvExport({ filename, format }) -> { exportRows, isExporting, error }` where
  `exportRows(rows)` formats and downloads, and `format` is one of the existing
  `formatPropertiesForExport` / `formatBookingsForExport` / `formatClientsForExport`.

- [ ] **Step 1: Write the failing test**

Create `src/hooks/__tests__/useCsvExport.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCsvExport } from '../useCsvExport';
import { exportToCSV } from '@/utils/exportUtils';

vi.mock('@/utils/exportUtils', () => ({ exportToCSV: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

describe('useCsvExport', () => {
  it('formats the rows before handing them to exportToCSV', async () => {
    const format = vi.fn((rows) => rows.map((row) => ({ Title: row.title })));
    const { result } = renderHook(() => useCsvExport({ filename: 'properties', format }));

    await act(async () => result.current.exportRows([{ title: 'Gigiri' }]));

    expect(format).toHaveBeenCalledWith([{ title: 'Gigiri' }]);
    expect(exportToCSV).toHaveBeenCalledWith([{ Title: 'Gigiri' }], 'properties');
  });

  it('exports nothing and reports an error for an empty list', async () => {
    // Downloading a header-only CSV looks like a broken export, and three
    // screens shipped one.
    const { result } = renderHook(() => useCsvExport({ filename: 'x', format: (r) => r }));
    await act(async () => result.current.exportRows([]));
    expect(exportToCSV).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/nothing to export/i);
  });

  it('clears isExporting even when the export throws', async () => {
    exportToCSV.mockImplementation(() => { throw new Error('quota'); });
    const { result } = renderHook(() => useCsvExport({ filename: 'x', format: (r) => r }));
    await act(async () => result.current.exportRows([{ a: 1 }]));
    expect(result.current.isExporting).toBe(false);
    expect(result.current.error).toBe('quota');
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/hooks/__tests__/useCsvExport.test.js`
Expected: FAIL — `Failed to resolve import "../useCsvExport"`.

- [ ] **Step 3: Write the implementation**

Create `src/hooks/useCsvExport.js`:

```js
import { useCallback, useState } from 'react';
import { exportToCSV } from '@/utils/exportUtils';

/**
 * The export button's whole behaviour, once.
 *
 * Three screens each had their own copy: two of them downloaded a header-only
 * file when the filtered list was empty, and none of them cleared their
 * spinner if the download threw.
 */
export function useCsvExport({ filename, format }) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const exportRows = useCallback(
    async (rows) => {
      setError(null);

      if (!rows?.length) {
        setError('There is nothing to export.');
        return;
      }

      setIsExporting(true);
      try {
        exportToCSV(format(rows), filename);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsExporting(false);
      }
    },
    [filename, format]
  );

  return { exportRows, isExporting, error };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useCsvExport.test.js`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCsvExport.js src/hooks/__tests__/useCsvExport.test.js
git commit -m "feat(hooks): add useCsvExport"
```

---

### Task 21: The file-size ratchet

**Files:**
- Create: `scripts/file-size-ratchet.mjs`
- Create: `file-size-budget.json`
- Create: `scripts/__tests__/fileSizeRatchet.test.js`
- Modify: `package.json`, `.github/workflows/ci.yml`

**Interfaces:**
- Produces: `npm run size:ratchet` and `npm run size:ratchet -- --update`, plus the exported
  `largestFiles(files) -> { path, lines }[]` the test drives.

- [ ] **Step 1: Write the failing test**

Create `scripts/__tests__/fileSizeRatchet.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { largestFiles } from '../file-size-ratchet.mjs';

describe('largestFiles', () => {
  it('reports files by line count, largest first', () => {
    const files = { 'a.jsx': 'x\ny\nz', 'b.jsx': 'x' };
    expect(largestFiles(files)).toEqual([
      { path: 'a.jsx', lines: 3 },
      { path: 'b.jsx', lines: 1 },
    ]);
  });

  it('ignores test files, which are allowed to be long', () => {
    const files = { 'src/x/__tests__/a.test.jsx': 'x\ny\nz\nq' };
    expect(largestFiles(files)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run scripts/__tests__/fileSizeRatchet.test.js`
Expected: FAIL — the module does not exist.

- [ ] **Step 3: Write the script**

Create `scripts/file-size-ratchet.mjs`:

```js
#!/usr/bin/env node
/**
 * Enforces a falling ceiling on the longest source file.
 *
 * ROADMAP.md Block 3.2 wants nothing over 300 lines and starts at 1,253. A hard
 * 300-line rule would fail the build twenty-four times on arrival and be
 * switched off the same afternoon, so this is a ceiling that only falls — the
 * same instrument as palette-budget.json and bundle-budget.json.
 *
 * Tests are excluded. A thorough test file is long for a good reason, and a
 * ceiling that punishes it teaches people to write fewer assertions.
 *
 *   node scripts/file-size-ratchet.mjs            check against the budget
 *   node scripts/file-size-ratchet.mjs --update   lower the budget to current
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const BUDGET_FILE = 'file-size-budget.json';
const ROOT = 'src';

/** @param {Record<string,string>} files @returns {{path:string,lines:number}[]} */
export function largestFiles(files) {
  return Object.entries(files)
    .filter(([path]) => !path.includes('__tests__') && !path.includes('/test/'))
    .map(([path, source]) => ({ path, lines: source.split('\n').length }))
    .sort((a, b) => b.lines - a.lines);
}

function readTree(dir, acc = {}) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) readTree(full, acc);
    else if (/\.jsx?$/.test(entry)) acc[relative(process.cwd(), full)] = readFileSync(full, 'utf8');
  }
  return acc;
}

if (process.argv[1]?.endsWith('file-size-ratchet.mjs')) {
  const ranked = largestFiles(readTree(ROOT));
  const largest = ranked[0]?.lines ?? 0;
  const budget = JSON.parse(readFileSync(BUDGET_FILE, 'utf8'));
  const over = ranked.filter((entry) => entry.lines > budget.max);

  console.log(`Largest source file: ${largest} lines (ceiling ${budget.max})`);
  console.log('Ten largest:');
  for (const { path, lines } of ranked.slice(0, 10)) {
    console.log(`  ${String(lines).padStart(5)}  ${path}`);
  }

  if (process.argv.includes('--update')) {
    if (largest > budget.max) {
      console.error(
        `\nRefusing to raise the ceiling from ${budget.max} to ${largest}. ` +
          'This budget only falls — that is what makes it a ratchet.'
      );
      process.exit(1);
    }
    writeFileSync(BUDGET_FILE, `${JSON.stringify({ ...budget, max: largest }, null, 2)}\n`);
    console.log(`\nCeiling lowered ${budget.max} -> ${largest}.`);
    process.exit(0);
  }

  if (over.length > 0) {
    console.error(`\n${over.length} file(s) over the ceiling of ${budget.max}:`);
    for (const { path, lines } of over) console.error(`  ${lines}  ${path}`);
    console.error('\nSplit by responsibility, not by line count. See ROADMAP.md Block 3.2.\n');
    process.exit(1);
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run scripts/__tests__/fileSizeRatchet.test.js`
Expected: PASS, 2 tests.

- [ ] **Step 5: Seed the budget from the real measurement**

```bash
echo '{ "max": 99999 }' > file-size-budget.json
node scripts/file-size-ratchet.mjs --update
cat file-size-budget.json
```

Expected: whatever `AdminProperties.jsx` measures **after Phase 1** — around 1,050, not the
1,253 this plan started from. Add the note:

```json
{
  "max": 1050,
  "note": "Lines in the longest non-test file under src/. ROADMAP.md Block 3.2 drives this to 300. Measured after Block 3 Phase 1, which removed the query bodies. This ceiling only falls; lower it with `npm run size:ratchet -- --update` at the end of every decomposition task."
}
```

- [ ] **Step 6: Wire it into npm and CI**

`package.json`: `"size:ratchet": "node scripts/file-size-ratchet.mjs",`

`.github/workflows/ci.yml`, after the palette and label ratchets:

```yaml
      # A 1,253-line component cannot be reviewed, cannot be tested at its
      # seams, and cannot be code-split. ROADMAP.md Block 3.2 wants nothing over
      # 300 lines; a hard rule would fail twenty-four times on arrival, so this
      # ceiling only falls. See file-size-budget.json.
      - name: File size ratchet
        run: npm run size:ratchet
```

- [ ] **Step 7: Commit**

```bash
git add scripts/file-size-ratchet.mjs scripts/__tests__/fileSizeRatchet.test.js file-size-budget.json package.json .github/workflows/ci.yml
git commit -m "ci: ratchet the longest source file"
```

---

### Task 22: Split `AdminProperties.jsx`

The seams are already marked by the file's own section comments: stats cards (`:503`),
filters (`:573`), desktop table (`:610`), mobile cards (`:693`), pagination (`:868`), and
the form modal (`:930-1253`).

**Files:**
- Create: `src/pages/admin/properties/PropertyStatsCards.jsx` — the five counters
- Create: `src/pages/admin/properties/PropertyFilters.jsx` — search, status, purpose, sort,
  and the mobile filter sheet
- Create: `src/pages/admin/properties/PropertyTable.jsx` — the desktop table
- Create: `src/pages/admin/properties/PropertyCardGrid.jsx` — the mobile grid and list views
- Create: `src/pages/admin/properties/PropertyFormModal.jsx` — the create/edit modal
- Create: `src/pages/admin/properties/PropertyImageUploader.jsx` — image select, preview,
  delete, and the Cloudinary upload
- Create: `src/pages/admin/properties/usePropertyForm.js` — `formData`, `errors`,
  `validateForm`, `resetForm`, `setupEditForm`, amenity add/remove
- Modify: `src/pages/admin/AdminProperties.jsx` — down to composition, under 300 lines
- Create: `src/pages/admin/properties/__tests__/usePropertyForm.test.js`
- Create: `src/pages/admin/properties/__tests__/PropertyFilters.test.jsx`
- Modify: `file-size-budget.json`

**Interfaces:**
- Consumes: `propertyQueries.page`, `createProperty`, `updateProperty`, `deleteProperty`,
  `setFeatured` (Task 4); `settingsQueries.cloudinary()` (Task 8); `useFilters` (Task 18);
  `usePagination` (Task 19); `useCsvExport` (Task 20).
- Produces:
  - `<PropertyStatsCards properties={Property[]} totalCount={number} />`
  - `<PropertyFilters filters={object} onFilterChange={(name, value) => void} onReset={() => void} activeCount={number} />`
  - `<PropertyTable properties={Property[]} sortField={string} sortDirection={'asc'|'desc'} onSort={(field) => void} onEdit={(p) => void} onDelete={(id) => void} onToggleFeatured={(p) => void} />`
  - `<PropertyCardGrid properties={Property[]} viewMode={'grid'|'list'} onEdit onDelete onToggleFeatured />`
  - `<PropertyFormModal isOpen={boolean} property={Property|null} onClose={() => void} onSaved={() => void} />`
  - `<PropertyImageUploader images={string[]} files={File[]} onAdd={(files) => void} onRemove={(index, type) => void} />`
  - `usePropertyForm(property) -> { formData, errors, handleInputChange, addAmenity, removeAmenity, validateForm, resetForm, toSubmitData }`

- [ ] **Step 1: Write the failing test for the form hook**

Create `src/pages/admin/properties/__tests__/usePropertyForm.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePropertyForm } from '../usePropertyForm';

describe('usePropertyForm', () => {
  it('starts empty for a new property', () => {
    const { result } = renderHook(() => usePropertyForm(null));
    expect(result.current.formData.title).toBe('');
    expect(result.current.formData.amenities).toEqual([]);
  });

  it('loads an existing property into the form', () => {
    const { result } = renderHook(() =>
      usePropertyForm({ id: 7, title: 'Gigiri', price: 100, amenities: ['Pool'] })
    );
    expect(result.current.formData.title).toBe('Gigiri');
    expect(result.current.formData.amenities).toEqual(['Pool']);
  });

  it('reports the missing required fields rather than the first one only', () => {
    const { result } = renderHook(() => usePropertyForm(null));
    act(() => { result.current.validateForm(); });
    expect(Object.keys(result.current.errors)).toEqual(
      expect.arrayContaining(['title', 'price'])
    );
  });

  it('rejects a non-numeric price', () => {
    const { result } = renderHook(() => usePropertyForm(null));
    act(() => result.current.handleInputChange({ target: { name: 'price', value: 'free' } }));
    act(() => { result.current.validateForm(); });
    expect(result.current.errors.price).toBeTruthy();
  });

  it('adds and removes amenities without mutating the previous array', () => {
    const { result } = renderHook(() => usePropertyForm(null));
    act(() => result.current.addAmenity('Pool'));
    const afterAdd = result.current.formData.amenities;
    act(() => result.current.addAmenity('Gym'));
    expect(afterAdd).toEqual(['Pool']);
    expect(result.current.formData.amenities).toEqual(['Pool', 'Gym']);
    act(() => result.current.removeAmenity(0));
    expect(result.current.formData.amenities).toEqual(['Gym']);
  });

  it('sends amenities and images as arrays, which is what the columns are', () => {
    // properties.amenities and properties.images are TEXT[], not jsonb. A
    // JSON string here is accepted by PostgREST and read back as one amenity
    // whose name is the whole array.
    const { result } = renderHook(() => usePropertyForm(null));
    act(() => result.current.addAmenity('Pool'));
    expect(Array.isArray(result.current.toSubmitData().amenities)).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/pages/admin/properties/__tests__/usePropertyForm.test.js`
Expected: FAIL — the hook does not exist.

- [ ] **Step 3: Extract `usePropertyForm.js`**

Move the `formData`/`errors` state (lines 36–57), `handleInputChange` (144), `handleAddAmenity`
(171), `handleRemoveAmenity` (181), `resetForm` (239), `validateForm` (266) and the
`submitData` construction from `handleSubmit` (317) into the hook. **Move the validation
rules verbatim** — this is not the task that decides what a valid property is.

- [ ] **Step 4: Run the hook test**

Run: `npx vitest run src/pages/admin/properties/__tests__/usePropertyForm.test.js`
Expected: PASS, 6 tests.

- [ ] **Step 5: Extract the six presentational components**

One at a time, in this order — smallest blast radius first: `PropertyStatsCards`,
`PropertyFilters`, `PropertyCardGrid`, `PropertyTable`, `PropertyImageUploader`,
`PropertyFormModal`. For each: cut the JSX verbatim, add the props from the Interfaces
block above, and replace the original with the element.

After each extraction, run:

```bash
npx vitest run src/test/a11y/adminSurfaces.axe.test.jsx
npm run palette:ratchet
npm run label:ratchet
```

Expected: axe green, palette unchanged, labels still 0. **Do not batch the six extractions
before running these** — a stale prop is invisible in a diff and obvious in a render.

- [ ] **Step 6: Write the filters test**

Create `src/pages/admin/properties/__tests__/PropertyFilters.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
import PropertyFilters from '../PropertyFilters';

describe('PropertyFilters', () => {
  const filters = { search: '', status: 'all', purpose: 'all' };

  it('reports a status change to its parent', async () => {
    const onFilterChange = vi.fn();
    const user = userEvent.setup();
    render(
      <PropertyFilters filters={filters} onFilterChange={onFilterChange} onReset={vi.fn()} activeCount={0} />
    );
    await user.selectOptions(screen.getByLabelText(/status/i), 'available');
    expect(onFilterChange).toHaveBeenCalledWith('status', 'available');
  });

  it('gives every control an accessible name', () => {
    // Block 2 took unlabelled controls to zero and the axe gate holds them
    // there. Moving markup into a new file is exactly how one comes back.
    render(
      <PropertyFilters filters={filters} onFilterChange={vi.fn()} onReset={vi.fn()} activeCount={0} />
    );
    for (const control of screen.getAllByRole('combobox')) {
      expect(control).toHaveAccessibleName();
    }
  });
});
```

- [ ] **Step 7: Reduce `AdminProperties.jsx` to composition**

What remains: the queries, the mutation handlers, `useFilters`, `usePagination`,
`useCsvExport`, and the six elements. Target under 300 lines.

Run: `wc -l src/pages/admin/AdminProperties.jsx`
Expected: under 300. If it is not, the form modal is still doing too much — move its two
columns into `PropertyFormFields.jsx` and re-measure.

- [ ] **Step 8: Run everything, lower the ceiling, commit**

```bash
npm run lint
npm run test:run
npm run size:ratchet -- --update
git add src/pages/admin/properties src/pages/admin/AdminProperties.jsx file-size-budget.json
git commit -m "refactor(admin): split AdminProperties into seven focused modules"
```

---

### Task 23: Split `AdminBookings.jsx` and `BookingDetailModal.jsx`

**Files:**
- Create: `src/pages/admin/bookings/BookingStatsCards.jsx`
- Create: `src/pages/admin/bookings/BookingFiltersPanel.jsx`
- Create: `src/pages/admin/bookings/BookingTable.jsx`
- Create: `src/pages/admin/bookings/BookingRescheduleDialog.jsx`
- Create: `src/pages/admin/bookings/BookingNotesPanel.jsx` — from `BookingDetailModal`
- Create: `src/pages/admin/bookings/useBookingMutations.js` — the four mutations and their
  single invalidation
- Modify: `src/pages/admin/AdminBookings.jsx`, `src/pages/admin/BookingDetailModal.jsx`
- Create: `src/pages/admin/bookings/__tests__/useBookingMutations.test.jsx`
- Modify: `file-size-budget.json`

**Interfaces:**
- Consumes: `bookingQueries`, `setBookingStatus`, `setBookingPriority`, `rescheduleBooking`,
  `addBookingNote`, `deleteBookingNote` (Task 5); `queryKeys.bookings` (Task 3);
  `useFilters` (Task 18).
- Produces:
  - `<BookingStatsCards stats={{ total, byStatus, byPriority }} />`
  - `<BookingFiltersPanel filters={object} onFilterChange={(name, value) => void} onReset={() => void} />`
  - `<BookingTable bookings={Booking[]} onSelect={(booking) => void} onStatusChange={(id, status) => void} />`
  - `<BookingRescheduleDialog booking={Booking|null} onClose={() => void} onConfirm={(appointmentAt) => void} />`
  - `<BookingNotesPanel bookingId={string} />`
  - `useBookingMutations() -> { setStatus, setPriority, reschedule, addNote, removeNote, isPending }`

- [ ] **Step 1: Write the failing test**

Create `src/pages/admin/bookings/__tests__/useBookingMutations.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBookingMutations } from '../useBookingMutations';
import { setBookingStatus } from '@/services/bookings';
import { queryKeys } from '@/services/queryKeys';

vi.mock('@/services/bookings', () => ({
  setBookingStatus: vi.fn().mockResolvedValue({ id: 'x' }),
  setBookingPriority: vi.fn().mockResolvedValue({ id: 'x' }),
  rescheduleBooking: vi.fn().mockResolvedValue({ id: 'x' }),
  addBookingNote: vi.fn().mockResolvedValue({ id: 1 }),
  deleteBookingNote: vi.fn().mockResolvedValue(undefined),
}));

const wrapper = ({ children }) => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

beforeEach(() => vi.clearAllMocks());

describe('useBookingMutations', () => {
  it('invalidates the whole bookings domain once per mutation', async () => {
    const client = new QueryClient();
    const spy = vi.spyOn(client, 'invalidateQueries');
    const localWrapper = ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useBookingMutations(), { wrapper: localWrapper });
    await act(async () => result.current.setStatus({ id: 'x', status: 'confirmed' }));

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.bookings.all })
    );
    expect(setBookingStatus).toHaveBeenCalledWith('x', 'confirmed');
  });

  it('reports pending while a mutation is in flight', async () => {
    const { result } = renderHook(() => useBookingMutations(), { wrapper });
    expect(result.current.isPending).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/pages/admin/bookings/__tests__/useBookingMutations.test.jsx`
Expected: FAIL — the hook does not exist.

- [ ] **Step 3: Write `useBookingMutations.js`**

```jsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  setBookingStatus, setBookingPriority, rescheduleBooking, addBookingNote, deleteBookingNote,
} from '@/services/bookings';
import { queryKeys } from '@/services/queryKeys';

/**
 * Every write against a booking, with one invalidation between them.
 *
 * Before this hook the same four mutations were declared in two components and
 * invalidated two flat keys by hand at six call sites — and the seventh forgot
 * one, which is why the counters could disagree with the list.
 */
export function useBookingMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });

  const status = useMutation({
    mutationFn: ({ id, status: next }) => setBookingStatus(id, next),
    onSuccess: invalidate,
  });
  const priority = useMutation({
    mutationFn: ({ id, priority: next }) => setBookingPriority(id, next),
    onSuccess: invalidate,
  });
  const reschedule = useMutation({
    mutationFn: ({ id, appointmentAt }) => rescheduleBooking(id, { appointmentAt }),
    onSuccess: invalidate,
  });
  const note = useMutation({ mutationFn: addBookingNote, onSuccess: invalidate });
  const removeNoteMutation = useMutation({ mutationFn: deleteBookingNote, onSuccess: invalidate });

  return {
    setStatus: status.mutateAsync,
    setPriority: priority.mutateAsync,
    reschedule: reschedule.mutateAsync,
    addNote: note.mutateAsync,
    removeNote: removeNoteMutation.mutateAsync,
    isPending:
      status.isPending || priority.isPending || reschedule.isPending ||
      note.isPending || removeNoteMutation.isPending,
  };
}
```

> The optimistic reschedule in `AdminBookings.jsx:184-230` is deliberately **not** folded in
> here. It depends on the current `filters` for its rollback key, which the hook does not
> know. Leave it in the page, keyed by `queryKeys.bookings.list(filters)`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/pages/admin/bookings/__tests__/useBookingMutations.test.jsx`
Expected: PASS, 2 tests.

- [ ] **Step 5: Extract the five components, one at a time**

After each, run `npx vitest run src/pages/admin/__tests__ src/test/a11y/adminSurfaces.axe.test.jsx`.

- [ ] **Step 6: Verify both files are under 300 lines**

Run: `wc -l src/pages/admin/AdminBookings.jsx src/pages/admin/BookingDetailModal.jsx`
Expected: both under 300.

- [ ] **Step 7: Lower the ceiling and commit**

```bash
npm run test:run
npm run size:ratchet -- --update
git add src/pages/admin/bookings src/pages/admin/AdminBookings.jsx src/pages/admin/BookingDetailModal.jsx file-size-budget.json
git commit -m "refactor(admin): split the bookings screens"
```

---

### Task 24: Split `ServicesMain.jsx` and `ViewingExperience.jsx`

Both are multi-step booking wizards with the step machinery inline, and both are 850 lines
because they contain two copies of it.

**Files:**
- Create: `src/components/services/useBookingWizard.js` — step index, `next`, `back`,
  per-step validation, `isLastStep`
- Create: `src/components/services/BookingStepper.jsx` — the numbered progress indicator
  (currently duplicated at `ServicesMain.jsx:261` and inside `ViewingExperience`)
- Create: `src/components/services/ServiceSelectionStep.jsx`
- Create: `src/components/services/PropertySelectionStep.jsx`
- Create: `src/components/services/ScheduleStep.jsx`
- Create: `src/components/services/ContactDetailsStep.jsx`
- Create: `src/components/services/BookingConfirmation.jsx`
- Modify: `src/pages/ServicesMain.jsx`, `src/components/services/ViewingExperience.jsx`
- Create: `src/components/services/__tests__/useBookingWizard.test.js`
- Modify: `file-size-budget.json`

**Interfaces:**
- Consumes: `createBooking`, `propertyQueries` (Tasks 4, 5); the existing `ServiceCard.jsx`,
  `ServiceForm.jsx` and `ViewingForm.jsx`.
- Produces:
  - `useBookingWizard({ steps, validate }) -> { step, stepIndex, next, back, goTo, isFirstStep, isLastStep, errors }`
  - `<BookingStepper totalSteps={number} currentStep={number} labels={string[]} />`
  - Each step component takes `value`, `onChange` and `errors` and renders one step.

- [ ] **Step 1: Write the failing test**

Create `src/components/services/__tests__/useBookingWizard.test.js`:

```js
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBookingWizard } from '../useBookingWizard';

const steps = ['service', 'property', 'schedule', 'contact'];

describe('useBookingWizard', () => {
  it('starts on the first step', () => {
    const { result } = renderHook(() => useBookingWizard({ steps, validate: () => ({}) }));
    expect(result.current.step).toBe('service');
    expect(result.current.isFirstStep).toBe(true);
  });

  it('advances only when the current step validates', () => {
    const validate = vi.fn((step) => (step === 'service' ? { service: 'Pick one' } : {}));
    const { result } = renderHook(() => useBookingWizard({ steps, validate }));
    act(() => result.current.next());
    expect(result.current.step).toBe('service');
    expect(result.current.errors.service).toBe('Pick one');
  });

  it('advances when validation passes and clears the errors', () => {
    const { result } = renderHook(() => useBookingWizard({ steps, validate: () => ({}) }));
    act(() => result.current.next());
    expect(result.current.step).toBe('property');
    expect(result.current.errors).toEqual({});
  });

  it('does not go back past the first step', () => {
    const { result } = renderHook(() => useBookingWizard({ steps, validate: () => ({}) }));
    act(() => result.current.back());
    expect(result.current.step).toBe('service');
  });

  it('knows when it is on the last step', () => {
    const { result } = renderHook(() => useBookingWizard({ steps, validate: () => ({}) }));
    act(() => result.current.goTo(3));
    expect(result.current.isLastStep).toBe(true);
  });

  it('skips validation when going backwards', () => {
    // A visitor correcting an earlier answer must not be blocked by the step
    // they are trying to leave. Both wizards got this wrong in the same way.
    const validate = vi.fn(() => ({ any: 'error' }));
    const { result } = renderHook(() => useBookingWizard({ steps, validate }));
    act(() => result.current.goTo(2));
    act(() => result.current.back());
    expect(result.current.step).toBe('property');
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/components/services/__tests__/useBookingWizard.test.js`
Expected: FAIL — the hook does not exist.

- [ ] **Step 3: Write `useBookingWizard.js`**

```js
import { useCallback, useState } from 'react';

/**
 * The step machinery both booking wizards had their own copy of.
 *
 * `validate(step)` returns an errors object for the step being left; an empty
 * object means "go on". Going backwards never validates — a visitor correcting
 * an earlier answer must not be held by the step they are leaving.
 */
export function useBookingWizard({ steps, validate }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState({});

  const next = useCallback(() => {
    const stepErrors = validate(steps[stepIndex]) ?? {};
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      setStepIndex((current) => Math.min(current + 1, steps.length - 1));
    }
  }, [steps, stepIndex, validate]);

  const back = useCallback(() => {
    setErrors({});
    setStepIndex((current) => Math.max(current - 1, 0));
  }, []);

  const goTo = useCallback(
    (index) => {
      setErrors({});
      setStepIndex(Math.max(0, Math.min(index, steps.length - 1)));
    },
    [steps.length]
  );

  return {
    step: steps[stepIndex],
    stepIndex,
    next,
    back,
    goTo,
    isFirstStep: stepIndex === 0,
    isLastStep: stepIndex === steps.length - 1,
    errors,
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/services/__tests__/useBookingWizard.test.js`
Expected: PASS, 6 tests.

- [ ] **Step 5: Extract `BookingStepper` and the four step components**

One at a time, running the public axe suite after each:
`npx vitest run src/test/a11y/publicSurfaces.axe.test.jsx`.

**Both wizards must end up rendering the same step components.** If a step differs between
them in a way a prop cannot express, say so in the commit body rather than forking the
component — a second copy is what this task exists to remove.

- [ ] **Step 6: Verify, lower the ceiling, commit**

```bash
wc -l src/pages/ServicesMain.jsx src/components/services/ViewingExperience.jsx
npm run test:run
npm run size:ratchet -- --update
git add src/components/services src/pages/ServicesMain.jsx file-size-budget.json
git commit -m "refactor(services): extract the booking wizard both flows duplicated"
```

Expected: both files under 300 lines.

---

### Task 25: Split the three large public pages

**Files:**
- Create: `src/pages/properties/PropertyFilterBar.jsx`, `PropertyGrid.jsx`,
  `PropertySortControl.jsx` — from `Properties.jsx` (763)
- Create: `src/pages/property-detail/PropertyGallery.jsx`, `PropertySpecs.jsx`,
  `PropertyEnquiryPanel.jsx` — from `PropertyDetail.jsx` (758)
- Create: `src/pages/international/AudienceTriage.jsx`, `RelocationServices.jsx`,
  `InternationalFaq.jsx` — from `International.jsx` (762)
- Modify: the three pages
- Create: `src/pages/properties/__tests__/PropertyFilterBar.test.jsx`
- Modify: `file-size-budget.json`

**Interfaces:**
- Consumes: `propertyQueries` (Task 4); `useFilters` (Task 18).
- Produces:
  - `<PropertyFilterBar filters={object} onFilterChange={(name, value) => void} onReset={() => void} />`
  - `<PropertyGrid properties={Property[]} onSelect={(property) => void} />`
  - `<PropertySortControl value={string} onChange={(value) => void} />`
  - `<PropertyGallery images={string[]} title={string} />`
  - `<PropertySpecs property={Property} />`
  - `<PropertyEnquiryPanel property={Property} />`
  - `<AudienceTriage />`, `<RelocationServices />`, `<InternationalFaq />` — presentational,
    no props

- [ ] **Step 1: Write the failing test**

Create `src/pages/properties/__tests__/PropertyFilterBar.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
import PropertyFilterBar from '../PropertyFilterBar';

describe('PropertyFilterBar', () => {
  it('reports each change to its parent rather than owning the state', async () => {
    const onFilterChange = vi.fn();
    const user = userEvent.setup();
    render(
      <PropertyFilterBar
        filters={{ type: 'all', purpose: 'all', search: '' }}
        onFilterChange={onFilterChange}
        onReset={vi.fn()}
      />
    );
    await user.type(screen.getByLabelText(/search/i), 'gigiri');
    expect(onFilterChange).toHaveBeenCalledWith('search', expect.any(String));
  });

  it('labels every control', () => {
    render(
      <PropertyFilterBar
        filters={{ type: 'all', purpose: 'all', search: '' }}
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />
    );
    for (const control of [...screen.getAllByRole('combobox'), ...screen.getAllByRole('textbox')]) {
      expect(control).toHaveAccessibleName();
    }
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/pages/properties/__tests__/PropertyFilterBar.test.jsx`
Expected: FAIL — the component does not exist.

- [ ] **Step 3: Extract, one component at a time**

After each: `npx vitest run src/test/a11y/publicSurfaces.axe.test.jsx && npm run palette:ratchet`.

`Properties.jsx` also carries URL-search-param syncing at lines 218–230. **Keep it in the
page** — it is routing, not filtering, and moving it into `useFilters` would give a hook
used by six screens a dependency on the router.

- [ ] **Step 4: Verify, lower the ceiling, commit**

```bash
wc -l src/pages/Properties.jsx src/pages/PropertyDetail.jsx src/pages/International.jsx
npm run test:run
npm run size:ratchet -- --update
git add src/pages/properties src/pages/property-detail src/pages/international src/pages/Properties.jsx src/pages/PropertyDetail.jsx src/pages/International.jsx file-size-budget.json
git commit -m "refactor(public): split the three largest public pages"
```

---

### Task 26: Split the 500–700 band

`Contact.jsx` (662) · `ClientManagement.jsx` (605) · `PropertyModal.jsx` (563) ·
`Home.jsx` (519) · `BookingCalendar.jsx` (502)

**Files:**
- Create: `src/pages/contact/ContactForm.jsx`, `ContactDetailsPanel.jsx`, `ContactMap.jsx`
- Create: `src/pages/admin/clients/ClientTable.jsx`, `ClientFiltersPanel.jsx`
- Create: `src/components/property/PropertyModalGallery.jsx`, `PropertyModalDetails.jsx`
- Create: `src/pages/home/HeroSection.jsx`, `FeaturedProperties.jsx`, `ServicesSection.jsx`
- Create: `src/components/calendar/CalendarToolbar.jsx`, `CalendarEventCard.jsx`
- Modify: the five pages/components
- Modify: `file-size-budget.json`

**Interfaces:**
- Consumes: `createBooking` (Task 5); `clientQueries` (Task 6); `propertyQueries` (Task 4);
  `useFilters` (Task 18); `usePagination` (Task 19); `useCsvExport` (Task 20).
- Produces:
  - `<ContactForm onSubmitted={() => void} />` — owns its own form state and calls `createBooking`
  - `<ContactDetailsPanel />` — reads `useSettings()`
  - `<ContactMap />`
  - `<ClientTable clients={Client[]} onSelect={(client) => void} onDelete={(id) => void} />`
  - `<ClientFiltersPanel filters={object} onFilterChange={(name, value) => void} onReset={() => void} />`
  - `<PropertyModalGallery images={string[]} title={string} />`
  - `<PropertyModalDetails property={Property} />`
  - `<HeroSection onExplore={() => void} />`
  - `<FeaturedProperties properties={Property[]} isLoading={boolean} onSelect={(property) => void} />`
  - `<ServicesSection ref />` — the scroll target `Home.jsx` keeps a ref to
  - `<CalendarToolbar view={string} onViewChange={(view) => void} date={Date} onDateChange={(date) => void} />`
  - `<CalendarEventCard booking={Booking} onSelect={(booking) => void} />`

- [ ] **Step 1: Write the failing test**

Create `src/pages/contact/__tests__/ContactForm.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
import ContactForm from '../ContactForm';
import { createBooking } from '@/services/bookings';

vi.mock('@/services/bookings', () => ({ createBooking: vi.fn().mockResolvedValue(undefined) }));

beforeEach(() => vi.clearAllMocks());

describe('ContactForm', () => {
  it('submits the enquiry and tells its parent', async () => {
    const onSubmitted = vi.fn();
    const user = userEvent.setup();
    render(<ContactForm onSubmitted={onSubmitted} />);

    await user.type(screen.getByLabelText(/name/i), 'Ada');
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
    await user.type(screen.getByLabelText(/phone/i), '+254700000000');
    await user.type(screen.getByLabelText(/message/i), 'Hello');
    await user.click(screen.getByRole('button', { name: /send|submit/i }));

    await waitFor(() => expect(createBooking).toHaveBeenCalled());
    expect(onSubmitted).toHaveBeenCalled();
  });

  it('does not submit an enquiry with no email', async () => {
    const user = userEvent.setup();
    render(<ContactForm onSubmitted={vi.fn()} />);
    await user.type(screen.getByLabelText(/name/i), 'Ada');
    await user.click(screen.getByRole('button', { name: /send|submit/i }));
    expect(createBooking).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/pages/contact/__tests__/ContactForm.test.jsx`
Expected: FAIL — the component does not exist.

- [ ] **Step 3: Extract, one component at a time, running the axe suites after each**

- [ ] **Step 4: Verify, lower the ceiling, commit**

```bash
wc -l src/pages/Contact.jsx src/pages/admin/ClientManagement.jsx src/components/PropertyModal.jsx src/pages/Home.jsx src/components/BookingCalendar.jsx
npm run test:run
npm run size:ratchet -- --update
git add -A
git commit -m "refactor: split the five components in the 500-700 line band"
```

---

### Task 27: The 300–500 sweep, and the ceiling at 300

Whatever remains over 300 after Phase 1's shrinkage and Tasks 22–26. Measured before this
task started, the candidates are: `Header.jsx` (481) · `UNHousing.jsx` (477) ·
`BookingList.jsx` (448) · `PropertyInterests.jsx` (406) · `AdminHeader.jsx` (399) ·
`InvestmentCalculator.jsx` (396) · `ClientDetail.jsx` (381) · `About.jsx` (364) ·
`Dashboard.jsx` (358) · `CommunicationTimeline.jsx` (351) · `AdminLayout.jsx` (329).

**Files:**
- Modify: each file still over 300, splitting by its own internal sections
- Modify: `file-size-budget.json` (to 300)
- Modify: `vitest.config.js` (raise the coverage floor)
- Modify: `ROADMAP.md` (the gaps table)

**Interfaces:**
- Consumes: everything built in Phase 2.
- Produces: nothing new — this is the tail.

- [ ] **Step 1: Re-measure**

```bash
find src -name '*.jsx' -o -name '*.js' | grep -v __tests__ | xargs wc -l | sort -rn | head -20
```

Work the list top-down. **`UNHousing.jsx` is exempt until Phase 4** — Task 34 deletes 90
lines of hardcoded inventory from it, and splitting it first means splitting it twice.
Note the exemption in `file-size-budget.json` and set the ceiling to `max(300, UNHousing's
line count)` until Phase 4 closes it.

- [ ] **Step 2: For each file over the ceiling, extract its largest section**

Run after each: `npm run test:run && npx vitest run src/test/a11y`.

- [ ] **Step 3: Set the ceiling to 300**

```bash
npm run size:ratchet -- --update
cat file-size-budget.json
```

Expected: `"max": 300` or lower (or the UNHousing exemption, documented).

- [ ] **Step 4: Raise the coverage floor**

```bash
npm run test:coverage
```

Set each threshold about a point under its measurement, with a comment in the file's
established style explaining that Phase 2 added hook and component unit tests over surfaces
that previously had none.

- [ ] **Step 5: Update the roadmap**

In `ROADMAP.md`, set **Files over 700 lines** to `0 ✅` and record the new largest file.

- [ ] **Step 6: Run everything and push Phase 2**

```bash
npm run lint
npm run test:coverage
npm run test:a11y
npm run build
npm run size:ratchet
git add -A
git commit -m "refactor: bring every source file under 300 lines"
git push
```

**Phase 2 exit, verified:** `npm run size:ratchet` passes at 300 · the three hooks exist and
are used, not re-implemented · axe still reports zero violations across both suites · the
palette and label ratchets are unmoved.

---

# Phase 3 — The performance budget

**Exit:** first-load JS + CSS under 100 kB gzip, `bundle-budget.json` lowered to match, and
Lighthouse Performance ≥ 90 on the mobile profile, gated in CI.

**The arithmetic this phase is betting on.** Today's 215.9 kB is six assets. Three of them
should not be in a first load at all:

| Asset | Today | After | Why |
|---|---:|---:|---|
| `vendor-supabase` | 54.9 | 0 | Task 29 — dynamically imported behind `getSupabase()` |
| `vendor-ui` (framer-motion + react-calendar) | 50.4 | 0 | Tasks 28 and 30 — react-calendar is admin-only and was glued to framer-motion; framer-motion is only in first load because the eager `Header` imports it |
| `vendor-icons` | 8.6 | ~3 | Task 28 — the grouping forced every route's icons into one eager chunk |
| `index` | 36.0 | ~30 | Task 31 — Analytics, SpeedInsights and MaintenancePage leave the entry |
| `vendor-react` | 52.9 | 52.9 | The floor. React, React-DOM and the router are the app. |
| CSS | 13.0 | 13.0 | Untouched here; the raw-size lead is ROADMAP Block 2's |
| **Total** | **215.9** | **~99** | |

That lands within a kilobyte or two of the target, which is close enough that it may not
make it. **If the measurement comes in between 100 and 110 kB, record the measured number,
lower `bundle-budget.json` to it, and write the remaining lead into ROADMAP.md rather than
declaring the target met.** ROADMAP rule 3 and the two wrong CSS predictions already on the
record are the reason this paragraph exists.

---

### Task 28: Delete the `manualChunks` grouping

The cheapest change in the block, and it is first because it changes what every later
measurement means.

**Files:**
- Modify: `vite.config.js:20-40`
- Create: `scripts/__tests__/firstLoadComposition.test.js`
- Modify: `bundle-budget.json`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing new — a build-output change only.

- [ ] **Step 1: Record the baseline**

```bash
npm run build
npm run bundle:report
```

Write the six-row table into the commit body. It is the before-image for the rest of the
phase.

- [ ] **Step 2: Write the failing test**

Create `scripts/__tests__/firstLoadComposition.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

/**
 * Asserts on what dist/index.html asks the browser to fetch before the app can
 * render. It needs a build; when there is no dist/ it skips rather than fails,
 * so a plain `npm run test:run` on a clean checkout stays green. CI builds, and
 * `npm run bundle:report` is the blocking gate either way.
 */
const html = () => readFileSync('dist/index.html', 'utf8');
const describeBuilt = existsSync('dist/index.html') ? describe : describe.skip;

describeBuilt('first-load composition', () => {
  it('does not preload an admin-only calendar library', () => {
    // react-calendar is imported by exactly one admin component, and
    // manualChunks glued it to framer-motion in vendor-ui — so every visitor
    // downloaded it. This is the assertion that keeps it out.
    expect(html()).not.toMatch(/vendor-ui/);
  });
});
```

- [ ] **Step 3: Run it to make sure it fails**

Run: `npm run build && npx vitest run scripts/__tests__/firstLoadComposition.test.js`
Expected: FAIL — `dist/index.html` preloads `vendor-ui`.

- [ ] **Step 4: Delete the grouping**

In `vite.config.js`, replace the `rollupOptions` block with:

```js
  build: {
    // No manualChunks.
    //
    // The four hand-written groups cost more than they bought. `vendor-ui`
    // grouped framer-motion with react-calendar; framer-motion is imported by
    // the eagerly-loaded Header, so Rollup preloaded the whole group and every
    // first-time visitor downloaded an admin calendar library. `vendor-icons`
    // did the same thing for lucide-react: every route's icons in one eager
    // chunk. Rollup's default splitting follows the actual import graph, which
    // is the thing a manual grouping keeps overriding by accident.
    //
    // Measured 2026-09-XX: first load <before> kB -> <after> kB gzip.
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    sourcemap: false,
  },
```

Also trim `optimizeDeps.include` to `['react', 'react-dom', 'react-router-dom']` — it is a
dev-server pre-bundling hint, and listing `@supabase/supabase-js` there while Task 29 makes
it dynamic is a contradiction waiting to confuse someone.

- [ ] **Step 5: Rebuild and measure**

```bash
npm run build
npm run bundle:report
npx vitest run scripts/__tests__/firstLoadComposition.test.js
```

Expected: the test passes and the total falls. **Record the real number** and fill it into
the comment above.

- [ ] **Step 6: Lower the budget and commit**

```bash
node scripts/bundle-report.mjs --update
git add vite.config.js bundle-budget.json scripts/__tests__/firstLoadComposition.test.js
git commit -m "perf: drop the manualChunks grouping that preloaded admin-only libraries"
```

Add the measured before/after to `bundle-budget.json`'s `note`.

---

### Task 29: Load the Supabase client dynamically

54.9 kB gzip — the single largest first-load asset — for a library the home page needs
*after* it paints, not before. This is the change Phase 1 was sequenced to make cheap: eight
service files and two contexts, instead of twenty-five call sites.

**Files:**
- Create: `src/services/client.js`
- Create: `src/services/__tests__/client.test.js`
- Modify: all eight service modules from Phase 1
- Modify: `src/test/setup.jsx` (mock `@/services/client` instead of `@/utils/supabaseClient`)
- Modify: `src/contexts/AuthContext.jsx`
- Delete: `src/utils/supabaseClient.js`
- Modify: `vitest.config.js` (the env comment about the deleted module)
- Modify: `eslint.config.js` (the restricted-import group)
- Modify: `bundle-budget.json`

**Interfaces:**
- Consumes: `@supabase/supabase-js` (dynamically).
- Produces: `getSupabase() -> Promise<SupabaseClient>` — memoised; the module is fetched
  once and the client constructed once.
- **Breaking change for every service:** `supabase.from(...)` becomes
  `(await getSupabase()).from(...)`. Every service function is already `async`, so no
  signature changes — but `onAuthStateChange` and `subscribeToSettings` become `async` and
  return a `Promise<() => void>`. Their two callers are updated in this task.

- [ ] **Step 1: Write the failing test**

Create `src/services/__tests__/client.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

// This one file tests the real module, so it opts out of the global mock.
vi.unmock('@/services/client');

beforeEach(() => vi.resetModules());

describe('getSupabase', () => {
  it('constructs the client once, however many callers ask for it', async () => {
    const createClient = vi.fn(() => ({ from: vi.fn() }));
    vi.doMock('@supabase/supabase-js', () => ({ createClient }));

    const { getSupabase } = await import('../client');
    const [a, b] = await Promise.all([getSupabase(), getSupabase()]);

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });

  it('throws a legible error when the environment is not configured', async () => {
    vi.doMock('@supabase/supabase-js', () => ({ createClient: vi.fn() }));
    vi.stubEnv('VITE_SUPABASE_URL', '');

    const { getSupabase } = await import('../client');
    await expect(getSupabase()).rejects.toThrow(/VITE_SUPABASE_URL/);

    vi.unstubAllEnvs();
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/services/__tests__/client.test.js`
Expected: FAIL — `Failed to resolve import "../client"`.

- [ ] **Step 3: Write `src/services/client.js`**

```js
/**
 * The Supabase client, fetched when something first needs it.
 *
 * `@supabase/supabase-js` is 54.9 kB gzip — the largest single asset in the
 * first load, for a library nothing needs before the first paint. A static
 * import puts it in the entry graph no matter which route is open, so this is
 * a dynamic one, memoised.
 *
 * This module is the only place in the app that constructs a client. There is
 * deliberately no service-key client: Vite inlines every VITE_* variable into
 * the bundle as a plain string, so a privileged key behind that prefix is a
 * published key. That is what caused the 2026-09-01 incident (audit finding
 * C-1), and the note is kept here because this file inherited the job.
 */
let clientPromise = null;

export function getSupabase() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_KEY;

      if (!url || !key) {
        throw new Error(
          'Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY. Add them to .env and restart the dev server.'
        );
      }

      const { createClient } = await import('@supabase/supabase-js');
      return createClient(url, key);
    })();
  }

  return clientPromise;
}

/** Test seam: drops the memoised client so a suite can construct a fresh one. */
export function resetSupabaseClient() {
  clientPromise = null;
}
```

> The old module threw at *import* time on a missing variable; this one throws at *first
> use*. That is the better failure — a missing variable now fails the query that needed it,
> with a message, instead of taking down the module graph before React mounts.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/services/__tests__/client.test.js`
Expected: PASS, 2 tests.

- [ ] **Step 5: Rewrite the eight services**

In each of `properties.js`, `bookings.js`, `clients.js`, `clientInterests.js`,
`clientCommunications.js`, `settings.js`, `auth.js`, `dashboard.js`:

```js
// before
import { supabase } from '@/utils/supabaseClient';
export async function listFeatured({ limit = 3 } = {}) {
  return unwrapList(await supabase.from(TABLE).select('*')..., { ... });
}

// after
import { getSupabase } from './client';
export async function listFeatured({ limit = 3 } = {}) {
  const db = await getSupabase();
  return unwrapList(await db.from(TABLE).select('*')..., { ... });
}
```

`subscribeToSettings` and `onAuthStateChange` become async:

```js
export async function subscribeToSettings(onChange) {
  const db = await getSupabase();
  const channel = db.channel('admin_settings_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, onChange)
    .subscribe();
  return () => { db.removeChannel(channel); };
}
```

- [ ] **Step 6: Update the two subscribing effects**

`SettingsContext.jsx` and `AuthContext.jsx`:

```jsx
useEffect(() => {
  let stop;
  let cancelled = false;

  subscribeToSettings(() => fetchSettings()).then((unsubscribe) => {
    // The provider may have unmounted while the client was being fetched.
    if (cancelled) unsubscribe();
    else stop = unsubscribe;
  });

  return () => {
    cancelled = true;
    stop?.();
  };
}, [fetchSettings]);
```

The `cancelled` flag is not optional: the client now arrives asynchronously, so a fast
unmount can resolve after the cleanup has already run and leave a live subscription behind.

- [ ] **Step 7: Move the global test mock**

In `src/test/setup.jsx`, change `vi.mock('@/utils/supabaseClient', ...)` to
`vi.mock('@/services/client', ...)`, exporting the same double behind `getSupabase`:

```jsx
vi.mock('@/services/client', () => {
  const client = { /* the existing double: from, rpc, channel, auth, ... */ };
  return {
    getSupabase: vi.fn(async () => client),
    resetSupabaseClient: vi.fn(),
    // Kept as a named export so tests can reach the double directly, exactly as
    // they used to reach `supabase`.
    __client: client,
  };
});
```

Update the service tests' import from
`import { supabase } from '@/utils/supabaseClient'` to
`import { __client as supabase } from '@/services/client'`. Nothing else in them changes —
`mockFrom(supabase, ...)` still works, because it is the same object.

- [ ] **Step 8: Delete the old module and update the two configs**

```bash
git rm src/utils/supabaseClient.js
```

In `eslint.config.js`, the restricted-import group becomes
`['@supabase/supabase-js', '**/services/client', '@/services/client']` — components and
pages must not construct a client either. In `vitest.config.js`, rewrite the `env` comment:
the placeholders are still needed (the client reads them), but the "throws at import time"
reasoning is now wrong and a stale comment is worse than none.

- [ ] **Step 9: Run everything and measure**

```bash
npm run lint
npm run test:run
npm run build
npm run bundle:report
```

Expected: `vendor-supabase` (or whatever Rollup now names the Supabase chunk) is **absent
from the first-load table**, and the total is down by roughly 55 kB.

- [ ] **Step 10: Lower the budget and commit**

```bash
node scripts/bundle-report.mjs --update
git add -A
git commit -m "perf: load the Supabase client dynamically, out of the first-load graph"
```

---

### Task 30: Take framer-motion out of the eager chrome

`Header.jsx` is the only eagerly-loaded module that imports framer-motion, and that single
import is what keeps a ~50 kB animation library in every first load. Every other importer is
behind a lazy route and pays for itself.

**Files:**
- Modify: `src/components/Header.jsx`
- Modify: `src/components/__tests__/Header.disclosure.test.jsx`
- Modify: `bundle-budget.json`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new. The header's markup, classes and ARIA are unchanged; only the
  mechanism that animates the mobile menu changes.

- [ ] **Step 1: Write the failing test**

Add to `src/components/__tests__/Header.disclosure.test.jsx`:

```jsx
it('imports no animation library, because it is in every first load', () => {
  // Header is rendered by PublicLayout, which App.jsx imports statically. Any
  // library it touches is downloaded before the first paint on every route,
  // including the ones that never animate anything.
  const source = readFileSync('src/components/Header.jsx', 'utf8');
  expect(source).not.toMatch(/framer-motion/);
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/components/__tests__/Header.disclosure.test.jsx`
Expected: FAIL — `Header.jsx:3` imports `motion, AnimatePresence`.

- [ ] **Step 3: Replace the mobile menu animation with a CSS transition**

```jsx
// before
<AnimatePresence>
  {isMenuOpen && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="md:hidden"
    >
      {/* menu */}
    </motion.div>
  )}
</AnimatePresence>

// after
<div
  id="mobile-menu"
  hidden={!isMenuOpen}
  className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${
    isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
  }`}
>
  {/* menu, moved verbatim */}
</div>
```

**Keep every `aria-expanded`, `aria-controls` and `id` exactly as they are.** The disclosure
test and the axe suite both assert on them, and `Header.disclosure.test.jsx` exists because
this menu's semantics have been wrong before.

> If the header's animation is genuinely worth keeping, the alternative is framer-motion's
> `LazyMotion` with `m` and `features={() => import('framer-motion').then(m => m.domAnimation)}`,
> which keeps ~5 kB in the entry and fetches the rest. Prefer the CSS transition: it is
> smaller, it needs no library, and `prefers-reduced-motion` is already handled by the
> project's Tailwind config.

- [ ] **Step 4: Run the tests and measure**

```bash
npx vitest run src/components/__tests__/Header.disclosure.test.jsx src/test/a11y
npm run build
npm run bundle:report
```

Expected: tests green; framer-motion no longer appears in the first-load table.

- [ ] **Step 5: Lower the budget and commit**

```bash
node scripts/bundle-report.mjs --update
git add src/components/Header.jsx src/components/__tests__/Header.disclosure.test.jsx bundle-budget.json
git commit -m "perf: drop framer-motion from the eagerly-loaded header"
```

---

### Task 31: Trim the entry chunk

**Files:**
- Modify: `src/App.jsx`
- Modify: `bundle-budget.json`
- Modify: `ROADMAP.md`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new.

- [ ] **Step 1: Write the failing test**

Add to `scripts/__tests__/firstLoadComposition.test.js`:

```js
it('keeps first load under 100 kB gzip', () => {
  // The ROADMAP Block 3.3 target. bundle-report.mjs is the blocking gate; this
  // asserts the target itself rather than whatever the budget currently says,
  // so a budget that was lowered to a measurement cannot quietly become the goal.
  const budget = JSON.parse(readFileSync('bundle-budget.json', 'utf8'));
  expect(budget.firstLoadGzipKb).toBeLessThan(100);
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run scripts/__tests__/firstLoadComposition.test.js`
Expected: FAIL — the budget is still above 100 after Tasks 28–30.

- [ ] **Step 3: Make the analytics scripts lazy**

```jsx
const Analytics = lazy(() =>
  import('@vercel/analytics/react').then((module) => ({ default: module.Analytics }))
);
const SpeedInsights = lazy(() =>
  import('@vercel/speed-insights/react').then((module) => ({ default: module.SpeedInsights }))
);

// ...rendered inside the existing <Suspense>, which already has a fallback.
```

Analytics that delays the first paint is measuring a page it made slower.

- [ ] **Step 4: Make `MaintenancePage` lazy**

It is imported statically for a branch that is false on every normal load:

```jsx
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));
```

Both render sites are already inside a `Suspense` boundary; the early-return branch at the
top of `App()` needs its own wrapper:

```jsx
if (maintenanceConfig.enabled) {
  return (
    <Suspense fallback={null}>
      <MaintenancePage {...maintenanceConfig} />
    </Suspense>
  );
}
```

- [ ] **Step 5: Measure, and decide honestly**

```bash
npm run build
npm run bundle:report
```

- **Under 100 kB:** lower the budget, and the test from Step 1 passes.
- **Between 100 and 110 kB:** lower the budget to the measurement, leave the Step 1 test
  **failing and marked `it.fails` with the measured number in a comment**, and write the
  remaining lead into ROADMAP.md. The next candidates, in order: `react-router-dom` inside
  `vendor-react` (~8 kB, and not removable without changing routing); the 76.4 kB raw
  stylesheet's unused-utility pruning (ROADMAP Block 2's open lead, 13.0 kB gzip today);
  `react-hot-toast` and `react-helmet-async` in the entry.
- **Above 110 kB:** something in Tasks 28–30 did not land. Re-read the asset table before
  writing any more code.

- [ ] **Step 6: Update the roadmap with the measured number**

Set **First-load JS (gzip)** in the gaps table to what was measured, not to the target.

- [ ] **Step 7: Commit**

```bash
node scripts/bundle-report.mjs --update
git add src/App.jsx bundle-budget.json scripts/__tests__/firstLoadComposition.test.js ROADMAP.md
git commit -m "perf: lazy-load analytics and the maintenance page out of the entry chunk"
```

---

### Task 32: Lighthouse in CI, mobile profile

**Files:**
- Create: `lighthouserc.json`
- Modify: `package.json` (devDependency `@lhci/cli`, script `lighthouse`)
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `npm run preview` (Vite's static server) and the built `dist/`.
- Produces: `npm run lighthouse`, and a CI job that fails under the asserted scores.

- [ ] **Step 1: Install and configure**

```bash
npm install --save-dev @lhci/cli
```

Create `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run preview -- --port 4173",
      "url": [
        "http://localhost:4173/",
        "http://localhost:4173/properties",
        "http://localhost:4173/contact"
      ],
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "formFactor": "mobile",
        "screenEmulation": {
          "mobile": true,
          "width": 412,
          "height": 823,
          "deviceScaleFactor": 1.75,
          "disabled": false
        },
        "throttlingMethod": "simulate"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

> `numberOfRuns: 3` because a single Lighthouse run on a shared CI runner is noisy enough to
> fail a gate on a good commit. Three runs and the median is the difference between a gate
> people trust and one they rerun until it passes.
>
> Accessibility is asserted at 0.95 rather than 1.0 on purpose: axe already gates
> accessibility properly, in both themes, over eleven surfaces. This assertion is a smoke
> alarm, not the fire door — and Lighthouse's own accessibility score includes checks axe
> cannot make in jsdom, which is exactly what makes it worth having as well.

Add to `package.json`:

```json
"lighthouse": "lhci autorun",
```

- [ ] **Step 2: Run it locally**

```bash
npm run build
npm run lighthouse
```

Expected: three URLs, three runs each, and a printed score table. **Record the performance
score.** If it is under 0.9, do not lower the assertion — read the report's opportunities
and either fix them or, if the fix belongs to another block, note it in ROADMAP.md and set
the assertion to the measured score *as a ratchet* with a comment saying so. A gate at a
number nobody has ever hit is not a gate.

- [ ] **Step 3: Add the CI job**

In `.github/workflows/ci.yml`, as a job after `verify`:

```yaml
  lighthouse:
    name: Lighthouse (mobile)
    runs-on: ubuntu-latest
    needs: verify
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - name: Install
        run: npm ci
      - name: Build
        run: npm run build
      # Three runs per URL and the median, because one run on a shared runner is
      # noisy enough to fail a gate on a good commit. The bundle budget catches
      # weight; this catches everything weight does not — render-blocking
      # requests, layout shift, and an image nobody sized.
      - name: Lighthouse
        run: npm run lighthouse
```

- [ ] **Step 4: Update the roadmap**

Set **Lighthouse Performance (mobile)** in the gaps table to the measured score.

- [ ] **Step 5: Commit and push Phase 3**

```bash
git add lighthouserc.json package.json package-lock.json .github/workflows/ci.yml ROADMAP.md
git commit -m "ci: gate Lighthouse performance on the mobile profile"
git push
```

**Phase 3 exit, verified:** `npm run bundle:report` passes against a budget that is lower
than 219 · the first-load table contains no Supabase, no framer-motion and no react-calendar
· `npm run lighthouse` passes its assertions · ROADMAP.md carries the measured numbers, not
the targets.

---

# Phase 4 — The UN inventory

> **⛔ Blocked on ROADMAP Block 1.** Migrations `009`–`012` must be applied by the owner
> first. Do not run this against a database whose `anon` role still has open grants: this
> phase inserts inventory rows, and on an unclosed database anyone could edit them.

**Exit:** `UNHousing.jsx` renders inventory from the database; the admin CRM manages those
rows; no invented prices, no Unsplash placeholders, no dates that go stale on their own.

---

### Task 33: Migration `013_property_segments.sql`

**Files:**
- Create: `supabase/migrations/013_property_segments.sql`
- Create: `supabase/seeds/013_un_inventory.sql`
- Create: `supabase/migrations/__tests__/013_property_segments.test.js`
- Modify: `supabase/migrations/000_baseline.sql` (the transcribed schema)

**Interfaces:**
- Consumes: the `properties` table from `000_baseline.sql`.
- Produces: `properties.segment TEXT` — `NULL` for ordinary listings, `'un-diplomatic'` for
  UN and diplomatic housing — plus an index and a read policy that treats a segmented row
  exactly like any other listing.

- [ ] **Step 1: Write the failing test**

Create `supabase/migrations/__tests__/013_property_segments.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const sql = readFileSync('supabase/migrations/013_property_segments.sql', 'utf8');

describe('013_property_segments', () => {
  it('is additive and idempotent, like every migration in this repo', () => {
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS/i);
    expect(sql).not.toMatch(/DROP COLUMN/i);
    expect(sql).not.toMatch(/DROP TABLE/i);
  });

  it('indexes the segment, because every UN page load filters on it', () => {
    expect(sql).toMatch(/CREATE INDEX IF NOT EXISTS.*segment/is);
  });

  it('does not widen any grant to anon', () => {
    // Block 1 spent a day closing these. A migration that re-opens one would
    // undo it silently.
    expect(sql).not.toMatch(/GRANT .* TO anon/i);
    expect(sql).not.toMatch(/USING \(true\)/i);
  });

  it('constrains the segment to known values', () => {
    expect(sql).toMatch(/CHECK/i);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run supabase/migrations/__tests__/013_property_segments.test.js`
Expected: FAIL — the file does not exist.

- [ ] **Step 3: Write the migration**

Create `supabase/migrations/013_property_segments.sql`:

```sql
-- =============================================================================
-- 013 — property segments
--
-- UNHousing.jsx shipped a literal `unProperties` array: three listings with
-- Unsplash photographs, invented prices and availability dates in the past.
-- ROADMAP.md Block 3.4 calls that a known temporary defect; this is the schema
-- that closes it, so the admin CRM manages UN inventory like any other listing.
--
-- A column, not a table. UN housing is a property with an audience, and every
-- query, policy, admin screen and index that already exists for `properties`
-- applies to it unchanged. A parallel table would have needed all of them again.
--
-- Additive and idempotent, like every migration here: applying it twice does
-- nothing the second time, and it drops nothing.
-- =============================================================================

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS segment TEXT;

-- NULL means "an ordinary listing", which is what every existing row is. The
-- constraint names the vocabulary so a typo becomes an error at write time
-- rather than an empty page at read time.
ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_segment_check;

ALTER TABLE public.properties
  ADD CONSTRAINT properties_segment_check
  CHECK (segment IS NULL OR segment IN ('un-diplomatic', 'corporate', 'student'));

-- Every load of /international/un-housing filters on this.
CREATE INDEX IF NOT EXISTS idx_properties_segment
  ON public.properties(segment)
  WHERE segment IS NOT NULL;

COMMENT ON COLUMN public.properties.segment IS
  'Audience this listing is marketed to. NULL for the general market. Set by the admin CRM; read by the segment pages under /international.';

-- No policy changes. A segmented row is a property: it is read by whatever
-- policy 009 already installed for public reads and written by whatever policy
-- governs admin writes. Adding a policy here would be adding a second answer to
-- a question that already has one.
```

- [ ] **Step 4: Write the seed**

Create `supabase/seeds/013_un_inventory.sql`:

```sql
-- =============================================================================
-- Seed: UN and diplomatic inventory
--
-- This is a SEED, not a migration. It is applied by hand, once, and it exists
-- so the page has something real to render on the day the column ships.
--
-- The three rows below are transcribed from the hardcoded array in
-- UNHousing.jsx, MINUS everything that was invented: no Unsplash URLs, no
-- availability dates. Prices are carried across as they were and are marked for
-- the owner to confirm — a price nobody has verified is worse in a database
-- than in a component, because in a database it looks authoritative.
--
--   TODO(owner): confirm each price and add real photographs through the admin
--   CRM before /international/un-housing is linked from the navigation.
-- =============================================================================

INSERT INTO public.properties
  (title, description, price, property_type, purpose, status, segment,
   location, address, city, bedrooms, bathrooms, area_sqft, amenities, images)
VALUES
  ('Executive Apartment - Gigiri',
   'Furnished executive apartment 500m from the UN complex. 24/7 armed security, two parking bays. Minimum six-month lease. Suited to UN staff, diplomats and international NGOs.',
   2500, 'apartment', 'rent', 'available', 'un-diplomatic',
   'Gigiri', '500m from UN Complex, Gigiri', 'Nairobi',
   3, 2, 1615,
   ARRAY['High-speed Internet', 'Generator Backup', 'Water Backup', 'DSTV', 'Gym', 'Swimming Pool'],
   ARRAY[]::TEXT[]),

  ('Luxury Villa - Runda',
   'Furnished villa in a gated Runda community, 3km from the UN complex. 24/7 security, three parking bays, staff quarters. Minimum twelve-month lease. Suited to senior UN officials and ambassadors.',
   4500, 'villa', 'rent', 'available', 'un-diplomatic',
   'Runda', 'Runda Estate, 3km from UN', 'Nairobi',
   4, 3, 3014,
   ARRAY['High-speed Internet', 'Generator', 'Water Backup', 'Garden', 'Staff Quarters', 'Swimming Pool'],
   ARRAY[]::TEXT[]),

  ('Modern Townhouse - Rosslyn',
   'Furnished townhouse in Rosslyn Valley, 4km from the UN complex. Perimeter wall and security guard, two parking bays. Flexible three-to-twelve-month lease. Suited to UN consultants and international professionals.',
   1800, 'townhouse', 'rent', 'available', 'un-diplomatic',
   'Rosslyn', 'Rosslyn Valley, 4km from UN', 'Nairobi',
   3, 2, 1938,
   ARRAY['High-speed Internet', 'Generator', 'DSTV', 'Modern Kitchen', 'Balcony'],
   ARRAY[]::TEXT[]);
```

> `bathrooms` is `INTEGER` in the live schema and the hardcoded array had `2.5` for the
> townhouse. It is written as `2` here. That is a real loss of information, and the right
> fix — a numeric column — is a schema change that belongs to whoever needs half-bathrooms
> across the whole table, not to this seed. Say so in the commit body.
>
> `size` in the array was square **metres** (150, 280, 180); `area_sqft` is square feet.
> The values above are converted (×10.764). Getting this wrong would advertise a 150-square-foot
> executive apartment.

- [ ] **Step 5: Update the transcribed baseline**

Add `segment VARCHAR` to the `ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS` block
in `000_baseline.sql`, with a one-line comment pointing at 013. That file is the
transcription of the live schema and is only useful while it stays true.

- [ ] **Step 6: Run the test and commit**

Run: `npx vitest run supabase/migrations/__tests__/013_property_segments.test.js`
Expected: PASS, 4 tests.

```bash
git add supabase/migrations/013_property_segments.sql supabase/seeds/013_un_inventory.sql supabase/migrations/__tests__ supabase/migrations/000_baseline.sql
git commit -m "feat(db): add a property segment column for UN and diplomatic inventory"
```

- [ ] **Step 7: Hand the migration to the owner**

Applying it is owner work, like Block 1. Write the exact steps into the commit body or a
short note in `ROADMAP.md`: run `013` in the SQL editor, then the seed, then confirm three
rows come back from
`select id, title, price, segment from properties where segment = 'un-diplomatic';`.

---

### Task 34: Serve `UNHousing.jsx` from the database

**Files:**
- Modify: `src/pages/UNHousing.jsx:23-80` (delete the array) and its property grid
- Modify: `src/services/properties.js` (add `listBySegment` and `propertyQueries.segment`)
- Modify: `src/services/__tests__/properties.test.js`
- Modify: `src/pages/admin/properties/PropertyFormModal.jsx` (a segment field)
- Create: `src/pages/__tests__/UNHousing.test.jsx`
- Modify: `file-size-budget.json`, `ROADMAP.md`

**Interfaces:**
- Consumes: `propertyQueries.segment(segment)`.
- Produces:
  - `listBySegment(segment) -> Property[]` in `properties.js`
  - `propertyQueries.segment(segment) -> { queryKey, queryFn, staleTime }`

- [ ] **Step 1: Write the failing test**

Create `src/pages/__tests__/UNHousing.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { render, screen } from '@/test/utils/renderWithProviders';
import UNHousing from '../UNHousing';

vi.mock('@/services/properties', () => ({
  propertyQueries: {
    segment: () => ({
      queryKey: ['properties', 'segment', 'un-diplomatic'],
      queryFn: () =>
        Promise.resolve([
          { id: 1, title: 'Executive Apartment - Gigiri', price: 2500, bedrooms: 3, bathrooms: 2, images: [] },
        ]),
    }),
  },
}));

describe('UNHousing', () => {
  it('renders inventory from the database', async () => {
    render(<UNHousing />);
    expect(await screen.findByText('Executive Apartment - Gigiri')).toBeInTheDocument();
  });

  it('carries no hardcoded inventory', () => {
    const source = readFileSync('src/pages/UNHousing.jsx', 'utf8');
    expect(source).not.toMatch(/unsplash/i);
    expect(source).not.toMatch(/unProperties\s*=\s*\[/);
    // Fixed dates in a component go stale silently; this one was 2026-02-01.
    expect(source).not.toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('carries an empty state, for the day before the seed runs', () => {
    // An empty segment must read as "nothing listed right now", not as a
    // broken page. Asserted on the source rather than by re-rendering with a
    // second mock, because the module mock above is file-scoped.
    const source = readFileSync('src/pages/UNHousing.jsx', 'utf8');
    expect(source).toMatch(/No UN or diplomatic listings/);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/pages/__tests__/UNHousing.test.jsx`
Expected: FAIL — the page renders its own array and the source assertions fail.

- [ ] **Step 3: Add `listBySegment` to `properties.js`**

```js
export async function listBySegment(segment) {
  const db = await getSupabase();
  return unwrapList(
    await db
      .from(TABLE)
      .select('*')
      .eq('segment', segment)
      .eq('status', 'available')
      .order('created_at', { ascending: false }),
    { table: TABLE, operation: 'listBySegment' }
  );
}
```

and to `propertyQueries`:

```js
  segment: (segment) => ({
    queryKey: queryKeys.properties.segment(segment),
    queryFn: () => listBySegment(segment),
    staleTime: STALE_TIME.standard,
    enabled: Boolean(segment),
  }),
```

Add a test for it in `properties.test.js` asserting both `eq` calls.

- [ ] **Step 4: Rewrite the page's inventory section**

```jsx
import { useQuery } from '@tanstack/react-query';
import { propertyQueries } from '@/services/properties';

const { data: properties = [], isLoading } = useQuery(propertyQueries.segment('un-diplomatic'));
```

Delete the `unProperties` array entirely. Map the card's fields onto the real columns:
`property.address`, `property.price`, `property.bedrooms`, `property.bathrooms`,
`property.area_sqft`, `property.amenities`, `property.images?.[0]`.

Four fields in the array have no column — `distance`, `furnished`, `security`,
`preferredTenants`, `leaseTerms`. **Do not add five columns for one page.** They are prose,
and they are already in the seeded `description`. Render `description` where the card showed
them, and delete the badges that have no source. Say so in the commit body.

The empty and loading states:

```jsx
{isLoading && <LoadingSkeleton count={3} />}
{!isLoading && properties.length === 0 && (
  <p className="text-content-muted text-center py-12">
    No UN or diplomatic listings are available right now. Call us on{' '}
    {phone} and we will match you to something that has not been listed yet.
  </p>
)}
```

- [ ] **Step 5: Add the segment field to the admin form**

A `<Select>` in `PropertyFormModal.jsx` offering "General market" (`null`), "UN &
diplomatic", "Corporate", "Student" — the vocabulary the CHECK constraint allows, so an
admin cannot type a value the database will reject. Use the project's `src/components/ui/Select.jsx`
primitive and give it a label; the label ratchet is at 0 and the axe suite covers this
screen.

- [ ] **Step 6: Run everything**

```bash
npm run lint
npm run test:run
npm run test:a11y
npm run size:ratchet
npm run build
npm run bundle:report
```

Expected: all green. `UNHousing.jsx` should now be well under 300 lines, which closes the
exemption Task 27 left open.

- [ ] **Step 7: Update the roadmap and push**

Mark Block 3.4 done in `ROADMAP.md`, and remove the "ships placeholder inventory" caveat —
it is no longer true. Set the ceiling in `file-size-budget.json` to 300 with no exemption.

```bash
npm run size:ratchet -- --update
git add -A
git commit -m "feat(un-housing): serve UN inventory from the database"
git push
```

---

# Exit criteria — the whole block, checkable

Run these from a clean checkout on the merged branch. Every one is a command, not a
judgement.

| # | Criterion | Command | Passes when |
|---|---|---|---|
| 1 | No component or page imports the Supabase client | `grep -rl supabaseClient src/components src/pages` | prints nothing |
| 2 | The boundary is enforced, not merely reached | probe file + `npx eslint` (Task 17 Step 3) | one `no-restricted-imports` error |
| 3 | No inline query keys or stale times | `npx vitest run src/services/__tests__/queryKeys.discipline.test.js` | 2 passing, 0 skipped |
| 4 | No source file over 300 lines | `npm run size:ratchet` | exit 0 with `ceiling 300` |
| 5 | First-load JS + CSS under 100 kB gzip | `npm run build && npm run bundle:report` | budget under 100 and within it |
| 6 | Lighthouse Performance ≥ 90, mobile | `npm run lighthouse` | assertions pass |
| 7 | Accessibility unmoved | `npm run test:a11y` | 30+ assertions, 0 violations |
| 8 | The two Block 2 ratchets unmoved | `npm run palette:ratchet && npm run label:ratchet` | both exit 0 |
| 9 | Coverage floor higher than it was | `npm run test:coverage` | thresholds above 46/35/37/45 |
| 10 | UN inventory served from the database | `npx vitest run src/pages/__tests__/UNHousing.test.jsx` | 3 passing |
| 11 | Everything still builds | `npm run lint && npm run build && npm run check:console` | all exit 0 |

**The block is done when all eleven pass and ROADMAP.md's gaps table carries the measured
numbers.** Not the target numbers — the measured ones. If criterion 5 lands at 104 kB, the
roadmap says 104 kB and names the next lead.

---

## Risks, and what to do about them

**The service migration changes behaviour by accident.** Tasks 10–16 are mechanical, and
mechanical changes are where ROADMAP rule 6's codemod flattened a gradient nobody had
tested. The defence is that every migration task adds a test that would have failed before
it, and that the axe suite renders eleven of the surfaces being touched. *If a task cannot
find a test that would have failed before, it is probably changing behaviour it did not
mean to.*

**The dashboard's shape change (Task 12) leaves a stale reference.** It is the only
migration that renames variables inside JSX. The admin axe suite renders the Dashboard, so
a broken reference is a render crash rather than a blank tile — but list every rename in the
commit body anyway.

**Decomposition reintroduces a raw palette class or an unlabelled control.** Both are
ratcheted and both ratchets run in CI. Run them *between* extractions rather than after all
six, because a diff of six moved components hides which one did it.

**The bundle target is missed by a few kilobytes.** Likely — see the arithmetic at the head
of Phase 3. The plan's answer is to record the measured number and name the next lead, not
to raise the budget or quietly redefine "first load". Two wrong predictions about the CSS
bundle are already on this project's record; a third that gets covered up would be worse
than the first two.

**Phase 4 blocks on the owner.** Tasks 33 and 34 write a migration and a page that reads it,
but only the owner can apply it. If Block 1 is still open when Phase 3 finishes, ship Phases
1–3, mark Phase 4 as blocked in ROADMAP.md, and stop. Do not seed inventory into a database
whose `anon` role can still edit it.

**Two agents working in parallel.** ROADMAP rule 4 was written because two Version 10s
happened. The phases here are sequential by dependency; if this block is split across
agents, split it at a phase boundary, never inside one, and never let two agents hold
`src/services/` at once.

---

## Self-review notes

Run against the spec after writing, as the writing-plans skill requires.

**Spec coverage.** ROADMAP Block 3.1 → Tasks 1–17 (services module per domain ✓, TanStack
standardised ✓, query keys centralised ✓, the `grep` exit criterion ✓). 3.2 → Tasks 18–27
(`AdminProperties`/`AdminBookings`/`ServicesMain` split ✓, `usePagination`/`useFilters`/
`useCsvExport` ✓, nothing over 300 ✓). 3.3 → Tasks 28–32 (Supabase split out ✓, route
splitting — **see the note below** —, Lighthouse gate ✓). 3.4 → Tasks 33–34 ✓.

**One place where this plan disagrees with the spec, deliberately.** ROADMAP 3.3 asks for
"route-level code splitting on the public side (admin is already lazy)". Measured: the
public side is *already* fully lazy — `App.jsx:36-56` lazy-loads all eleven public routes.
The real cause of the first-load weight is different, and the plan attacks what was measured
rather than what was assumed: a `manualChunks` grouping that forces admin-only
`react-calendar` into the eager `vendor-ui` chunk, an eagerly-imported `Header` that pulls
in framer-motion, and two contexts that import Supabase before the first paint. Task 28's
commit body should say this, and ROADMAP 3.3's second bullet should be struck as already
done. **This is the plan's most important finding and the reason Phase 3 leads with a
six-line config deletion instead of a routing change.**

**Placeholder scan.** No "TBD", no "add error handling", no "similar to Task N". The one
`TODO` in the plan is inside a SQL seed and is addressed to the owner (confirm the prices
before linking the page), which is a real handoff rather than an unwritten step. Task 27 is
the least specific task in the plan by nature — it is a tail sweep — so it carries the
measured candidate list, the exemption rule for `UNHousing.jsx`, and a re-measure step
first.

**Type consistency, checked across tasks.** `listPage` returns `{ rows, count }` in Task 4
and is destructured that way in Task 14 ✓. `propertyQueries.detail(id)` carries its own
`enabled`, which is why Task 10 deletes the `if (id)` guard ✓. `getBookingStats` returns
`{ total, byStatus, byPriority }` in Task 5 and Task 13 reads `stats?.byStatus?.pending` ✓.
`useFilters` returns `setFilter(name, value)` and every component built in Tasks 22–26 takes
`onFilterChange(name, value)` ✓. `getSupabase()` is introduced in Task 29 and every service
written in Tasks 4–9 is rewritten there, not left half-migrated ✓. `queryKeys.bookings.all`
is the single invalidation target in Tasks 13, 23 ✓.

**Numbers this plan asserts that a reader should re-measure before trusting:** 22 direct
importers, 1,253-line largest file, 215.9 kB first load, and the six-row asset table. All
measured on `2e9f16f` on 2026-09-06 by the commands named beside them. Everything downstream
of Phase 1 will have moved by the time it is read.
