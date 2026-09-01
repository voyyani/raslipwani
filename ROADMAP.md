# Raslipwani Properties — Master Roadmap (Final)

> **Version 3 — supersedes all prior iterations.**
>
> **Source:** [`docs/audit/2026-09-01-codebase-audit.md`](docs/audit/2026-09-01-codebase-audit.md), plus **live database introspection** performed 2026-09-01 against project `gihgdouvltxlpynpuyde` (`rasilpwani`, eu-north-1).
>
> **Goal:** Take a functional prototype (audited **3.8/10**) to a world-class production system (**target 9/10**) on a single, coherent identity stack.
>
> **Baseline commit:** `c1c8656`

---

## ⛔ READ THIS FIRST

Live introspection found exposure **materially worse** than the static audit could infer. This is no longer only about a leaked key.

**Right now, with the anon key that ships inside your public JavaScript bundle, any person on the internet can:**

| Action | Verified how |
|---|---|
| Read all **12 bookings** — customer name, email, phone, appointment time, notes | `HTTP 200`, `content-range: */12` |
| **`DELETE FROM bookings`** — destroy every lead you have | `anon` holds `DELETE` grant; RLS is **off** on the table |
| **`TRUNCATE properties`** — wipe all 12 listings | `anon` holds `TRUNCATE` grant; RLS is **off** |
| Read your **Cloudinary `api_secret`** | `settings` table: RLS off, 0 policies, `HTTP 206`, 1 row with non-null secret |
| Rewrite `admin_settings` — business phone, email, WhatsApp, logo | `USING (true)` policy with no `TO` clause |

Verified grants — identical on **every** public table:

```
anon → DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
```

Where RLS is **off**, those grants apply with nothing in the way.

```
RLS ENABLED:  admin_settings, client_communications, client_property_interests
RLS OFF:      bookings ⚠️   clients ⚠️   properties ⚠️   settings ⚠️
```

The four tables with RLS **off** are the four that matter. The policies written on `bookings`, `clients`, and `properties` are **inert** — Postgres ignores policies when `relrowsecurity = false`. They read like protection and provide none.

**This is a data-destruction exposure, not just a disclosure one.** Rotating the service key does not close it — the anon key is *supposed* to be public. Only RLS closes it. **Phase 0 is same-day work.**

---

## What Introspection Confirmed, Corrected, and Newly Found

| # | Question | Answer from the live database |
|---|---|---|
| 1 | Service key in Vercel production? | ✅ **Confirmed by owner.** Live credential disclosure. |
| 2 | RLS state of `properties` / `bookings`? | 🔴 **RLS is OFF on both**, plus `clients` and `settings`. "RLS is on" held for only 3 of 7 tables. |
| 3 | Has the `clients` CRM run in production? | ✅ **No — 0 rows.** The one piece of good news: no client PII has been exposed, because none was ever entered. |
| — | **NEW** — Cloudinary secret | 🔴 `settings` table (RLS off, 0 policies) holds a **non-null `api_secret`**, anon-readable. Not visible from the repo. |
| — | **NEW** — Destructive grants | 🔴 `anon` holds `DELETE`/`TRUNCATE` on every table. Far beyond read exposure. |
| — | **NEW** — Supabase Auth is empty | ✅ **`auth.users` = 0.** The Clerk → Supabase Auth migration is **greenfield**. No user migration, no dual-write, no cutover risk. |
| — | **NEW** — Real leads are stranded | ⚠️ **8 bookings sit in `pending`** with no notification ever sent (audit C-5). Those are real people awaiting a reply. |
| — | **NEW** — Identity columns are `text` | `bookings.assigned_agent_id` and `confirmed_by` are `text` (Clerk IDs). Must become `uuid → auth.users(id)`. |

---

## The Architectural Decision: Supabase Auth Replaces Clerk

**This is the defining change in this iteration, and it is the correct one.**

The previous roadmap proposed bridging Clerk to Supabase with a JWT template. That machinery exists solely to compensate for running two identity systems. Deleting one system beats bridging two.

**What the codebase paid for having two:**

| Symptom | Location |
|---|---|
| `service_role` key shipped to the browser | `supabaseClient.js:12` |
| RLS opened to `anon` to let admin writes through | `006_fix_admin_settings_rls.sql` |
| One query bypassing RLS via the admin client | `AdminProperties.jsx:440` |
| Policies scoped `TO authenticated` that never match | every migration |
| RLS switched off entirely on four tables | live database |

Every one of those is the same root cause: **Clerk holds the session, Postgres decides access, and nothing connects them.**

**With Supabase Auth:**

```sql
-- This simply works. No bridge, no template, no service key.
create policy "admins manage bookings" on bookings
  for all to authenticated
  using (exists (select 1 from admin_users where id = auth.uid()));
```

`auth.uid()` is native to Postgres. RLS stops being a workaround target and becomes the actual security model.

