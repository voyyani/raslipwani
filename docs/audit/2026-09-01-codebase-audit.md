# Raslipwani Properties — Codebase Audit

**Date:** 2026-09-01
**Commit audited:** `c1c8656`
**Scope:** Full application — client (public) surface, admin CRM, data layer, build & deploy config
**Method:** Static read of all 96 source files, plus executed `npm install`, `npx eslint .`, `npx vitest run`, `npm run build`, and bundle inspection of `dist/`.

Every claim below is backed by a file path, a command output, or a line number. Where I could not verify something from the repository alone (live database state, deployed environment variables), I say so explicitly.

---

## 1. Executive Summary

Raslipwani Properties is a React 18 + Vite SPA for a Kenyan real-estate agency. It serves a public marketing/listings site and a password-protected admin CRM (properties, bookings, clients, settings) from a single bundle. Auth is Clerk; data is Supabase Postgres; deploy is Vercel.

The product surface is genuinely ambitious — it has a working booking flow, a client CRM with communication timelines, a settings system that drives site branding at runtime, and a differentiated international/diaspora offering. That ambition is real value.

The engineering underneath it is not yet load-bearing. Three problems are severe enough that I would not describe the application as production-safe today:

1. **A Supabase `service_role` key is read from a `VITE_`-prefixed environment variable** (`src/utils/supabaseClient.js:5`). Vite inlines every `VITE_*` variable into the client bundle as plain text. If that variable is set in the Vercel production environment, the key is publicly downloadable and grants full, RLS-bypassing read/write/delete on the entire database.
2. **Row Level Security is effectively off.** Every policy in `supabase/migrations/` is `USING (true)` / `WITH CHECK (true)`. The `admin_settings` table is explicitly world-writable (`006_fix_admin_settings_rls.sql`). There is no rule anywhere that restricts a row to a user.
3. **Clerk and Supabase are not connected.** Clerk issues the session; Supabase never sees it. The browser client is always the `anon` role. The codebase contains three different, mutually inconsistent workarounds for this one gap, and each one weakens security further.

Below those, the picture is: **zero tests actually execute**, **77 lint errors**, **~2,000 lines of unreachable code**, **two of six primary navigation links 404**, **the booking-notification email can never fire**, and **every public visitor downloads the admin CRM**.

None of this is unusual for a product built fast under delivery pressure. All of it is fixable, and the order in which you fix it matters a lot. Section 9 and the companion `ROADMAP.md` set that order.

### Scorecard

| Dimension | Rating | One-line justification |
|---|---|---|
| Security | 🔴 **2/10** | Service key exposed to browser; RLS is `USING (true)` everywhere; PII tables unprotected. |
| Data layer & auth architecture | 🔴 **3/10** | Clerk↔Supabase gap papered over three different ways; no server tier; no data-access layer. |
| Testing | 🔴 **1/10** | 3 test files exist; **0 tests run** — the suite crashes on a JSX-in-`.js` parse error. |
| Code quality / hygiene | 🟠 **4/10** | 77 lint errors, 64 `console.*` calls, 2,039 lines of dead code, 12 `alert()`/`confirm()` calls. |
| Architecture & structure | 🟠 **4/10** | No layout route, no error boundary, 16 components query Supabase directly, 800–1,300-line pages. |
| Performance | 🟠 **4/10** | ~958 kB raw / ~275 kB gzip JS on first paint; admin code and FontAwesome ship to public visitors. |
| Design system consistency | 🟠 **4/10** | 4 brand tokens defined; `bg-blue-*` used 165× vs `bg-primary` 116×; `primary-dark` used 19× and **is not defined**. |
| Accessibility | 🟡 **5/10** | Alt text is genuinely good (22/22). But zoom is disabled globally and native `alert()` breaks screen-reader flow. |
| UX correctness | 🟠 **4/10** | 2 of 6 nav links and both footer legal links lead to a 404. |
| SEO & content | 🟢 **7/10** | Helmet per page, JSON-LD schema, robots + sitemap present. Sitemap is stale and canonical domains disagree. |
| Build & deploy config | 🟠 **4/10** | Build succeeds, but `vercel.json` rewrites `/api/*` into the SPA and the API route is in a path Vercel ignores. |

**Overall: 3.8 / 10 — functional prototype, not yet a production system.**

---

## 2. What the Application Is

### 2.1 Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | React (SPA, no SSR) | 18.3.1 |
| Build | Vite | 6.4.3 |
| Routing | react-router-dom | 6.30.1 |
| Styling | Tailwind CSS | 3.4.17 |
| Auth | Clerk (`@clerk/clerk-react`) | 5.32.0 |
| Data | Supabase JS | 2.50.0 |
| Server state | TanStack Query | 5.90.19 |
| Forms | react-hook-form + zod | 7.71.1 / 4.3.5 |
| Motion | framer-motion | 12.43.0 |
| Calendar | FullCalendar + react-calendar | 6.1.20 / 6.0.0 |
| Rich text | react-quill | 2.0.0 |
| Deploy | Vercel | — |

There is **no TypeScript** — 0 `.ts`/`.tsx` files. `prop-types` is a declared dependency but appears in only 3 of 96 files, so the codebase has essentially no type or shape checking of any kind.

### 2.2 Size

```
96 source files under src/
23,587 lines of .js / .jsx / .css
```

Largest files:

