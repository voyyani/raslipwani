# Changelog

All notable changes to Raslipwani Properties.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Phase and Release
numbers refer to [`ROADMAP.md`](ROADMAP.md).

> **⚠️ Nothing in `[Unreleased]` is live.** Every entry below sits on the branch
> `feat/phase2-revenue-data-integrity` and has never been deployed. The security fixes in
> particular are **written but not applied** — the three migrations that close the data
> exposure require an owner to run them. See
> [`docs/HANDOFF-phase1-apply.md`](docs/HANDOFF-phase1-apply.md).

---

## [Unreleased] — branch `feat/phase2-revenue-data-integrity`

Verified 2026-09-02 (end of Release 2): **84 tests passing across 13 files**,
**0 ESLint errors**, coverage 61.7% lines behind an enforced ratcheting floor,
production build clean, **first-load bundle 229.8 kB gzip** under a 235 kB CI budget.

### Security

- **Removed the `service_role` key from the browser bundle.** `supabaseClient.js`
  exported a `supabaseAdmin` client built from `VITE_SUPABASE_SERVICE_KEY`, which meant a
  key that bypasses every row-level security policy was shipped in public JavaScript to
  every visitor. The export is deleted and `AdminProperties` now performs the same write
  through normal RLS. Verified: `dist/` contains zero JWT-shaped strings.
  🔑 *The old key is already public in bundles previously served and must still be rotated.*
- **Authored `007_emergency_lockdown.sql`** — revokes `anon`'s `DELETE`, `UPDATE`, and
  `TRUNCATE` grants and enables RLS on `bookings`, `clients`, `properties`, and `settings`,
  the four tables where it was switched off. 🔴 **Not applied.**
- **Authored `009_auth_rls_policies.sql`** — replaces all 19 `USING (true)` policies with
  policies that reference `auth.uid()`, and converts `bookings.assigned_agent_id` /
  `confirmed_by` from Clerk `text` IDs to `uuid references auth.users(id)`.
  🔴 **Not applied.**
- **Closed an open mail relay.** The replacement `/api/send-email` handler no longer
  accepts `to` or `subject` from the caller, as its predecessor did. An unauthenticated
  browser could otherwise have mailed arbitrary HTML to arbitrary recipients from the
  company domain. Recipients now derive from server-side environment configuration and
  from the submitted booking; all interpolated values are escaped.
- **Locked down anon booking inserts** so a submission cannot set `client_id`.
- **Scoped admin `SELECT` on `settings`** rather than revoking all access, which would
  have broken admin image upload silently.

### Added

- **Supabase Auth as the single identity system**, replacing Clerk:
  - `AuthContext` wrapping `supabase.auth` with session handling, `onAuthStateChange`
    subscription and teardown, and an `isAdmin` gate.
  - A branded `/admin/login` page, replacing Clerk's hosted UI.
  - `admin_users` table and a `security definer is_admin()` helper (`008`), with no
    self-service signup — admin accounts are provisioned, never registered.
  - `ProtectedRoute` rewritten to check `is_admin()`, not mere authentication.
    **Signed in ≠ admin.**
- **A working booking notification pipeline** (Phase 2.1). Four independent faults each
  blocked email delivery; all four are fixed. See *Fixed*. Delivery is fail-safe — the
  booking row is saved before notification is attempted, so a mail outage can never
  surface to a customer as a failed booking.
- **`/privacy` and `/terms` pages and routes**, written against the Kenyan Data
  Protection Act 2019, with a shared `LegalLayout`. Both are mandatory for a business
  processing personal data and neither existed.
- **A navigation link test** asserting every `Header` and `Footer` link resolves to a real
  route or an intentional external URL.
- **`ROADMAP.md`**, a codebase audit, and `docs/HANDOFF-phase1-apply.md`.
- **Continuous integration** (Phase 3.4) — `.github/workflows/ci.yml` runs
  `npm ci → lint → test:coverage → build → bundle budget` on every pull request and on
  pushes to `main`/`staging`, alongside a version-pinned `gitleaks` secret scan.
  `test:coverage` is used rather than `test:run` because only that command enforces the
  coverage floor. 🔑 *Branch protection still has to be enabled for these to block a merge.*