**Why this is unusually low-risk here:** `auth.users` is **empty**. There is nothing to migrate. You create admin accounts and delete Clerk — no dual-write window, no session migration, no rollback plan needed for user data.

**What you gain:** one vendor instead of two · 72 kB of Clerk out of the bundle · one key instead of three · `auth.uid()` in RLS · a single dashboard.

**What you give up — state it honestly:** Clerk's polished pre-built UI components, its organisation/multi-tenancy features, and some social-login ergonomics. For a single-operator admin panel behind one login, none of that is load-bearing. If you later need multi-agent orgs with granular roles, revisit — but build that on `admin_users` rows, not a second identity vendor.

---

## Guiding Principles

1. **Stop destruction before disclosure.** A `DELETE` grant on live bookings outranks a leaked key, because a leak is recoverable and deleted leads are not.
2. **One identity system.** Every auth workaround in this codebase traces to having two. Never reintroduce a second.
3. **RLS enabled ≠ RLS enforcing.** Three tables carry policies that Postgres ignores. Verify with `relrowsecurity`, never by reading migrations.
4. **Safety net before restructuring.** Zero tests execute today. The fix is a one-line rename that unlocks every later phase.
5. **Route or delete — never orphan.** 2,039 unreachable lines exist because features were built then disconnected.
6. **Every phase ships.** Each ends deployable and independently valuable.
7. **Measure, don't assert.** Every phase has numeric exit criteria.

---

## Phase Map

| # | Phase | Duration | Ships |
|---|---|---|---|
| **0** | 🚨 Emergency Lockdown | **Today** | Destruction vector closed, secrets rotated |
| **1** | Supabase Auth Migration | 1 week | Clerk deleted, `auth.uid()` RLS, one identity system |
| **2** | Revenue & Data Integrity | 1 week | Resend emails, reproducible schema, fixed nav |
| **3** | Safety Net | 1 week | Live test suite, CI, error boundaries |
| **4** | Structure & International IA | 2 weeks | Data layer, layout routes, International section |
| **5** | Design System + Dark Mode | 2 weeks | Dual-theme tokens, primitives, working hover states |
| **6** | Performance | 1 week | −70% first-load JS, Lighthouse ≥ 90 |
| **7** | Accessibility | 1 week | WCAG 2.1 AA |
| **8** | SEO & Cross-Brand | 1 week | Canonical domain, dynamic sitemap, Nairobuild |
| **9** | Client-Side UI Revamp | 3 weeks | World-class public experience |
| **10** | Platform Maturity | Ongoing | TypeScript, observability, docs |

**Safe to operate: Phases 0 → 3 (~3 weeks).** Phases 0–4 are sequential; 5–8 largely parallelise.

---

## 🚨 Phase 0 — Emergency Lockdown

**Same day. Every hour of delay is a window in which your bookings can be deleted.**

### 0.1 — Kill the destruction vector 🔴 **FIRST**

`anon` holds `DELETE`, `UPDATE`, `INSERT`, and `TRUNCATE` on every public table, and RLS is off on four of them. Revoke the grants **before** anything else — this is the change that stops data loss, and it takes one migration.

- [ ] Write and apply `007_emergency_lockdown.sql`:
  - `revoke all on all tables in public from anon;`
  - Re-grant only what the public site genuinely needs: `select` on `properties`, `select` on `admin_settings`, `insert` on `bookings`.
  - `alter table … enable row level security` on **`bookings`, `clients`, `properties`, `settings`** — the four currently unprotected.
  - Interim policies: public `SELECT` on published `properties`; anon `INSERT`-only on `bookings`; **zero anon access to `settings` and `clients`**.
- [ ] **Verify by attempting it.** Confirm with the anon key that `DELETE` on `bookings` is rejected and `settings` returns `401`/empty. A control you have not tested is a control you do not have.
- [ ] Take a full database backup **before** applying, so a mistake here is reversible.

### 0.2 — Rotate the Cloudinary secret 🔴 **NEW**

The `settings` table holds a **non-null `api_secret`** with RLS off and 0 policies, reachable by anon (`HTTP 206`). A Cloudinary `api_secret` permits signed uploads, deletions, and account operations against your entire media library — which is every property photo you have.

- [ ] Rotate the Cloudinary API secret in the Cloudinary console.
- [ ] Review the Cloudinary activity log for unfamiliar uploads or deletions.
- [ ] **Stop storing it in a browser-reachable table.** Move it to a Vercel environment variable used only by server-side code. A secret in a PostgREST-exposed table is a published secret, regardless of policy.
- [ ] Once migrated, `alter table settings drop column api_secret;`. Also review the duplicate-looking `settings` vs `admin_settings` tables and consolidate.

### 0.3 — Rotate the Supabase service key 🔴

`VITE_SUPABASE_SERVICE_KEY` is set in Vercel production. Vite inlines every `VITE_*` variable into the bundle as a string literal, so the `service_role` JWT has been publicly downloadable from your CDN.