| File | Lines |
|---|---|
| `src/pages/admin/AdminProperties.jsx` | 1,297 |
| `src/pages/ServicesMain.jsx` | 829 |
| `src/pages/admin/AdminBookings.jsx` | 824 |
| `src/pages/Services.jsx` | 800 *(unreachable)* |
| `src/components/services/ViewingExperience.jsx` | 800 |
| `src/pages/PropertyDetail.jsx` | 766 |
| `src/pages/Properties.jsx` | 758 |
| `src/pages/International.jsx` | 724 |
| `src/pages/Contact.jsx` | 716 |

Nine files exceed 700 lines. A 1,297-line page component holds data fetching, filtering, pagination, form state, modal state, CSV export, and markup in one scope — it cannot be reviewed, tested, or safely modified as a unit.

### 2.3 Routes

Defined in `src/App.jsx:171-223`:

**Public:** `/` · `/properties` · `/properties/:id` · `/international` · `/services` · `/services/viewing` · `/about` · `/contact` · `/property/:id` · `/maintenance`
**Redirects:** `/listings` → `/properties` · `/contact-us` → `/contact`
**Admin (Clerk-protected):** `/admin` · `/admin/properties` · `/admin/viewings` · `/admin/bookings` · `/admin/clients` · `/admin/clients/:id` · `/admin/settings`

### 2.4 Data model

From `supabase/migrations/`:

- `clients` — 28 columns, 6 indexes. Holds names, emails, phones, budgets, tags, preferences. **This is PII.**
- `client_property_interests` — join table, interest level + notes
- `client_communications` — call/email/meeting/viewing/note timeline
- `bookings` — enhanced with admin fields in `002`/`003`
- `booking_notes` — created in `003_enhance_bookings_admin.sql`
- `admin_settings` — single-row settings table driving runtime branding
- `email_templates` — created in `004`

`properties` and `bookings` have **no creation migration in the repository**. They predate the migration folder and their live schema and RLS state are unknown from the repo alone. **This is itself a finding** — see §4.6.

---

## 3. Verified Command Output

These are the actual results, reproduced fresh at audit time.

### 3.1 Tests — the suite does not run

```
$ npx vitest run

Cannot parse /home/kkk/projects/raslipwani/src/test/setup.js: Expression expected.
 ❯ src/pages/admin/__tests__/AdminBookings.test.jsx (0 test)
 ❯ src/components/__tests__/BookingStatusBadge.test.jsx (0 test)
 ❯ src/pages/admin/__tests__/Settings.test.jsx (0 test)

Error: Failed to parse source for import analysis because the content contains
invalid JS syntax. If you are using JSX, make sure to name the file with the
.jsx or .tsx extension.
  File: /home/kkk/projects/raslipwani/src/test/setup.js:52:60
  52 |    Link: ({ children, to }) => <a href={to}>{children}</a>
     |                                                         ^

 Test Files  3 failed (3)
      Tests  no tests
```

`src/test/setup.js` contains JSX but carries a `.js` extension, so esbuild refuses to transform it. Because it is the global `setupFiles` entry, **every** test file fails to load. The project reports having tests; it has **zero executing tests** across 23,587 lines.

The fix is a one-line rename (`setup.js` → `setup.jsx`, plus the reference in `vitest.config.js`). The significance is not the fix — it is that this went unnoticed, which means the suite has never been part of anyone's loop.

### 3.2 Lint — 77 errors

```
$ npx eslint .
✖ 83 problems (77 errors, 6 warnings)
```

Representative:

- `src/pages/api/send-email.js:44` — `'require' is not defined` (CommonJS `require` inside an ESM file — this would throw at runtime)
- `tailwind.config.js:1` — `'module' is not defined`
- `vitest.config.js:33` — `'__dirname' is not defined`
- `src/pages/admin/AdminProperties.jsx` — 9 unused-variable errors including `error`, `success`, `setSuccess`, `isMobile`, `totalPages` — dead state that was wired up and abandoned
- `motion` imported but unused in 5 admin files

A lint run that fails means lint is not in CI, which means nothing mechanical guards the codebase.

### 3.3 Build — succeeds, but ships too much

```
$ npm run build
✓ 2856 modules transformed. built in 13.86s

dist/assets/index-BCngLnEa.js        379.41 kB │ gzip: 106.34 kB
dist/assets/vendor-supabase.js       219.90 kB │ gzip:  57.36 kB
dist/assets/vendor-react.js          154.10 kB │ gzip:  50.12 kB
dist/assets/vendor-ui.js             129.87 kB │ gzip:  42.81 kB
dist/assets/vendor-clerk.js           72.32 kB │ gzip:  17.45 kB
dist/assets/index.css                174.85 kB │ gzip:  39.71 kB
dist/assets/fa-solid-900.woff2       158.22 kB
dist/assets/fa-brands-400.woff2      118.68 kB
dist/assets/fa-solid-900.ttf         426.11 kB
dist/assets/fa-brands-400.ttf        210.79 kB
```

All five vendor chunks are eagerly imported by `App.jsx`, so a first-time visitor to the **homepage** downloads:

```
JS:  ~958 kB raw  /  ~275 kB gzip
CSS: ~175 kB raw  /  ~40 kB gzip
```

before any page-specific chunk. On the 3G/mid-range-Android conditions common in the Kenyan market this product serves, that is a multi-second delay to first meaningful paint.

---

## 4. Findings

