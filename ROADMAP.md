# Raslipwani Properties — Remaining Work to World-Class

> **Version 11 — reconciled 2026-09-06.** This document contains **only what is still
> outstanding**. Work that is verifiably finished is compressed into the ledger below and
> then never mentioned again. Supersedes Versions 1–10.
>
> **Why "reconciled":** two sessions worked from `18e82a9` in parallel and each wrote its
> own Version 10. One migrated the public surfaces by hand through the primitives and
> fixed the nav, the JSON-LD geo error and the Cloudinary secret; the other wrote the
> palette codemod, the theme-invariant roles and the theme provider. Both were real, both
> were unmerged, and their two roadmaps disagreed about what was done. They are merged at
> `28f57ca`, the conflicts resolved in favour of the hand-migrated structure with the
> codemod re-run over it, and **every number below re-measured against the merged tree**.
>
> **Score:** audited **3.8/10** (2026-09-01) → **~7/10** today → target **9/10**.
> The score does not move past 7 by writing code. See **Block 1**, which remains the only
> outstanding work with a live consequence and the only work an agent cannot do for you.
>
> **Sources:** [`docs/audit/2026-09-01-codebase-audit.md`](docs/audit/2026-09-01-codebase-audit.md);
> live introspection of project `gihgdouvltxlpynpuyde` (`rasilpwani`, eu-north-1) on
> 2026-09-01 and 2026-09-02. **Every count below was re-measured on 2026-09-06**, except
> the database facts in Block 1, which are carried forward from 2026-09-02 and are marked
> where they need re-confirming.

---

## Where this actually stands

Version 10 said three things were true at once. Two of them have changed.

1. **The design system is spent, not just built.** Version 9 described a proven token
   layer painting one theme with 2,772 literal colour classes standing between it and a
   second. **94 remain, both themes ship, and every public surface is on tokens.** The
   decorative multi-hue gradients that one Version 10 recorded as *blocked on a design
   decision* are not blocked: the theme-invariant roles that arrived with the codemod
   name them, so they migrated with everything else.
2. **The accessibility bar is measured rather than asserted.** Both Version 10s carried
   "axe violations: **not measured**" while the block above it committed to WCAG AA.
   Every public surface plus the header and footer is now asserted against WCAG 2.1 A/AA
   in both themes, on every run, as its own CI step. **Zero violations.** The gate found
   three real defects on its first run — including a page that crashed outright on a null
   Supabase response — which is the argument for gates over intentions in one line.
3. **The database is still open.** `007` and `008` are applied. `009`–`012` are written,
   dry-run inside a rolled-back transaction, and **not applied**. Until they are, anyone
   holding the public anon key can still read customer PII and write through an
   unauthenticated RPC.

**Block 1 is still the only work with a live consequence, and it has not moved in four
revisions of this document. Everything an agent can do is preparation for it.**

### Already true — do not re-do, do not re-litigate

<sub>Kept deliberately short. A roadmap with no record of finished work invites redoing it.</sub>

