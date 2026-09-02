# Raslipwani Properties — Remaining Work to World-Class

> **Version 9 — rewritten 2026-09-02.** This document contains **only what is still
> outstanding**. Everything verified complete has been removed; what survives is work,
> not history. Supersedes Versions 1–8.
>
> **Score:** audited **3.8/10** (2026-09-01) → **~5.5/10** today → target **9/10**.
> The score does not move past 6 by writing code — see **Block 1**, which is the only
> outstanding work with a live consequence and the only work an agent cannot do for you.
>
> **Sources:** [`docs/audit/2026-09-01-codebase-audit.md`](docs/audit/2026-09-01-codebase-audit.md);
> live introspection of project `gihgdouvltxlpynpuyde` (`rasilpwani`, eu-north-1) on
> 2026-09-01 and 2026-09-02; counts below re-measured against the working tree on 2026-09-02.

---

## Where this actually stands

Three separate things are true at once, and conflating them is how the last two
iterations of this roadmap went stale:

1. **The code has moved a long way.** Clerk is gone, the test suite exists and runs, CI
   gates six checks, every page is routed, the token layer is built and proven.
2. **The newest and most visible half of it has not shipped.** Releases 1–3 are merged and
   pushed to `origin/main`. **Release 4 — Slices 4A and 4B — is not.** It sits unmerged and
   unpushed on `worktree-release4-slice-4a` and carries the 999 kB font removal, the
   canonical fix, the layout route and the entire token layer.
3. **The database is still open.** `007` and `008` are applied. `009`–`012` are not.
   Until they are, anyone holding the public anon key can still read customer PII and
   write through an unauthenticated RPC.

**Block 1 is the only work with a live consequence. Everything else is preparation.**

### Already true — do not re-do, do not re-litigate

<sub>Kept deliberately short. A roadmap with no record of finished work invites redoing it.</sub>