Severity: 🔴 Critical (exploitable or actively broken) · 🟠 High · 🟡 Medium · 🔵 Low

---

### 🔴 C-1 — Supabase `service_role` key is exposed to the browser

**File:** `src/utils/supabaseClient.js:5-18`

```js
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

// Admin client (bypasses RLS - for authenticated admin operations)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { ... })
  : supabase;
```

Vite substitutes every `import.meta.env.VITE_*` reference with a **string literal at build time**. There is no runtime lookup and no server boundary. If `VITE_SUPABASE_SERVICE_KEY` is set in the Vercel production environment, the `service_role` JWT is sitting in a JS file on the CDN, readable by anyone who opens DevTools or runs `curl | grep eyJ`.

The `service_role` key bypasses RLS entirely. An attacker holding it can read every client record, dump every booking, alter prices, or drop rows.

It is used in exactly one place — `src/pages/admin/AdminProperties.jsx:441`, one property-insert call — so the blast radius of the *fix* is small even though the blast radius of the *bug* is total.

**I could not verify whether the variable is actually set in production** — there is no `.env` file in the repo (correctly gitignored). **Please check the Vercel dashboard immediately.** If it is set: rotate the key first, then remove the variable, then fix the code. Rotation must come first, because the old key is already public in every previously deployed bundle.

**Aggravating detail:** the fallback is silent. If the key is absent, `supabaseAdmin` becomes the anon client, and the property-insert at line 441 fails against RLS with no distinct error path. The system is designed so that the insecure configuration is the one that works.

---

### 🔴 C-2 — Row Level Security is disabled in practice

**Files:** all of `supabase/migrations/`

Every single policy in the repository grants unconditional access:

```sql
-- 001_create_clients_tables.sql:148  (clients table — PII)
CREATE POLICY "Allow authenticated users to view clients"
  ON clients FOR SELECT TO authenticated USING (true);

-- 006_fix_admin_settings_rls.sql:18  (no TO clause = includes anon)
CREATE POLICY "Allow public to read settings"  ON admin_settings FOR SELECT USING (true);
CREATE POLICY "Allow insert settings"          ON admin_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update settings"          ON admin_settings FOR UPDATE USING (true) WITH CHECK (true);
```

`USING (true)` means "every row, always." RLS is enabled but expresses no rule. The migrations acknowledge this in their own comments:

> `-- TODO: Implement role-based policies later` (001:146)
> `-- USING (true); -- In production, add proper admin role check` (004:32)
> `-- Note: In production, you should integrate Clerk JWT with Supabase` (006:33)

`admin_settings` is the worst case: policy `006` has **no `TO` clause**, which in Postgres defaults to `PUBLIC` — including the `anon` role. Since the anon key is necessarily public in any SPA, **anyone on the internet can rewrite your site's business name, logo, phone number, email, WhatsApp number, social links, and maintenance mode.** Those values are rendered site-wide via `SettingsContext` (`src/contexts/SettingsContext.jsx`). This is a live defacement and phone-number-hijack vector — swap the contact number and inbound leads route to the attacker.

---

### 🔴 C-3 — Clerk and Supabase share no trust boundary

**Files:** `src/App.jsx:150` (ClerkProvider), all 16 files importing `supabaseClient`

Clerk authenticates the admin. Supabase authorizes the data. Nothing carries the identity from one to the other. No Clerk JWT template is configured, no `accessToken` callback is passed to `createClient`, no `setSession` call exists anywhere in `src/`.

The consequence: the browser's Supabase client operates as the **`anon`** role on every request, including from inside the admin panel. Policies scoped `TO authenticated` therefore never match admin traffic.

The codebase contains three incompatible workarounds for this single gap, and the comments show the team hitting the wall three separate times:

| Workaround | Location | Comment in code |
|---|---|---|
| Ship the service key to the browser | `supabaseClient.js:12` | `"Only use this in admin pages after Clerk authentication"` |
| Open the policy to `anon` | `006_fix_admin_settings_rls.sql` | `"Clerk auth is not integrated with Supabase RLS"` |
| Use `supabaseAdmin` for one call | `AdminProperties.jsx:440` | `"Use supabaseAdmin to bypass RLS (Clerk auth not recognized by Supabase)"` |

Only `AdminProperties` uses the admin client. `ClientManagement`, `AdminBookings`, `Dashboard`, `ClientDetail`, and `BookingDetailModal` all use the plain anon client against tables whose policies are `TO authenticated`. Those queries should return empty sets or RLS errors. That they apparently work in production implies **RLS is disabled outright on the live `clients`/`bookings` tables**, diverging from the migrations — see C-4.

**This is the root cause.** C-1 and C-2 are symptoms. Fixing the Clerk↔Supabase bridge is what makes the other two fixable rather than just relocatable.

---

### 🔴 C-4 — Migrations are not a reliable record of the live schema

**Files:** `supabase/migrations/003_*.sql`, `004_create_admin_settings.sql`

**4a. Invalid SQL.** Migrations `003_enhance_bookings_admin.sql` (lines 53, 57, 61, 65) and `004_create_admin_settings.sql` (lines 30, 34, 38, 63, 67, 71, 75) use:

```sql
CREATE POLICY IF NOT EXISTS "Admin can view all settings" ...
```

