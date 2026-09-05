# Raslipwani Properties — Remaining Work to World-Class

> **Version 10 — revised 2026-09-05.** This document contains **only what is still
> outstanding**. Everything verified complete has been removed; what survives is work,
> not history. Supersedes Versions 1–9.
>
> **Score:** audited **3.8/10** (2026-09-01) → **~6/10** today → target **9/10**.
> The score does not move past 6 by writing code — see **Block 1**, which is the only
> outstanding work with a live consequence and the only work an agent cannot do for you.
>
> **Sources:** [`docs/audit/2026-09-01-codebase-audit.md`](docs/audit/2026-09-01-codebase-audit.md);
> live introspection of project `gihgdouvltxlpynpuyde` (`rasilpwani`, eu-north-1) on
> 2026-09-01 and 2026-09-02; **every count below re-measured against the working tree on
> 2026-09-05.**

---

## Where this actually stands

Three separate things are true at once, and conflating them is how the last two
iterations of this roadmap went stale:

1. **The code has moved a long way.** Clerk is gone, the test suite exists and runs, CI
   gates six checks, every page is routed, the token layer is built, proven, and now
   **spent across every public surface**.
2. **It has shipped as far as `main`.** Release 4 — Slices 4A, 4B and the 4C primitive
   layer — merged at `18e82a9`. Block 2 is closed. What Version 9 described as "sitting
   on an unpushed branch" is no longer true.
3. **The database is still open.** `007` and `008` are applied. `009`–`012` are not.
   Until they are, anyone holding the public anon key can still read customer PII and
   write through an unauthenticated RPC.

