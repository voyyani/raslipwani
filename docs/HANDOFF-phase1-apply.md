# Phase 1 Handoff — Steps Only You Can Run

**Branch:** `feat/supabase-auth-migration`
**Date:** 2026-09-01
**Status:** code complete, database untouched

Every code change for Phase 1 is committed and tested. Nothing in this migration has
touched your database, your Supabase dashboard, or your Vercel settings — by design.
Your project holds 12 real bookings with customer PII, so applying RLS migrations and
rotating credentials are your decisions, not an agent's.

This file is the list of what remains. Work top to bottom.

---

## ⚠️ Order matters

`009` assumes the grant baseline `007` establishes. Applying `009` first leaves the
blanket `anon` grants in place, and the policies will not save you — **grants are
checked before RLS**.

```
BACKUP → 007 → 008 → 009 → create admin → disable signup → verify → deploy
```

---

## 1. Back up first

Supabase Dashboard → **Database → Backups**. Take one now.

`009` performs `ALTER COLUMN ... TYPE uuid USING NULL` on `bookings`. That was verified
safe on 2026-09-01 (all three identity columns were 100% NULL across all 12 rows), but
re-confirm before applying, because if it is no longer true the conversion destroys data:

```sql
SELECT count(assigned_agent_id) AS agents, count(confirmed_by) AS confirmers
FROM bookings;   -- expect 0, 0
```

If either is non-zero, **stop** and tell me — the migration needs a backfill first.

---

## 2. Apply the migrations

In the Supabase SQL editor, in this order:

| # | File | What it does |
|---|---|---|
| 1 | `supabase/migrations/007_emergency_lockdown.sql` | Revokes `anon`'s DELETE/TRUNCATE/UPDATE, enables RLS on the 4 unprotected tables |
| 2 | `supabase/migrations/008_admin_users.sql` | `admin_users` table + `is_admin()` |
| 3 | `supabase/migrations/009_auth_rls_policies.sql` | Real policies on `auth.uid()`, identity columns → `uuid` |

**Expect the admin panel to stop reading data after 007 and before you finish step 3.**
That is correct: the panel currently reads as `anon`. Use the Supabase Table Editor in
the meantime — there are only 12 bookings.

---

## 3. Create your admin account

Dashboard → **Authentication → Users → Add user**. Real email, strong password, tick
*Auto Confirm User*. Copy the UUID, then:

```sql
INSERT INTO public.admin_users (id, email, role)
VALUES ('PASTE-UUID', 'PASTE-EMAIL', 'admin');
```

Verify:

```sql
SELECT au.email, a.role
FROM public.admin_users a JOIN auth.users au ON au.id = a.id;
```

---

## 4. Disable public signup

Dashboard → **Authentication → Providers → Email** → turn **off** "Enable sign ups".
Leave Email/Password enabled.

Without this, anyone can create an `auth.users` row. They would not be admins — `is_admin()`
gates that — but it is needless attack surface. Enable MFA here too if your plan offers it;
this login guards all customer data.

---

## 5. Verify — do not skip

Both migrations end with verification blocks. The one that actually matters is proving it
from **outside**, with the public anon key:

```bash
U=$(grep '^VITE_SUPABASE_URL=' .env | cut -d= -f2-)
K=$(grep '^SUPABASE_ANON_KEY=' .env | cut -d= -f2-)

# MUST NOT return customer rows
curl -s "$U/rest/v1/bookings?select=name,email" -H "apikey: $K" -H "Authorization: Bearer $K"
# MUST be rejected
curl -s -X DELETE "$U/rest/v1/bookings?id=eq.0" -H "apikey: $K" -H "Authorization: Bearer $K"
# MUST be rejected — Cloudinary credentials
curl -s "$U/rest/v1/settings?select=id" -H "apikey: $K" -H "Authorization: Bearer $K"

# MUST still succeed — the public site needs these
curl -s "$U/rest/v1/properties?select=id,title&limit=1" -H "apikey: $K" -H "Authorization: Bearer $K"
curl -s "$U/rest/v1/admin_settings?select=business_name" -H "apikey: $K" -H "Authorization: Bearer $K"
```

A control you have not tested is a control you do not have.

---

## 6. Manual end-to-end (`npm run dev`)

1. `/admin` signed out → redirects to `/admin/login`
2. Wrong password → error alert, stays on login
3. Correct password → lands on `/admin`
4. Sidebar shows your email and an initial avatar
5. `/admin/properties` loads; toggling *featured* saves — **this is the operation that
   previously required the browser-exposed service key**
6. `/admin/bookings` shows all 12
7. Sign out → header shows "Admin Login"
8. `/admin` again → redirects to login (session actually cleared)
9. Hard refresh while signed in → session persists

Public site: `/` renders featured properties, `/properties` lists 12, a booking submits
from `/contact` and lands as `status = 'pending'`.

---

## 7. Deployment — separate from the above

These are still open from Phase 0 and are **not** fixed by this branch:

- [ ] **Rotate the Supabase `service_role` key**, then delete `VITE_SUPABASE_SERVICE_KEY`
      from all Vercel environments, then redeploy. Rotate *first* — the old key is already
      public in every bundle you have served.
- [ ] **Rotate the Cloudinary `api_secret`.** It sits in the `settings` table, which was
      anon-readable. `009` locks the table, but a secret that has been published stays
      published. Move it to a server-side env var, then
      `ALTER TABLE public.settings DROP COLUMN api_secret;`
- [ ] Delete `VITE_CLERK_PUBLISHABLE_KEY` from Vercel (removed from `.env` already).
- [ ] Delete the Clerk application once the new login works in production.
- [ ] **Revoke the `sbp_` introspection token** — it is account-wide and no longer needed.

---

## Known, accepted, not blocking

| Item | Why it is deferred |
|---|---|
| **Bundle regression: main chunk 379 kB → 1,057 kB** | Chunking change, not new code — module count went *down* (2856 → 2800). Removing `vendor-clerk` from `manualChunks` let Rollup pull FullCalendar/quill into the main chunk. ROADMAP Phase 6.1 lazy-loads admin, which fixes it properly. Performance only, not correctness or security. |
| `AdminLogin` redirects on `user`, not `isAdmin` | A non-admin gets an extra hop via `/admin` then "Not authorised". No security hole. |
| `npm run test:coverage` fails | `@vitest/coverage-v8` not installed. `npm test` works. |
| `AdminBookings.jsx` status `<label>` has no `htmlFor` | Real a11y defect, pre-existing. ROADMAP Phase 7.2. |

---

## What this branch delivers

- Clerk fully removed — `@clerk/clerk-react` uninstalled, 72 kB gone from every page load
- `supabaseAdmin` service-key client **deleted** — no privileged key can reach the browser
- Supabase Auth login, session handling, admin gating (`authenticated ≠ admin`)
- `admin_users` + `is_admin()`, and RLS policies that reference real identity
- **Test suite resurrected**: it executed *zero* tests before this branch; it now runs 40
- 11 commits, all reviewed