- [ ] **Rotate first:** Supabase → Settings → API → `service_role` → Reset. Deleting the Vercel variable does **not** invalidate keys already in bundles you have served.
- [ ] Delete `VITE_SUPABASE_SERVICE_KEY` from all Vercel environments; redeploy.
- [ ] Verify: `curl -s https://raslipwani.co.ke/assets/index-*.js | grep -c eyJ` → `0`.
- [ ] Remove the `supabaseAdmin` export from `src/utils/supabaseClient.js` and update `AdminProperties.jsx:441`.
- [ ] Add a build-time guard failing the build if any `VITE_*` name matches `SERVICE|SECRET|PRIVATE|PASSWORD`.

### 0.4 — Assess and document

- [ ] Supabase → Logs → API: review the full retention window for anomalous `anon` and `service_role` activity — bulk `SELECT` on `bookings`, unexpected `DELETE`, unfamiliar IPs.
- [ ] Verify the 12 bookings and 12 properties are intact and unmodified.
- [ ] Check `admin_settings` against known-good values (phone, email, WhatsApp, logo) — the lead-hijack target.
- [ ] **`clients` has 0 rows, so no client PII was exposed.** `bookings` did expose 12 customers' names, emails, and phones. Assess whether that meets the notification threshold under the Kenyan Data Protection Act 2019 (72-hour ODPC window). That is a legal question — get counsel, do not decide it in-house.
- [ ] Document in `docs/audit/2026-09-01-incident.md`.
- [ ] **Revoke the `sbp_` introspection token** when this phase closes.

**Exit criteria:** anon cannot delete, update, or truncate anything. RLS enabled on all 7 tables. Cloudinary and service keys rotated. Logs reviewed.

---

## Phase 1 — Supabase Auth Migration

**Timeline: 1 week.** Removes the root cause of every auth defect in the audit.

**This is greenfield: `auth.users` = 0.** No migration, no dual-write, no cutover risk.

### 1.1 — Model admin identity

- [ ] Create `admin_users`: `id uuid primary key references auth.users(id) on delete cascade`, `email text not null`, `role text not null default 'admin'`, `created_at timestamptz default now()`.
- [ ] RLS on `admin_users`: a user may read their own row; only `service_role` writes. **No self-service signup** — an admin table anyone can insert into is not an admin table.
- [ ] Helper: `create function is_admin() returns boolean language sql security definer stable as $$ select exists (select 1 from admin_users where id = auth.uid()) $$;`
- [ ] Seed the initial admin account through the Supabase dashboard.
- [ ] Disable public signup in Auth settings. Admin accounts are provisioned, never registered.

### 1.2 — Replace the client-side auth layer

- [ ] Enable Email/Password in Supabase Auth. Enforce a strong password policy; enable MFA if available on your plan — this login guards all customer data.
- [ ] Build `src/contexts/AuthContext.jsx` around `supabase.auth`: `signIn`, `signOut`, `session`, `user`, `isAdmin`, with `onAuthStateChange` subscribed and cleaned up.
- [ ] Build `src/pages/AdminLogin.jsx` — branded, replacing Clerk's hosted UI.
- [ ] Rewrite `ProtectedRoute` (`App.jsx:80-97`) against the Supabase session, checking `is_admin()` rather than mere authentication. **Signed in ≠ admin.**
- [ ] Replace `src/components/AuthButtons.jsx` (Clerk `SignedIn`/`SignedOut`).
- [ ] Remove `ClerkProvider` from `App.jsx:150` and the `clerkPubKey` guard at `App.jsx:59`.
- [ ] Add password reset and session-expiry handling — a redirect to login, not a white screen.

### 1.3 — Simplify the Supabase client

- [ ] With Supabase Auth, the client attaches the session automatically. Delete the entire `supabaseAdmin` concept — it existed only to bypass RLS that Clerk could not satisfy.
- [ ] One client, one key, one code path.

### 1.4 — Real RLS on `auth.uid()`

Now that identity is native, policies can express rules instead of `true`.

- [ ] `properties` — public `SELECT` limited to published/available; writes `using (is_admin())`.
- [ ] `bookings` — anon `INSERT` only, with column constraints; `SELECT`/`UPDATE`/`DELETE` admin-only. **A prospect must never read another prospect's booking.**
- [ ] `clients`, `client_communications`, `client_property_interests` — admin-only, all operations. This is PII.
- [ ] `admin_settings` — public `SELECT`; writes admin-only.
- [ ] `settings` — no anon access at all; secrets already removed in Phase 0.2.
- [ ] Delete every `USING (true)` policy.
- [ ] **Migrate identity columns:** `bookings.assigned_agent_id` and `bookings.confirmed_by` are `text` (Clerk IDs). Convert to `uuid references auth.users(id)`. Existing rows hold Clerk IDs or nulls — with 12 bookings, backfill by hand.
- [ ] Tests: anon **cannot** read `clients`; anon **cannot** delete `bookings`; admin **can** do both.

