# Raslipwani Properties — Remaining Work to World-Class

> **Version 10 — rewritten 2026-09-03.** This document contains **only what is still
> outstanding**. Work that is verifiably finished is compressed into the ledger below and
> then never mentioned again. Supersedes Versions 1–9.
>
> **Score:** audited **3.8/10** (2026-09-01) → **~6.5/10** today → target **9/10**.
> The score does not move past 7 by writing code. See **Block 1**, which remains the only
> outstanding work with a live consequence and the only work an agent cannot do for you.
>
> **Sources:** [`docs/audit/2026-09-01-codebase-audit.md`](docs/audit/2026-09-01-codebase-audit.md);
> live introspection of project `gihgdouvltxlpynpuyde` (`rasilpwani`, eu-north-1) on
> 2026-09-01 and 2026-09-02. **Every count below was re-measured against the working tree
> on 2026-09-03**, except the database facts in Block 1, which are carried forward from
> 2026-09-02 and are marked where they need re-confirming.

---

## Where this actually stands

Version 9 opened by saying three things were true at once. One of them has changed, and
saying so precisely is the point of this document.

1. **The code has moved a long way, and it has now landed.** Version 9's second point —
   "the newest and most visible half of it has not shipped" — is **no longer true**.
   Release 4 was merged to `main` in `18e82a9`. The font removal, the canonical fix, the
   layout route, the token layer and the primitives are all on one line of history.
2. **The design system is now spent, not just built.** Version 9 described a proven token
   layer painting exactly one theme, with 2,772 literal colour classes standing between it
   and a second. That gap is closed: **95 literal classes remain, and both themes ship.**
3. **The database is still open.** `007` and `008` are applied. `009`–`012` are written,
   dry-run inside a rolled-back transaction, and **not applied**. Until they are, anyone
   holding the public anon key can still read customer PII and write through an
   unauthenticated RPC.

**Block 1 is still the only work with a live consequence, and it has not moved in a day.
Everything an agent can do is preparation for it.**

### Already true — do not re-do, do not re-litigate

<sub>Kept deliberately short. A roadmap with no record of finished work invites redoing it.</sub>