**PostgreSQL does not support `IF NOT EXISTS` on `CREATE POLICY`** — in any version through 17. These statements are syntax errors. Both migrations abort at the first policy statement. Migration `002` gets this right, wrapping the same intent in a `DO $$ ... IF NOT EXISTS (SELECT 1 FROM pg_policies ...)` block (002:138-151), which proves the correct pattern was known and then not applied.

That `006_fix_admin_settings_rls.sql` exists at all — hand-fixing `admin_settings` RLS — is direct evidence that `004` failed to apply.

**4b. Duplicate version numbers.** Two files claim `003`:
```
003_create_admin_settings_table.sql
003_enhance_bookings_admin.sql
```
Ordering between them is undefined. And `003_create_admin_settings_table.sql` and `004_create_admin_settings.sql` both create the same table.

**4c. Missing foundational tables.** There is **no migration creating `properties` or `bookings`** — the two tables the entire product runs on. Their live schema, indexes, constraints, and RLS state exist only in the production database.

Net effect: you cannot rebuild this database from the repository, you cannot stand up a staging environment that matches production, and you cannot reason about live security posture from the code. That last point is why C-2's severity is uncertain-but-assume-worst.

---

### 🔴 C-5 — Booking notification emails can never be sent

Three independent breakages stack on the same feature:

**5a. The only caller is unreachable code.** `fetch('/api/send-email')` appears exactly once, at `src/pages/Services.jsx:198`. But `App.jsx:39` routes `/services` to a *different* file:
```js
const Services = lazy(() => import('./pages/ServicesMain')); // Updated path
```
`src/pages/Services.jsx` (800 lines) is never imported by anything. The live page, `ServicesMain.jsx`, inserts the booking at line 137 and **never calls the email endpoint**.

**5b. The endpoint is not deployed.** The handler sits at `src/pages/api/send-email.js`. Vercel serves serverless functions from a **root-level `/api` directory**. `vercel.json` declares `"framework": "vite"` with `"outputDirectory": "dist"`. Nothing under `src/` becomes a function. The route does not exist in production.

**5c. `vercel.json` would swallow it anyway.**
```json
"rewrites": [ { "source": "/(.*)", "destination": "/" } ]
```
This catch-all rewrites *every* path — including `/api/*` — to the SPA shell. Even a correctly placed function would be unreachable. The rewrite needs a negative lookahead: `"/((?!api/).*)"`.

**5d. The handler is a non-functional stub even so.**
```js
const transporter = {
  host: "sandbox.smtp.mailtrap.io",   // sandbox — never delivers to real inboxes
  auth: { user: "your-mailtrap-user", pass: "your-mailtrap-pass" }  // placeholders
};
const nodemailer = require('nodemailer');  // CommonJS require in an ESM file
```
`nodemailer` is **not in `package.json`**. ESLint flags the `require` (`'require' is not defined`, send-email.js:44).

**Business impact:** a prospective client books a viewing, sees a success message, and no one is notified. Bookings land in the database and are discovered only when an admin happens to open the dashboard. For a business whose entire funnel is inbound viewing requests, this is the highest-value defect in the report after the security items — it is silently losing revenue.

---

### 🟠 H-1 — Two of six navigation links lead to a 404

**File:** `src/components/Header.jsx:30-59` vs `src/App.jsx:171-223`

| Nav label | `Header.jsx` links to | Route exists? |
|---|---|---|
| Home | `/` | ✅ |
| Listings | `/properties` | ✅ |
| Services | `/services` | ✅ |
| **International** | `/internationalproperties` | ❌ — the route is `/international` |
| About | `/about` | ✅ |
| **Construction** | `/construction-support` | ❌ — no such route |

Both footer legal links also 404: `Footer.jsx:209` → `/privacy`, `Footer.jsx:212` → `/terms`. Neither route exists.

So **4 of the site's persistent, every-page links are broken.** "International" is the differentiated, highest-value offering in the product (diaspora investors, UN/embassy housing) and it is unreachable from the navigation. `Home.jsx`'s own JSON-LD and the sitemap don't list it either — it is effectively invisible.

For a marketing site this is not a polish issue; it is a funnel that dead-ends.

---

### 🟠 H-2 — ~2,039 lines of unreachable code

Verified by checking whether any file imports these modules:

| File | Lines | Imported by |
|---|---|---|
| `src/pages/Services.jsx` | 800 | nothing |
| `src/pages/UNHousing.jsx` | 474 | nothing |
| `src/pages/InternationalHub.jsx` | 425 | nothing |
| `src/pages/DiasporaPortal.jsx` | 340 | nothing |
| **Total** | **2,039** | |

That is **8.6% of the codebase** that cannot execute. Three of the four are the UN-housing / diaspora feature set that `src/Docs/UN-OPPORTUNITY-IMPLEMENTATION.md` describes as a strategic priority — built, then orphaned by a routing change.

The cost is not disk space. It is that `Services.jsx` and `ServicesMain.jsx` are near-duplicates that a maintainer will edit the wrong one of. It has already happened: the email integration lives in the dead copy (C-5a).

**Decide per file: route it or delete it.** Git preserves the history either way.

---

### 🟠 H-3 — Every public visitor downloads the admin CRM

**File:** `src/App.jsx:49-57`

Public pages are correctly lazy-loaded:
```js
const Home = lazy(() => import('./pages/Home'));
const Properties = lazy(() => import('./pages/Properties'));
```