### 1.5 — Remove Clerk entirely

- [ ] `npm uninstall @clerk/clerk-react` — removes 72 kB from the bundle.
- [ ] Delete `VITE_CLERK_PUBLISHABLE_KEY` from `.env` and Vercel.
- [ ] Remove `vendor-clerk` from `vite.config.js` `manualChunks`.
- [ ] `grep -ri clerk src/` returns nothing.
- [ ] Delete the Clerk application once the new login is verified in production.

**Exit criteria:** zero Clerk references. Admin login works via Supabase. Every policy references `auth.uid()`. Anon can read published properties and insert a booking — nothing else, proven by test.

---

## Phase 2 — Revenue & Data Integrity

**Timeline: 1 week.**

### 2.1 — Resend booking notifications 🔴

**Four stacked breakages mean no booking has ever produced an email.** Introspection makes the cost concrete: **8 bookings sit in `pending`** — real people who enquired and were never contacted.

- [ ] Add `resend`; set `RESEND_API_KEY` in Vercel **server-side only — no `VITE_` prefix**.
- [ ] Verify `raslipwani.co.ke` as a Resend sending domain (SPF + DKIM + DMARC). Unverified mail lands in spam, which is indistinguishable from not sending.
- [ ] **Move the handler** from `src/pages/api/send-email.js` to root-level `/api/send-email.js`. Vercel serves functions only from a root `api/` directory; nothing under `src/` is ever deployed.
- [ ] **Fix `vercel.json`:** the catch-all rewrite `"/(.*)"` → `"/"` swallows `/api/*`. Change source to `"/((?!api/).*)"`.
- [ ] Replace the Mailtrap sandbox stub and its literal `"your-mailtrap-user"` placeholders with the Resend SDK.
- [ ] Replace `require('nodemailer')` — a CommonJS call in an ESM file, for a package not in `package.json`.
- [ ] **Wire into the live path:** `ServicesMain.jsx:137` and `Contact.jsx:96`. The existing `fetch('/api/send-email')` sits in `Services.jsx:198`, which is unreachable code — the integration was written into the dead copy.
- [ ] Admin notification **and** customer confirmation. Escape all interpolated values.
- [ ] Fail safe: if email fails, the booking still saves and the customer still sees success.
- [ ] **Triage the 8 pending bookings manually.** Some may be weeks old; contact them before automation goes live, and expect that some have moved on.

### 2.2 — Make the schema reproducible

The repo cannot rebuild the database — which is why Phase 0 required live introspection.

- [ ] **Write `000_baseline.sql`** from the live schema. `properties` (24 columns), `bookings` (25), and `settings` (8) have **no creation migration**. Column lists are captured in the audit.
- [ ] **Fix invalid SQL:** `CREATE POLICY IF NOT EXISTS` is **not valid PostgreSQL in any version**. It appears 4× in `003_enhance_bookings_admin.sql` and 7× in `004_create_admin_settings.sql`, so both abort at their first policy statement. (That `006` exists at all is proof `004` never applied.) Use the guarded `DO $$ … pg_policies` pattern from `002:138-151`.
- [ ] Resolve the duplicate `003_` prefix — two files claim it, so order is undefined.
- [ ] Consolidate `settings` and `admin_settings`.
- [ ] Verify the chain applies cleanly to an empty database. If it does not, the history is still fiction.

### 2.3 — Fix broken navigation

Four persistent, every-page links 404.

- [ ] `Header.jsx:48` — `/internationalproperties` → `/international`.
- [ ] `Header.jsx:58` — `/construction-support` is shelved; became **Nairobuild**. Link out to `https://nairobuild.co.ke` (`target="_blank" rel="noopener"`) or move to the footer. See Phase 8.4.
- [ ] `Footer.jsx:209,212` — `/privacy` and `/terms` have no routes. **Both are mandatory** for a business processing PII under the Kenyan DPA.
- [ ] Test asserting every `Header`/`Footer` link resolves to a route or an intentional external URL.

---

## Phase 3 — Safety Net

**Timeline: 1 week.** Nothing after this is safe without it.

### 3.1 — Resurrect the test suite

3 test files exist; **0 tests execute.** `src/test/setup.js` holds JSX with a `.js` extension, so esbuild refuses it — and as the global `setupFiles` entry, it takes every suite down with it.

- [ ] Rename `src/test/setup.js` → `setup.jsx`; update `vitest.config.js`. **One line.**
- [ ] Confirm the 3 existing suites pass.
- [ ] Conventions: MSW for Supabase, the existing `renderWithProviders`, `user-event` over `fireEvent`.
- [ ] Highest-risk paths first: booking submission, admin login, **RLS denial for anon**, settings load with a failed fetch.
- [ ] Coverage with a ratcheting floor.

