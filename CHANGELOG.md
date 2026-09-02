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

Verified 2026-09-02: **74 tests passing across 11 files**, production build clean,
78 ESLint errors outstanding.

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
| 🔴 **First-load JS regressed to ~446 kB gzip** (from ~275 kB). Removing `vendor-clerk` from `manualChunks` let Rollup fold FullCalendar and Quill into the main chunk, now 1,059 kB raw. | Performance only — not correctness or security. | Roadmap **6.1, promoted to Release 2** |
| `003_enhance_bookings_admin.sql` and `004_create_admin_settings.sql` use `CREATE POLICY IF NOT EXISTS`, which is **not valid PostgreSQL in any version**, so both aborted. `booking_notes` and `email_templates` do not exist in production, and `BookingDetailModal` and `EmailSettings` reference them. | Two admin features are broken today. | Roadmap **2.2** |
| The `signOut` race fix has no test. A test was written, passed with the fix removed, and was deleted rather than left green and meaningless. | Fix is correct but unverified. | Roadmap **3.1** |
| Three assertion-free tests in `AdminBookings.test.jsx` ("would check … in real implementation"). | Green tests that prove nothing. | Roadmap **3.1** |
| Coverage thresholds sit at `0` and `@vitest/coverage-v8` is not installed. | The ratcheting floor is unenforceable. | Roadmap **3.1** |
| 78 ESLint errors; no CI; no error boundaries anywhere. | Any render exception blanks the app. | Roadmap **3.2 / 3.3 / 3.4** |
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