Admin pages are **statically imported**:
```js
import Dashboard from './pages/admin/Dashboard';
import AdminProperties from './pages/admin/AdminProperties';
import Bookings from './features/bookings/Bookings';
import AdminBookings from './pages/admin/AdminBookings';
import ClientManagement from './pages/admin/ClientManagement';
import ClientDetail from './pages/admin/ClientDetail';
import Settings from './pages/admin/Settings';
```

`AdminLayout` is also imported eagerly at line 17. All of it lands in the 379 kB main chunk. I confirmed `papaparse` (CSV export — admin-only) is present in `dist/assets/index-*.js`.

Two costs:

1. **Performance.** The main chunk is 379 kB / 106 kB gzip, and a large share of it is functionality no anonymous visitor can use.
2. **Information disclosure.** Minified admin source is publicly readable: table names, column names, query shapes, the settings schema, the client CRM data model. It hands an attacker a map of the database — which, combined with C-2, is a map to unprotected data.

Converting these seven imports to `lazy()` is a contained change with a large payoff.

---

### 🟠 H-4 — FontAwesome ships ~914 kB of fonts for a handful of icons

**File:** `src/main.jsx:6`
```js
import '@fortawesome/fontawesome-free/css/all.min.css';
```

This pulls the entire icon library's CSS (the dominant contributor to the 174.85 kB CSS bundle) and emits every font file:

```
fa-solid-900.ttf     426.11 kB
fa-brands-400.ttf    210.79 kB
fa-solid-900.woff2   158.22 kB
fa-brands-400.woff2  118.68 kB
```

Actual usage: **one file** references FontAwesome — `src/pages/Home.jsx`, for four service icons (`fas fa-home`, `fa-search-dollar`, `fa-chart-line`, `fa-tasks`).

Meanwhile the project already depends on **two other icon libraries**: `react-icons` (30 files) and `lucide-react` (12 files). Three icon systems for one product.

Dropping FontAwesome and re-drawing those four icons in `lucide-react` removes ~914 kB of fonts and most of the CSS bundle. This is the single cheapest large performance win available.

---

### 🟠 H-5 — No error boundary anywhere

```
$ grep -rn 'ErrorBoundary\|componentDidCatch' src/
(no matches)
```

Any render-time exception in any component unmounts the entire React tree and leaves the user staring at a blank white page. No message, no recovery, no reporting.

The exposure is concrete. `SettingsContext` merges remote data into UI state, and — because of C-2 — that remote data is **publicly writable**. A malformed value written to `admin_settings` propagates into every page's render path with nothing to catch it.

Needed: a root boundary with a branded fallback, plus a per-route boundary so one broken page does not take down navigation.

---

### 🟠 H-6 — Data access is scattered across 16 components

Sixteen component files import `supabaseClient` and build queries inline. `.from('bookings')` alone appears in **18 places** across 9 files.

There is no repository, no service layer, no shared query-key convention, no single place where a field name is defined. `Dashboard.jsx` builds five separate `bookings` queries (lines 75, 76, 80, 110) in one component.

Consequences:
- A schema change requires finding and editing 18 call sites correctly.
- Query keys are ad-hoc, so cache invalidation is unreliable — `Home.jsx` sets `staleTime: 60_000` locally while the global default is `5 * 60 * 1000` (`App.jsx:28`).
- Nothing is unit-testable without mocking Supabase at every call site — which is exactly why the test suite never grew.
- TanStack Query is installed and used in 16 files, but raw `useEffect` + `supabase` fetching persists alongside it. Two paradigms, inconsistently applied.

---

### 🟠 H-7 — The design system exists but is bypassed

**File:** `tailwind.config.js`

Four brand tokens are defined:
```js
primary: '#0D4B6E', secondary: '#1A7CA5', accent: '#FFC107',
light: '#F5F9FC',   dark: '#0A2E46',
```

Actual usage across `.jsx`:

| Class family | Occurrences |
|---|---|
| `bg-gray-*` | 291 |
| **`bg-blue-*`** | **165** |
| `bg-primary` | 116 |
| `bg-green-*` | 68 |
| `bg-red-*` | 53 |
| `bg-yellow-*` | 46 |
| **`bg-secondary`** | **2** |
| `bg-purple/amber/orange/indigo` | 11 |

Raw Tailwind blue is used **more often than the brand's own primary color.** `secondary` is used twice in 96 files. `accent` — the brand gold — is used zero times as a background.

**And `primary-dark` is used 19 times but is not defined in `tailwind.config.js`.** Tailwind emits no class for it, so every one of those 19 hover states is silently inert. These are on primary CTAs — `Home.jsx:158` (`hover:bg-primary-dark` on "Browse Properties"), `App.jsx:227` (the 404 return button), and 17 more. **Your main call-to-action buttons have no hover feedback.**

There is also no semantic layer at all: no `success`/`warning`/`danger`/`info` tokens, so status colors are hand-picked per component. `BookingStatusBadge`, `MobileBookingCard`, and `AdminBookings` each independently decide what "confirmed" looks like.

Additional friction in `src/index.css`:
- **Line 2** imports **Poppins**; **`index.html:15`** preloads **Inter**. The preload is for a font the site never uses — a wasted request on the critical path, and Poppins is *not* preloaded, so it blocks late.
- **Lines 62-74** set a global `button { background-color: #1a1a1a; border-radius: 8px; padding: 0.6em 1.2em; }` — leftover Vite scaffolding that every Tailwind button must override.
- **Lines 78-88** contain a `prefers-color-scheme: dark` block that flips `:root` to a dark background. The app has **no dark mode**; on a device set to dark, this can leak dark backgrounds behind light Tailwind components.
- **Lines 118-127** hide elements by `aria-label` with `!important`, commented as a "defensive UI fix" for stray markup. That is a symptom being suppressed rather than a cause being removed.