| | Verified 2026-09-06 |
|---|---|
| Identity | One stack. Clerk removed from code and `package.json`; Supabase Auth, `admin_users`, `is_admin()` |
| Privileged keys in bundle | Zero JWT-shaped strings in `dist/`, enforced at build time |
| Tests | **387 passing / 36 files** (0 at baseline) |
| Lint errors | 0 (baseline 77). **168 warnings** (was 375), every one counted and budgeted |
| CI | lint · test · coverage floor · **axe** · palette ratchet · label ratchet · token freshness · build · bundle budget · no-console-in-dist · gitleaks |
| **axe violations** | **0**, across 6 public + 5 admin surfaces + all chrome × 2 themes, enforced in CI |
| Routing | 0 unreachable pages, guarded by a test; 0 broken nav links; one `PublicLayout`, header mounts once |
| Design tokens | 32 role tokens + 5 fixed tokens, both themes, one source, 129 contrast assertions at AA |
| **Themes** | **Two, shipped.** Light / dark / system, persisted, applied before first paint |
| Primitives | `Button`, `Field`, `Input`/`Textarea`/`Select`, `Card`, `Badge`, `Modal`, `Toast`, `ConfirmDialog`, `ThemeToggle` |
| Native dialogs | 0 `alert()`/`confirm()`/`prompt()`; 0 hand-rolled overlays. Both held by tests |
| Literal palette classes | **94**, from 3,005. Ceiling live and blocking in CI |
| Unlabelled controls | **0**, from 96. Held by a ratchet that is now a floor, not a ceiling |
| Public surfaces on tokens | Home, Properties, PropertyDetail, About, Contact, International, UNHousing |
| Contact form | Behind `Input`/`Select`/`Textarea`/`Button`; errors announced, not just visible |
| Nav disclosures | Dropdown operable by keyboard (it was not — the trigger had no `onClick` at all), `aria-expanded`/`aria-controls` on all five disclosures |
| Skip link | First in the tab order, target focusable, asserted by test |
| Module resolution | `@` alias in **both** vite and vitest configs; Supabase imported by one specifier everywhere |
| Bundle | 215.9 kB gzip first load (from 275 kB), budget 219 kB |
| Icon libraries | **One** — `lucide-react`. FontAwesome (999 kB of fonts) and `react-icons` both gone |
| Canonicals | Route-aware. Every page previously declared the homepage as its canonical |
| Cloudinary secret | Form can no longer write it to an anon-readable column; guarded by test |
| JSON-LD geo | Corrected from Nairobi to Kikambala (~500 km); guarded by test |
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
| **2** | Finish 4C/4D — the long tail of the migration | agent | ~2 days | Block 5 |
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

### ~~1.8 — One paired code change~~ ✅ **done** *(agent work)*

`CloudinarySettings.jsx` read and wrote `cloudinary_api_key` and `cloudinary_api_secret`
on `admin_settings`, whose columns are anon-readable. Both were `NULL`, so nothing had
leaked — the form was one save away from publishing a live secret. Both fields are gone
from the form, the read and the write; it now says the credentials belong in server-side
configuration. Unsigned uploads, which is all this site performs, need only the cloud name
and preset. `noSecretsInAnonTables.test.js` fails the build if any client-side file names
those columns again.

**One correction while closing it:** this item also named "the email API key". There is no
API-key field in `EmailSettings.jsx` and never was in this tree — the Resend key is read
only by `api/send-email.js`, from the environment. Only the Cloudinary credentials were
ever at risk.

**This does not reduce 1.5.** The Cloudinary secret sat in an anon-readable column
historically and **still needs rotating**; closing the write path does not un-publish
anything already served.

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

## Block 2 — Finish the migration's long tail *(≈2 days)*

Version 9 gave 4C five days to migrate surfaces one PR at a time and 4D four days to
build a theme on top. Both are done, and the reason generalises: **the 2,772 literal
colour classes were never 2,772 decisions.** They were ~240 distinct classes, the top
twenty carrying two thirds of every occurrence. Written down once in
`scripts/codemod-palette.mjs` and applied mechanically, they took one afternoon instead
of 59 review rounds — and produced a *consistent* result, which hand-migration did not.

What is left is the genuine remainder: the parts a table could not decide.

- [ ] **The last 94 literal classes.** Concentrated in `International.jsx` (**38**),
      `DebugPanel.jsx` (**12**), `Settings.jsx` (**6**) and `Footer.jsx` (**5**), with a
      thin tail across 15 more files. These are the ones the codemod correctly refused:
      a literal class carries no information about the ground it sits on, and these sit
      on grounds that do not flip with the theme. `DebugPanel` is developer chrome and
      arguably should be exempted by rule rather than migrated. **Decide `International`
      in Block 4, where that surface is redesigned anyway.**
- [ ] **Audit both themes on every surface, by eye.** The tokens are proven by contrast
      test; what no test covers is third-party chrome. **FullCalendar, react-quill and
      the four hardcoded hex values in the `.custom-calendar` block have not been looked
      at in dark mode.** Property imagery and the hero scrims need a human.