| | Verified 2026-09-03 |
|---|---|
| Identity | One stack. Clerk removed from code and `package.json`; Supabase Auth, `admin_users`, `is_admin()` |
| Privileged keys in bundle | Zero JWT-shaped strings in `dist/`, enforced at build time |
| Tests | 315 passing / 28 files (0 at baseline); coverage **70.3% statements**, past the 70% target |
| Lint errors | 0 (baseline 77). Warnings 395, every one of them counted and budgeted |
| CI | lint · test · coverage floor · palette ratchet · **label ratchet** · token freshness · build · bundle budget · no-console-in-dist · gitleaks |
| Routing | 0 unreachable pages, guarded by a test; 0 broken nav links; one `PublicLayout`, header mounts once |
| Design tokens | 32 role tokens + 5 fixed tokens, both themes, one source, 129 contrast assertions at AA |
| **Themes** | **Two, shipped.** Light / dark / system, persisted, applied before first paint |
| Primitives | `Button`, `Field`, `Input`/`Textarea`/`Select`, `Card`, `Badge`, `Modal`, `Toast`, `ConfirmDialog`, `ThemeToggle` |
| Native dialogs | 0 `alert()`/`confirm()`/`prompt()`; 0 hand-rolled overlays. Both held by tests |
| Literal palette classes | **95**, from 3,005. Ceiling live and blocking in CI |
| Unlabelled controls | **67**, from 96 — and **0 on every public, visitor-facing form** |
| Bundle | 215 kB gzip first load (from 275 kB), budget 219 kB |
| Icon fonts | 0 bytes (FontAwesome's 999 kB removed); CSS 146 kB → 75.6 kB raw |
| Canonicals | Route-aware. Every page previously declared the homepage as its canonical |
| Booking email | Resend pipeline built and tested end-to-end 🔑 *awaiting keys* |

> **Correction carried forward:** `docs/HANDOFF-phase1-apply.md` records `AdminBookings.jsx:70`
> and `AdminLayout.jsx:49` as broken because they filter `bookings.is_archived`. The
> 2026-09-02 introspection proved the column **exists**; `000_baseline.sql` was the thing
> that was wrong and has been rewritten from `information_schema`. **Those queries are
> fine.** Nothing to do.

---

## Order of remaining work

| | Block | Owner | Effort | Blocks |
|---|---|---|---|---|
| **1** | Close the database | 🔑 **you** | ~1 day | *everything downstream in production* |
| **2** | Finish 4C/4D — the long tail of the migration | agent | ~3 days | Block 5 |
| **3** | Release 5 — data layer, decomposition, the rest of the budget | agent | ~7 days | Block 4 (partly) |
| **4** | Phase 9 — the UI revamp | agent | ~3 weeks | — |
| **5** | Phase 8 — SEO and discovery | agent | ~1 week + one investigation | — |
| **6** | Phase 10 — platform maturity | ongoing | — | — |

Block 1 blocks production, not the agents. Block 2 → 4 are sequential. 3 and 5 parallelise
with 2. **Version 9's Block 2 ("land what already exists") is deleted — it is done.**

---

## ⛔ Block 1 — Close the database (owner only) · **the only blocking work**

**Status: `007` and `008` are applied. `009`, `010`, `011`, `012` are written, dry-run
against production inside a rolled-back transaction, and not applied.** Unchanged since
2026-09-02, and unverified since — **re-run the preconditions below rather than trusting
this paragraph.**

`007` already revoked the blanket `anon` grants, so the raw destruction vector is narrower
than the original audit described. What remains is still serious, and two of the four
items were found only by introspection — they are invisible from the repo.

### 1.1 — Apply `009_auth_rls_policies.sql` 🔑

Real policies on `auth.uid()`; `assigned_agent_id` and `confirmed_by` converted `text` →
`uuid` with foreign keys to `auth.users`.

- Take a backup first (Dashboard → Database → Backups).
- Verified preconditions as of 2026-09-02: both identity columns are `text`, **0 of 12
  rows populated**, `client_id` already `uuid`. Re-confirm immediately before applying:
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

Consolidates `settings` into `admin_settings` (preserving values) and secures the orphaned
tables. Apply after `009`.

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

**Exit criteria for Block 1:** anon cannot read customer PII, cannot write through any RPC,
and cannot delete or truncate anything. All 7 tables have RLS enabled with real policies.
Zero `USING (true)` policies except the documented public SELECT. Every published
credential rotated. All six curl assertions above behave as commented.

---

## Block 2 — Finish the migration's long tail *(≈3 days)*

Version 9 gave 4C five days to migrate surfaces one PR at a time and 4D four days to build
a theme on top. Both are substantially done, and the reason is worth keeping, because it
generalises: **the 2,772 literal colour classes were never 2,772 decisions.** They were
~240 distinct classes, the top twenty carrying two thirds of every occurrence. Written
down once in `scripts/codemod-palette.mjs` and applied mechanically, they took one
afternoon instead of 59 review rounds — and produced a *consistent* result, which
hand-migration would not have.

What is left is the genuine remainder: the parts a table could not decide.

- [ ] **The last 95 literal classes.** These are the indigo, purple and pink decoration on
      the marketing surfaces — mostly gradients on `International.jsx` (**37**),
      `DebugPanel.jsx` (**12**) and `Settings.jsx` (**6**). They have no role in the token
      layer, and inventing one for decoration is a design decision, not a mechanical one.
      **Decide it in Block 4, where those surfaces are redesigned anyway** — or add a
      `decor-*` scale if they survive the redesign. Do not force them into `brand`.
- [ ] **Audit both themes on every surface.** The tokens are proven by contrast test; what
      no test covers is third-party chrome. **FullCalendar, react-quill and the four
      hardcoded hex values in the `.custom-calendar` block have not been looked at in dark
      mode.** Property imagery and the hero scrims should be checked by eye.
- [ ] **Finish the icon consolidation.** `react-icons` is imported in **29 files** against
      `lucide-react` in 11 — unchanged, because the plan was to migrate call sites as each
      surface was touched, and the codemod meant surfaces were never touched one by one.
      This now needs its own pass through the `<Icon>` registry built in 4A. It removes a
      whole dependency and shrinks `vendor-icons`.
- [ ] **Label the remaining 67 controls**, all in the admin console. `label-budget.json`
      holds the ceiling; `AdminProperties.jsx` (19) and `GeneralSettings.jsx` (13) are the
      bulk. Route them through the `Field` primitive rather than hand-pairing `htmlFor`,
      since `Field` cannot produce an unlabelled control.
- [ ] **`axe-core` in CI, failing the build on violations.** Deliberately sequenced after
      the labels: turning it on today would fail on 67 known violations and be switched
      off within a day. Turn it on when the ratchet reaches zero, and it becomes the
      guard that keeps it there.
- [ ] **Skip-to-content link; live regions for async status and toasts.**
- [ ] Bring the CSS bundle under 50 kB raw (**75.6 kB** today, from 146 kB).
- [ ] Retire `jsx-a11y/label-has-for` in `eslint.config.js` once the labels are done. It is
      deprecated and double-counts `label-has-associated-control`; **turning it off today
      would drop the warning count by a third and fix nothing**, which is exactly why it
      is listed last rather than first.

**Exit:** raw-palette ratchet at **0** or a documented `decor` scale · label ratchet at
**0** · **zero axe violations, enforced in CI** · every public flow completable by keyboard
in both themes · one icon library · CSS under 50 kB raw.

---

## Block 3 — Release 5 · Data layer, decomposition, and the rest of the budget *(≈7 days)*

Invisible to users, and the thing that makes Block 4 a design exercise rather than a
rewrite.

### 3.1 — Data-access layer

**24 files under `src/components` and `src/pages` import the Supabase client directly.**

- [ ] `src/services/` — one module per domain: `properties`, `bookings`, `clients`,
      `settings`, `auth`. Every query behind a named, testable function.
- [ ] Standardise on TanStack Query; remove raw `useEffect` + `supabase` fetching. Two
      paradigms coexist today.
- [ ] Centralise query keys. `Home.jsx` sets a local `staleTime` that silently disagrees
      with the global default in `App.jsx`.
- [ ] **Exit:** `grep -rl supabaseClient src/components src/pages` returns nothing.

### 3.2 — Decompose the largest components *(after 3.1 — they shrink on their own)*

**8 files still exceed 700 lines**; `AdminProperties.jsx` is 1,294.

- [ ] Split `AdminProperties.jsx`, `AdminBookings.jsx`, `ServicesMain.jsx`. Target: none
      over 300 lines.
- [ ] Extract `usePagination`, `useFilters`, `useCsvExport`.

### 3.3 — Finish the performance budget

First load is **215 kB gzip** against a **< 100 kB** target.

- [ ] **Split the Supabase client.** `vendor-supabase` is 55 kB gzip — the single largest
      item in first load, and the dominant one now that the fonts are gone.
- [ ] Route-level code splitting on the public side (admin is already lazy).
- [ ] Lighthouse in CI as a gate, mobile profile.

### 3.4 — Move `UNHousing.jsx`'s hardcoded inventory into the database

`UNHousing.jsx:27+` embeds a literal `unProperties` array with Unsplash placeholders,
invented prices and fixed dates (`2026-02-01`) that will silently go stale. Model these as
`properties` rows with a segment tag so the admin CRM manages them. **Needs a migration, so
it is blocked on Block 1.** Until then the page ships placeholder inventory: a known,
temporary defect, not a finished state.

**Exit:** zero direct Supabase imports in components and pages · no file over 300 lines ·
first-load JS **under 100 kB gzip** · Lighthouse Performance ≥ 90 mobile · UN inventory
served from the database.

---

## Block 4 — Phase 9 · The client-side UI revamp *(≈3 weeks)*

**This was the original request, and it is deliberately last.** A revamp built on open
grants, no tokens and a 275 kB bundle inherits all of it. Blocks 2 and 3.3 exist so this
one can be about design rather than archaeology — and they have now largely paid out: the
revamp starts with a proven two-theme token system, a primitive set, and 96% of the colour
debt gone.

### 4.1 — Direction

- [ ] Capture product truth: local buyers, diaspora investors, UN/embassy tenants — the
      job each is doing, and what makes Raslipwani different from a generic listings site.
- [ ] Commit to a visual world; document it in `DESIGN.md`.
- [ ] Mode per surface: **Persuade** (home, services, international), **Operate** (search,
      booking), **Read** (about, guides).

### 4.2 — Surfaces

- [ ] **Home** — the hero is a stock photo under a dark overlay with generic copy ("Your
      Trusted Real Estate Partner in Kenya"). Replace it with a point of view and a search
      entry that starts the journey immediately.
- [ ] **Properties** — the grid *is* the product. Filters, map, saved searches, comparison.
- [ ] **Property detail** — gallery, neighbourhood context, mortgage/ROI calculator, and a
      booking flow that converts.
- [ ] **International** — UN/diplomatic housing and diaspora investment are the things a
      generic competitor cannot copy. The section is routed now and still under-treated.
      **Likely the highest-return product change in this document.** It also carries 37 of
      the 95 remaining literal colours, so the two jobs are the same job.
- [ ] **Booking flow** — end to end, with the confirmation experience Block 2 unlocks and
      the Resend emails actually firing.
- [ ] **Admin login and console** — the first impression of the tool used daily, and now
      the only place unlabelled controls remain.
- [ ] **Contact, About, 404.**

### 4.3 — Craft

- [ ] Purposeful motion. Today's framer-motion usage is a uniform fade-up on nearly
      everything, which reads as a default rather than a decision.
- [ ] Real loading, empty and error states everywhere; the featured-properties skeleton is
      a good model to extend.
- [ ] Mobile-first — the market is predominantly mobile on constrained networks.
- [ ] Keep the existing Cloudinary `f_auto,q_auto` responsive `<picture>` pattern. It is
      already correct.

**Exit:** every public surface rebuilt against the design system, in both themes, within
the Block 3.3 budget, passing the Block 2 accessibility bar.

---

## Block 5 — Phase 8 · SEO and discovery *(≈1 week + one investigation)*

### 5.1 — Consolidate on one domain

- [ ] 301 `.com` → `.co.ke` permanently; keep the redirect and do not let the domain lapse.
- [ ] Make canonical, JSON-LD `@id`/`url`, JSON-LD image, `robots.txt` and OG agree.
- [ ] **Fix the JSON-LD coordinates.** `Home.jsx:90-91` reads `-1.2921, 36.8219` — Nairobi
      city centre — while the `address` in the same block is Kikambala Road, Kilifi.
      **~500 km apart**, which breaks local-business indexing outright.

### 5.2 — Dynamic sitemap

`public/sitemap.xml` is static with **7 URLs** and omits **every property detail page** —
precisely the pages that should rank.

- [ ] Generate it at build time from the property list, with `lastmod`.

### 5.3 — Structured data, and the rendering constraint

- [ ] Per-property `RealEstateListing` JSON-LD; real OG images per property; route the last
      remaining Helmet blocks through `DynamicSEO`.
- [ ] **Investigate the SPA rendering constraint properly.** As a pure client-side SPA,
      crawlers see an empty shell for all property content. This is plausibly the single
      largest limit on organic acquisition. Prerendering the listing routes, or moving to
      an SSR framework, is **a project in its own right** — scope it honestly rather than
      bolting it onto a release.

### 5.4 — Nairobuild cross-brand

Construction is now a separate business (`nairobuild.co.ke`) with genuinely adjacent
audiences — land buyers need builders, builders need land.

- [ ] Footer sister-brand block, styled as a deliberate cross-brand reference rather than a
      stray outbound link. `rel="noopener"`, external affordance.
- [ ] Contextual links where the journey warrants it — land listings, plot pages.
- [ ] Consider reciprocal linking from Nairobuild; cross-domain links between genuinely
      related businesses are legitimate SEO.
- [ ] **Decide: primary nav or footer?** Nav says "part of our offering"; footer says
      "sister business we recommend." A positioning call, not a technical one.

### 5.5 — Database-driven maintenance mode

`App.jsx:78` reads `VITE_MAINTENANCE_MODE` at build time, requiring a **rebuild** to
toggle — while `SettingsContext` already carries a `maintenance_mode` field that could flip
instantly.

- [ ] Switch to the DB flag; keep the env var as an emergency override.

---

## Block 6 — Phase 10 · Platform maturity *(ongoing)*

- [ ] **TypeScript, incrementally.** **Zero `.ts`/`.tsx` files; `prop-types` in 18 of 103
      components.** Version 9 recorded 4 of 96 — the primitives added since carry their
      own, so the habit is spreading, but 85 components still check nothing.
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

Only metrics with distance left to travel appear here. Anything at target moved to the
ledger at the top.

| Metric | 2026-09-02 | **Today** | Target | Block |
|---|---|---|---|---|
| `SECURITY DEFINER` RPCs granted to `anon` | 2 | **2** | 0 | 1 |
| Policies that are `USING (true)` | 19 | **19** → 1 after `009` | 1 | 1 |
| Published secrets not yet rotated | 3 | **3** | 0 | 1 |
| Booking notification delivery | 0% | **0%** — 8 enquiries stranded | 100% | 1 |
| Raw palette classes in `src/` | 2,772 | **95** | 0 or a `decor` scale | 2 |
| Unlabelled form controls | 96 | **67** (0 on public surfaces) | 0 | 2 |
| Icon libraries | 2 | **2** (`react-icons` in 29 files, `lucide-react` in 11) | 1 | 2 |
| axe violations | not measured | **not measured** | 0, enforced in CI | 2 |
| `aria-expanded` in the codebase | 2 | **3** | every disclosure control | 2 |
| CSS bundle (raw) | 80.9 kB | **75.6 kB** | < 50 kB | 2 |
| Files importing Supabase directly | 23 | **24** | 0 | 3 |
| Files over 700 lines | 8 | **8** (largest 1,294) | 0 over 300 | 3 |
| First-load JS (gzip) | 213.9 kB | **215 kB** | < 100 kB | 3 |
| Lighthouse Performance (mobile) | not measured | **not measured** | ≥ 90 | 3 |
| Property pages in the sitemap | 0 | **0** | all | 5 |
| JSON-LD geo error | ~500 km | **~500 km** | correct | 5 |
| `.ts`/`.tsx` files | 0 | **0** | incremental adoption | 6 |
| Themes shipped | 1 | **2** ✅ | 2, both AA | ✅ |
| Test coverage | 62.4% | **70.3% statements** ✅ | ≥ 70% | ✅ |
| Overall audit score | ~5.5 / 10 | **~6.5 / 10** | **9 / 10** | — |

Three of those numbers went **up**, and they are left visible rather than quietly
re-baselined: direct Supabase imports (23 → 24) and first-load JS (213.9 → 215 kB) both
drifted because this release added a provider and a component without touching Block 3,
and `aria-expanded` rose only because one dropdown was fixed — the denominator is still
every disclosure control on the site.

**The score is capped at roughly 7 until Block 1 is executed, and no amount of further
coding lifts it.**

---

## How to execute this

This roadmap is strategic — *what*, *why*, in what order, with numeric exit criteria. It is
deliberately not task-level. **Do not generate plans for all blocks up front**; each block
changes the codebase enough that a plan written today for Block 4 would be stale before it
started.

**Block 1 needs no plan** — it is a checklist run against the Supabase dashboard.

**For each agent-executable block, generate the plan when you start it:**

```
/superpowers:writing-plans Block 2 of ROADMAP.md — the last 95 literal colours,
the admin labels, axe in CI, and the icon consolidation
```

**Four rules that have held so far and should keep holding.**

1. **Every block ends deployable.** Not "ends written" — ends *deployed*. Version 9 existed
   partly because two finished slices sat on an unpushed branch for a week.
2. **Guard rails land with the work, not after it.** Every number in the gaps table that is
   currently held — bundle budget, coverage floor, palette ratchet, label ratchet,
   console-in-dist — is held by CI, not by intention. When a defect is too large to fix at
   once, ship a ratchet rather than an error: a rule that fails the build on arrival with
   96 violations gets switched off within a day, and then nothing is enforced at all.
3. **Measure, don't assert.** Every count here was re-measured on 2026-09-03. A roadmap
   that gets more accurate is working; one whose numbers only ever improve is being marked
   by the person who wrote it.
4. **Prefer one written-down decision to many repeated ones.** The colour migration was
   scoped at five days of surface-by-surface PRs and took an afternoon, because the work
   was a vocabulary, not a sequence of judgements. Before grinding through a long list, ask
   whether the list is actually short and repeated. **But hold the line on what a table may
   decide:** the same codemod, run without that discipline, quietly rewrote four doc
   comments, flattened a gradient to pure black, and leaked a brand ground onto the wrong
   half of a ternary — all three found by reading its output, none by a test. Mechanise the
   repetition; keep the judgement.