---

### 🟡 M-1 — Native `alert()` and `confirm()` in 12 places

Despite `react-hot-toast` being installed and used in 15 files:

```
src/pages/ServicesMain.jsx:154        alert("Thank you for your booking! ...")
src/pages/ServicesMain.jsx:172        alert('Failed to submit booking. ...')
src/components/PropertyModal.jsx:122  alert('Phone number copied to clipboard!')
src/pages/admin/AdminProperties.jsx:413   window.confirm('Are you sure you want to delete this property?')
src/pages/admin/AdminBookings.jsx:289     window.confirm(`Reschedule booking to ...`)
src/pages/admin/BookingDetailModal.jsx:522 window.confirm('Delete this note?')
src/components/PropertyInterests.jsx:395  confirm('Remove this property interest?')
src/components/CommunicationTimeline.jsx:328 confirm('Delete this communication?')
src/components/services/ViewingExperience.jsx:208, 224   alert(...)
```

`ServicesMain.jsx:154` is the **live booking confirmation** — the single most important moment in the customer journey, delivered as an unstyled browser dialog. `alert()` blocks the main thread, cannot be branded, is suppressible by browsers, and reads poorly to screen readers.

Destructive `confirm()` calls are worse than cosmetic: a raw yes/no dialog for "delete this property" gives no undo and no context about what is being destroyed.

---

### 🟡 M-2 — Pinch-zoom is disabled site-wide

**File:** `index.html:6`
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0,
      maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

`maximum-scale=1.0` + `user-scalable=no` prevents users from zooming. This is a direct **WCAG 2.1 SC 1.4.4 (Resize Text, Level AA)** failure and disproportionately affects low-vision users — a meaningful share of any audience browsing property photos and price figures.

Modern iOS ignores it, but Android honors it. Remove both attributes; keep `viewport-fit=cover`.

Broader a11y picture (to be fair — some of it is good):
- ✅ **Alt text: 22 of 22 images have it.** Verified with a multiline-aware parse. Genuinely well done.
- ✅ 239 `focus:ring` / `focus-visible` declarations — focus styling is broadly present.
- ✅ Only 1 `onClick` on a non-interactive `<div>`.
- ⚠️ 27 `aria-*` attributes and **1** `role=` across 96 files — thin for an app with modals, dropdowns, tabs, and a calendar. Modal focus-trapping and `aria-modal` need a dedicated pass.
- ⚠️ 98 `<input>` vs 145 `<label>` — plausible, but explicit `htmlFor`/`id` pairing was not verified per-field.

---

### 🟡 M-3 — 64 `console.*` calls ship to production

Across 17 files. `vite.config.js:26` explicitly notes that console-stripping was dropped:

> `// Note: Removed 'terser' to avoid optional dependency in Vercel builds`

`SettingsContext.jsx` is the worst offender, logging full settings payloads on every fetch:
```js
console.log('[SettingsContext] Raw data from DB:', data);
console.log('[SettingsContext] Merged settings:', mergedSettings);
```

This leaks internal schema to anyone with a console open and adds noise that hides real errors. Also: `src/components/admin/DebugPanel.jsx` (196 lines) is gated on `import.meta.env.DEV` at `AdminLayout.jsx:327` — correctly excluded from production, worth noting as a thing done right.

Replace with a `logger` utility that no-ops outside development, or re-enable `esbuild`'s `drop: ['console', 'debugger']` (which needs no extra dependency, contrary to the comment).

---

### 🟡 M-4 — Header, Footer, and Helmet are duplicated in 11 pages

Eleven page components each render `<Header />` and `<Footer />` themselves. `App.jsx` has **no layout route** — even the inline 404 handler (`App.jsx:220-231`) re-renders both by hand.

Consequences:
- On every client-side navigation, Header and Footer unmount and remount. Scroll listeners in `Header.jsx:18-23` are torn down and re-attached each time; the sticky header's `isScrolled` state resets; any mobile menu state is lost.
- A change to the shell requires touching 11+ files.
- Each page independently constructs `<Helmet>` blocks with hand-written meta — despite `DynamicSEO.jsx` existing for exactly this purpose.

A `<PublicLayout>` route element with `<Outlet />` fixes all of it and removes duplication from every page at once.

---

### 🟡 M-5 — Canonical URL and sitemap disagree with each other

- `Home.jsx:66` canonical → `https://www.raslipwani.co.ke`
- `Home.jsx` JSON-LD `@id` / `url` → `https://www.raslipwani.**com**`
- `Home.jsx` JSON-LD `image` → `https://raslipwani.com/logo.png`
- `public/robots.txt` sitemap → `https://www.raslipwani.co.ke/sitemap.xml`

Three different domains in one file's head. Search engines will split ranking signals or ignore the structured data.

`public/sitemap.xml` lists 5 URLs and omits `/international`, `/services/viewing`, and every `/properties/:id` detail page — i.e. all the listing pages that should actually rank. It is static, so new properties are never discoverable via sitemap.