The rename is trivial; that it went unnoticed is not. Fix the loop, not just the file.

### 3.2 — Clean the lint baseline

77 errors. A failing lint run guards nothing.

- [ ] Real bugs first: `require` in ESM (`send-email.js:44`), `module` in `tailwind.config.js`, `__dirname` in `vitest.config.js`.
- [ ] Remove dead state in `AdminProperties.jsx` (9 unused vars, wired up and abandoned).
- [ ] Drop unused `motion` imports across 5 admin files.
- [ ] Add `eslint-plugin-jsx-a11y`.

### 3.3 — Error boundaries

No boundary exists anywhere; any render exception blanks the app. `SettingsContext` merges remote data straight into render paths.

- [ ] Root boundary with branded fallback and recovery; per-route boundaries; one around the admin shell.
- [ ] Report caught errors somewhere real.

### 3.4 — CI

- [ ] GitHub Actions on every PR: `install → lint → test → build`. Block merge on failure.
- [ ] Report bundle size per PR so Phase 6's gains cannot silently regress.
- [ ] **Add secret scanning** (`gitleaks`). Phase 0 must be structurally impossible to repeat.

---

## Phase 4 — Structure & International IA

**Timeline: 2 weeks.**

### 4.1 — Build the International section

UN Housing, Diaspora, and International Hub were **planned upgrades**, so this is an IA build, not a deletion. But two of them conflict.

**The conflict:** `International.jsx` (724 lines, routed) and `InternationalHub.jsx` (425 lines, orphaned) are **two hub pages covering the same three audiences** — UN staff/diplomats, diaspora Africans, international professionals. They cannot both be `/international`.

**Proposed IA:**

```
/international                → Hub: audience triage, three clear paths
/international/un-housing     → UN & diplomatic housing (Gigiri, Runda)
/international/diaspora       → Diaspora investor marketing
/portal                       → Diaspora owner dashboard (authenticated)
```

- [ ] **Resolve the hub conflict.** `International.jsx` is more complete (multi-currency, investment calculator, 6 sections); `InternationalHub.jsx` has sharper audience segmentation and a stronger "Capturing the UN Nairobi Opportunity" narrative. Merge the best of both; delete the loser.
- [ ] Route `UNHousing.jsx` at `/international/un-housing`.
- [ ] `DiasporaPortal.jsx` is **structurally different** — no marketing sections, `h1` at line 90. It reads as an authenticated dashboard, not a landing page. Decide: authenticated `/portal` behind Supabase Auth (now trivial, post-Phase 1), or rewrite as marketing. Do not route it as-is beside marketing pages.
- [ ] **Move hardcoded data to the database.** `UNHousing.jsx:27+` embeds a literal `unProperties` array with Unsplash placeholders, hardcoded prices, and fixed dates (`2026-02-01`) that will silently go stale. Model as `properties` rows with a segment tag so the admin CRM manages them.
- [ ] **Delete `src/pages/Services.jsx`** (800 lines) — a near-duplicate of the live `ServicesMain.jsx` and an active hazard that already caused the email bug. Port anything of value first.
- [ ] Add to nav and sitemap.

This is your most defensible position — UN/diplomatic housing and diaspora investment are things a generic listings site cannot copy — and it is currently invisible. **Likely the highest-return product change here.**

### 4.2 — Data-access layer

16 components query Supabase directly; `.from('bookings')` appears in **18 places** across 9 files.

- [ ] `src/services/` — one module per domain: `properties`, `bookings`, `clients`, `settings`, `auth`.
- [ ] Every query behind a named, testable function.
- [ ] Standardise on TanStack Query; remove raw `useEffect` + `supabase` fetching. Two paradigms coexist today.
- [ ] Centralise query keys. (`Home.jsx` sets a local `staleTime` silently disagreeing with the global default at `App.jsx:28`.)
- [ ] **Exit:** `grep -rl supabaseClient src/components src/pages` returns nothing.

### 4.3 — Layout routes

11 pages each render their own `<Header />` and `<Footer />`; `App.jsx` has no layout route.

- [ ] `<PublicLayout>` with `<Outlet />`; remove Header/Footer from all 11 pages.
- [ ] Fixes a real bug: Header unmounts/remounts on every navigation, tearing down and re-attaching its scroll listener (`Header.jsx:18-23`) and resetting sticky state.
- [ ] Consolidate per-page `<Helmet>` blocks into the existing `DynamicSEO`.

### 4.4 — Decompose the largest components

Nine files exceed 700 lines; `AdminProperties.jsx` is 1,297.

- [ ] Split `AdminProperties.jsx`, `AdminBookings.jsx` (824), `ServicesMain.jsx` (829). Target: none over 300 lines.
- [ ] Extract `usePagination`, `useFilters`, `useCsvExport`.
- [ ] Do this **after** 4.2 — with data access extracted, these shrink substantially on their own.