- **A build-time secret-name guard** — `scripts/guard-env-names.mjs` fails the build if any
  `VITE_*` variable name matches `SERVICE|SECRET|PRIVATE|PASSWORD|CREDENTIAL`, in either the
  build environment or a committed `.env*` file. Vite inlines `VITE_*` into the bundle as
  string literals, which is precisely how the `service_role` key was published. Wired as
  `prebuild`, so it covers local, CI and Vercel builds without anyone opting in. It prints
  names, never values.
- **A bundle budget** — `scripts/bundle-report.mjs` derives first-load weight from
  `dist/index.html` (entry module + `modulepreload` graph + stylesheet) rather than a
  hardcoded file list, so it tracks whatever the bundler actually emitted. The ceiling
  lives in `bundle-budget.json` and exceeding it fails CI.
- **Error boundaries** (Phase 3.3) — `src/components/ErrorBoundary.jsx` at three levels:
  root (above the providers), per-route (inside `Suspense`), and around the admin `Outlet`.
  Branded fallback with retry, plus an `onError` hook for a real reporter later. 5 tests.
- **`000_baseline.sql`** (Phase 2.2) — `properties`, `bookings` and `settings` had no
  creation migration at all, so the repository could not rebuild its own database. It can now.
- **`010_consolidate_settings.sql`** — retires the legacy `settings` table in favour of
  `admin_settings` and closes the admin RLS gap. `AdminProperties.jsx` repointed off the
  legacy table.
- **Migration-chain guard tests** — 5 automated checks for ordering, duplicate version
  numbers, invalid `CREATE POLICY IF NOT EXISTS`, and idempotency markers.

### Fixed

- **The test suite executed zero tests.** `src/test/setup.js` contained JSX under a `.js`
  extension, so esbuild refused it — and because it was the global `setupFiles` entry, it
  took every suite down with it. Renamed to `.jsx`. The suite now runs 74 tests.
- **Email had never been delivered, for four stacked reasons:**
  - the handler lived at `src/pages/api/send-email.js`, and Vercel serves functions only
    from a root-level `api/` directory, so it was never deployed;
  - the `vercel.json` catch-all rewrite `/(.*)` → `/` swallowed `/api/*`;
  - the implementation was a Mailtrap sandbox stub calling `require('nodemailer')` — a
    CommonJS call in an ESM file, for a package that was never a dependency;
  - the only `fetch('/api/send-email')` call site sat in `Services.jsx`, which is
    unrouted and unreachable. It is now wired into `ServicesMain.jsx` and `Contact.jsx`,
    the two forms customers actually reach.
- **Four persistent navigation links 404'd on every page** — `/internationalproperties`
  (now `/international`), `/construction-support` (now an external link to the
  Nairobuild sister brand), `/privacy`, and `/terms`.
- **The `/services` booking form could never save.** The insert was malformed.
- **A session race in `signOut`.** Both concurrency guards in `AuthContext` were
  closure-local and bypassed; they are now refs, and `signOut` claims a ticket.
  ⚠️ *This fix is not covered by a test — see Known Issues.*
- **A rejected `getSession()` left the app loading forever.** It now fails closed.
- **Test router context.** The global mock supplied no real router context and no env
  defaults, so any suite importing `supabaseClient` by relative path loaded the real
  module and crashed.
- **The first-load bundle regression, 446 kB → 229.8 kB gzip** (Phase 6.1). All seven
  admin pages and `AdminLayout` were statically imported, so every anonymous visitor
  downloaded FullCalendar, Quill and papaparse — and a minified map of the database
  schema. They are now `lazy()`. First load is below the 275 kB pre-regression baseline.
- **ESLint was measuring the wrong thing.** `eslint-plugin-react` was never installed, so
  ESLint could not treat a JSX element tag as a use of its identifier. An automated pass
  that trusted the old `no-unused-vars` output removed `motion` from 33 files and broke 6
  tests — `motion` *is* used, as `<motion.div>`. Both `eslint-plugin-react` and
  `eslint-plugin-jsx-a11y` are now installed and the config carries correct Node and test
  globals, which alone removed 7 `no-undef` false positives.
- **78 ESLint errors → 0** (Phase 3.2), including real defects the old configuration hid:
  ESM/CommonJS mismatches, missing `__dirname` recreation, an empty catch block, and dead
  `error`/`success` state in `AdminProperties.jsx` that was written but never read.