- [x] **Finish the icon consolidation.** ✅ Done on 2026-09-06. All 29 files now go
      through the `<Icon>` registry; `react-icons` is gone from `package.json`, and the
      three brand marks lucide does not carry (WhatsApp, TikTok, Pinterest) are drawn
      locally from Simple Icons path data in `BrandMarks.jsx`.

      **The bundle rationale in the previous revision was wrong, and it is worth saying
      so.** This was expected to *shrink* `vendor-icons` (32 kB raw). It grew it:

      | | icons bundled | `vendor-icons` raw | gzip | first load |
      |---|---|---:|---:|---:|
      | before | 51 lucide + 74 react-icons | 32.0 kB | 7.6 kB | 215.3 kB |
      | after | **85 lucide** + 3 local paths | **40.9 kB** | **8.6 kB** | **215.9 kB** |

      Fewer icons, bigger chunk, because a lucide glyph costs roughly **481 bytes** —
      it is a stroke-based, multi-element SVG — where a FontAwesome glyph is one filled
      path. Consolidating onto the *larger* per-icon library and then widening the
      registry from 54 names to 91 to cover admin was always going to cost space; nobody
      checked the per-icon cost before writing the prediction down.

      **The work still earns its place, just not for the stated reason.** What it bought
      is one library, one vocabulary, one sizing idiom (an explicit `size` prop rather
      than three competing conventions), and icon data that is serialisable — seven files
      stored React components inside content-shaped arrays and now hold registry name
      strings. Those are maintenance wins. It is not a bundle win, and the ~600 bytes of
      gzip it costs are the price of them.
- [x] **Label the remaining 65 controls**, all in the admin console. ✅ Done on
      2026-09-06; `label-budget.json` is at **0** and is now a floor rather than a
      ceiling. Routed through the `Field` primitives, plus a new `Checkbox` for the four
      controls whose label belongs beside the box rather than above it.

      **Eleven of the 65 were not labelling defects at all**, and forcing them through
      `Field` would have been wrong. Seven `<label>` elements captioned groups of toggle
      buttons or a bare button — a `<button>` is not a labellable control, so those
      labels named nothing; they are now `role="group"` with `aria-labelledby`, or plain
      `<span>` captions. The same pattern appeared in both `AdminProperties` and
      `AdminBookings`, which suggests it was copied. Two more captioned a file drop zone
      whose real control was already correctly paired. **A count of a lint rule is not a
      count of one defect.**
- [x] **`axe-core` in CI, failing the build on violations.** ✅ Done, and the sequencing
      argument that deferred it turned out to be wrong in a useful way. The plan was to
      wait for the label ratchet to reach zero, on the theory that a gate arriving with
      67 known violations gets switched off within a day. But those violations are in
      **admin**, and the gate that matters covers the **public** surfaces — which were
      already at zero. Scoping the gate to what is clean, rather than delaying it until
      everything is, turned it on two blocks early.

      **Extended over the admin console on 2026-09-06** — five admin surfaces plus the
      admin chrome, both themes, 30 assertions in CI. It found three things the label
      work had not:

      - **Four `<select>` elements with no accessible name** (`select-name`, critical) in
        `AdminProperties` and `ClientManagement`. The label ratchet scored these as clean
        because there was no `<label>` element for it to inspect at all — the filters use
        their first option as a pseudo-label. **Passing `jsx-a11y/label-has-associated-control`
        is not the same claim as having an accessible name, and only one of them is WCAG.**
      - **A nameless `role="img"`** (`role-img-alt`, serious) inside FullCalendar's
        prev/next buttons — the first of the third-party chrome this block flags as never
        audited. Fixed with `buttonIcons={false}`.
      - **`AdminBookings` rendering an empty page under test**, caught by a `textContent`
        assertion written before the gate was switched on. axe reports zero violations on
        a blank page, so a gate without that assertion would have passed while inspecting
        nothing.

      The gate was verified to still fail by planting a nameless icon-only button and
      watching `button-name` catch it on both themes.