Also: the JSON-LD `geo` coordinates are `-1.2921, 36.8219` — that is **Nairobi city centre**, while the `address` in the same block is **Kikambala Road, Kilifi, 80108**. The coordinates and the address describe places ~500 km apart, which will confuse local-business indexing.

`DynamicSEO.jsx` exists (80 lines) but pages still hand-roll Helmet blocks alongside it.

---

### 🔵 L-1 — Unused dependency: `@headlessui/react`

```
$ grep -rn 'headlessui' src/
(no matches)
```

Declared in `package.json` and named in `vite.config.js` `manualChunks.vendor-ui`. Zero imports. Remove it.

Also worth a look: `react-calendar` is used in 1 file while FullCalendar is used in another — two calendar libraries for one product, mirroring the three-icon-library situation (H-4).

### 🔵 L-2 — `react-quill` 2.0.0 is unmaintained

`src/pages/admin/settings/EmailSettings.jsx:5`. The package has not shipped since 2023, declares React 16/17 peer deps, and relies on `findDOMNode` — removed in React 19. This blocks the React 19 upgrade path. Migrate to `quill` 2 directly (already a dependency) or `tiptap`.

### 🔵 L-3 — `src/Docs/` holds 15 status documents inside the source tree

`PHASE1-SUMMARY.md`, `sessionplan.md`, `week2-3-implementation.md`, `datalog.md`, etc. sit under `src/`, alongside root-level `SUMMARY.md`, `NEXT_STEPS.md`, `PERFORMANCE_OPTIMIZATION.md`. Point-in-time status notes go stale and contradict each other. Move durable ones to `docs/`, archive the rest.

### 🔵 L-4 — Maintenance mode requires a redeploy

`App.jsx:63-78` reads `VITE_MAINTENANCE_MODE` from the build-time environment, so toggling maintenance requires a full rebuild and redeploy. Meanwhile `SettingsContext` already has a `maintenance_mode` field backed by the database (`SettingsContext.jsx:49`) that could flip it instantly. Two mechanisms, and the build-time one wins.

---

## 5. What Is Done Well

An audit that only lists problems is not an accurate picture. These are real strengths worth preserving through any refactor:

- **Alt text is complete** — 22 of 22 images. Verified, not assumed. Rare.
- **Focus styling is broadly present** — 239 `focus:ring`/`focus-visible` declarations.
- **Public-route code splitting is correct** — all public pages use `lazy()` with a `Suspense` fallback.
- **TanStack Query is properly configured** with sensible global defaults (`App.jsx:26-33`).
- **The settings system is a genuinely good idea** — runtime-configurable branding, contact details, business hours, and locale, with a well-structured `DEFAULT_SETTINGS` fallback so the site renders correctly even if the fetch fails.
- **`DebugPanel` is correctly dev-gated** (`AdminLayout.jsx:327`).
- **`useDebounce`** is used for admin search — the right call, applied deliberately.
- **Vendor chunking is thoughtfully hand-configured** in `vite.config.js`.
- **SEO fundamentals are in place** — per-page Helmet, JSON-LD `RealEstateAgent` schema, `robots.txt`, `sitemap.xml`, responsive `<picture>` with `fetchpriority="high"` on the hero.
- **Responsive images** use Cloudinary `f_auto,q_auto` with per-breakpoint `srcSet` (`Home.jsx:118-137`) — correct technique.
- **Loading and empty states exist** on the featured-properties section, including skeletons.
- **Zod + react-hook-form** in `ClientForm.jsx` shows the team knows the right validation pattern — it just was not applied consistently.
- **The mobile work is real** — `admin-mobile.css`, `MobileBookingCard`, `MobilePropertyCard`, `AdminBottomNav` represent deliberate mobile-first thinking for the admin surface.

The instincts here are good. The gap is consistency and verification, not capability.

---

## 6. Risk Register

| ID | Risk | Likelihood | Impact | Exposure |
|---|---|---|---|---|
| C-1 | Service key in bundle → full DB compromise | **CONFIRMED LIVE** | Catastrophic | 🔴 |
| C-2 | `admin_settings` anon-writable → site defacement, contact hijack | **High** | Severe | 🔴 |
| C-2 | Client PII table readable if RLS off in prod | Medium | Severe (data-protection exposure) | 🔴 |
| C-5 | Booking emails never fire → silent lead loss | **Certain** | High (direct revenue) | 🔴 |
| C-4 | Cannot rebuild DB from repo; no safe staging | Certain | High | 🔴 |
| H-1 | 4 persistent nav links 404 | **Certain** | High (funnel + SEO) | 🟠 |
| H-5 | Any render error → white screen | Medium | High | 🟠 |
| 3.1 | Zero tests execute → no regression safety | **Certain** | High | 🟠 |
| H-3 | ~275 kB gzip JS first paint on mobile networks | Certain | Medium | 🟠 |

---

## 7. Recommended Order of Work

The sequence matters more than the list. Three principles drive it:

1. **Stop the bleeding before improving anything.** C-1 and C-2 are live exposures.
2. **Build the safety net before restructuring.** Refactoring 23,000 lines with zero executing tests is how you ship regressions. Fixing the test suite is a one-line rename that unlocks everything after it.
3. **Fix the root cause, not the symptom.** C-3 (the Clerk↔Supabase gap) is what makes C-1 and C-2 *seem* necessary. Bridge it and the workarounds become deletable rather than relocatable.

