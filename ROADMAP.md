# Raslipwani Properties — Master Roadmap (Final)

> **Version 8 — status-verified 2026-09-02, end of Release 4 Slice 4B. Supersedes all prior iterations.**
>
> **Source:** [`docs/audit/2026-09-01-codebase-audit.md`](docs/audit/2026-09-01-codebase-audit.md), plus **live database introspection** performed 2026-09-01 against project `gihgdouvltxlpynpuyde` (`rasilpwani`, eu-north-1).
>
> **Goal:** Take a functional prototype (audited **3.8/10**) to a world-class production system (**target 9/10**) on a single, coherent identity stack.
>
> **Baseline commit:** `c1c8656` · **Current head:** `worktree-release4-slice-4a` @ `1e1b357` (Releases 1–3 merged; Release 4 Slice 4A complete)

---

## 📍 Status — verified 2026-09-02

Everything below was re-checked against the working tree, a full `npm test` run, a
production build, and `npx eslint`. Checked boxes mean *verified today*, not *believed
done*. Where a task's outcome lives in the database or in Vercel, an agent cannot verify
it — those are marked 🔑 **owner-verify** and are listed in
[`docs/HANDOFF-phase1-apply.md`](docs/HANDOFF-phase1-apply.md).

| | Verified 2026-09-02 (end of Release 4 Slice 4B) |
|---|---|
| Tests | ✅ **227 passing, 19 files** — the suite executed 0 tests at baseline |
| Coverage | ✅ **62.4% statements / 63.3% lines**, enforced by a ratcheting floor (raised again in 4B) |
| Build | ✅ clean |
| Lint | ✅ **0 errors** (baseline 77) — **3,370** warnings: 365 `jsx-a11y` (deferred to 4D) plus **3,005 newly-visible** literal palette classes the 4B rule now counts. The debt did not grow; it stopped being invisible |
| Bundle | ✅ **213.9 kB gzip first load** — below the 275 kB pre-regression baseline; budget **219 kB**, 5.1 kB of headroom |
| CI | ✅ lint · test · coverage floor · **palette ratchet** · **generated-token freshness** · build · bundle budget · no-console-in-dist · secret scan, on every PR |
| Clerk | ✅ gone from runtime code and from `package.json` |
| Privileged keys in bundle | ✅ zero JWT-shaped strings in `dist/`, now enforced at build time |
| Error boundaries | ✅ root, route and admin |
| Unreachable lines | ✅ **0** — `Services.jsx`, `InternationalHub.jsx` and `DiasporaPortal.jsx` deleted, `UNHousing.jsx` routed. A test now fails if a page is orphaned again |
| Design tokens | ✅ **32 semantic role tokens in both themes**, generated from one source, every content-on-surface pair AA by 102 assertions. `bg-primary-dark` also emits rules for the first time — 20 previously-inert hover states now render |
| Fonts | ✅ Poppins is preloaded and loaded. The HTML no longer preloads a font the CSS never fetched |
| Zoom | ✅ `user-scalable=no` removed — WCAG 1.4.4 (AA) no longer failed at the viewport tag |
| Icon fonts | ✅ **0 bytes** — FontAwesome removed in 4A; it had been emitting **999 kB** of `.woff2`/`.ttf` for ~40 glyphs |
| CSS bundle | ✅ **74.4 kB raw / 12.7 kB gzip** (was 146.1 kB / 35.1 kB) |
| Console output in `dist/` | ✅ **0**, asserted on the artifact by `scripts/check-dist-console.mjs` in CI |
| Header remounts | ✅ **0 per navigation** — one layout route replaced 11 per-page render sites |
| Broken partial dark mode | ✅ **deleted** — the scaffold block flipped `:root` to `#242424` on an OS preference with no token layer beneath it, leaking dark ground behind light cards. It had been shipping |
| Status colours | ✅ **one map**. Four components each had their own; *confirmed* was blue in one and green in three, and *completed* rendered as pending in two |
| Canonical URLs | ✅ route-aware. Every page previously declared the **homepage** as its canonical |
| Release 4 | 🟢 **Slices 4A and 4B complete and verified.** 4C and 4D scoped and not started. See [Release 4 — "Themed"](#-release-4--themed--4a-complete-2026-09-02) |

**Status of the migrations — re-verified by live introspection 2026-09-02:**

| Migration | State | Effect |
|---|---|---|
| `007` emergency lockdown | ✅ **APPLIED** | anon grants reduced to exactly `properties:SELECT`, `admin_settings:SELECT`, `bookings:INSERT`; RLS on for all 8 tables. **The data-destruction vector is closed.** |
| `008` admin_users | ✅ **APPLIED** | `admin_users` + `is_admin()` exist. `auth.users` is still 0. |
| `009` auth RLS policies | ⬜ **not applied** | `clients`, `client_communications` and `client_property_interests` still carry inherited `USING (true)` policies for `authenticated`. Harmless while `auth.users` = 0; live the moment the first account exists. |
| `010` consolidate settings | ⬜ **not applied** | legacy `settings` table still present, still holding a live Cloudinary `api_secret`. |
| `011` close definer RPC | 🆕 ⬜ **not applied** | **closes an anon-callable, RLS-bypassing write path** — see below. |
| `012` lock admin_users + defaults | 🆕 ⬜ **not applied** | `authenticated` can currently `TRUNCATE admin_users`; RLS does not cover TRUNCATE. |

**Two new findings from the 2026-09-02 introspection, neither visible from the repo:**

1. 🔴 `public.update_setting(text,text,text)` is `SECURITY DEFINER`, owned by
   `postgres`, **executable by `anon`**, and runs an `UPDATE admin_settings` with no
   `WHERE` clause. SECURITY DEFINER bypasses RLS entirely, so 007's policies do not
   apply inside it, and PostgREST exposes it at `/rest/v1/rpc/update_setting`. It writes
   only `updated_by`/`updated_at`, so the blast radius is narrow — but it is an
   unauthenticated write into a table that is supposed to be read-only for anon.
   `get_setting(text)` has the same exposure and returns NULL unconditionally. Neither is
   called anywhere in `src/` or `api/`. `011` drops both.
2. 🔴 `authenticated` holds `TRUNCATE` on `admin_users`. **RLS does not apply to
   TRUNCATE**, so the table's SELECT-only policy does not stop it — any signed-in user
   could delete every admin row and lock every administrator out. The cause is
   structural: `admin_users` was created by `008`, *after* `007`'s revoke swept the
   tables that existed then, so it inherited Supabase's default ACL of `arwdDxtm` for
   anon and authenticated. Every future table will do the same. `012` fixes the table
   and the default.

**Still true:** the Cloudinary and `service_role` key rotations remain outstanding, and
`admin_settings` — which anon reads with `USING (true)` — has `cloudinary_api_secret`
and `email_api_key` columns that `CloudinarySettings.jsx` writes to. They are NULL
today. **Saving that admin form publishes your Cloudinary secret to anyone with the anon
key.** Do not use that screen until the columns are removed.

**Resolved since:** the first-load bundle regression. Removing Clerk's `manualChunks`
entry had let Rollup pull FullCalendar and Quill into the main chunk (283 kB gzip on its
own). Phase 6.1 was promoted out of Phase 6 and lazy-loaded the admin console; first load
is now **229.8 kB gzip**, better than the 275 kB it started at. `bundle-budget.json` and
the CI bundle job exist so it cannot drift back silently.

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

| # | Phase | Duration | Status (2026-09-02) |
|---|---|---|---|
| **0** | 🚨 Emergency Lockdown | **Today** | 🟡 **Code done, NOT applied.** `007` written; rotations 🔑 owner |
| **1** | Supabase Auth Migration | 1 week | 🟡 **Code complete & tested.** `008`/`009` authored, **not applied** |
| **2** | Revenue & Data Integrity | 1 week | 🟢 **2.1 done** (needs keys 🔑) · **2.2 done** · **2.3 done** |
| **3** | Safety Net | 1 week | ✅ **Complete** — 3.1 (84 tests + coverage floor), 3.2 (0 lint errors), 3.3, 3.4 |
| **4** | Structure & International IA | 2 weeks | 🟢 **4.1 done · 4.3 done (4A)** · 4.2, 4.4 → Release 5 |
| **5** | Design System + Dark Mode | 2 weeks | 🟢 **5.1 done · 5.4 done · 5.6 mostly done (4A)** · **5.2, 5.3, 5.5 → Release 4 (4B/4C/4D)** |
| **6** | Performance | 1 week | 🟢 **6.1 mostly done · 6.2 done · 6.3 done (4A)** · 6.1 client split, 6.4 → Release 5 |
| **7** | Accessibility | 1 week | 🟢 **7.1 (zoom) done · icon a11y contract landed (4A)** · **rest → Release 4 (4D)** |
| **8** | SEO & Cross-Brand | 1 week | ⬜ Not started (8.5 partially shipped pre-roadmap) |
| **9** | Client-Side UI Revamp | 3 weeks | ⬜ Not started |
| **10** | Platform Maturity | Ongoing | ⬜ Not started |

**Safe to operate: Phases 0 → 3 (~3 weeks).** Phases 0–4 are sequential; 5–8 largely parallelise.

---

## 🎯 Re-scoped Delivery Plan

The phase map above is the *complete* picture — roughly fifteen weeks of work. That is a
map, not a plan. What follows is the plan: what to do next, sized so each block ends with
something shipped.

The re-scope is driven by three facts established on 2026-09-02:

1. **Everything already built is blocked behind one owner action.** Phases 0, 1, and 2.1
   are code-complete and tested, and deliver *nothing* until migrations are applied and
   two secrets are set. Writing more code before that does not move the product forward.
2. **The bundle regressed.** First-load JS went from ~275 kB gzip to ~446 kB. Phase 6.1
   is a half-day of `lazy()` calls that recovers it, and it now sits in the critical path
   rather than eight phases away.
3. **The big phases are not the bottleneck.** Phases 4, 5, and 9 total seven weeks of
   restructuring. None of them are what stands between this codebase and a safe,
   revenue-generating deployment.

### 🔑 Release 1 — "Safe and earning" · *blocked on owner, ~1 day of owner time*

Nothing here is code. All of it is already written and waiting.

- [ ] Back up the database, then apply `007` → `008` → `009` **in order**
- [ ] Create the admin account; disable public signup
- [ ] Verify the lockdown from outside with the anon key — *a control you have not tested
      is a control you do not have*
- [ ] Rotate the Supabase `service_role` key and the Cloudinary `api_secret`
- [ ] Set `RESEND_API_KEY` + `BOOKING_NOTIFICATION_EMAIL` in Vercel; verify the sending
      domain (SPF/DKIM/DMARC)
- [ ] Triage the 8 stranded `pending` bookings by hand *before* automation goes live

Full instructions: [`docs/HANDOFF-phase1-apply.md`](docs/HANDOFF-phase1-apply.md).

**Ships:** the destruction vector closed, secrets rotated, and — for the first time — a
booking that actually notifies someone.

### ✅ Release 2 — "Trustworthy" · **COMPLETE 2026-09-02**

The smallest set of work that makes the codebase safe to change quickly.

- [x] **6.1 Lazy-load admin** *(promoted)* — bundle recovered to **229.8 kB gzip** first
      load, below the 275 kB pre-regression baseline. `2b9cf93`
- [x] **2.2 Reproducible schema** — `000_baseline.sql` added, the invalid
      `CREATE POLICY IF NOT EXISTS` fixed, duplicate `003_` prefixes given a total
      ordering, `004` rewritten to drop the contradictory `admin_settings` definition,
      and `010_consolidate_settings` added to close the admin RLS gap and retire the
      legacy `settings` table. `AdminProperties.jsx` repointed to `admin_settings`.
      The chain now replays from an empty database. `cfe21b3`
- [x] **3.4 CI** — GitHub Actions on every PR and on pushes to `main`/`staging`:
      `npm ci → lint → test:coverage → build → bundle budget`, plus a pinned `gitleaks`
      secret scan and a `prebuild` guard that fails on secret-shaped `VITE_*` names.
      `c5a119b`
- [x] **3.2 Lint to zero** — 78 errors → **0**. `eslint-plugin-react` and `jsx-a11y`
      were missing entirely, so JSX identifiers read as unused; installing them found
      real bugs the old config could not see. `cb48d0c`
- [x] **3.3 Error boundaries** — root, per-route and admin, with a branded recovery
      screen and retry. `4f7a482`
- [x] **3.1 finished** — `@vitest/coverage-v8` installed, the ratcheting floor set from
      the live baseline instead of `0`, and the three assertion-free tests in
      `AdminBookings.test.jsx` given real assertions. 84 tests, 13 files.

**Shipped:** a bundle back under control, a schema that rebuilds, and a pipeline that
keeps both true.

> ⚠️ Release 2 hardens the *codebase*. It changes nothing in production. **Release 1 —
> one day of owner time — is still the only thing standing between the live database and
> anyone with the anon key.** It remains the highest-value work available, and no amount
> of further code changes that.

### ✅ Release 3 — "Coherent" · **COMPLETE 2026-09-02**

- [x] **4.1 International section** — the hub conflict is resolved, `UNHousing` is
      routed, `DiasporaPortal`'s fate is decided, and `Services.jsx` is gone. All
      **2,074 unreachable lines** retired.
      - `International.jsx` won the hub contest on completeness (multi-currency,
        investment calculator, six sections). `InternationalHub.jsx`'s genuine
        contribution — audience segmentation and the *"Capturing the UN Nairobi
        Opportunity"* framing — was merged in as a triage section directly under the
        hero, and the file deleted. Its three cards now go somewhere: UN staff →
        `/international/un-housing`, diaspora → the on-page diaspora section,
        international professionals → `/properties`. The old `targetMarkets` grid was
        removed as a duplicate: it named the same three audiences and linked to none
        of them.
      - `UNHousing.jsx` routed at `/international/un-housing`, with a breadcrumb back
        to the hub, plus nav dropdown and `sitemap.xml` entries.
      - **`DiasporaPortal.jsx` deleted, not routed.** It is a mock-data prototype —
        two hardcoded properties, fabricated rent, portfolio value and ROI — with no
        `owner_properties` model behind it. Routing it at `/portal` would have shown
        signed-in users invented figures about their own money. The IA intent survives
        as a Phase 10 item; the design is recoverable from git history.
      - **`Services.jsx` deleted** (800 lines) — a near-duplicate of the live
        `ServicesMain.jsx` and the source of the earlier email bug. Nothing imported it.
      - A test enforces principle 5 from here on: `src/pages/__tests__/pages.routed.test.js`
        walks App.jsx's import graph and fails if any module in `src/pages` is
        unreachable. Verified to fail on a deliberately orphaned file.
- [x] **5.1 Broken token fixed** — `primary`, `secondary` and `accent` are now objects
      with `DEFAULT`/`dark`/`light`. `bg-primary-dark` (18 uses) and `text-primary-dark`
      (2) compiled to **zero rules** before this; confirmed against compiled CSS that
      `.hover\:bg-primary-dark:hover` now emits `#0A3A56` and `.bg-primary` still emits
      `#0D4B6E`. Every primary CTA has hover feedback for the first time.
- [x] **5.4 Global CSS cleaned** — the Poppins/Inter mismatch is fixed at both ends:
      `index.html` preloaded Inter while `index.css` `@import`-ed Poppins. Poppins is now
      a `<link rel="stylesheet">` in the HTML (discovered in the initial document rather
      than after the CSS bundle parses) and the `@import` is gone, with a
      `fonts.gstatic.com` preconnect added. The Vite scaffold `button { … }` block was
      removed — only its focus ring is kept. The `!important` `aria-label` hiding hack
      was removed outright: the markup it suppressed no longer exists anywhere in `src/`.
- [x] **7.1 Zoom re-enabled** — `maximum-scale=1.0, user-scalable=no` removed from the
      viewport; `viewport-fit=cover` kept. A direct WCAG 2.1 SC 1.4.4 (AA) failure closed.

**Shipped:** every page written is a page reachable, on a type and token foundation that
actually compiles, and pinch-zoom works.

> ⚠️ Release 3, like Release 2, changes nothing in production. **Release 1 remains one day
> of owner time and remains the only thing standing between the live database and anyone
> with the anon key.**

### 🎨 Release 4 — "Themed" · **4A COMPLETE 2026-09-02**

The design-system release. It is the last block of work Phase 9 (the original UI-revamp
request) is waiting on, and the first block whose value the visitor can see.

**Everything in this section was measured on 2026-09-02, not inherited from an earlier
draft.** Three numbers the roadmap carried turned out to be wrong, and the corrections
change the scope — they are called out where they land.

#### Why this shape, and why this order

The obvious Release 4 — "do 5.2, then 5.3, then 5.5, then Phase 7" — is the wrong order,
and it is worth saying why before committing to a different one.

1. **Migrating call sites before primitives exist means migrating them twice.** There are
   ~1,784 raw palette classes in `src/` (see the table below). If tokens are swapped in
   first, every `<button className="bg-blue-600 px-4 py-2 rounded">` is edited once for
   the token and again when `<Button>` replaces it. Build the primitive first and the
   call site collapses to `<Button>` — the token debt leaves as a side effect of markup
   that shrinks rather than an edit pass of its own.
2. **Deleting markup beats theming markup.** 4.3 (layout routes) removes 11 duplicated
   `<Header />`/`<Footer />` render sites, and 6.2 (FontAwesome) rewrites 67 icon call
   sites that would otherwise need theming twice. Both are cheap, both shrink the surface
   5.2 has to cross, and 4.3 additionally fixes a live bug. They go first.
3. **A ~1,784-site colour migration cannot be verified by a test suite.** No assertion
   catches "this surface now renders dark text on a dark card." So the release ships its
   own guard rails — a lint rule that bans raw palette classes with a ratcheting count, a
   contrast test over the token layer itself, and `axe-core` in CI — and those land
   *before* the migration they police, not after.

Four slices, each independently mergeable and independently valuable. **Every slice ends
deployable** — principle 6 applies inside a release, not only between them.

#### Slice 4A — Shrink the surface · ✅ **COMPLETE** (`1e1b357`)

Everything here removed weight or removed duplication, so the theming work in
4B/4C crosses a smaller surface. All four items shipped, plus three defects found
on the way in.

- [x] **4.3 Layout routes.** `<PublicLayout>` renders the chrome once above an
      `<Outlet />`; all 11 per-page `<Header />`/`<Footer />` render sites are
      gone. This was not tidying: `Header.jsx:18-23` attaches a scroll listener
      on mount, and the header was unmounting and remounting on every
      navigation, tearing that listener down and resetting sticky state each
      time. Pages keep their own `<main>`; `International.jsx` and
      `UNHousing.jsx` gained the `<main>` landmark they never had. The 404 moved
      inside the layout, so a mistyped URL keeps its navigation.
- [x] **6.2 + 5.6 FontAwesome removed.** All **67 `fa-` usages across 10 files**
      now route through one `<Icon>` registry backed by `lucide-react`.
      **`dist/` went from 1,022,976 bytes of icon fonts to zero**, and the CSS
      bundle from 146.1 kB to 74.4 kB raw (35.1 → 12.7 kB gzip).
- [x] **6.3 Console output stripped.** 55 `console.*` calls became `logger.*`,
      which no-ops outside development; `esbuild.drop` removes the rest at build
      time — scoped to `command === 'build'`, because Vite applies `esbuild` to
      the dev transform too and dropping `console` there would silence the very
      diagnostics the logger exists to keep. No terser needed, contrary to the
      comment at the old `vite.config.js:26`.
- [x] **Fixed `index.html`'s `<title>`** — it read `Rasilpwani Properties`
      against `Raslipwani` in all 174 other occurrences.

**Three defects found while doing the above, each fixed here:**

1. 🔴 **Every page declared the homepage as its canonical URL.** `DynamicSEO`
   renders once above the router and emitted
   `<link rel="canonical" href="https://raslipwani.co.ke">` on *every* route.
   A canonical naming a different URL than the page it sits on tells crawlers
   that page is a duplicate and should not be indexed in its own right — so
   every listing, service page and statutory page was asking to be dropped from
   the index. `PublicLayout` now emits a route-aware canonical; `Properties`
   (query-stripped) and `PropertyDetail` (slug-based) still override it with
   their better answers. Home separately declared a `www.` canonical — a
   different host from the rest of the site — which is also gone.
2. 🟠 **`admin-mobile.css` was a top-level `App.jsx` import**: 328 lines of admin
   console styling in the stylesheet every public visitor blocks on, for an
   audience of one. Moved into the lazy admin chunk. Its two global rules were
   redundant — `index.css` already sets `overflow-x: hidden` and Tailwind
   preflight already sets `box-sizing`.
3. 🟠 **`console.error` was leaking Supabase internals to visitors.**
   `App.jsx` printed error objects — table names, column names, sometimes row
   contents — into the console of anyone who hit a missing listing. Console
   output is not a private channel. Now dropped from the build and asserted
   absent from the artifact.

**Guard rails landed with the slice, not after it:**

- `scripts/check-dist-console.mjs`, wired into CI — asserts zero `console.*` in
  the built application chunks. A config option is a claim until something
  checks the artifact.
- Tests asserting: no `fa-` classes in `src/`, no `@fortawesome` dependency, no
  `console.*` outside the logger and DebugPanel, no `<Header />`/`<Footer />`
  outside the layout route, and a `<main>` landmark on every public page.
- The `<Icon>` registry test renders all 45 names and checks the a11y contract
  (decorative by default, `role="img"` + `aria-label` on request).
- Bundle budget ratcheted **235 → 219 kB**; coverage floor raised to 60 lines /
  59 statements / 45 functions / 46 branches.

**Exit criteria — measured, not asserted:**

| | Target | Result |
|---|---|---|
| Font payload | < 100 kB | ✅ **0 bytes** (was 999 kB) |
| One icon library | 1 | ⚠️ **2** — see correction below |
| `console.*` in `dist/` | 0 | ✅ **0**, enforced in CI |
| Header mounts per navigation | 0 | ✅ **0** |
| First-load CSS | < 50 kB | ⚠️ **74.4 kB raw** (12.7 kB gzip) — see correction below |

🔧 **Correction — "one icon library" is not reachable as scoped.**
`lucide-react` has **no mark for TikTok, WhatsApp or Pinterest**, all three of
which the site uses. Those come from `react-icons/si`, already a dependency and
already shipping as tree-shaken SVG, so the count is **3 → 2, not 3 → 1**. The
payload goal was met in full regardless — FontAwesome was the only *font*-based
library, and it accounted for 100% of the 999 kB. Reaching literal parity would
mean hand-drawing three brand marks, which is a trademark question, not an
engineering one. The remaining `react-icons` usage (30 files, mostly `Fi`/`Fa`
sets) costs no fonts and is folded into **Slice 4C**, where the primitives
standardise icon usage anyway.

🔧 **Correction — the sub-50 kB CSS target belongs to 4C, not 4A.**
Removing FontAwesome took the CSS bundle from 146.1 kB to 74.4 kB raw — roughly
half, and all of the vendor half. The remaining 74.4 kB is Tailwind utility
output driven by the app's own class usage, which *is* the ~1,784 raw palette
classes Slice 4C collapses into primitives. No further 4A-shaped work reduces
it. Gzipped it is already **12.7 kB**, so the criterion is met on the wire and
missed on disk; the target moves to 4C where the work that reaches it lives.

⚠️ **A trap for later slices, found here:** `src/test/setup.jsx` mocks
`useLocation` **globally** to a fixed `/admin`. That is right for the admin
components it was written for and wrong for anything route-aware — with it in
place, `PublicLayout` reported the same canonical on every route and the bug
above would have been invisible to its own test. `PublicLayout.test.jsx` undoes
it locally. **Any route-aware component tested from here on must do the same**,
or the global mock should be narrowed to the suites that need it.

#### Slice 4B — Build the layer · ✅ **COMPLETE**

The layer is built and proven before anything is migrated onto it. That ordering is
the whole slice: a colour system is the one part of a design system a test can
actually verify, so it is verified first and migrated second.

- [x] **5.2 Semantic dual-theme tokens.** 32 role tokens — `surface`,
      `surface-raised`, `surface-sunken`, `surface-overlay`, `surface-inverse`,
      `content`, `content-muted`, `content-subtle`, `content-inverse`, `border`,
      `border-strong`, `brand`/`brand-hover`/`brand-subtle`/`brand-content`,
      `content-on-brand`, `accent`/`accent-hover`/`content-on-accent`,
      `focus-ring`, plus a `surface`/`content`/`border` triple for each of
      `success`/`warning`/`danger`/`info` — defined in both themes in
      `src/design/tokens.js`, emitted as CSS custom properties, consumed by
      Tailwind with `darkMode: 'class'`.
      **The values are generated, not copied.** The same palette has to exist as
      CSS the browser paints, as Tailwind names components write, and as hex the
      contrast formula reads. Three hand-kept copies drift — usually in the theme
      nobody has open — so `scripts/generate-tokens.mjs` writes
      `src/styles/tokens.css` from the one source, `npm run build` refuses to
      build against a stale copy, and a test fails if it is out of date.
      Channels are emitted space-separated (`245 249 252`) rather than as hex so
      Tailwind's `<alpha-value>` slot works and `bg-surface/80` behaves like a
      built-in colour.
- [x] **Status colours become tokens, not opinions.** One map in
      `src/design/status.js`, read by `BookingStatusBadge`, `BookingList`,
      `BookingRow` and `AdminBookings`. **Two real defects fell out of doing it:**
  1. **The same booking changed colour depending on the screen.**
     `BookingStatusBadge` rendered *confirmed* in blue; `BookingList` and
     `BookingRow` rendered it in green. Each site was unit-tested against its own
     opinion, so nothing failed.
  2. **Completed bookings read as still-outstanding.** `BookingList` and
     `BookingRow` used a two-branch ternary — confirmed, cancelled, else — so
     *completed* fell through to the pending colour. `confirmed` is now `info`
     and `completed` is `success`, and a test asserts they cannot be equal:
     confirmed means "on the calendar", completed means "done", and that is the
     distinction the admin acts on.
- [x] **The guard rail lands with the layer, not after it.**
      `eslint-rules/no-raw-palette-classes.js` flags every literal Tailwind colour
      in `src/` as a warning with an actionable message naming the token to use
      instead; `scripts/palette-ratchet.mjs` enforces `palette-budget.json` in CI,
      and refuses to raise the ceiling even when asked. Verified by regression
      probe: adding three literal classes takes the check to exit 1 and `--update`
      to a refusal.
      It counts from ESLint running the real rule rather than from a second regex,
      because two definitions of "a palette class" eventually disagree and the one
      CI trusts is the one nobody reads. It also scans configuration objects, not
      only `className` attributes — half the debt here lives in maps like
      `{ color: 'bg-yellow-100 text-yellow-800' }`.
- [x] **Contrast is asserted, not eyeballed.** 102 assertions across both themes:
      every text role on every ground, brand-as-link on every ground, button and
      accent labels on their fills, each status colour both on its own tint *and*
      directly on a card, control boundaries at WCAG 1.4.11's 3:1, and the focus
      ring against the page. Verified to fail: lightening `content-subtle` by four
      steps turns four assertions red.

**Two things done here that the slice did not ask for, with reasons:**

1. **The broken dark block at `index.css:78-88` was deleted here rather than in
   4D.** It flipped bare `:root` to `#242424` under `prefers-color-scheme: dark`
   with no token layer beneath it, so dark ground leaked behind light components —
   and it has been shipping. Leaving it in place for one more slice would have
   meant a token layer and a media query asserting different things about the same
   page. The global stylesheet now paints from `--surface`/`--content`, and the
   focus ring from `--focus-ring` instead of `-webkit-focus-ring-color`, which is
   invisible in dark mode.
2. **`primary` and `accent` became theme-aware.** ~470 call sites use them and
   4C is where those move, but the brand hex is **2.1:1 on a dark ground** —
   leaving it literal would have meant shipping an unreadable button the moment
   4D turns dark mode on. Dark mode now resolves a lighter brand.

🔧 **Correction — the raw-palette count was low, and the definition was the
reason.** The roadmap recorded **~1,784**. The rule counts **3,005**. The earlier
figure looked only at `bg-`/`text-` for a subset of hues; it did not count variant
chains (`hover:`, `md:`, `dark:`), bare `white`/`black`, the other fifteen colour
utilities (`border-`, `ring-`, `divide-`, `from-`/`via-`/`to-`, …), or the
configuration objects. All of those are surface a theme has to cross. **3,005 is
the number 4C is scoped against**, and `palette-budget.json` is where it lives.

**Exit criteria — measured, not asserted:**

| | Target | Result |
|---|---|---|
| Token layer, both themes | complete | ✅ **32 tokens × 2 themes**, name-for-name identical by test |
| Every pair AA by test | 4.5:1 text / 3:1 non-text | ✅ **102 assertions**, all passing, proven able to fail |
| Ratchet in CI | present | ✅ **3,005 ceiling**, blocking, refuses to rise |
| Generated CSS cannot drift | — | ✅ enforced by `prebuild` **and** by a test |
| Tests | ≥ 100 | ✅ **227 passing** (was 98), 19 files |
| Coverage floor | ratchets up | ✅ **62 lines / 61 statements / 48 functions / 48 branches** (was 60/59/45/46) |
| First-load JS | ≤ 213.2 kB | ✅ **213.9 kB** — +0.7 kB, the token declarations themselves |
| Lint errors | 0 | ✅ **0** |
| Call sites migrated | 0 | ⚠️ **8** — the status pills above, which are the slice's own deliverable |

#### Slice 4C — Primitives, and the migration they carry *(≈5 days)*

- [ ] **5.5 Primitives on the token layer:** `Button`, `Input`, `Select`, `Card`, `Badge`,
      `Modal`, `Toast`, and a `ConfirmDialog`. Both themes, keyboard-complete, from the
      first commit — an inaccessible primitive multiplies by every call site.
- [ ] **Retire the 10 native browser dialogs.** 🔧 **Correction: 10, not 12** — 5 `alert()`
      and 5 `confirm()` across 8 files. Two of them are not admin conveniences:
      `ServicesMain.jsx:167` and `ViewingExperience.jsx:208` are both **live booking
      confirmations** — the highest-value moment in the customer journey — delivered as an
      unstyled, thread-blocking browser dialog. `react-hot-toast` is already a dependency
      in 16 files. The four destructive `confirm()` calls become a `ConfirmDialog` that
      names what is being deleted.
- [ ] **Migrate surfaces through the primitives**, highest-traffic first: Home →
      Properties → PropertyDetail → booking flow → Contact/About → admin. Each surface is
      its own PR, and each drops the ratchet ceiling. Admin last: it is the surface with
      one user, and it is where a mistake costs the least.
- [ ] `Modal` absorbs `PropertyModal`, `BookingModal`, `BookingDetailModal` and
      `ClientForm` — which is also how Phase 7's focus-trap requirement gets satisfied
      once instead of four times.

**Exit:** raw-palette ratchet below 400 · zero `alert()`/`confirm()` in `src/` · every
modal rendered by one primitive.

#### Slice 4D — Ship the theme, and the accessibility it exposes *(≈4 days)*

- [ ] **5.3 Dark mode.** Theme provider (`light`/`dark`/`system`), persisted, respecting
      `prefers-color-scheme`, toggle in the header and the admin shell.
- [ ] **Delete the broken dark block at `index.css:78-88` — do not build on it.** It flips
      bare `:root` to `#242424` under `prefers-color-scheme: dark` with no token layer
      beneath, so dark backgrounds already leak behind light components today. It is a
      hazard, and it has been shipping.
- [ ] Audit every surface in both themes, including property imagery, FullCalendar, Quill,
      and the four hardcoded hex values in the `.custom-calendar` block.
- [ ] **7.x Accessibility — the part that is genuinely broken.** 374 lint warnings sound
      like the measure; they are not. 134 of them come from `jsx-a11y/label-has-for`, a
      **deprecated rule double-counting** `label-has-associated-control`. The real defect
      is simpler and worse: **134 `<label>` elements, 11 `htmlFor` attributes, 134 form
      controls.** Roughly 123 labels are associated with nothing, which is a screen reader
      announcing an unlabelled input on every form on the site.
  - [ ] Pair `htmlFor`/`id` across all 134 controls.
  - [ ] Focus trapping, `aria-modal`, and focus restoration — once, in the `Modal`
        primitive from 4C.
  - [ ] `aria-expanded`/`aria-controls` on header dropdowns and mobile menu. **33
        `aria-*` attributes and 4 `role=` exist across 96 files**, of which only 2 are
        `aria-expanded`.
  - [ ] Skip-to-content link; live regions for async status and toasts.
  - [ ] **`axe-core` in CI**, failing the build on violations, plus a keyboard-only pass
        over the booking flow in both themes.

**Exit:** two themes, both AA by contrast test and by axe · zero axe violations in CI ·
every public flow completable by keyboard in both themes.

#### What Release 4 deliberately does not do

- **4.2 (data-access layer) and 4.4 (component decomposition).** Both are real, and 4.2
  gates 4.4. Neither is visible to a user, and neither blocks Phase 9. Release 5.
- **Phase 8 (SEO).** 8.3's SPA-rendering constraint is likely the largest single limit on
  organic acquisition and deserves its own investigation — possibly its own project. It
  does not belong bolted to a design release.
- **Phase 9 itself.** Release 4 builds the system; Phase 9 is the redesign that spends it.
  Conflating them produces a redesign with no reusable layer underneath, which is how this
  codebase acquired 1,784 raw palette classes in the first place.
- **The Supabase client split (remaining 6.1).** `vendor-supabase` is 56 kB gzip and the
  largest item in first load, but the sub-100 kB target needs it *and* 6.2 *and* route-level
  work. 6.2 lands here; the rest is Release 5, measured against what 4A actually recovers.

#### Release 4 exit criteria — numeric, and checkable

| | Release 4 start (2026-09-02) | After 4A | **After 4B** | Release 4 exit | Slice |
|---|---|---|---|---|---|
| Raw palette classes in `src/` | 1,784 *(under-counted)* | 1,784 | **3,005 counted, ceiling live** | **< 400**, ratcheting in CI | 4B ✅ / 4C |
| Themes | 1 (broken partial dark) | 1 | **layer for 2, AA by test; provider pending** | **2, both AA by test** | 4B ✅ / 4D |
| Native `alert()`/`confirm()` | 10 | 10 | 10 | **0** | 4C |
| Icon libraries | 3 | ✅ **2** | 2 | **2** *(revised — see 4A)* | 4A ✅ |
| Font payload | 999 kB *(re-measured; ~914 was low)* | ✅ **0 bytes** | 0 bytes | **< 100 kB** | 4A ✅ |
| CSS bundle | 146.1 kB raw / 35.1 kB gzip | ✅ **74.4 kB / 12.7 kB** | 76.7 kB / 13.3 kB *(+2.3 kB: the token declarations)* | **< 50 kB raw** *(moved to 4C)* | 4A + 4C |
| `<label>` without `htmlFor` | ~123 of 134 | ~123 of 134 | ~123 of 134 | **0** | 4D |
| axe violations | not measured | not measured | not measured | **0, enforced in CI** | 4D |
| `console.*` in `dist/` | present | ✅ **0**, enforced in CI | 0 | **0** | 4A ✅ |
| Header remounts per navigation | 1 (scroll listener rebuilt each time) | ✅ **0** | 0 | **0** | 4A ✅ |
| Canonical URL per page | homepage on every route 🔴 | ✅ route-aware | route-aware | correct | 4A ✅ |
| First-load JS+CSS (gzip) | 229.8 kB | ✅ **213.2 kB**, budget 219 kB | ✅ **213.9 kB** | **≤ 229.8 kB** | 4A ✅ |
| Tests | 86 passing, 60.76% statements | ✅ **98 passing, 61.51%** | ✅ **227 passing, 62.38%** | **≥ 100 passing, floor ratchets up** | 4B ✅ |

> ⚠️ Release 4, like Releases 2 and 3, **changes nothing in production**. Slices 4A and
> 4B are merged and verified, and not one byte of either has reached a visitor — it sits on a branch,
> like everything before it. This is now the *sixth* consecutive block of agent-executable
> work stacked on top of a database that is still untouched. **Release 1 is still one day
> of owner time, and it is still the only thing standing between the live database and
> anyone holding the anon key.** A beautifully themed, fully accessible front end that
> loads 999 kB faster over a table anyone can `TRUNCATE` is not a world-class product —
> it is a faster way to reach the same exposure.

### Later — deliberately deferred

Phases 4.2, 4.4, the remainder of 6, all of 8, 9, and 10 remain valuable and remain
documented in full below. **Phase 9 (the UI revamp — the original request) should be built
on the design system Release 4 establishes, not before it** — for the same reason Release 3
had to precede Release 4. See [Execution](#execution).

---

## 🚨 Phase 0 — Emergency Lockdown

**Same day. Every hour of delay is a window in which your bookings can be deleted.**

### 0.1 — Kill the destruction vector 🔴 **FIRST**

`anon` holds `DELETE`, `UPDATE`, `INSERT`, and `TRUNCATE` on every public table, and RLS is off on four of them. Revoke the grants **before** anything else — this is the change that stops data loss, and it takes one migration.

- [x] **Write** `007_emergency_lockdown.sql` — authored, reviewed, committed. 🔴 **NOT APPLIED.** 🔑
  - `revoke all on all tables in public from anon;`
  - Re-grant only what the public site genuinely needs: `select` on `properties`, `select` on `admin_settings`, `insert` on `bookings`.
  - `alter table … enable row level security` on **`bookings`, `clients`, `properties`, `settings`** — the four currently unprotected.
  - Interim policies: public `SELECT` on published `properties`; anon `INSERT`-only on `bookings`; **zero anon access to `settings` and `clients`**.
- [ ] 🔑 **Verify by attempting it.** Confirm with the anon key that `DELETE` on `bookings` is rejected and `settings` returns `401`/empty. A control you have not tested is a control you do not have.
- [ ] 🔑 Take a full database backup **before** applying, so a mistake here is reversible.

### 0.2 — Rotate the Cloudinary secret 🔴 **NEW**

The `settings` table holds a **non-null `api_secret`** with RLS off and 0 policies, reachable by anon (`HTTP 206`). A Cloudinary `api_secret` permits signed uploads, deletions, and account operations against your entire media library — which is every property photo you have.

- [ ] 🔑 Rotate the Cloudinary API secret in the Cloudinary console.
- [ ] 🔑 Review the Cloudinary activity log for unfamiliar uploads or deletions.
- [ ] 🔑 **Stop storing it in a browser-reachable table.** Move it to a Vercel environment variable used only by server-side code. A secret in a PostgREST-exposed table is a published secret, regardless of policy.
- [ ] 🔑 Once migrated, `alter table settings drop column api_secret;`. Also review the duplicate-looking `settings` vs `admin_settings` tables and consolidate.

### 0.3 — Rotate the Supabase service key 🔴

`VITE_SUPABASE_SERVICE_KEY` is set in Vercel production. Vite inlines every `VITE_*` variable into the bundle as a string literal, so the `service_role` JWT has been publicly downloadable from your CDN.

- [ ] 🔑 **Rotate first:** Supabase → Settings → API → `service_role` → Reset. Deleting the Vercel variable does **not** invalidate keys already in bundles you have served.
- [ ] 🔑 Delete `VITE_SUPABASE_SERVICE_KEY` from all Vercel environments; redeploy.
- [x] Verify no privileged key ships. **Confirmed 2026-09-02:** zero JWT-shaped strings in `dist/`. Re-verify against production after redeploy. 🔑
- [x] Remove the `supabaseAdmin` export and update `AdminProperties.jsx`. **Done** — the service-key client no longer exists in the codebase.
- [x] Add a build-time guard failing the build if any `VITE_*` name matches `SERVICE|SECRET|PRIVATE|PASSWORD`. **Done** — `scripts/guard-env-names.mjs`, wired as `prebuild` so it covers local, CI *and* Vercel builds. Also checks committed `.env*` files, and prints names only, never values.

### 0.4 — Assess and document

- [ ] 🔑 Supabase → Logs → API: review the full retention window for anomalous `anon` and `service_role` activity — bulk `SELECT` on `bookings`, unexpected `DELETE`, unfamiliar IPs.
- [ ] 🔑 Verify the 12 bookings and 12 properties are intact and unmodified.
- [ ] 🔑 Check `admin_settings` against known-good values (phone, email, WhatsApp, logo) — the lead-hijack target.
- [ ] 🔑 **`clients` has 0 rows, so no client PII was exposed.** `bookings` did expose 12 customers' names, emails, and phones. Assess whether that meets the notification threshold under the Kenyan Data Protection Act 2019 (72-hour ODPC window). That is a legal question — get counsel, do not decide it in-house.
- [ ] Document in `docs/audit/2026-09-01-incident.md`.
- [ ] 🔑 **Revoke the `sbp_` introspection token** when this phase closes.

**Exit criteria:** anon cannot delete, update, or truncate anything. RLS enabled on all 7 tables. Cloudinary and service keys rotated. Logs reviewed.

---

## Phase 1 — Supabase Auth Migration

**Timeline: 1 week.** Removes the root cause of every auth defect in the audit.

**This is greenfield: `auth.users` = 0.** No migration, no dual-write, no cutover risk.

### 1.1 — Model admin identity

- [x] Create `admin_users` — authored in `008_admin_users.sql`: `id uuid primary key references auth.users(id) on delete cascade`, `email text not null`, `role text not null default 'admin'`, `created_at timestamptz default now()`.
- [x] RLS on `admin_users`: a user may read their own row; only `service_role` writes. **No self-service signup** — an admin table anyone can insert into is not an admin table.
- [x] Helper: `create function is_admin() returns boolean language sql security definer stable as $$ select exists (select 1 from admin_users where id = auth.uid()) $$;`
- [ ] 🔑 Seed the initial admin account through the Supabase dashboard.
- [ ] 🔑 Disable public signup in Auth settings. Admin accounts are provisioned, never registered.

### 1.2 — Replace the client-side auth layer

- [ ] 🔑 Enable Email/Password in Supabase Auth. Enforce a strong password policy; enable MFA if available on your plan — this login guards all customer data.
- [x] Build `src/contexts/AuthContext.jsx` around `supabase.auth`: `signIn`, `signOut`, `session`, `user`, `isAdmin`, with `onAuthStateChange` subscribed and cleaned up.
- [x] Build `src/pages/AdminLogin.jsx` — branded, replacing Clerk's hosted UI.
- [x] Rewrite `ProtectedRoute` (`App.jsx:80-97`) against the Supabase session, checking `is_admin()` rather than mere authentication. **Signed in ≠ admin.**
- [x] Replace `src/components/AuthButtons.jsx` (Clerk `SignedIn`/`SignedOut`).
- [x] Remove `ClerkProvider` from `App.jsx:150` and the `clerkPubKey` guard at `App.jsx:59`.
- [x] Session-expiry handling — a redirect to login, not a white screen. *(Password reset is still outstanding.)*

### 1.3 — Simplify the Supabase client

- [x] With Supabase Auth, the client attaches the session automatically. Delete the entire `supabaseAdmin` concept — it existed only to bypass RLS that Clerk could not satisfy.
- [x] One client, one key, one code path.

### 1.4 — Real RLS on `auth.uid()`

Now that identity is native, policies can express rules instead of `true`.

- [x] `properties` — public `SELECT` limited to published/available; writes `using (is_admin())`.
- [x] `bookings` — anon `INSERT` only, with column constraints; `SELECT`/`UPDATE`/`DELETE` admin-only. **A prospect must never read another prospect's booking.**
- [x] `clients`, `client_communications`, `client_property_interests` — admin-only, all operations. This is PII.
- [x] `admin_settings` — public `SELECT`; writes admin-only.
- [x] `settings` — no anon access at all; secrets already removed in Phase 0.2.
- [x] Delete every `USING (true)` policy.
- [x] **Migrate identity columns:** `bookings.assigned_agent_id` and `bookings.confirmed_by` are `text` (Clerk IDs). Convert to `uuid references auth.users(id)`. Existing rows hold Clerk IDs or nulls — with 12 bookings, backfill by hand.
- [ ] 🔑 Tests: anon **cannot** read `clients`; anon **cannot** delete `bookings`; admin **can** do both. *(Policies are written and reviewed; the outside-in anon probe is a Release 1 step — it cannot pass until the migrations are applied.)*

### 1.5 — Remove Clerk entirely

- [x] `npm uninstall @clerk/clerk-react` — removes 72 kB from the bundle.
- [x] Deleted from `.env`. 🔑 Still present in Vercel. 🔑
- [x] Remove `vendor-clerk` from `vite.config.js` `manualChunks`. ⚠️ **This caused the bundle regression** — see 6.1.
- [x] `grep -ri clerk src/` returns only one code comment and stale files in `src/Docs/`. No runtime references.
- [ ] 🔑 Delete the Clerk application once the new login is verified in production.

**Exit criteria:** zero Clerk references. Admin login works via Supabase. Every policy references `auth.uid()`. Anon can read published properties and insert a booking — nothing else, proven by test.

---

## Phase 2 — Revenue & Data Integrity

**Timeline: 1 week.**

### 2.1 — Resend booking notifications 🔴

**Four stacked breakages mean no booking has ever produced an email.** Introspection makes the cost concrete: **8 bookings sit in `pending`** — real people who enquired and were never contacted.

- [x] Add `resend`. 🔑 Still to set `RESEND_API_KEY` in Vercel 🔑 **server-side only — no `VITE_` prefix**.
- [ ] 🔑 Verify `raslipwani.co.ke` as a Resend sending domain (SPF + DKIM + DMARC). Unverified mail lands in spam, which is indistinguishable from not sending.
- [x] **Move the handler** from `src/pages/api/send-email.js` to root-level `/api/send-email.js`. Vercel serves functions only from a root `api/` directory; nothing under `src/` is ever deployed.
- [x] **Fix `vercel.json`:** the catch-all rewrite `"/(.*)"` → `"/"` swallows `/api/*`. Change source to `"/((?!api/).*)"`.
- [x] Replace the Mailtrap sandbox stub and its literal `"your-mailtrap-user"` placeholders with the Resend SDK.
- [x] Replace `require('nodemailer')` — a CommonJS call in an ESM file, for a package not in `package.json`.
- [x] **Wire into the live path:** `ServicesMain.jsx:137` and `Contact.jsx:96`. The existing `fetch('/api/send-email')` sits in `Services.jsx:198`, which is unreachable code — the integration was written into the dead copy.
- [x] Admin notification **and** customer confirmation. Escape all interpolated values. *(Also hardened: the endpoint no longer accepts caller-supplied `to`/`subject` — that was an open relay.)*
- [x] Fail safe: if email fails, the booking still saves and the customer still sees success.
- [ ] 🔑 **Triage the 8 pending bookings manually.** Some may be weeks old; contact them before automation goes live, and expect that some have moved on.

### 2.2 — Make the schema reproducible

The repo cannot rebuild the database — which is why Phase 0 required live introspection.

- [x] **Write `000_baseline.sql`** from the live schema. **Done** — `properties`, `bookings` and `settings` now have a creation migration, so the chain starts from an empty database.
- [x] **Fix invalid SQL:** `CREATE POLICY IF NOT EXISTS` replaced with the guarded `DO $$ … pg_policies` pattern. `004` was additionally rewritten to drop its contradictory `admin_settings` definition and focus on `email_templates`; `003a` made idempotent with `DROP TRIGGER IF EXISTS`.
- [x] Resolve the duplicate `003_` prefix — **done**, the files now carry a total ordering.
- [x] Consolidate `settings` and `admin_settings` — **done** in `010_consolidate_settings.sql`, which also closes the admin RLS gap. `AdminProperties.jsx` repointed off the legacy table.
- [x] Verify the chain applies cleanly to an empty database. **Guarded by 5 automated migration-chain tests** (ordering, no duplicate versions, no invalid `CREATE POLICY IF NOT EXISTS`, idempotency markers). 🔑 A real replay against a scratch Postgres remains an owner check.

### 2.3 — Fix broken navigation

Four persistent, every-page links 404.

- [x] `Header.jsx:48` — `/internationalproperties` → `/international`.
- [x] `Header.jsx:58` — `/construction-support` is shelved; became **Nairobuild**. Link out to `https://nairobuild.co.ke` (`target="_blank" rel="noopener"`) or move to the footer. See Phase 8.4.
- [x] `Footer.jsx:209,212` — `/privacy` and `/terms` now have routes and pages (Kenyan DPA 2019 compliant). **Both are mandatory** for a business processing PII under the Kenyan DPA.
- [x] Test asserting every `Header`/`Footer` link resolves to a route or an intentional external URL.

---

## Phase 3 — Safety Net

**Timeline: 1 week.** Nothing after this is safe without it.

### 3.1 — Resurrect the test suite

3 test files exist; **0 tests execute.** `src/test/setup.js` holds JSX with a `.js` extension, so esbuild refuses it — and as the global `setupFiles` entry, it takes every suite down with it.

- [x] Rename `src/test/setup.js` → `setup.jsx`; update `vitest.config.js`. **One line.**
- [x] Confirm the existing suites pass. **74 tests across 11 files, all green (2026-09-02).**
- [ ] Conventions: MSW for Supabase, the existing `renderWithProviders`, `user-event` over `fireEvent`.
- [ ] Highest-risk paths first. *(Admin login, auth context, protected routes, navigation, and the booking-email builder are covered. Still missing: booking submission end-to-end, RLS denial for anon, settings load with a failed fetch.)*
- [x] Coverage with a ratcheting floor. **Done** — `@vitest/coverage-v8` installed, thresholds set from the live baseline (58 lines / 57 statements / 44 functions / 45 branches) rather than `0`, and enforced by CI. Now at 61.7% lines / 60.6% statements. The three assertion-free tests in `AdminBookings.test.jsx` have real assertions.
- [x] Confirm the suite still passes after all of Release 2. **84 tests across 13 files, all green (2026-09-02).**

The rename is trivial; that it went unnoticed is not. Fix the loop, not just the file.

### 3.2 — Clean the lint baseline

77 errors. A failing lint run guards nothing. **Now 0.**

- [x] Real bugs first: ESM/CommonJS mismatches and missing `__dirname` recreation fixed; the ESLint config given correct Node and test globals, which removed 7 `no-undef` false positives.
- [x] Remove dead state in `AdminProperties.jsx` — **done**, including `error`/`success` state that was written but never read (the component already reported through toasts).
- [x] Drop unused `motion` imports. **Done, but the first attempt was wrong and is worth recording:** an automated pass removed `motion` from 33 files and broke 6 tests, because `motion` *is* used — as `<motion.div>` — and `eslint-plugin-react` was not installed, so ESLint could not see JSX element tags as variable usage. The lint baseline was measuring the wrong thing.
- [x] Add `eslint-plugin-jsx-a11y` — **and `eslint-plugin-react`**, whose absence was the actual defect. Adding both raised visible problems to 196; the a11y rules are set to **warn** so they stay visible without blocking, and are Phase 7's work. 418 warnings remain.

### 3.3 — Error boundaries

No boundary exists anywhere; any render exception blanks the app. `SettingsContext` merges remote data straight into render paths.

- [x] Root boundary with branded fallback and recovery; per-route boundaries; one around the admin shell. **Done** — `src/components/ErrorBoundary.jsx`, wired at three levels in `App.jsx`, 5 tests.
- [x] Report caught errors somewhere real. **Partly** — boundary name and component stack go to the console, plus an `onError` hook ready for a real reporter. Wiring an actual service (Sentry or equivalent) stays open; see Phase 10.

### 3.4 — CI

- [x] GitHub Actions on every PR: `npm ci → lint → test:coverage → build`. **Done** — `.github/workflows/ci.yml`. `test:coverage` rather than `test:run`, because only that command enforces the ratcheting floor. 🔑 **Owner action: enable branch protection on `main` requiring both jobs** — the workflow reports failure, but only branch protection blocks a merge.
- [x] Report bundle size per PR so Phase 6's gains cannot silently regress. **Done** — `scripts/bundle-report.mjs` derives first load from `dist/index.html` (entry + `modulepreload` graph + stylesheet), so it tracks what the bundler actually emitted. Budget in `bundle-budget.json`; over budget fails the job.
- [x] **Add secret scanning** (`gitleaks`). **Done** — version-pinned, scanning the commits a change introduces rather than all history: the historical exposure is closed by rotation, and a permanently-red job trains people to ignore it. The step resolves its range with `git rev-list` first, because gitleaks exits `0` when the underlying git command fails — a scanner that passes because it scanned nothing is worse than none.
- [ ] Run a one-time full-history sweep by hand: `gitleaks detect --source . --redact`. 🔑

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

- [x] **Resolve the hub conflict.** `International.jsx` kept and extended; `InternationalHub.jsx`'s audience triage and *"Capturing the UN Nairobi Opportunity"* framing merged into it as a routed triage section; the file deleted. The duplicate `targetMarkets` grid was dropped in the same pass.
- [x] Route `UNHousing.jsx` at `/international/un-housing`, with a breadcrumb back to `/international`.
- [x] `DiasporaPortal.jsx` — **decided: deleted.** It is a mock-data dashboard (two hardcoded properties, invented rent/ROI) with no data model behind it. Behind auth at `/portal` it would present fabricated financials as a user's own. Re-enters scope as a Phase 10 item once an owner-property model exists.
- [ ] **Move hardcoded data to the database.** `UNHousing.jsx:27+` embeds a literal `unProperties` array with Unsplash placeholders, hardcoded prices, and fixed dates (`2026-02-01`) that will silently go stale. Model as `properties` rows with a segment tag so the admin CRM manages them. **Deferred past Release 3:** it needs a migration, and no migration can be applied until Release 1 is done. The page ships with placeholder inventory in the meantime — treat that as a known, temporary defect, not a finished state.
- [x] **Deleted `src/pages/Services.jsx`** (800 lines). Nothing imported it; `ServicesMain.jsx` is the live page.
- [x] Added to nav (an `/international` dropdown) and to `public/sitemap.xml`.
- [x] **New:** `src/pages/__tests__/pages.routed.test.js` fails the build if any page module becomes unreachable from `App.jsx` again.

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

- [x] `primary`, `secondary` and `accent` restructured as objects with `DEFAULT`/`dark`/`light`. Verified against compiled Tailwind output: `.hover\:bg-primary-dark:hover` → `#0A3A56`, `.group-hover\:text-primary-dark` present, `.bg-primary` unchanged at `#0D4B6E`.

### 5.2 — Dual-theme token layer

The system is bypassed. **Re-measured 2026-09-02, and the earlier count understated it:** **151 `bg-blue-*` + 188 `text-blue-*` + 1,445 raw `gray`/`slate`/`zinc`/`neutral` classes = ~1,784 raw palette usages, against 121 `bg-primary`.** Raw Tailwind outnumbers the brand token roughly 15 to 1. The greys were never counted before and are the bulk of the dark-mode problem — a blue that stays blue in dark mode is a design flaw; a `bg-gray-50` card that stays white is an unreadable page. `bg-secondary` appears **twice** in 96 files; `accent` never as a background.

Because dark mode is in scope, build tokens **semantically** (`surface`, `content`, `border`) rather than literally (`bg-white`, `text-gray-800`). Literal tokens cannot theme; retrofitting means touching every component twice.

- [ ] Full 50–900 scales; semantic `success`/`warning`/`danger`/`info` so status colours stop being invented per component (`BookingStatusBadge`, `MobileBookingCard`, and `AdminBookings` each decide "confirmed" independently today).
- [ ] CSS custom properties; Tailwind `darkMode: 'class'`.
- [ ] Migrate all ~1,784 raw palette usages, highest-traffic surface first, through the primitives from 5.5 rather than class-by-class (see Release 4, Slice 4C).
- [ ] ESLint rule banning raw Tailwind palette colours in `src/`.

### 5.3 — Ship dark mode

- [ ] Theme provider: `light`/`dark`/`system`, persisted, respecting `prefers-color-scheme`; toggle in header and admin.
- [ ] **Remove the existing broken dark block** (`index.css:78-88`). It flips bare `:root` dark with no token layer beneath, leaking dark backgrounds behind light components. A hazard, not a foundation.
- [ ] Audit every surface in both themes, including property imagery, FullCalendar, and Quill.
- [ ] Contrast-verify both at AA.

### 5.4 — Clean global CSS

- [x] **Font mismatch fixed at both ends.** The Inter preload is gone; Poppins now loads from a `<link rel="stylesheet">` in `index.html` instead of an `@import` inside the CSS bundle, so the browser discovers it in the initial document. `fonts.gstatic.com` preconnect added.
- [x] Vite scaffold `button { … }` block removed; only `button:focus-visible`'s outline kept.
- [x] `!important` `aria-label` hiding hack removed. The markup it suppressed (`aria-label="Scroll to learn more"`) no longer exists in `src/` — the hack was suppressing nothing.

### 5.5 — Primitives

- [ ] `Button`, `Input`, `Select`, `Card`, `Badge`, `Modal`, `Toast` — both themes.
- [ ] **Replace all 10 native `alert()`/`confirm()` calls** — re-counted 2026-09-02: **5 `alert()` and 5 `confirm()` across 8 files** (recorded as 12 previously). `react-hot-toast` is already used in 16 files. **Two are customer-facing, not admin conveniences:** `ServicesMain.jsx:167` *and* `ViewingExperience.jsx:208` are both **live booking confirmations** — the highest-value moment in the customer journey — delivered as an unstyled, thread-blocking browser dialog.
- [ ] Replace the four destructive `window.confirm()` calls with a dialog naming what is being deleted, offering undo.
- [ ] Storybook or equivalent.

### 5.6 — One icon library

Three ship today: `react-icons` (imported in **31 places** across 30 files), `lucide-react` (11 files), FontAwesome (**67 `fa-` usages across 10 files** — see the 6.2 correction). Plus two calendar libraries.

- [ ] Standardise on `lucide-react`; migrate `react-icons`; remove FontAwesome (payoff in 6.2).

---

## Phase 6 — Performance

**Timeline: 1 week.**

**Baseline (measured):** ~958 kB raw / **~275 kB gzip** JS plus 175 kB / 40 kB gzip CSS on first paint. On the mid-range Android and 3G conditions typical of this market, that is multiple seconds to first meaningful paint.

### 6.1 — Lazy-load admin

`App.jsx:49-57` statically imports all seven admin pages plus `AdminLayout` into the 379 kB main chunk **every anonymous visitor downloads**. Confirmed: `papaparse` (admin-only CSV) is in the public bundle.

Two costs: visitors pay for what they cannot use, and minified admin source publicly discloses table names, column names, and query shapes — a map of the database.

- [x] Convert all seven to `lazy()`; lazy-load `AdminLayout`. **Done** — `2b9cf93`.
- [ ] Split the Supabase client so public pages load a smaller surface. `vendor-supabase` is **56 kB gzip and still eager** — now the single largest item in first load. Remaining 6.1 work.
- [x] **Clerk's 72 kB is already gone** as of Phase 1.5.

> ✅ **RESOLVED in Release 2.** First load went **~446 kB → 229.8 kB gzip**, below the
> 275 kB baseline. The heavy admin dependencies (FullCalendar, Quill, papaparse) now sit
> in route chunks an anonymous visitor never requests. `bundle-budget.json` holds the line
> at 235 kB and CI enforces it.

**Result:** first load 229.8 kB gzip. The 100 kB target needs 6.2 (FontAwesome) and the
Supabase split above; both remain open.

### 6.2 — Remove FontAwesome

`main.jsx:6` imports the whole library, emitting **~914 kB of fonts** (`fa-solid-900.ttf` 426 kB, `fa-brands-400.ttf` 211 kB, plus woff2).

🔧 **Scope correction, 2026-09-02.** This phase previously read *"actual usage: four icons in one file."* That is wrong. Measured: **67 `fa-` usages across 10 files** — `About.jsx` (26), `Home.jsx`, `PropertyDetail.jsx`, `Header.jsx`, `Footer.jsx`, `AdminHeader.jsx`, and four `services/` components. Several are data-driven (`icon: "fas fa-home"` strings in config arrays), so the rewrite has to replace the string-keyed indirection with component references, not just swap tags. The payoff is unchanged and still the best ratio available in the codebase; the cost is a day, not an afternoon.

- [ ] Redraw all 67 in `lucide-react`; replace string-keyed icon config with component references; delete the import and the dependency.

**Expected:** ~914 kB of fonts gone; CSS 146 kB → under 50 kB. **Still the cheapest large win available.**

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

- [x] **Zoom re-enabled.** `maximum-scale=1.0, user-scalable=no` removed from `index.html`; `viewport-fit=cover` kept. SC 1.4.4 (AA) no longer failed at the viewport tag.
**Read the warning count carefully — it is not the measure.** ESLint reports 374 warnings, of which **351 are three label/control rules**, and **134 of those come from `jsx-a11y/label-has-for`, a deprecated rule that double-counts `label-has-associated-control`**. Turning it off drops the number by a third and fixes nothing. The honest measure is below.

- [ ] **Pair `htmlFor`/`id` across all 134 form controls.** Measured 2026-09-02: **134 `<label>` elements, 11 `htmlFor` attributes, 134 `input`/`select`/`textarea`.** Roughly **123 labels are associated with nothing** — a screen reader announces an unlabelled control on effectively every form on the site. This is the single largest real accessibility defect in the codebase, and it is invisible behind the inflated warning count.
- [ ] Retire `jsx-a11y/label-has-for` in `eslint.config.js` once the pairing lands, so the remaining count means something.
- [ ] Focus trapping, `aria-modal` and focus restoration on `PropertyModal`, `BookingModal`, `BookingDetailModal`, `ClientForm` — implemented **once in the `Modal` primitive** from 5.5, not four times.
- [ ] `aria-expanded`/`aria-controls` on header dropdowns and mobile menu. Measured: **33 `aria-*` attributes and 4 `role=` across 96 files**, of which exactly **2** are `aria-expanded` — both in `Header.jsx`, on the mobile toggle only. The `/international` dropdown added in Release 3 announces nothing.
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
- [ ] **Diaspora owner portal** (`/portal`). `DiasporaPortal.jsx` was deleted in Release 3 rather than routed, because it rendered fabricated portfolio figures from a hardcoded array. Rebuilding it needs, in order: an `owner_properties` model linking `auth.users` to `properties` with RLS scoping a signer to their own rows; real income, expense and maintenance records; and a session-only (non-admin) route guard. The deleted prototype is the design reference — recover it from git history at the Release 3 commit.

---

## Success Metrics

Three columns now: where this started, where it actually is today, and where it is going.
"Verified 2026-09-02" means measured, not asserted.

| Metric | Baseline (2026-09-01) | **Verified 2026-09-02 (end of Release 3)** | Target |
|---|---|---|---|
| Tables where anon can `DELETE`/`TRUNCATE` | **7 of 7** | **7 of 7** 🔑 *(fix written, not applied)* | 0 |
| Tables with RLS actually enabled | **3 of 7** | **3 of 7** 🔑 *(fix written, not applied)* | 7 of 7 |
| Policies that are `USING (true)` | **19 of 19** | **19 of 19** 🔑 *(fix written, not applied)* | 0 |
| Secrets reachable from the browser | **3** | **1** — service key gone from code; Cloudinary secret + anon over-grant remain 🔑 | 0 |
| Identity systems | 2 (Clerk + Supabase) | ✅ **1** | **1** |
| Executing tests | **0** | ✅ **98** (16 files) | Full critical-path |
| Test coverage | 0% | **61.51% statements / 62.59% lines**, ratcheting floor enforced in CI | ≥ 70% |
| ESLint errors | 77 | ✅ **0** (**365** warnings, almost all `jsx-a11y`) | 0 |
| Unreachable lines | 2,039 | ✅ **0** — guarded by `pages.routed.test.js` | 0 |
| Broken navigation links | 4 | ✅ **0** | 0 |
| Inert design tokens (`*-dark` compiling to nothing) | 20 | ✅ **0** | 0 |
| First-load JS+CSS (gzip) | ~275 kB | **213.2 kB**, budget **219 kB**, enforced in CI | < 100 kB |
| Largest single chunk | 379 kB raw | 309 kB raw / 87 kB gzip (`AdminBookings`, lazy) | — |
| CSS bundle | 175 kB | ✅ **74.4 kB (12.7 kB gzip)** — FontAwesome gone; the rest is the palette debt 4C removes | < 50 kB |
| Font payload | **999 kB** *(re-measured; ~914 was low)* | ✅ **0 bytes** — FontAwesome removed in 4A; Poppins loads from Google Fonts | < 100 kB |
| Lighthouse Performance (mobile) | not measured | not measured | ≥ 90 |
| axe violations | not measured | not measured | 0 |
| Largest component | 1,297 lines | **1,284 lines** (`AdminProperties.jsx`) — Release 5 (4.4) | < 300 |
| Components querying Supabase directly | 16 | **24 files** *(re-measured)* — Release 5 (4.2) | 0 |
| Raw palette classes (`blue`/`gray`/`slate`/…) | **3,005** *(re-measured by the 4B lint rule; 1,784 and 165 were both narrower definitions)* | **3,005, ceiling live in CI** — Release 4 (4C spends it) | < 400 ratcheting → 0 |
| Themes | 1 (broken partial dark) | **token layer for 2, every pair AA by test** (4B); the broken partial dark is deleted; provider — Release 4 (4D) | 2, both AA by contrast test |
| Native `alert()`/`confirm()` | 10 *(re-counted; 12 was wrong)* | **10**, 2 of them customer-facing — Release 4 (4C) | 0 |
| Components deciding status colour independently | 4, disagreeing | ✅ **1 map** (4B) — `confirmed` was blue in one and green in three; `completed` rendered as pending in two | 1 |
| Icon libraries | 3 | ✅ **2** — FontAwesome gone (4A); `react-icons` folds into 4C | 2 *(revised: lucide has no TikTok/WhatsApp/Pinterest mark)* |
| `<label>` without an associated control | ~123 of 134 | **~123 of 134** — Release 4 (4D) | 0 |
| `console.*` calls in `src/` | 68 *(re-counted)* | ✅ **0 in `dist/`**, enforced in CI; source routes through `logger` | 0 in `dist/` |
| Viewport blocks pinch-zoom (SC 1.4.4) | **yes** | ✅ **no** | no |
| Booking notification delivery | **0%** (8 leads stranded) | **0%** — pipeline built and tested, 🔑 awaiting keys | 100% |
| Error boundaries | 0 | ✅ Root + per-route + admin | Root + per-route + admin |
| CI | none | ✅ lint · test · coverage floor · build · bundle budget · no-console-in-dist · gitleaks | lint + test + build + gitleaks |
| Header remounts per navigation | 1 (scroll listener rebuilt each time) | ✅ **0** — one layout route (4A) | 0 |
| Pages declaring the homepage as canonical | **all of them** 🔴 | ✅ **0** — route-aware canonical (4A) | 0 |
| Overall audit score | **3.8 / 10** | ~**5.8 / 10** *(code-side gains real; security gains still not live)* | **9 / 10** |

**Read the table honestly.** Sixteen metrics have improved, and the three that matter
most for security are **still unchanged** — because the migrations that fix them have not
been applied. The audit score moves to roughly 5.8 only on the strength of code quality,
a live test suite, and now a materially faster first load. **It does not move past 6
until Release 1 is executed**, and no amount of further coding will move it. Slice 4A is
the fifth consecutive block of agent-executable work stacked on a database anyone holding
the anon key can still `TRUNCATE`.

**On numbers that got worse without regressing.** Version 6 recorded four such rows. 4A
adds two more, both found by measuring rather than reading: the font payload was **999 kB,
not ~914 kB**, and there were **68** `console.*` calls in `src/`, not 66. Both are now
zero. Against that, three counts in the Version 6 scope proved wrong in the *other*
direction once the work was done — "one icon library" is unreachable (lucide has no
TikTok, WhatsApp or Pinterest mark), and the sub-50 kB raw CSS target cannot be hit by
4A-shaped work because the remaining CSS *is* the palette debt 4C removes.

Both corrections are recorded in [Slice 4A](#slice-4a--shrink-the-surface--complete-1e1b357)
with the reasoning, and the exit-criteria table now carries the revised targets rather
than quietly keeping targets that cannot be met. A roadmap that gets more accurate is
working; one whose numbers only ever improve is being marked by the person who wrote it —
and one that keeps an unreachable target to look ambitious is doing the same thing more
politely.

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

**Where to start today:** not with a plan — with
[`docs/HANDOFF-phase1-apply.md`](docs/HANDOFF-phase1-apply.md). Release 1 is entirely
owner actions against Supabase and Vercel, and every line of code it needs is already
written and tested. **Releases 2 and 3 are complete, and Release 4's first slice is now complete
too, which makes this more urgent, not less: the codebase is hardened, coherent, fast,
and the database is still untouched.** Four blocks of agent-executable work have been
consumed; Release 1 cannot be, because it is not code.

**Release 4 — the current block — is in progress** in
[Release 4 — "Themed"](#-release-4--themed--4a-complete-2026-09-02). It is the design
system: the thing every remaining phase depends on, and the thing Phase 9 (the original
UI-revamp request) was always meant to be built on. **Slice 4A is done and verified;
4B is next.**

It runs in **four independently mergeable slices**, ordered so each one shrinks the next:

| Slice | Work | Why here | Size |
|---|---|---|---|
| **4A** ✅ | 4.3 layout routes · 6.2 FontAwesome · 5.6 icon consolidation · 6.3 console strip | Deleting markup beats theming markup. Removed 11 duplicate Header/Footer sites and 67 icon call sites *before* the token migration has to cross them; fixed the Header remount bug, a site-wide canonical defect, and 999 kB of fonts on the way | **done** (`1e1b357`) |
| **4B** | 5.2 semantic dual-theme tokens · raw-palette ESLint ratchet · contrast test | Build and **prove** the layer before anything consumes it. The ratchet and the contrast test land *with* the layer, because a ~1,784-site colour migration cannot be verified after the fact | ~4 days |
| **4C** | 5.5 primitives · retire the 10 native dialogs · migrate surfaces through the primitives | A call site replaced by `<Button>` sheds its token debt as a side effect. Migrating classes first means editing the same markup twice | ~5 days |
| **4D** | 5.3 dark mode shipped · the rest of Phase 7 · `axe-core` in CI | The theme and the accessibility work touch the same markup; splitting them means two passes over every surface | ~4 days |

**4A is complete.** Next is 4B — and its ordering rationale is unchanged and worth
restating: build and *prove* the token layer with **zero call sites migrated**, so the
layer is verifiably correct before ~1,784 of them depend on it. The ESLint palette
ratchet and the WCAG contrast test land *with* the layer, not after the migration they
police. Each slice ends deployable.

```
/superpowers:writing-plans Release 4 Slice 4C of ROADMAP.md — primitives on the token layer, retire the 10 native dialogs, migrate surfaces and lower the palette ratchet
```

**Two things 4A learned that 4B should carry in:**

1. **`src/test/setup.jsx` mocks `useLocation` globally to `/admin`.** Any route-aware
   component will test green against the wrong route until a suite overrides it locally,
   the way `PublicLayout.test.jsx` does. The theme provider in 4D is route-aware in
   spirit; the token work in 4B is not, but the trap is cheap to remember and expensive
   to rediscover.
2. **Measure the thing, not the config.** 4A's console strip was a two-line Vite change
   that would have been trivially wrong and invisible — `esbuild.drop` applies to the dev
   transform too, and scoping it to `command === 'build'` was the difference between
   working and silently breaking local debugging. What caught it was checking the
   artifact. 4B's contrast assertions should read computed token values, not the
   stylesheet that declares them.

**Numbers this roadmap has had to correct, and where.** FontAwesome was 67 usages across
10 files, not "four icons in one file" — **now zero** (4A). The raw-palette debt is ~1,784
classes, not 165, because the 1,445 raw greys were never counted — still outstanding
(4B/4C). There are 10 native dialogs, not 12, two of them customer-facing — still
outstanding (4C). The font payload was 999 kB, not ~914 kB — **now zero** (4A). There
were 68 `console.*` calls, not 66 — **now zero in `dist/`** (4A). And two Release 4 exit
targets were themselves wrong: "one icon library" is unreachable, and sub-50 kB raw CSS
is 4C's to hit, not 4A's; both are revised in place with reasons. Scope from the
corrected numbers, never from the phase text those corrections replaced.

One item is deliberately carried out of Release 3 and **blocked on Release 1**: moving
`UNHousing.jsx`'s hardcoded `unProperties` array into the database (4.1). It needs a
migration, and no migration can be applied until the owner runs Release 1.

A per-release changelog is maintained in [`CHANGELOG.md`](CHANGELOG.md).

---

*Version 8 — Release 4 Slice 4B completed and verified against the working tree: `npm run lint` (**0 errors**, 3,370 warnings — 365 `jsx-a11y` plus 3,005 literal palette classes the new rule makes visible for the first time), `npm run test:coverage` (**227 passing, 19 files**, 62.38% statements / 63.26% lines, floor ratcheted to 61/62/48/48), `npm run build` (clean, with `prebuild` asserting the generated `tokens.css` is current), `npm run bundle:report` (**213.9 kB**, within the 219 kB budget), and `npm run palette:ratchet` (**3,005**, ceiling live) on 2026-09-02. The contrast figures are not estimates: 102 assertions compute WCAG 2.1 relative luminance for every content-on-surface pair in both themes, and the suite was proven able to fail by lightening `content-subtle` four steps and watching four of them go red. The ratchet was proven able to block by adding three literal classes and watching the check exit 1 and `--update` refuse. Release 4's remaining scope numbers — 3,005 raw palette classes, 10 native dialogs, 134 labels against 11 `htmlFor` — were counted against `src/` on 2026-09-02 and supersede the earlier figures they contradict.*