- [ ] **Live regions for async status and toasts.** The skip link is done.
- [ ] Bring the CSS bundle under 50 kB raw (**76.3 kB** today, from 146 kB). Two theories
      about where the excess lives have now been retired by measurement. It was not the
      two colour vocabularies coexisting — the bundle *rose* when the admin migration
      landed. And it was not the icons: the consolidation is done and the stylesheet did
      not move by a single byte (76.3 kB before, 76.3 kB after), which is exactly what
      should have been expected, since icons are JavaScript and never touched the CSS.
      **The only remaining lead is unused-utility pruning, and it should be measured
      before it is scheduled** — that is two wrong predictions in a row on this line.
- [x] Retire `jsx-a11y/label-has-for` in `eslint.config.js`. ✅ Done on 2026-09-06, and
      listing it last was right for a reason worth keeping. It was costed at **100 of
      375** warnings. By the time the labels landed it was **39 of 207**, because
      routing a field through the primitives silences this rule as a side effect of
      satisfying the real one. Turning it off first would have deleted 100 warnings and
      fixed nothing; turning it off last removed 39 that had become genuinely redundant.
      Total warnings: **375 → 168**.

**Exit criteria, as at 2026-09-06:**

| | |
|---|---|
| label ratchet at **0** | ✅ from 96 at the start of Release 4 |
| axe extended over the admin console, still at zero | ✅ 30 assertions in CI |
| one icon library | ✅ `react-icons` removed |
| `jsx-a11y/label-has-for` retired | ✅ warnings 375 → 168 |
| raw-palette ratchet at **0** or a documented exemption | ⬜ **94** — untouched by this block |
| every public flow completable by keyboard in both themes | ⬜ not yet verified by hand |
| CSS under 50 kB | ⬜ **76.3 kB** — the icon theory is now retired, see above |

Four of seven. The three that remain were not attempted here and are deliberately left
unticked: ticking them would make this document less accurate, which is the one thing rule
3 forbids.

---

## Block 3 — Release 5 · Data layer, decomposition, and the rest of the budget *(≈7 days)*

Invisible to users, and the thing that makes Block 4 a design exercise rather than a
rewrite.

### 3.1 — Data-access layer ✅ *(done)*

**24 files under `src/components` and `src/pages` import the Supabase client directly.**

- [x] `src/services/` — one module per domain: `properties`, `bookings`, `clients`,
      `settings`, `auth`. Every query behind a named, testable function.
- [x] Standardise on TanStack Query; remove raw `useEffect` + `supabase` fetching. Two
      paradigms coexist today.
- [x] Centralise query keys. `Home.jsx` sets a local `staleTime` that silently disagrees
      with the global default in `App.jsx`.
- [x] **Exit:** `grep -rl supabaseClient src/components src/pages` returns nothing but
      the two test files that configure the mock. Enforced going forward by a
      `no-restricted-imports` ESLint error (see `eslint.config.js`), which replaced the
      ratchet that held the line while the migration was in flight.

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

**Measured 2026-09-08, Block 3 Tasks 22–31.** Three of the five have landed: the Supabase
boundary is an ESLint error and the client is a dynamic import; the longest source file is
295 lines, down from 1,294; first load is **112.4 kB gzip**, down from 220.7.

The bundle target is **not met, and the last 12.4 kB is not more of the same work.** The
plan's arithmetic assumed the entry chunk would shrink to ~30 kB and the icon registry to
~3 kB once the vendor groups were gone; neither was ever going to, and the measurement says
so. What is actually left:

| Remaining | Gzip | Notes |
|---|---:|---|
| Stylesheet | 13.2 kB | 78.4 kB raw. Unused-utility pruning is **Block 2's open lead**, not Block 3's |
| React + React-DOM + router | ~53 kB | The floor. Removable only by changing routing |
| Icon registry (85 lucide icons) | ~8.6 kB | Synchronous by contract — call sites store icon *names*, not components |
| App code, helmet, react-query | ~37 kB | The application itself |