---

## Phase 5 — Design System + Dark Mode

**Timeline: 2 weeks.** Prerequisite for Phase 9.

### 5.1 — Fix the broken token first

**`bg-primary-dark` is used 19 times and is not defined in `tailwind.config.js`.** Verified against compiled CSS: `.bg-primary` emits correctly; `bg-primary-dark` emits **zero rules**. Every one of those hover states is inert — including `Home.jsx:158` ("Browse Properties") and `App.jsx:227`.

**Your primary CTAs have no hover feedback.**

- [ ] Restructure `primary`/`secondary` as objects with `DEFAULT`, `dark`, `light`. Verify all 19 render.

### 5.2 — Dual-theme token layer

The system is bypassed: **`bg-blue-*` 165 times vs `bg-primary` 116** — raw Tailwind blue outnumbers your brand colour. `bg-secondary` appears **twice** in 96 files; `accent` never as a background.

Because dark mode is in scope, build tokens **semantically** (`surface`, `content`, `border`) rather than literally (`bg-white`, `text-gray-800`). Literal tokens cannot theme; retrofitting means touching every component twice.

- [ ] Full 50–900 scales; semantic `success`/`warning`/`danger`/`info` so status colours stop being invented per component (`BookingStatusBadge`, `MobileBookingCard`, and `AdminBookings` each decide "confirmed" independently today).
- [ ] CSS custom properties; Tailwind `darkMode: 'class'`.
- [ ] Migrate all 165 `bg-blue-*` usages.
- [ ] ESLint rule banning raw Tailwind palette colours in `src/`.

### 5.3 — Ship dark mode

- [ ] Theme provider: `light`/`dark`/`system`, persisted, respecting `prefers-color-scheme`; toggle in header and admin.
- [ ] **Remove the existing broken dark block** (`index.css:78-88`). It flips bare `:root` dark with no token layer beneath, leaking dark backgrounds behind light components. A hazard, not a foundation.
- [ ] Audit every surface in both themes, including property imagery, FullCalendar, and Quill.
- [ ] Contrast-verify both at AA.

### 5.4 — Clean global CSS

- [ ] **Font mismatch:** `index.css:2` imports **Poppins**; `index.html:15` preloads **Inter**. Verified in the build — deployed HTML preloads a font the deployed CSS never loads, while Poppins isn't preloaded and blocks late. Fix both ends.
- [ ] Remove the Vite scaffold `button { background-color: #1a1a1a; … }` (lines 62-74) that every Tailwind button overrides.
- [ ] Remove the `!important` `aria-label` hiding hack (118-127) and fix the markup it suppresses.

### 5.5 — Primitives

- [ ] `Button`, `Input`, `Select`, `Card`, `Badge`, `Modal`, `Toast` — both themes.
- [ ] **Replace all 12 native `alert()`/`confirm()` calls.** `react-hot-toast` is already used in 15 files. The critical one: `ServicesMain.jsx:154` is the **live booking confirmation** — the highest-value moment in the customer journey — delivered as an unstyled, thread-blocking browser dialog.
- [ ] Replace the four destructive `window.confirm()` calls with a dialog naming what is being deleted, offering undo.
- [ ] Storybook or equivalent.

### 5.6 — One icon library

Three ship today: `react-icons` (30 files), `lucide-react` (12), FontAwesome (1). Plus two calendar libraries.

- [ ] Standardise on `lucide-react`; migrate `react-icons`; remove FontAwesome (payoff in 6.2).

---

## Phase 6 — Performance

**Timeline: 1 week.**

**Baseline (measured):** ~958 kB raw / **~275 kB gzip** JS plus 175 kB / 40 kB gzip CSS on first paint. On the mid-range Android and 3G conditions typical of this market, that is multiple seconds to first meaningful paint.

### 6.1 — Lazy-load admin

`App.jsx:49-57` statically imports all seven admin pages plus `AdminLayout` into the 379 kB main chunk **every anonymous visitor downloads**. Confirmed: `papaparse` (admin-only CSV) is in the public bundle.

Two costs: visitors pay for what they cannot use, and minified admin source publicly discloses table names, column names, and query shapes — a map of the database.

- [ ] Convert all seven to `lazy()`; lazy-load `AdminLayout`.
- [ ] Split the Supabase client so public pages load a smaller surface (220 kB currently eager).
- [ ] **Clerk's 72 kB is already gone** as of Phase 1.5.

**Expected:** main chunk 379 kB → under 120 kB.

### 6.2 — Remove FontAwesome

`main.jsx:6` imports the whole library, emitting **~914 kB of fonts** (`fa-solid-900.ttf` 426 kB, `fa-brands-400.ttf` 211 kB, plus woff2). Actual usage: **four icons in one file**.

- [ ] Redraw in `lucide-react`; delete import and dependency.

**Expected:** ~914 kB of fonts gone; CSS 175 kB → ~40 kB. **The cheapest large win available.**