Full phase breakdown, sequencing, and acceptance criteria are in **[`ROADMAP.md`](../../ROADMAP.md)**.

Immediate, before anything else:

1. ~~Check the Vercel dashboard for `VITE_SUPABASE_SERVICE_KEY`.~~ **CONFIRMED SET.** Rotate the Supabase `service_role` key **now**, then delete the variable, then redeploy. Rotate *first* — the old key is already public in every deployed bundle, and removing the variable does not invalidate it. Then review Supabase API logs for unauthorised access.
2. **Lock down `admin_settings` writes** — drop the anon INSERT/UPDATE policies from `006`. Reads can stay public; writes must not be.
3. **Rename `src/test/setup.js` → `setup.jsx`** and update `vitest.config.js`. One line; turns a dead suite into a live one.
4. **Fix the four broken nav links** in `Header.jsx` and `Footer.jsx`. Under an hour; restores the funnel.

---

## 8. Open Questions — **ANSWERED 2026-09-01**

> **Update:** the project owner answered these on the audit date. Answers are recorded inline below. The two consequential ones:
>
> - **Q1 is confirmed positive — `VITE_SUPABASE_SERVICE_KEY` IS set in Vercel production.** Finding C-1 is therefore not a latent bug but a **live credential disclosure**. The `service_role` key has been publicly downloadable from the CDN in every deploy that included it. Rotate before removing; deleting the Vercel variable does not invalidate keys already present in previously served bundles. See `ROADMAP.md` Phase 0.
> - **Q2: RLS is ON.** This does *not* reduce C-2's severity. Every policy in the repository is `USING (true)`, and RLS enabled with `USING (true)` is functionally identical to RLS disabled. The `admin_settings` policies in `006` additionally carry no `TO` clause, defaulting to `PUBLIC` (including `anon`). Live introspection is still required to confirm the state of `properties` and `bookings`, which have no migration in the repo.

Original questions and their answers:

1. **Is `VITE_SUPABASE_SERVICE_KEY` set in Vercel production?**
   ✅ **YES — CONFIRMED.** C-1 is a live credential disclosure. Rotate the `service_role` key, then remove the variable, then redeploy. Review Supabase API logs for unauthorised `service_role` activity. If `clients` exfiltration is evident, this is a personal-data breach under the Kenyan Data Protection Act 2019 (72-hour ODPC notification) — a legal question, not an engineering one. → **Roadmap Phase 0.1, 0.2**

2. **RLS state of live `properties` and `bookings`?**
   ⚠️ **RLS is ON** — but every policy is `USING (true)`, which enforces nothing. Live introspection still required for these two tables, which have no migration in the repo. Owner has agreed to provide DB credentials via a gitignored `.env`. → **Roadmap Phase 0.3**

3. **Was the `clients` CRM exercised in production?**
   ⏳ **Pending introspection.** Its policies are `TO authenticated` while the app connects as `anon`, so its queries should fail. Resolved by the Phase 0.3 introspection. → **Roadmap Phase 1.3**

4. **Route or delete `UNHousing`, `DiasporaPortal`, `InternationalHub`?**
   ✅ **ROUTE THEM.** All three were planned upgrades, not abandoned experiments. This converts H-2 from a deletion into an information-architecture build. Note two complications found on closer inspection: (a) `International.jsx` (724 lines, routed) and `InternationalHub.jsx` (425 lines, orphaned) are **competing hub pages** covering the same three audiences and must be merged, not both routed; (b) `DiasporaPortal.jsx` is structurally a dashboard, not a landing page — no marketing sections, `h1` at line 90 — and needs a placement decision. **`Services.jsx` (800 lines) is still deleted** — it is a near-duplicate of the live `ServicesMain.jsx` and already caused C-5. → **Roadmap Phase 3.1**

5. **Canonical domain?**
   ✅ **`raslipwani.co.ke`.** 301 `.com` → `.co.ke` permanently. Correct all JSON-LD, canonical tags, `robots.txt`, and OG metadata. → **Roadmap Phase 7.1**

6. **Is `/construction-support` planned?**
   ✅ **Shelved — relaunched as Nairobuild** (`nairobuild.co.ke`), a separate business. Becomes an outbound cross-brand link rather than a route. Placement (primary nav vs. footer) is a positioning decision left to the owner. → **Roadmap Phase 1.5, 7.5**

7. **Dark mode?**
   ✅ **YES.** Tokens must therefore be **semantic** (`surface`, `content`, `border`) rather than literal (`bg-white`, `text-gray-800`) from the start — literal tokens cannot theme, and retrofitting means touching every component twice. The existing `prefers-color-scheme` block at `index.css:78-88` is removed: it flips bare `:root` with no token layer beneath it, so it leaks dark backgrounds behind light components. It is a hazard, not a foundation. → **Roadmap Phase 4.2, 4.3**

8. **Email provider?**
   ✅ **Resend** — the owner's standard across all projects. Requires domain verification (SPF/DKIM/DMARC) on `raslipwani.co.ke`, or transactional mail lands in spam. `RESEND_API_KEY` must be **server-side only, with no `VITE_` prefix** — the entire Phase 0 incident exists because of that prefix. → **Roadmap Phase 1.4**

---

*Audit performed against commit `c1c8656` on 2026-09-01. All findings verified by file inspection or executed command output. Line references are accurate as of that commit.*