The stylesheet is the only line with real slack in it, and it belongs to Block 2. This is
recorded rather than closed: `scripts/__tests__/firstLoadComposition.test.js` holds the
under-100 assertion as an `it.fails`, so it flips red — and the marker comes off — the day
the number is actually met.

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
- [x] **Fix the JSON-LD coordinates.** ✅ Was `-1.2921, 36.8219` — Nairobi city centre —
      while the `address` in the same block reads Kikambala Road, Kilifi. ~500 km apart,
      which breaks local-business indexing outright. Now `-3.8667, 39.7833`;
      `structuredData.test.js` asserts the point falls inside Kilifi County and that `@id`
      and `url` agree. **🔑 Worth one owner check:** these coordinates are Kikambala as a
      locality, not a surveyed pin on the office door. If the exact location matters for a
      map card, confirm it and tighten the value.

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

| Metric | 2026-09-03 | **Today (2026-09-06)** | Target | Block |
|---|---|---|---|---|
| `SECURITY DEFINER` RPCs granted to `anon` | 2 | **2** | 0 | 1 |
| Policies that are `USING (true)` | 19 | **19** → 1 after `009` | 1 | 1 |
| Published secrets not yet rotated | 3 | **3** | 0 | 1 |
| Booking notification delivery | 0% | **0%** — 8 enquiries stranded | 100% | 1 |
| Raw palette classes in `src/` | 95 | **94** | 0 or a documented exemption | 2 |
| Unlabelled form controls | 67 | **0** ✅ | 0 | ✅ 2 |
| Icon libraries | 2 | **1** ✅ `lucide-react` only | 1 | ✅ 2 |
| CSS bundle (raw) | 75.6 kB | **76.3 kB** — unmoved by the icon work, as it should have been | < 50 kB | 2 |
| `jsx-a11y/label-has-for` (deprecated, double-counts) | 109 | **rule removed** ✅ | rule removed after pairing | ✅ 2 |
| `jsx-a11y/control-has-associated-label` | 87 | **45** — halved as a side effect, not targeted | 0 | 2 |
| Files importing Supabase directly | 24 | **0** ✅ | 0 | ✅ 3 |
| Files over 700 lines | 8 | **0** ✅ — longest source file is 295 (Block 3 Tasks 22–27) | 0 over 300 | ✅ 3 |
| First-load JS (gzip) | 215 kB | **112.4 kB** (Block 3 Tasks 28–31) | < 100 kB | 3 |
| Lighthouse Performance (mobile) | not measured | **still not measured** — gated in CI as of Block 3 Task 32; the dev sandbox has no Chrome | ≥ 90 | 3 |
| Property pages in the sitemap | 0 | **0** | all | 5 |
| `.ts`/`.tsx` files | 0 | **0** | incremental adoption | 6 |
| axe violations (public + admin + chrome) | not measured | **0** ✅ enforced in CI, 30 assertions | 0 | ✅ 2 |
| Themes shipped | 2 | **2** ✅ | 2, both AA | ✅ |
| JSON-LD geo error | ~500 km | **corrected** ✅ | correct | ✅ 5 |
| Test coverage | 70.3% statements | **46.6% statements** — floor lowered a second time, see below | ≥ 70% | ongoing |
| Overall audit score | ~6.5 / 10 | **~7 / 10** | **9 / 10** | — |

**Two numbers went the wrong way, and both are left visible rather than re-baselined.**

**Coverage fell 70.3% → 60.3%, and the floor was lowered — the first time this repo has
given back a ratchet.** The axe suite renders six public pages that had no suite of their
own, so v8 had never counted them. Measured both ways on the same tree:

| | files | covered statements | % |
|---|---:|---:|---:|
| without the axe suite | 43 | 835 of 1,205 | 69.3% |
| with the axe suite | 52 | **1,013** of 1,681 | 60.3% |

**178 more statements are covered and nine more files are exercised.** The percentage fell
because the denominator grew faster than the numerator — which is what happens whenever
testing reaches previously untested ground, and is the standing flaw in ratcheting a
*ratio*. Holding the old floor would have meant deleting the accessibility gate to protect
a number. The reasoning is recorded in `vitest.config.js` beside the thresholds.