### 6.3 — Strip console output

64 `console.*` calls across 17 files. `SettingsContext` logs full settings payloads every fetch.

- [ ] Enable esbuild `drop: ['console','debugger']`. (`vite.config.js:26` claims this needed terser — it does not.)
- [ ] A `logger` that no-ops outside development.

### 6.4 — Gate it

- [ ] Lighthouse CI with a budget; Core Web Vitals via the installed `@vercel/speed-insights`; fail CI on regression.

**Exit criteria:** first-load JS under 100 kB gzip. Lighthouse Performance ≥ 90 mobile.

---

## Phase 7 — Accessibility

**Timeline: 1 week.** Target WCAG 2.1 AA.

Better start than typical: **alt text complete (22/22)**, 239 focus declarations, only 1 `onClick` on a non-interactive `div`.

- [ ] **Re-enable zoom.** `index.html:6` sets `maximum-scale=1.0, user-scalable=no` — a direct **SC 1.4.4 (AA)** failure that Android honours, disproportionately affecting low-vision users browsing photos and price figures. Remove both; keep `viewport-fit=cover`.
- [ ] Focus trapping and `aria-modal` on `PropertyModal`, `BookingModal`, `BookingDetailModal`, `ClientForm`; focus restoration on close.
- [ ] `aria-expanded`/`aria-controls` on header dropdowns and mobile menu. Only 27 `aria-*` and **1** `role=` exist across 96 files.
- [ ] Verify `htmlFor`/`id` pairing across all 98 inputs.
- [ ] Live regions for async status and toasts; skip-to-content link.
- [ ] Keyboard-only pass over every public flow including booking; screen-reader pass on booking and search; contrast audit **both themes**; `axe-core` in CI.

**Exit criteria:** zero axe violations; every flow completable by keyboard, both themes.

---

## Phase 8 — SEO & Cross-Brand

**Timeline: 1 week.**

### 8.1 — Consolidate on `raslipwani.co.ke`

`Home.jsx` contains **three domains in one head block**: canonical → `.co.ke`, JSON-LD `@id`/`url` → `.com`, JSON-LD image → `raslipwani.com/logo.png`.

- [ ] 301 `.com` → `.co.ke` permanently; keep the redirect and don't let the domain lapse.
- [ ] Consistent across canonical, JSON-LD, `robots.txt`, OG.
- [ ] **Fix the JSON-LD geo coordinates.** They read `-1.2921, 36.8219` — Nairobi city centre — while the `address` in the same block is Kikambala Road, Kilifi. ~500 km apart, which breaks local-business indexing.

### 8.2 — Dynamic sitemap

Static, 5 URLs, omits `/international`, `/services/viewing`, and **every property detail page** — all the pages that should rank.

- [ ] Generate at build time from the property list, with `lastmod`.

### 8.3 — Structured data & rendering

- [ ] Per-property `RealEstateListing` JSON-LD; route remaining Helmet blocks through `DynamicSEO`; real OG images per property.
- [ ] **Address the SPA rendering constraint.** As a pure client-side SPA, crawlers see an empty shell for all property content. This is likely the largest single constraint on organic acquisition and deserves its own investigation — prerendering listing routes, or an SSR framework. Scope honestly; this may be a project in its own right.

### 8.4 — Nairobuild cross-brand

Construction is now a separate business (`nairobuild.co.ke`) with genuinely adjacent audiences — land buyers need builders, builders need land.

- [ ] Footer sister-brand block, styled as a deliberate cross-brand reference rather than a stray outbound link.
- [ ] Contextual links where the journey warrants it — land listings, plot pages. `rel="noopener"`, external affordance.
- [ ] Consider reciprocal linking from Nairobuild; cross-domain links between genuinely related businesses are legitimate SEO.
- [ ] **Decide: primary nav or footer?** Nav says "part of our offering"; footer says "sister business we recommend." A positioning call, not a technical one.

### 8.5 — Database-driven maintenance mode

`App.jsx:63-78` reads `VITE_MAINTENANCE_MODE` at build time, requiring a rebuild to toggle — while `SettingsContext` already carries a `maintenance_mode` field that could flip instantly.

- [ ] Switch to the DB flag; keep the env var as emergency override.

---

## Phase 9 — Client-Side UI Revamp

**Timeline: 3 weeks.** Your original request. Last by design: a revamp built on open `DELETE` grants, zero tests, no tokens, and a 275 kB bundle inherits all of it.

**Depends on:** Phase 4 (structure), 5 (tokens + dark mode), 6 (budget).

### 9.1 — Direction

- [ ] Capture product truth: local buyers, diaspora investors, UN/embassy tenants — the job each is doing and what makes Raslipwani different.
- [ ] Commit to a visual world; document in `DESIGN.md`.
- [ ] Mode per surface: **Persuade** (home/services/international), **Operate** (search/booking), **Read** (about/guides).