**Block 1 is the only work with a live consequence. Everything else is preparation.**
It has not moved since Version 9, because nothing in it is agent-executable.

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
| Bundle | 215.5 kB gzip first load (from 275 kB), budget 219 kB |
| Icon fonts | 0 bytes (FontAwesome's 999 kB removed); CSS 146 kB → 76.7 kB raw |
| Canonicals | Route-aware. Every page previously declared the homepage as its canonical |
| Zoom | `user-scalable=no` removed; SC 1.4.4 no longer failed at the viewport tag |
| Booking email | Resend pipeline built and tested end-to-end 🔑 *awaiting keys* |
| Public surfaces on tokens | Home, Properties, PropertyDetail, About, Contact, International, UNHousing — **0 literal colour classes** between them, bar one documented decorative gradient |
| Contact form | Behind `Input`/`Select`/`Textarea`/`Button`; errors announced, not just visible |
| Nav disclosures | Dropdown operable by keyboard (it was not), `aria-expanded`/`aria-controls` on all five disclosures |
| Skip link | First in the tab order, target focusable, asserted by test |
| Cloudinary secret | Form can no longer write it to an anon-readable column; guarded by test |
| JSON-LD geo | Corrected from Nairobi to Kikambala; guarded by test |

> **Correction carried forward:** a note in `docs/HANDOFF-phase1-apply.md` records
> `AdminBookings.jsx:70` and `AdminLayout.jsx:49` as broken because they filter
> `bookings.is_archived`. The 2026-09-02 introspection proved the column **exists** in the
> live database — `000_baseline.sql` was the thing that was wrong, and it has since been
> rewritten by transcription from `information_schema`. **Those queries are fine.**
> Nothing to do.

> **Two further corrections, found 2026-09-05.**
>
> 1. **Block 1.8 named "the email API key" alongside the Cloudinary secret.** There is no
>    API-key field in `EmailSettings.jsx` and never was in this tree — the Resend key is
>    read only by `api/send-email.js` from the environment. Only the Cloudinary
>    credentials were ever at risk, and they are now gone from the form.
> 2. **The `htmlFor` count is not a usable metric any more, and Version 9's target was
>    built on it.** Migrating a form to `Field` *removes* `htmlFor` from the call site —
>    the primitive renders the association internally — so the raw grep fell from 15 to 7
>    while labelling got strictly better. Counting `<label>` against `htmlFor` now
>    punishes the fix. The honest measure is the eslint rule, and that is what the gaps
>    table below records.

---

## Order of remaining work

| | Block | Owner | Effort | Blocks |
|---|---|---|---|---|
| **1** | Close the database | 🔑 **you** | ~1 day | *everything downstream in production* |
| ~~2~~ | ~~Land what already exists~~ | — | — | ✅ **done** — merged at `18e82a9` |
| **3** | Release 4C — the admin half of the surface migration | agent | ~2 days | Block 4 |
| **4** | Release 4D — ship the theme, fix the accessibility it exposes | agent | ~4 days | Block 6 |
| **5** | Release 5 — data layer, decomposition, the rest of the budget | agent | ~7 days | Block 6 (partly) |
| **6** | Phase 9 — the UI revamp | agent | ~3 weeks | — |
| **7** | Phase 8 — SEO and discovery | agent | ~4 days + investigation | — |
| **8** | Phase 10 — platform maturity | ongoing | — | — |

3 → 4 are sequential, and 3 is now mostly done. 5 and 7 parallelise with 3–4. 6 depends
on 3, 4, and the budget half of 5. **Block 1 is independent of all of them** and gates
only production, which is exactly why it has not blocked the work above it.

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

### ~~1.8 — One paired code change~~ ✅ **done** *(agent work)*

`CloudinarySettings.jsx` read and wrote `cloudinary_api_key` and `cloudinary_api_secret`
on `admin_settings`, whose columns are anon-readable. Both were `NULL`, so nothing had
leaked — the form was one save away from publishing a live secret. Both fields are gone
from the form, the read and the write; the form now says the credentials belong in
server-side configuration. Unsigned uploads, which is all this site performs, need only
the cloud name and preset. `noSecretsInAnonTables.test.js` fails the build if any
client-side file names those columns again.

**This does not reduce 1.5.** The Cloudinary secret still sat in an anon-readable column
historically and **still needs rotating**; closing the write path does not un-publish
anything that was already served.

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

## ~~Block 2 — Land what already exists~~ ✅ **done**

Release 4's slices merged onto `main` at `18e82a9`, bringing the 999 kB font removal, the
canonical fix, the layout route, the console strip and the whole token layer onto one line
of history. The typo in `docs/HANDOFF-phase1-apply.md` was fixed at `97e81e1`.

**Still outstanding from this block, and owner-side:** `main` is merged but a deploy from
it has not been confirmed, and `docs/HANDOFF-phase1-apply.md` has not been retired in
favour of Block 1. Two documents still tell the owner what to run, and they disagree.

---

## Block 3 — Release 4C · Primitives, and the migration they carry *(≈2 days left)*

**Progress, measured 2026-09-05.** The primitive layer, the whole dialog problem, and the
**entire public surface** are done. What remains is admin and the shared components admin
leans on, plus the icon consolidation, which has not started.

- [x] **Primitives on the token layer:** `Button`, `Input`/`Textarea`/`Select` (over a
      shared `Field`), `Card`, `Badge`, `Modal`, `Toast`, `ConfirmDialog`, plus
      `useConfirm`/`usePrompt` and the `useDialog` hook the two chrome-less dialogs need.
- [x] **Retire the native browser dialogs.** The count was **eleven**, not ten.
      `noNativeDialogs.test.js` fails the build on the twelfth.
- [x] **Every dialog rendered by one primitive.** Eleven, not the four this document once
      named. `noBespokeDialogs.test.js` holds the line. Block 4's focus-trap requirement
      is satisfied by this, once.
- [x] **Migrate the public surfaces.** Home, Properties, PropertyDetail, About, Contact,
      International and UNHousing carry **zero literal colour classes** between them, bar
      one documented decorative gradient on About. Contact's form went through the
      primitives as well as the tokens, which is what linked its error text to its fields.
      Ratchet **3,005 → 2,163**, banked at each step and blocking in CI.
- [ ] **Migrate the admin surfaces.** Everything left in the ratchet's top ten is admin or
      a component admin owns: `AdminProperties` (214), `ClientManagement` (128),
      `BookingDetailModal` (127), `AdminBookings` (124), `BookingCalendar` (101),
      `ServicesMain` (94), `BookingList` (92), `InvestmentCalculator` (86). Admin last was
      always the plan: it has one user, and it is where a mistake costs least.
- [ ] **Finish the AdminProperties form.** Its dialog is behind `Modal`, but its 1,294
      lines of hand-written fields still carry unassociated labels. It belongs with that
      surface's pass.
- [ ] **Finish the icon consolidation. Not started.** `react-icons` is imported in **29
      files** against `lucide-react` in 11 — unchanged since Version 9, because the public
      surface passes touched colour, not icons. The `<Icon>` registry built in 4A is the
      seam.
- [ ] Bring the CSS bundle under 50 kB raw.

### Two findings from the public passes that change what "done" means here

**1. The CSS bundle rose, and will keep rising until admin lands.** 80.9 kB → **84.9 kB**
raw. This is not a regression to chase: a partial migration carries both vocabularies at
once, because the public pages now emit token utilities while the admin files still emit
the grey and blue literals, and Tailwind generates both. **The `< 50 kB` exit criterion is
unreachable until the admin migration finishes**, and any attempt to chase it before then
is measuring the wrong thing.

**2. The token layer has no vocabulary for decorative colour, and 57 classes are stuck on
it.** `International.jsx`, `UNHousing.jsx` and `About.jsx` carry deliberate multi-hue
gradients — purple, indigo, orange, pink, emerald, cyan. The layer has 32 semantic roles,
all of which answer "what job does this colour do", and none of which answer "which of six
decorative hues is this". Mapping them onto `brand` would flatten a deliberate visual into
one hue, which is a redesign. **This is a real dependency in the wrong direction: Block 3
cannot reach zero without a decision that belongs to Block 6.** Either Block 6 commits to
a visual world that names these roles, or it removes the gradients. Inventing decorative
tokens by codemod now would pre-empt that choice, so the eslint rule keeps reporting them
— the correct state for something known and not yet decided.

**Exit:** raw-palette ratchet **below 400** (the ceiling is **2,163** today and blocking in
CI; ~57 of the remainder are blocked on Block 6 as above) · ~~zero `alert()`/`confirm()` in
`src/`~~ ✅ · ~~every modal rendered by one primitive~~ ✅ · ~~every public surface on
tokens~~ ✅ · one icon library · CSS under 50 kB raw.

---

## Block 4 — Release 4D · Ship the theme, and the accessibility it exposes *(≈3 days)*

The two cheapest items are done. The theme provider — the item everything else in this
block is really waiting on — is not started.

- [ ] **Theme provider** — `light`/`dark`/`system`, persisted, respecting
      `prefers-color-scheme`, with a toggle in the header and the admin shell. **This is
      now the single highest-value remaining agent task**: the token layer is built, both
      themes are defined and contrast-tested, and every public surface is on tokens. The
      provider is the switch that turns all of that into something a visitor can see.
- [ ] Audit every surface in both themes, including property imagery, FullCalendar, Quill,
      and the four hardcoded hex values in the `.custom-calendar` block.
- [ ] **Associate the remaining labels.** Re-measured 2026-09-05 by rule rather than by
      grep: **94 `jsx-a11y/label-has-associated-control`** (from 134 at the audit
      baseline) and **87 `jsx-a11y/control-has-associated-label`**. Nearly all of what is
      left is admin, and most of it is inside `AdminProperties.jsx` — so this lands with
      the Block 3 admin passes rather than as a sweep of its own. Every form that has gone
      through `Field` is correct and cannot regress.
- [ ] Retire `jsx-a11y/label-has-for` in `eslint.config.js` **after** the pairing lands.
      It is a deprecated rule that double-counts `label-has-associated-control`; it
      contributes **109** of the current warnings and turning it off fixes nothing.
- [x] **`aria-expanded`/`aria-controls` on header dropdowns and the mobile menu.**
      **2 → 10.** This was recorded as an attribute gap and was not one: the desktop
      dropdown trigger was a `<button>` with no `onClick`, opening only on the wrapper's
      `onMouseEnter`. A keyboard visitor could focus it, press Enter, and watch nothing
      happen — the International section, which this document calls the highest-return
      part of the product, was unreachable without a mouse. It now toggles on activation,
      closes on Escape and returns focus to the trigger. `Header.disclosure.test.jsx`
      drives it by keyboard on purpose.
- [x] **Skip-to-content link.** In `PublicLayout`, asserted to be *first* in the tab order
      and to point at a target carrying `tabIndex={-1}` — a fragment link whose target is
      not focusable scrolls the page and leaves focus behind in the nav.
- [ ] Live regions for async status and toasts.
- [ ] **`axe-core` in CI**, failing the build on violations, plus a keyboard-only pass
      over the booking flow in both themes. Still **not measured** — and until it runs,
      every claim in this block is an argument rather than a number.

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

First load is **215.5 kB gzip** against a **< 100 kB** target, with a 219 kB budget
blocking in CI.

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
- [x] **Fix the JSON-LD coordinates.** Was `-1.2921, 36.8219` — Nairobi city centre —
      while the `address` in the same block reads Kikambala Road, Kilifi. ~500 km apart,
      which breaks local-business indexing outright. Now `-3.8667, 39.7833`.
      `structuredData.test.js` asserts the point falls inside Kilifi County and that
      `@id` and `url` agree. **🔑 Worth one owner check:** the new coordinates are
      Kikambala as a locality, not a surveyed pin on the office door. If the exact
      location matters for a map card, confirm it and tighten the value.

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
- [x] **Remove `@headlessui/react`** — done. Worth recording what it did *not* buy:
      because it was never imported it was never bundled, so removing it shortened the
      dependency list and deleted a stale `manualChunks` hint, and moved the bundle by
      **zero bytes**. Version 9 listed it under budget work; it was housekeeping.
- [ ] **Consolidate the two calendar libraries.**
- [ ] **Error tracking** (Sentry) wired into the existing error boundaries.
- [ ] **Documentation hygiene** — **14 status docs in `src/Docs/`** plus several at root,
      shipping in the repo and contradicting the code. ~~`README.md` advertises React
      18.2.0 / Vite 4.4.5~~ ✅ corrected to the actual 18.3.1 / 6.3.5, in both the badges
      and the stack table. The 14 status docs remain.
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

| Metric | Today (2026-09-05) | Target | Block |
|---|---|---|---|
| Tables where anon can `DELETE`/`TRUNCATE` | narrowed by `007`; `admin_users` still truncatable by any signed-in user | 0 | 1 |
| `SECURITY DEFINER` RPCs granted to `anon` | **2** (`update_setting`, `get_setting`) | 0 | 1 |
| Policies that are `USING (true)` | 19 → 1 after `009` (the documented public SELECT) | 1 | 1 |
| Published secrets not yet rotated | **3** (service key, Cloudinary secret, `sbp_` token) — *unchanged; closing the write path does not un-publish* | 0 | 1 |
| Client code that can write a secret to an anon-readable column | **0** (was 1), guarded by test | 0 | ✅ 1.8 |
| Release 4 work reaching production | **merged to `main`** at `18e82a9`; deploy unconfirmed | deployed | ✅ 2 (merge) |
| Raw palette classes in `src/` | **2,163** (from 3,005), ceiling live and blocking | **< 400** → 0 | 3 |
| — of which blocked on a Block 6 design decision | **~57** (decorative multi-hue gradients, no token role exists) | decided, then 0 | 6 → 3 |
| Public surfaces with literal colour classes | **0 of 7** | 0 | ✅ 3 |
| Admin surfaces with literal colour classes | **all of them**; top file 214 | 0 | 3 |
| Native `alert()`/`confirm()`/`prompt()` | **0** (there were 11, not 10) | 0 | ✅ 3 |
| Hand-rolled dialog overlays | **0** (there were 11, not the 4 recorded) | 0 | ✅ 3 |
| Icon libraries | **2** (`react-icons` in 29 files, `lucide-react` in 11) — *unchanged; not started* | 1 | 3 |
| Booking notification delivery | **0%** — 8 enquiries stranded | 100% | 1 |
| CSS bundle (raw) | **84.9 kB** — *rose from 80.9; both vocabularies coexist mid-migration* | < 50 kB | 3 |
| Themes shipped | **1** (layer complete, every public surface on it, provider still absent) | 2, both AA | 4 |
| `jsx-a11y/label-has-associated-control` | **94** (from 134 at baseline), nearly all admin | 0 | 4 |
| `jsx-a11y/control-has-associated-label` | **87** | 0 | 4 |
| `jsx-a11y/label-has-for` (deprecated, double-counts) | **109** | rule removed after pairing | 4 |
| `aria-expanded` in the codebase | **10** (from 2) | every disclosure control | ✅ 4 (nav) |
| Nav dropdown operable by keyboard | **yes** (it was not — no `onClick` at all) | yes | ✅ 4 |
| Skip-to-content link | **present**, first in tab order, asserted | present | ✅ 4 |
| axe violations | **not measured** | 0, enforced in CI | 4 |
| Files importing Supabase directly | **24** | 0 | 5 |
| Files over 700 lines | **7** (largest 1,294) | 0 over 300 | 5 |
| First-load JS (gzip) | **215.5 kB** (budget 219) | < 100 kB | 5 |
| Lighthouse Performance (mobile) | **not measured** | ≥ 90 | 5 |
| Property pages in the sitemap | **0** | all | 7 |
| JSON-LD geo error | **corrected** (~500 km → Kikambala), guarded by test | correct | ✅ 7 |
| `.ts`/`.tsx` files | **0** | incremental adoption | 8 |
| Test coverage | **69.8% statements / 70.6% lines** (307 tests, from 297) — floors ratcheted | ≥ 70% | ✅ ongoing |
| Lint errors | **0** (2,477 warnings, from 3,105) | 0 | ongoing |
| Overall audit score | **~6 / 10** | **9 / 10** | — |

**The score is capped at roughly 6 until Block 1 is executed, and no amount of further
coding lifts it.**

---

## How to execute this

This roadmap is strategic — *what*, *why*, in what order, with numeric exit criteria. It
is deliberately not task-level. **Do not generate plans for all blocks up front**; each
block changes the codebase enough that a plan written today for Block 6 would be stale
before it started.

**Block 1 needs no plan** — it is a checklist run against the Supabase dashboard.
**Block 2 is closed.**

**What to do next, in order of value:**

1. **Block 1**, by the owner. It has not moved in three revisions of this document, and
   it is still the only outstanding work with a live consequence.
2. **The Block 4 theme provider.** Everything it needs now exists: the token layer, both
   palettes, the contrast tests, and every public surface migrated onto them. It is the
   switch that makes all of Release 4 visible to a visitor, and it is one focused task.
3. **The Block 3 admin passes.** They unblock the CSS budget, carry most of the remaining
   label defects with them, and are low-risk because admin has one user.

**For each agent-executable block, generate the plan when you start it:**

```
/superpowers:writing-plans Block 4 of ROADMAP.md — the theme provider, and the
both-theme audit of the surfaces the token migration has already prepared
```

**Three rules that have held so far and should keep holding:**

1. **Every block ends deployable.** Not "ends written" — ends *deployed*. Release 4's
   slices sat on an unpushed branch for two revisions of this document, which is why
   "merged" is not the finish line. They are on `main` now; **a deploy from it has still
   not been confirmed**, so the rule has not finished being earned.
2. **Guard rails land with the work, not after it.** Every number in the gaps table that
   is currently held — bundle budget, coverage floor, palette ratchet, console-in-dist —
   is held by CI, not by intention.
3. **Measure, don't assert.** Every count in this document was re-measured on 2026-09-05.
   A roadmap that gets more accurate is working; one whose numbers only ever improve is
   being marked by the person who wrote it.

   This revision earns that claim on three counts, all of which moved the wrong way:
   the **CSS bundle rose** 80.9 → 84.9 kB, and will keep rising until the admin
   migration lands; **`@headlessui/react` bought zero bytes**, not the budget win it was
   filed under; and the **`htmlFor` metric this document has used since Version 1 turned
   out to punish the fix**, falling 15 → 7 while labelling improved. A fourth: Version 9
   recorded the nav disclosures as an attribute gap, and they were a **keyboard trap** —
   the roadmap had understated a defect, which is the rarer and more useful kind of
   error to find.