| | Verified |
|---|---|
| Identity | One stack. Clerk removed from code and `package.json`; Supabase Auth, `admin_users`, `is_admin()` |
| Privileged keys in bundle | Zero JWT-shaped strings in `dist/`, enforced at build time |
| Tests | 227 passing / 19 files (0 at baseline), ratcheting coverage floor at 62% lines |
| Lint errors | 0 (baseline 77) |
| CI | lint · test · coverage floor · palette ratchet · token freshness · build · bundle budget · no-console-in-dist · gitleaks |
| Routing | 0 unreachable pages, guarded by a test; 0 broken nav links; one `PublicLayout`, header mounts once |
| Design tokens | 32 semantic roles, both themes, generated from one source, 102 contrast assertions AA |
| Bundle | 213.9 kB gzip first load (from 275 kB), budget 219 kB |
| Icon fonts | 0 bytes (FontAwesome's 999 kB removed); CSS 146 kB → 76.7 kB raw |
| Canonicals | Route-aware. Every page previously declared the homepage as its canonical |
| Zoom | `user-scalable=no` removed; SC 1.4.4 no longer failed at the viewport tag |
| Booking email | Resend pipeline built and tested end-to-end 🔑 *awaiting keys* |

> **Correction carried forward:** a note in `docs/HANDOFF-phase1-apply.md` records
> `AdminBookings.jsx:70` and `AdminLayout.jsx:49` as broken because they filter
> `bookings.is_archived`. The 2026-09-02 introspection proved the column **exists** in the
> live database — `000_baseline.sql` was the thing that was wrong, and it has since been
> rewritten by transcription from `information_schema`. **Those queries are fine.**
> Nothing to do.

---

## Order of remaining work

| | Block | Owner | Effort | Blocks |
|---|---|---|---|---|
| **1** | Close the database | 🔑 **you** | ~1 day | *everything downstream in production* |
| **2** | Land what already exists | you + agent | ~half a day | any visible improvement at all |
| **3** | Release 4C — primitives, and the migration they carry | agent | ~5 days | Block 6 |
| **4** | Release 4D — ship the theme, fix the accessibility it exposes | agent | ~4 days | Block 6 |
| **5** | Release 5 — data layer, decomposition, the rest of the budget | agent | ~7 days | Block 6 (partly) |
| **6** | Phase 9 — the UI revamp | agent | ~3 weeks | — |
| **7** | Phase 8 — SEO and discovery | agent | ~1 week + investigation | — |
| **8** | Phase 10 — platform maturity | ongoing | — | — |

Blocks 1 → 2 are strictly sequential. 3 → 4 are sequential. 5 and 7 parallelise with 3–4.
6 depends on 3, 4, and the budget half of 5.

---

## ⛔ Block 1 — Close the database (owner only) · **the only blocking work**

**Status: `007` and `008` are applied. `009`, `010`, `011`, `012` are written, dry-run
against production inside a rolled-back transaction, and not applied.**

`007` already revoked the blanket `anon` grants, so the raw destruction vector is
narrower than the original audit described. What remains open is still serious, and two
of the four items were found only by introspection — they are invisible from the repo.

### 1.1 — Apply `009_auth_rls_policies.sql` 🔑

Real policies on `auth.uid()`; `assigned_agent_id` and `confirmed_by` converted `text` →
`uuid` with foreign keys to `auth.users`.

- Take a backup first (Dashboard → Database → Backups).
- Verified preconditions: both identity columns are `text`, **0 of 12 rows populated**,
  `client_id` already `uuid`. Re-confirm immediately before applying:
  ```sql
  SELECT count(assigned_agent_id) AS agents, count(confirmed_by) AS confirmers FROM bookings; -- expect 0, 0
  ```
  If either is non-zero, **stop** — the conversion needs a backfill first.
- The migration drops every policy on `bookings` before retyping, then recreates the full
  intended set: 11 policies, 15 guards on the booking INSERT policy, and zero remaining
  `USING (true)` apart from the documented public SELECT on `admin_settings`.

### 1.2 — Apply `011_close_definer_rpc.sql` 🔴 🔑

`public.update_setting` is `SECURITY DEFINER`, owned by `postgres`, `EXECUTE` granted to
`anon`, and runs `UPDATE admin_settings` **with no WHERE clause**. `SECURITY DEFINER`
bypasses RLS, so `007`'s policies do not apply inside it, and PostgREST publishes it at
`/rest/v1/rpc/`. **This is an unauthenticated write path straight around the lockdown.**
`get_setting` shares the ACL. Neither is called anywhere; the migration drops both.

### 1.3 — Apply `012_lock_admin_users_and_defaults.sql` 🔴 🔑

`authenticated` holds `TRUNCATE` on `admin_users`, and **RLS does not apply to
`TRUNCATE`** — so the SELECT-only policy does not stop a signed-in user from deleting
every admin. `admin_users` was created by `008` *after* `007`'s revoke, so it inherited
Supabase's default ACL of `arwdDxtm`. The migration fixes the table, revokes `TRUNCATE`
schema-wide, and changes `ALTER DEFAULT PRIVILEGES` so the next table is not born public.

### 1.4 — Apply `010_consolidate_settings.sql` 🔑

Consolidates `settings` into `admin_settings` (preserving values) and secures the
orphaned tables. Apply after `009`.

### 1.5 — Rotate what has already been published 🔑

A secret that has been served stays served. Rotation is not optional cleanup.

- [ ] **Supabase `service_role` key** — rotate, then delete `VITE_SUPABASE_SERVICE_KEY`
      from every Vercel environment, then redeploy. Rotate *first*; the old key is in
      every bundle already served.
- [ ] **Cloudinary `api_secret`** — it sat in an anon-readable column. Rotate, move it to
      server-side configuration, then `ALTER TABLE public.settings DROP COLUMN api_secret;`
- [ ] Delete `VITE_CLERK_PUBLISHABLE_KEY` from Vercel; delete the Clerk application.
- [ ] Revoke the `sbp_` introspection token — it is account-wide and no longer needed.

### 1.6 — Create the admin account and close signup 🔑

Dashboard → Authentication → Users → Add user (real email, strong password, auto-confirm),
then insert the UUID into `public.admin_users`:

```sql
INSERT INTO public.admin_users (id, email, role) VALUES ('PASTE-UUID', 'PASTE-EMAIL', 'admin');
```

Then Authentication → Providers → Email → **turn off "Enable sign ups"**, and enable MFA
if the plan offers it. This login guards all customer data.

### 1.7 — Prove it from outside, with the public key

A control you have not tested is a control you do not have.

```bash
U=$(grep '^VITE_SUPABASE_URL=' .env | cut -d= -f2-)
K=$(grep '^SUPABASE_ANON_KEY=' .env | cut -d= -f2-)

curl -s "$U/rest/v1/bookings?select=name,email" -H "apikey: $K" -H "Authorization: Bearer $K"        # MUST NOT return rows
curl -s -X DELETE "$U/rest/v1/bookings?id=eq.0" -H "apikey: $K" -H "Authorization: Bearer $K"         # MUST be rejected
curl -s "$U/rest/v1/settings?select=id" -H "apikey: $K" -H "Authorization: Bearer $K"                 # MUST be rejected
curl -s -X POST "$U/rest/v1/rpc/update_setting" -H "apikey: $K" -H "Authorization: Bearer $K"         # MUST 404 — dropped
curl -s "$U/rest/v1/properties?select=id,title&limit=1" -H "apikey: $K" -H "Authorization: Bearer $K" # MUST succeed
curl -s "$U/rest/v1/admin_settings?select=business_name" -H "apikey: $K" -H "Authorization: Bearer $K" # MUST succeed
```

### 1.8 — One paired code change, before or with 1.5 *(agent work)*

`CloudinarySettings.jsx:61` writes `cloudinary_api_secret` (and the email API key) into
`admin_settings`, whose columns are anon-readable. They are `NULL` today — **saving that
form publishes the secret.** Move both to server-side configuration and remove the fields
from the form. This must land before the form is used again.

### 1.9 — Turn the booking notifications on 🔑

The Resend pipeline is built and tested; it has never had credentials, so **no booking has
ever produced an email**, and **8 enquiries sit in `pending`** — real people who contacted
you and were never contacted back.

- [ ] Set `RESEND_API_KEY` and `BOOKING_NOTIFICATION_EMAIL` in every Vercel environment
      (`api/send-email.js:29-37` reads both and fails closed without them). Redeploy.
- [ ] Submit one real booking end to end and confirm the email arrives.
- [ ] **Contact the 8 stranded enquiries by hand.** This is a business action, not a
      deployment one, and nothing in the codebase will do it for you.

**Exit criteria for Block 1:** anon cannot read customer PII, cannot write through any
RPC, and cannot delete or truncate anything. All 7 tables have RLS enabled with real
policies. Zero `USING (true)` policies except the documented public SELECT. Every
published credential rotated. All six curl assertions above behave as commented.

---

## Block 2 — Land what already exists

Release 4's two finished slices sit on `worktree-release4-slice-4a`, unpushed, and the
branch has **diverged** from `main` — `main` has since gained the database corrections
(`6726207`, `62fc033`, `8b1abb9`) that the branch does not carry, and the branch carries
a `ROADMAP.md` that predates them.

- [ ] **Merge `worktree-release4-slice-4a` into `main`.** Both sides are green; the
      divergence is a documentation and migration overlap, not a code conflict. Merging
      brings the 999 kB font removal, the layout route, the canonical fix, the console
      strip and the whole token layer onto one line of history.
- [ ] **Revert the accidental typo in `docs/HANDOFF-phase1-apply.md`** — an uncommitted
      edit introduced `supabase/m igrations/007_...` (stray space) into the apply table.
      That table is a checklist a human follows under pressure.
- [ ] **Push and deploy.** The bundle, font, canonical and layout wins in the "already
      true" table above are the ones a visitor would actually feel, and they are the ones
      still sitting on the unpushed branch.
- [ ] Retire `docs/HANDOFF-phase1-apply.md` in favour of Block 1, which supersedes it and
      is current. Keep one owner-facing checklist, not two that disagree.

**Exit:** `main` contains all agent work to date, the site is deployed from it, and there
is exactly one document telling the owner what to run.

---

## Block 3 — Release 4C · Primitives, and the migration they carry *(≈5 days)*

The token layer is built and proven; **nothing consumes it yet** beyond the eight status
pills Slice 4B shipped as its own proof. 4C is where the layer gets spent.

- [ ] **Primitives on the token layer:** `Button`, `Input`, `Select`, `Card`, `Badge`,
      `Modal`, `Toast`, `ConfirmDialog`. Both themes, keyboard-complete **from the first
      commit** — an inaccessible primitive multiplies by every call site.
- [ ] **Retire the 10 native browser dialogs** (re-verified 2026-09-02: **5 `alert()` and
      5 `confirm()`**). Two are not admin conveniences: `ServicesMain.jsx:167` and
      `ViewingExperience.jsx:208` are both **live booking confirmations** — the
      highest-value moment in the customer journey — delivered as an unstyled,
      thread-blocking browser dialog. `react-hot-toast` is already a dependency in 16
      files. The four destructive `confirm()` calls become a `ConfirmDialog` that names
      what is being deleted.
- [ ] **`Modal` absorbs `PropertyModal`, `BookingModal`, `BookingDetailModal` and
      `ClientForm`** — which is also how Block 4's focus-trap requirement gets satisfied
      once instead of four times.
- [ ] **Migrate surfaces through the primitives**, highest-traffic first: Home →
      Properties → PropertyDetail → booking flow → Contact/About → admin. **One PR per
      surface, each dropping the palette ratchet ceiling.** Admin last: it has one user,
      and it is where a mistake costs least.
- [ ] **Finish the icon consolidation.** FontAwesome is gone, but **`react-icons` is still
      imported in 30 files** against `lucide-react` in 11. Two libraries ship where one
      would do. The `<Icon>` registry built in 4A is the seam: migrate `react-icons` call
      sites through it as each surface is touched, rather than as a separate sweep.
- [ ] Bring the CSS bundle under 50 kB raw as the raw classes collapse into primitives
      (76.7 kB today).

**Exit:** raw-palette ratchet **below 400** (the ceiling is **3,005** today and blocking
in CI) · **zero** `alert()`/`confirm()` in `src/` · every modal rendered by one primitive ·
CSS under 50 kB raw.

---

## Block 4 — Release 4D · Ship the theme, and the accessibility it exposes *(≈4 days)*

- [ ] **Theme provider** — `light`/`dark`/`system`, persisted, respecting
      `prefers-color-scheme`, with a toggle in the header and the admin shell.
- [ ] Audit every surface in both themes, including property imagery, FullCalendar, Quill,
      and the four hardcoded hex values in the `.custom-calendar` block.
- [ ] **Pair `htmlFor`/`id` across all 134 form controls.** Re-verified 2026-09-02:
      **134 `<label>` elements, 11 `htmlFor` attributes, 134 `input`/`select`/`textarea`.**
      Roughly **123 labels are associated with nothing** — a screen reader announces an
      unlabelled control on effectively every form on the site. This is the largest real
      accessibility defect in the codebase, and it hides behind an inflated warning count:
      of 365 `jsx-a11y` warnings, 134 come from `jsx-a11y/label-has-for`, a **deprecated
      rule that double-counts** `label-has-associated-control`. Turning that rule off
      drops the number by a third and fixes nothing.
- [ ] Retire `jsx-a11y/label-has-for` in `eslint.config.js` **after** the pairing lands,
      so the remaining count means something.
- [ ] **`aria-expanded`/`aria-controls` on header dropdowns and the mobile menu.**
      Measured: **2 `aria-expanded` in the entire codebase**, both on the mobile toggle.
      The `/international` dropdown announces nothing.
- [ ] Skip-to-content link; live regions for async status and toasts.
- [ ] **`axe-core` in CI**, failing the build on violations, plus a keyboard-only pass
      over the booking flow in both themes.

**Exit:** two themes, both AA by contrast test **and** by axe · **zero** axe violations,
enforced in CI · every public flow completable by keyboard in both themes.

---

## Block 5 — Release 5 · Data layer, decomposition, and the rest of the budget *(≈7 days)*

Invisible to users, and the thing that makes Block 6 a design exercise rather than a
rewrite.

### 5.1 — Data-access layer

**23 files under `src/components` and `src/pages` import the Supabase client directly.**

- [ ] `src/services/` — one module per domain: `properties`, `bookings`, `clients`,
      `settings`, `auth`. Every query behind a named, testable function.
- [ ] Standardise on TanStack Query; remove raw `useEffect` + `supabase` fetching. Two
      paradigms coexist today.
- [ ] Centralise query keys. `Home.jsx` sets a local `staleTime` that silently disagrees
      with the global default in `App.jsx`.
- [ ] **Exit:** `grep -rl supabaseClient src/components src/pages` returns nothing.

### 5.2 — Decompose the largest components *(after 5.1 — they shrink on their own)*

**8 files still exceed 700 lines**; `AdminProperties.jsx` is 1,284.

- [ ] Split `AdminProperties.jsx`, `AdminBookings.jsx`, `ServicesMain.jsx`. Target: none
      over 300 lines.
- [ ] Extract `usePagination`, `useFilters`, `useCsvExport`.

### 5.3 — Finish the performance budget

First load is **213.9 kB gzip** against a **< 100 kB** target.

- [ ] **Split the Supabase client.** `vendor-supabase` is 56 kB gzip — the single largest
      item in first load, and the dominant one now that the fonts are gone.
- [ ] Route-level code splitting on the public side (admin is already lazy).
- [ ] Lighthouse in CI as a gate, mobile profile.

### 5.4 — Move `UNHousing.jsx`'s hardcoded inventory into the database

`UNHousing.jsx:27+` embeds a literal `unProperties` array with Unsplash placeholders,
invented prices and fixed dates (`2026-02-01`) that will silently go stale. Model these as
`properties` rows with a segment tag so the admin CRM manages them. **Needs a migration,
so it is blocked on Block 1.** Until then the page ships placeholder inventory: a known,
temporary defect, not a finished state.

**Exit:** zero direct Supabase imports in components and pages · no file over 300 lines ·
first-load JS **under 100 kB gzip** · Lighthouse Performance ≥ 90 mobile · UN inventory
served from the database.

---

## Block 6 — Phase 9 · The client-side UI revamp *(≈3 weeks)*

**This was the original request, and it is deliberately last.** A revamp built on open
grants, no tokens and a 275 kB bundle inherits all of it. Blocks 3, 4 and 5.3 exist so
this one can be about design rather than archaeology.

### 6.1 — Direction

- [ ] Capture product truth: local buyers, diaspora investors, UN/embassy tenants — the
      job each is doing, and what makes Raslipwani different from a generic listings site.
- [ ] Commit to a visual world; document it in `DESIGN.md`.
- [ ] Mode per surface: **Persuade** (home, services, international), **Operate** (search,
      booking), **Read** (about, guides).

### 6.2 — Surfaces

- [ ] **Home** — the hero is a stock photo under a dark overlay with generic copy ("Your
      Trusted Real Estate Partner in Kenya"). Replace it with a point of view and a search
      entry that starts the journey immediately.
- [ ] **Properties** — the grid *is* the product. Filters, map, saved searches, comparison.
- [ ] **Property detail** — gallery, neighbourhood context, mortgage/ROI calculator, and a
      booking flow that converts.
- [ ] **International** — UN/diplomatic housing and diaspora investment are the things a
      generic competitor cannot copy. The section is routed now and still under-treated.
      **Likely the highest-return product change in this document.**
- [ ] **Booking flow** — end to end, with the confirmation experience Block 3 unlocks and
      the Resend emails actually firing.
- [ ] **Admin login and console** — the first impression of the tool used daily.
- [ ] **Contact, About, 404.**

### 6.3 — Craft

- [ ] Purposeful motion. Today's framer-motion usage is a uniform fade-up on nearly
      everything, which reads as a default rather than a decision.
- [ ] Real loading, empty and error states everywhere; the featured-properties skeleton is
      a good model to extend.
- [ ] Mobile-first — the market is predominantly mobile on constrained networks.
- [ ] Keep the existing Cloudinary `f_auto,q_auto` responsive `<picture>` pattern. It is
      already correct.

**Exit:** every public surface rebuilt against the design system, in both themes, within
the Block 5.3 budget, passing the Block 4 accessibility bar.

---

## Block 7 — Phase 8 · SEO and discovery *(≈1 week + one investigation)*

### 7.1 — Consolidate on one domain

- [ ] 301 `.com` → `.co.ke` permanently; keep the redirect and do not let the domain lapse.
- [ ] Make canonical, JSON-LD `@id`/`url`, JSON-LD image, `robots.txt` and OG agree.
- [ ] **Fix the JSON-LD coordinates.** `Home.jsx:90-91` reads `-1.2921, 36.8219` —
      Nairobi city centre — while the `address` in the same block is Kikambala Road,
      Kilifi. **~500 km apart**, which breaks local-business indexing outright.

### 7.2 — Dynamic sitemap

`public/sitemap.xml` is static with **7 URLs** and omits **every property detail page** —
precisely the pages that should rank.

- [ ] Generate it at build time from the property list, with `lastmod`.

### 7.3 — Structured data, and the rendering constraint

- [ ] Per-property `RealEstateListing` JSON-LD; real OG images per property; route the
      last remaining Helmet blocks through `DynamicSEO`.
- [ ] **Investigate the SPA rendering constraint properly.** As a pure client-side SPA,
      crawlers see an empty shell for all property content. This is plausibly the single
      largest limit on organic acquisition. Prerendering the listing routes, or moving to
      an SSR framework, is **a project in its own right** — scope it honestly rather than
      bolting it onto a release.

### 7.4 — Nairobuild cross-brand

Construction is now a separate business (`nairobuild.co.ke`) with genuinely adjacent
audiences — land buyers need builders, builders need land.

- [ ] Footer sister-brand block, styled as a deliberate cross-brand reference rather than
      a stray outbound link. `rel="noopener"`, external affordance.
- [ ] Contextual links where the journey warrants it — land listings, plot pages.
- [ ] Consider reciprocal linking from Nairobuild; cross-domain links between genuinely
      related businesses are legitimate SEO.
- [ ] **Decide: primary nav or footer?** Nav says "part of our offering"; footer says
      "sister business we recommend." A positioning call, not a technical one.

### 7.5 — Database-driven maintenance mode

`App.jsx:78` reads `VITE_MAINTENANCE_MODE` at build time, requiring a **rebuild** to
toggle — while `SettingsContext` already carries a `maintenance_mode` field that could
flip instantly.

- [ ] Switch to the DB flag; keep the env var as an emergency override.

---

## Block 8 — Phase 10 · Platform maturity *(ongoing)*

- [ ] **TypeScript, incrementally.** **Zero `.ts`/`.tsx` files; `prop-types` in 4 of 96.**
      Essentially no shape checking anywhere.
- [ ] **Replace `react-quill`** — unmaintained since 2023, React 16/17 peers, and it
      depends on `findDOMNode`, which React 19 removed. **It blocks the React 19 path.**
      `quill` 2 is already a dependency; `tiptap` is the alternative.
- [ ] **Remove `@headlessui/react`** — declared in `package.json` and in `manualChunks`,
      with **zero imports in `src/`**.
- [ ] **Consolidate the two calendar libraries.**
- [ ] **Error tracking** (Sentry) wired into the existing error boundaries.
- [ ] **Documentation hygiene** — **14 status docs in `src/Docs/`** plus several at root;
      `README.md` advertises React 18.2.0 / Vite 4.4.5 against an actual 18.3.1 / 6.3.5.
      They ship in the repo and contradict the code.
- [ ] **Staging environment** — possible now that the schema is reproducible.
- [ ] **Diaspora owner portal** (`/portal`). `DiasporaPortal.jsx` was deleted rather than
      routed, because it rendered fabricated portfolio figures from a hardcoded array.
      Rebuilding it needs, in order: an `owner_properties` model linking `auth.users` to
      `properties` with RLS scoping a signer to their own rows; real income, expense and
      maintenance records; and a session-only (non-admin) route guard. The deleted
      prototype is the design reference — recover it from git history at `ace04b7`.

---

## The gaps that remain — numeric, and checkable

Only metrics with distance left to travel appear here. Anything already at target was
removed along with the rest of the finished work.

| Metric | Today (2026-09-02) | Target | Block |
|---|---|---|---|
| Tables where anon can `DELETE`/`TRUNCATE` | narrowed by `007`; `admin_users` still truncatable by any signed-in user | 0 | 1 |
| `SECURITY DEFINER` RPCs granted to `anon` | **2** (`update_setting`, `get_setting`) | 0 | 1 |
| Policies that are `USING (true)` | 19 → 1 after `009` (the documented public SELECT) | 1 | 1 |
| Published secrets not yet rotated | **3** (service key, Cloudinary secret, `sbp_` token) | 0 | 1 |
| Release 4 work reaching production | **0 of 2 slices** (unmerged, unpushed) | both | 2 |
| Raw palette classes in `src/` | **3,005**, ceiling live and blocking | **< 400** → 0 | 3 |
| Native `alert()`/`confirm()` | **10**, 2 of them customer-facing | 0 | 3 |
| Icon libraries | **2** (`react-icons` in 30 files, `lucide-react` in 11) | 1 | 3 |
| Booking notification delivery | **0%** — 8 enquiries stranded | 100% | 1 |
| CSS bundle (raw) | **76.7 kB** | < 50 kB | 3 |
| Themes shipped | **1** (the layer for 2 exists; the provider does not) | 2, both AA | 4 |
| `<label>` without an associated control | **~123 of 134** | 0 | 4 |
| `aria-expanded` in the codebase | **2** | every disclosure control | 4 |
| axe violations | **not measured** | 0, enforced in CI | 4 |
| Files importing Supabase directly | **23** | 0 | 5 |
| Files over 700 lines | **8** (largest 1,284) | 0 over 300 | 5 |
| First-load JS (gzip) | **213.9 kB** | < 100 kB | 5 |
| Lighthouse Performance (mobile) | **not measured** | ≥ 90 | 5 |
| Property pages in the sitemap | **0** | all | 7 |
| JSON-LD geo error | **~500 km** from the stated address | correct | 7 |
| `.ts`/`.tsx` files | **0** | incremental adoption | 8 |
| Test coverage | **62.4% statements** | ≥ 70% | ongoing |
| Overall audit score | **~5.5 / 10** | **9 / 10** | — |

**The score is capped at roughly 6 until Block 1 is executed, and no amount of further
coding lifts it.**

---

## How to execute this

This roadmap is strategic — *what*, *why*, in what order, with numeric exit criteria. It
is deliberately not task-level. **Do not generate plans for all blocks up front**; each
block changes the codebase enough that a plan written today for Block 6 would be stale
before it started.

**Blocks 1 and 2 need no plan.** Block 1 is a checklist run against the Supabase
dashboard; Block 2 is a merge and a deploy.

**For each agent-executable block, generate the plan when you start it:**

```
/superpowers:writing-plans Block 3 of ROADMAP.md — primitives on the token layer,
retire the 10 native dialogs, migrate surfaces and lower the palette ratchet
```

**Three rules that have held so far and should keep holding:**

1. **Every block ends deployable.** Not "ends written" — ends *deployed*. Release 4's two
   finished slices have been sitting on an unpushed branch, which is why "merged" is not
   the finish line.
2. **Guard rails land with the work, not after it.** Every number in the gaps table that
   is currently held — bundle budget, coverage floor, palette ratchet, console-in-dist —
   is held by CI, not by intention.
3. **Measure, don't assert.** Every count in this document was re-measured on 2026-09-02.
   A roadmap that gets more accurate is working; one whose numbers only ever improve is
   being marked by the person who wrote it.