- **The migration chain could not replay** (Phase 2.2). `CREATE POLICY IF NOT EXISTS` —
  invalid in every PostgreSQL version — replaced with the guarded `DO $$ … pg_policies`
  pattern; `004` rewritten to drop its contradictory second `admin_settings` definition;
  `003a` made idempotent with `DROP TRIGGER IF EXISTS`; duplicate `003_` prefixes given a
  total ordering.
- **The three assertion-free tests in `AdminBookings.test.jsx`** now assert something.

### Removed

- **Clerk, entirely.** `@clerk/clerk-react` uninstalled, `ClerkProvider` and the
  `clerkPubKey` guard removed from `App.jsx`, `AuthButtons` and `AdminLayout` rewritten,
  `vendor-clerk` dropped from `manualChunks`, and `VITE_CLERK_PUBLISHABLE_KEY` removed
  from `.env`. 72 kB out of every page load.
  🔑 *The Vercel variable and the Clerk application itself still need deleting.*
- `src/pages/api/send-email.js`, superseded by the root-level handler.

### Known issues

| Issue | Impact | Tracked as |
|---|---|---|
| 🔴 **No migration has been applied.** `007`–`010` are written, reviewed and inert. | **Every exposure in the roadmap is still open in production.** Nothing else on this page matters more. | `docs/HANDOFF-phase1-apply.md` |
| The migration chain is guarded by static tests, not by an actual replay against a scratch Postgres. | The chain is *consistent*; that it *applies* is still unproven. | Roadmap **2.2** 🔑 |
| The `signOut` race fix has no test. A test was written, passed with the fix removed, and was deleted rather than left green and meaningless. | Fix is correct but unverified. | Roadmap **3.1** |
| **418 ESLint warnings**, mostly `jsx-a11y`. Set to warn deliberately, so they stay visible without blocking Release 2. | Real accessibility defects, none of them new. | Roadmap **7** |
| `vendor-supabase` is 56 kB gzip and still eager — now the largest single item in first load. | The 100 kB first-load target needs this and FontAwesome. | Roadmap **6.1 / 6.2** |
| Error boundaries log to the console; no reporting service is wired. | A production render failure recovers silently and nobody is told. | Roadmap **10** |
| CI reports failure but does not block merges until branch protection is enabled on `main`. | A red build can still be merged. | 🔑 **Owner action** |
| gitleaks scans only the commits a change introduces, not all history. | A pre-existing leak would not be caught by CI. Run `gitleaks detect --source . --redact` once by hand. | 🔑 **Owner action** |
| 2,074 unreachable lines — `Services.jsx` (835) plus three unrouted International pages (1,239). | Dead code, and three finished pages nobody can reach. | Roadmap **4.1 / Release 3** |
| `AdminLogin` redirects on `user`, not `isAdmin`. | A non-admin takes one extra hop before "Not authorised". No security hole. | Accepted |

### Owner actions required before any of this is live

Ordered; `009` assumes the grant baseline `007` establishes, and **grants are checked
before RLS**.

```
BACKUP → 007 → 008 → 009 → create admin → disable signup → verify → deploy
```

Then: rotate the Supabase `service_role` key and the Cloudinary `api_secret`; set
`RESEND_API_KEY` and `BOOKING_NOTIFICATION_EMAIL` in Vercel (server-side, no `VITE_`
prefix); verify `raslipwani.co.ke` for SPF/DKIM/DMARC; and manually triage the 8 stranded
`pending` bookings before automation goes live. Full detail in
[`docs/HANDOFF-phase1-apply.md`](docs/HANDOFF-phase1-apply.md).

---

## [0.1.0] — 2026-09-01 — `c1c8656`

The pre-roadmap baseline, audited at **3.8 / 10**. Recorded here as the point every
metric in `ROADMAP.md` measures from.

### Added

- Maintenance mode with configurable settings and UI.
- Homepage mobile optimisation — icon-only services grid, condensed "Why Raslipwani"
  strip, roughly 400 px less scroll on mobile.

### State at this commit

Two identity systems (Clerk holding sessions, Postgres deciding access, nothing
connecting them) · `service_role` key in the public bundle · RLS off on 4 of 7 tables ·
all 19 policies `USING (true)` · `anon` holding `DELETE`/`TRUNCATE` on every table ·
0 tests executing · 77 ESLint errors · 2,039 unreachable lines · 4 broken nav links ·
0 booking notifications ever delivered, with 8 leads stranded in `pending`.
