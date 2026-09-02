-- =============================================================================
-- 007_emergency_lockdown.sql
-- Date: 2026-09-01
-- Severity: CRITICAL — apply same day
-- =============================================================================
--
-- WHAT THIS FIXES
--
-- Live introspection on 2026-09-01 found that the `anon` role — whose key ships
-- inside the public JavaScript bundle — holds these grants on EVERY public table:
--
--     DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
--
-- and that RLS was DISABLED on four tables:
--
--     bookings ⚠️   clients ⚠️   properties ⚠️   settings ⚠️
--
-- Policies written on those tables are INERT: PostgreSQL ignores policies when
-- relrowsecurity = false. They read like protection and provide none.
--
-- Net effect before this migration — any anonymous internet user could:
--   • SELECT all bookings (customer name, email, phone, appointment, notes)
--   • DELETE FROM bookings          → destroy every lead
--   • TRUNCATE properties           → wipe every listing
--   • SELECT settings.api_secret    → read the Cloudinary API secret
--   • UPDATE admin_settings         → rewrite the site's phone/email/WhatsApp
--
-- This is a DATA-DESTRUCTION exposure, not only a disclosure one. Rotating the
-- service_role key does NOT close it — the anon key is meant to be public.
-- Only RLS plus correct grants closes it.
--
-- -----------------------------------------------------------------------------
-- ⚠️  BEFORE YOU RUN THIS
-- -----------------------------------------------------------------------------
--
-- 1. TAKE A FULL BACKUP. Supabase Dashboard → Database → Backups.
--    This migration revokes grants and enables RLS. A mistake is far easier to
--    undo from a backup than to reason about live.
--
-- 2. KNOWN IMPACT — THE ADMIN PANEL LOSES DATABASE ACCESS.
--
--    The admin panel currently reads via the `anon` role, because Clerk sessions
--    are invisible to Supabase (see audit finding C-3). Once anon is locked
--    down, admin reads of bookings and clients will fail until ROADMAP Phase 1
--    replaces Clerk with Supabase Auth.
--
--    This is a deliberate trade: a week of managing bookings through the
--    Supabase dashboard, versus leaving a public DELETE grant open on live
--    customer data. Take the trade.
--
--    INTERIM WORKFLOW: Supabase Dashboard → Table Editor → bookings.
--    There are 12 bookings and 8 are pending, so this is genuinely workable.
--
--    If you would rather keep the admin panel reading for now, see
--    "PARTIAL LOCKDOWN" at the bottom. It is strictly less safe and should be
--    measured in days, not weeks.
--
-- 3. VERIFY AFTERWARDS. The verification block at the end is not optional —
--    a control you have not tested is a control you do not have.
--
-- -----------------------------------------------------------------------------
-- STATUS: ✅ APPLIED to production on or before 2026-09-02, verified by
-- introspection the same day — anon grants are exactly
-- (properties SELECT, admin_settings SELECT, bookings INSERT), RLS is on for
-- all 8 tables, and the three policies below are live.
--
-- A brief detour worth recording: the `is_archived` guard in the booking policy
-- was removed on 2026-09-02 because no migration in this repo creates that
-- column, and it was assumed the file could never have run. Introspection
-- disproved that — `bookings.is_archived boolean` exists in production and the
-- live policy contains the guard. The column was missing from
-- `000_baseline.sql`, not from the database. The guard is restored, and the
-- baseline has been rewritten from `pg_catalog` instead of from inference.
-- -----------------------------------------------------------------------------
--
-- =============================================================================


BEGIN;

-- -----------------------------------------------------------------------------
-- STEP 1 — Revoke the blanket grants
-- -----------------------------------------------------------------------------
-- Removes DELETE / TRUNCATE / UPDATE / INSERT / SELECT from anon everywhere.
-- Step 2 grants back only what the public website actually needs.

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

-- `authenticated` keeps table-level grants; RLS policies (Step 4) constrain it.
-- Destructive verbs are removed from every role that does not need them.
REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public FROM authenticated;


-- -----------------------------------------------------------------------------
-- STEP 2 — Grant back the minimum the public site needs
-- -----------------------------------------------------------------------------
-- Derived from actual usage in src/:
--   properties      SELECT  → Home.jsx (featured), Properties.jsx, PropertyDetail.jsx
--   bookings        INSERT  → Contact.jsx:96, ServicesMain.jsx:137, ViewingExperience
--   admin_settings  SELECT  → SettingsContext.jsx (site-wide branding)
--
-- Note there is no anon SELECT on bookings: a prospect must never be able to
-- read another prospect's booking. Nor on `settings`, `clients`,
-- `client_communications`, or `client_property_interests`.

GRANT SELECT ON public.properties     TO anon;
GRANT SELECT ON public.admin_settings TO anon;
GRANT INSERT ON public.bookings       TO anon;

-- bookings.id is an identity/serial column; INSERT needs its sequence.
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;


-- -----------------------------------------------------------------------------
-- STEP 3 — Enable RLS where it was off
-- -----------------------------------------------------------------------------
-- Until this runs, every policy on these tables is decorative.

ALTER TABLE public.bookings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings   ENABLE ROW LEVEL SECURITY;

-- Already enabled, asserted here so the file states the full intended end state:
ALTER TABLE public.admin_settings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_communications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_property_interests ENABLE ROW LEVEL SECURITY;


-- -----------------------------------------------------------------------------
-- STEP 4 — Replace permissive policies with interim rules
-- -----------------------------------------------------------------------------
-- INTERIM, not final. ROADMAP Phase 1.4 rewrites these against auth.uid() once
-- Supabase Auth replaces Clerk. The goal here is only to close the hole without
-- taking the public website down.