### 9.2 — Surfaces

- [ ] **Home** — the hero is a stock photo with a dark overlay and generic copy ("Your Trusted Real Estate Partner in Kenya"). Replace with a real point of view and a search entry that starts the journey immediately.
- [ ] **Properties** — the grid *is* the product. Filters, map, saved searches, comparison.
- [ ] **Property detail** — gallery, neighbourhood context, mortgage/ROI calculator, a booking flow that converts.
- [ ] **International** — properly routed from 4.1; your most defensible surface. Treat as a headline.
- [ ] **Booking flow** — end-to-end, with the confirmation experience 5.5 unlocks and the Resend emails from 2.1 actually firing.
- [ ] **Admin login** — first impression of the tool you use daily; it deserves the same care as the public site.
- [ ] **Contact, About, 404** — the 404 is currently inline JSX in `App.jsx`.

### 9.3 — Craft

- [ ] Purposeful motion. The existing framer-motion usage is uniform fade-up on nearly everything, which reads as a default rather than a decision.
- [ ] Real loading, empty, and error states everywhere; the featured-properties skeleton is a good model to extend.
- [ ] Mobile-first: the market is predominantly mobile on constrained networks.
- [ ] Build on the existing Cloudinary `f_auto,q_auto` responsive `<picture>` pattern — already correct.

**Exit criteria:** every public surface rebuilt against the design system, both themes, within the Phase 6 budget, passing Phase 7 accessibility.

---

## Phase 10 — Platform Maturity

**Ongoing.**

- [ ] **TypeScript**, incrementally. Zero `.ts` files; `prop-types` in 3 of 96 files. Essentially no shape checking anywhere.
- [ ] **Replace `react-quill`** — unmaintained since 2023, React 16/17 peers, depends on `findDOMNode` which React 19 removed. Blocks the React 19 path. `quill` 2 is already a dependency; `tiptap` is the alternative.
- [ ] **Remove `@headlessui/react`** — zero imports in `src/`, yet declared and in `manualChunks`.
- [ ] **Consolidate the two calendar libraries.**
- [ ] **Error tracking** (Sentry) wired into the Phase 3.3 boundaries.
- [ ] **Documentation hygiene** — 15 status docs in `src/Docs/` plus three at root. `README.md` advertises React 18.2.0 / Vite 4.4.5 against actual 18.3.1 / 6.4.3.
- [ ] **Staging environment**, possible once Phase 2.2 makes the schema reproducible.

---

## Success Metrics

| Metric | Baseline (verified 2026-09-01) | Target |
|---|---|---|
| Tables where anon can `DELETE`/`TRUNCATE` | **7 of 7** | 0 |
| Tables with RLS actually enabled | **3 of 7** | 7 of 7 |
| Policies that are `USING (true)` | **19 of 19** | 0 |
| Secrets reachable from the browser | **3** (service key, Cloudinary secret, anon over-grant) | 0 |
| Identity systems | 2 (Clerk + Supabase) | **1** |
| Executing tests | **0** | Full critical-path |
| Test coverage | 0% | ≥ 70% |
| ESLint errors | 77 | 0 |
| Unreachable lines | 2,039 | 0 |
| Broken navigation links | 4 | 0 |
| First-load JS (gzip) | ~275 kB | < 100 kB |
| CSS bundle | 175 kB | < 50 kB |
| Font payload | ~914 kB | < 100 kB |
| Lighthouse Performance (mobile) | not measured | ≥ 90 |
| axe violations | not measured | 0 |
| Largest component | 1,297 lines | < 300 |
| Components querying Supabase directly | 16 | 0 |
| `bg-blue-*` usages | 165 | 0 |
| Themes | 1 (broken partial dark) | 2, both AA |
| Booking notification delivery | **0%** (8 leads stranded) | 100% |
| Overall audit score | **3.8 / 10** | **9 / 10** |

---

## Execution

This roadmap is strategic — *what*, *why*, in what order, with exit criteria. It is deliberately not task-level.

To execute a phase:

```
/superpowers:writing-plans Phase 1 of ROADMAP.md — Supabase Auth Migration
```

That produces a bite-sized, TDD-structured plan at `docs/superpowers/plans/YYYY-MM-DD-<phase>.md`, run via `superpowers:subagent-driven-development` or `superpowers:executing-plans`.

**Do not generate all phase plans up front.** Each phase changes the codebase enough that a plan written today for Phase 6 would be stale by the time Phase 5 lands.

**Phase 0 needs no plan. It is same-day work, and the destruction vector is open until it is done.**

---

*Derived from the codebase audit of commit `c1c8656` and live database introspection of project `gihgdouvltxlpynpuyde`, both 2026-09-01. Owner decisions incorporated: Supabase Auth replaces Clerk; canonical `raslipwani.co.ke`; Nairobuild cross-link; dark mode; Resend; International section routed.*