**It then happened again, harder, in Block 2 — and "it only goes up from 60" was written
one measurement too early.** Extending the axe gate over the admin console renders five
admin pages that had no suite of any kind, so v8 had never counted them either:

| | tests | covered statements | % |
|---|---:|---:|---:|
| without the admin axe suite | 373 | 1,099 of 1,810 | 60.71% |
| with the admin axe suite | 387 | **1,266** of 2,718 | **46.57%** |

**167 more statements are covered and the admin console is exercised for the first time**,
while 908 statements joined the denominator. The floor came down a second time, to 45.

Two give-backs from the same cause is no longer an exception, it is the metric behaving as
designed: **a ratio floor cannot survive contact with newly-reached ground.** The choice
each time was between lowering the number and deleting the gate that revealed it, and
deleting a WCAG gate to protect a coverage percentage is the tail wagging the dog. What
46.57% now says is true — **admin is almost entirely untested** — and that was equally true
yesterday, merely invisible. Block 3 is where it is repaid, because a data-access layer and
decomposition both require tests for exactly these surfaces.

**The CSS bundle rose 75.6 → 76.3 kB** despite the migration finishing, which retires the
theory that the excess was two vocabularies coexisting. Block 2 then retired the second
theory too: the icon consolidation landed and **the stylesheet did not move by one byte**,
because icons are JavaScript. Two wrong predictions in a row on this line; the remaining
lead is unused-utility pruning, and it should be measured before it is scheduled.

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
/superpowers:writing-plans Block 2 of ROADMAP.md — the icon consolidation,
the admin labels, and extending the axe gate over the admin console
```

**Four rules that have held so far and should keep holding.**

1. **Every block ends deployable.** Not "ends written" — ends *deployed*. Version 9 existed
   partly because two finished slices sat on an unpushed branch for a week.
2. **Guard rails land with the work, not after it.** Every number in the gaps table that is
   currently held — bundle budget, coverage floor, palette ratchet, label ratchet,
   console-in-dist — is held by CI, not by intention. When a defect is too large to fix at
   once, ship a ratchet rather than an error: a rule that fails the build on arrival with
   96 violations gets switched off within a day, and then nothing is enforced at all.
3. **Measure, don't assert.** Every count here was re-measured on 2026-09-06. A roadmap
   that gets more accurate is working; one whose numbers only ever improve is being marked
   by the person who wrote it. This revision earns that on three counts: **coverage fell**
   and the floor came down with it, **the CSS bundle rose** and took its explanation with
   it, and **two parallel Version 10s each claimed work the other had not seen** — which
   is the failure mode a document like this exists to prevent and did not.
4. **Work in one place, or reconcile immediately.** Two agents working from the same
   commit produced two Version 10s, two migrations of the same seven files, and a merge
   with eleven conflicts. Nothing was lost — the hand-migrated structure survived and the
   codemod was re-run over it — but the reconciliation cost more than the second migration
   did. Parallel work needs disjoint surfaces, not just disjoint branches.
5. **A gate scoped to what is clean beats a gate deferred until everything is.** axe was
   scheduled after the label ratchet reached zero, on the theory that it would otherwise
   arrive failing. Those violations were all in admin; the public surfaces were already at
   zero. Scoping the gate to them turned it on two blocks early and it immediately caught
   a crash. Ask what is *already* clean and fence it, rather than waiting.
6. **Prefer one written-down decision to many repeated ones.** The colour migration was
   scoped at five days of surface-by-surface PRs and took an afternoon, because the work
   was a vocabulary, not a sequence of judgements. Before grinding through a long list, ask
   whether the list is actually short and repeated. **But hold the line on what a table may
   decide:** the same codemod, run without that discipline, quietly rewrote four doc
   comments, flattened a gradient to pure black, and leaked a brand ground onto the wrong
   half of a ternary — all three found by reading its output, none by a test. Mechanise the
   repetition; keep the judgement.