-- ---- properties -------------------------------------------------------------
-- Public may read available listings. All 12 rows are status='available', so
-- this hides nothing that is currently live.

DROP POLICY IF EXISTS "View Listings"                                  ON public.properties;
DROP POLICY IF EXISTS "Allow authenticated users to update properties" ON public.properties;

CREATE POLICY "public reads available properties"
  ON public.properties FOR SELECT
  TO anon, authenticated
  USING (status = 'available');

-- No anon write path. Admin writes return in Phase 1.4.

-- ---- bookings ---------------------------------------------------------------
-- Anon may submit, and may not read back. This is the single most important
-- policy in the file: it is what stops a competitor from harvesting your leads.

DROP POLICY IF EXISTS "Allow authenticated users full access to bookings" ON public.bookings;

CREATE POLICY "public may submit a booking"
  ON public.bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    type IN ('viewing', 'consultation', 'contact')
    AND name  IS NOT NULL AND length(trim(name))  BETWEEN 1 AND 200
    AND email IS NOT NULL AND length(trim(email)) BETWEEN 3 AND 320
    AND (status IS NULL OR status = 'pending')
    AND is_archived IS NOT TRUE
    -- Admin-only fields must not be settable by the submitter.
    AND admin_notes       IS NULL
    AND internal_notes    IS NULL
    AND confirmed_at      IS NULL
    AND confirmed_by      IS NULL
    AND assigned_agent_id IS NULL
  );

-- ---- admin_settings ---------------------------------------------------------
-- Public read is required: SettingsContext drives site-wide branding.
-- Public WRITE was the defacement and phone-hijack vector. It goes now.

DROP POLICY IF EXISTS "Allow public to read settings"   ON public.admin_settings;
DROP POLICY IF EXISTS "Allow insert settings"           ON public.admin_settings;
DROP POLICY IF EXISTS "Allow update settings"           ON public.admin_settings;
DROP POLICY IF EXISTS "Prevent deletion of settings"    ON public.admin_settings;

CREATE POLICY "public reads settings"
  ON public.admin_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- No INSERT/UPDATE/DELETE policy = no write path for anon or authenticated.
-- service_role bypasses RLS, so the Supabase dashboard still edits settings.

-- ---- clients / communications / interests -----------------------------------
-- PII. No policy for anon at all. The existing `TO authenticated USING (true)`
-- policies are left in place: they were never reachable (the app connects as
-- anon), they are now backed by real RLS, and Phase 1.4 rewrites them against
-- is_admin(). Dropping them here would add churn without adding safety.

-- ---- settings (Cloudinary credentials) --------------------------------------
-- No policy whatsoever = no access for anon or authenticated. Reachable only
-- by service_role.
--
-- ⚠️  THIS DOES NOT UNDO THE EXPOSURE. The api_secret in this table has been
--     publicly readable. ROTATE IT IN THE CLOUDINARY CONSOLE — see ROADMAP
--     Phase 0.2 — then move it to a server-side environment variable and drop
--     the column. A secret living in a PostgREST-exposed table is a published
--     secret, whatever the policy says.

COMMIT;


-- =============================================================================
-- VERIFICATION — run this after COMMIT. Do not skip it.
-- =============================================================================
--
-- Expect: rls_enabled = true for all 7 rows.
--
--   SELECT c.relname AS table, c.relrowsecurity AS rls_enabled
--   FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
--   WHERE n.nspname = 'public' AND c.relkind = 'r'
--   ORDER BY c.relname;
--
-- Expect: anon appears ONLY as
--   properties=SELECT, admin_settings=SELECT, bookings=INSERT
--
--   SELECT table_name, grantee, string_agg(DISTINCT privilege_type, ',') AS privs
--   FROM information_schema.role_table_grants
--   WHERE table_schema = 'public' AND grantee = 'anon'
--   GROUP BY table_name, grantee ORDER BY table_name;
--
-- -----------------------------------------------------------------------------
-- Then prove it from outside, with the public anon key. Replace $URL and $ANON.
--
--   # MUST return 401/403, or an empty array — never customer rows
--   curl -s "$URL/rest/v1/bookings?select=name,email,phone" \
--        -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
--
--   # MUST be rejected
--   curl -s -X DELETE "$URL/rest/v1/bookings?id=eq.0" \
--        -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
--
--   # MUST be rejected — this is the Cloudinary secret
--   curl -s "$URL/rest/v1/settings?select=api_secret" \
--        -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
--
--   # MUST still work — the public site depends on these
--   curl -s "$URL/rest/v1/properties?select=id,title&limit=1" \
--        -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
--   curl -s "$URL/rest/v1/admin_settings?select=business_name" \
--        -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
--
-- Then load the live site and confirm: homepage featured properties render,
-- the listings page renders, header branding renders, and a test booking
-- submits successfully.
--
-- =============================================================================


-- =============================================================================
-- PARTIAL LOCKDOWN — less safe; use only if the admin panel must keep reading
-- =============================================================================
--
-- Closes the destructive verbs but leaves anon SELECT in place, so the admin
-- panel keeps working while customer data stays publicly readable.
--
-- This is a worse position. Choose it only as a deliberate, dated, short-term
-- trade, and finish ROADMAP Phase 1 within days rather than weeks.
--
--   BEGIN;
--   REVOKE DELETE, UPDATE, TRUNCATE, TRIGGER, REFERENCES
--     ON ALL TABLES IN SCHEMA public FROM anon;
--   REVOKE INSERT ON public.clients, public.properties,
--                    public.settings, public.admin_settings FROM anon;
--   ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;  -- Cloudinary secret
--   COMMIT;
--
-- Even in this variant, `settings` must be locked and the Cloudinary secret
-- rotated. That one is not negotiable.
-- =============================================================================
