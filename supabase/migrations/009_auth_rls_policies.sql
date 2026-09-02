-- =============================================================================
-- 009_auth_rls_policies.sql
-- Date: 2026-09-01
-- Replaces every USING (true) policy with a real rule based on auth.uid().
-- Depends on: 007_emergency_lockdown.sql, 008_admin_users.sql
-- =============================================================================
--
-- ⚠️  NOT YET APPLIED. Apply 007, then 008, then this file, in that order, and
--     take a database backup first. Verification queries are at the bottom.
--
--     Applying 009 before 007 leaves the blanket anon grants in place, and the
--     policies below will not save you: grants are checked before RLS.
--
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Identity columns: text (Clerk IDs) -> uuid (auth.users)
-- Verified 2026-09-01 against the live database: assigned_agent_id, confirmed_by
-- and client_id are 100% NULL across all 12 bookings, so `USING NULL` discards
-- nothing. If that is no longer true when you apply this, STOP and re-check —
-- the conversion would silently destroy data.
--     SELECT count(assigned_agent_id), count(confirmed_by) FROM bookings;  -- expect 0, 0
-- -----------------------------------------------------------------------------
ALTER TABLE public.bookings
  ALTER COLUMN assigned_agent_id TYPE uuid USING NULL,
  ALTER COLUMN confirmed_by      TYPE uuid USING NULL;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_assigned_agent_fk
    FOREIGN KEY (assigned_agent_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT bookings_confirmed_by_fk
    FOREIGN KEY (confirmed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- properties: public reads available listings; admins do everything
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "public reads available properties" ON public.properties;
DROP POLICY IF EXISTS "admins manage properties"          ON public.properties;

CREATE POLICY "public reads available properties"
  ON public.properties FOR SELECT
  TO anon, authenticated
  USING (status = 'available' OR public.is_admin());

CREATE POLICY "admins manage properties"
  ON public.properties FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;

-- -----------------------------------------------------------------------------
-- bookings: anon may submit only; admins read and manage
-- The absence of an anon SELECT policy is the point — it is what stops a
-- competitor from harvesting your leads with the public anon key.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "public may submit a booking" ON public.bookings;
DROP POLICY IF EXISTS "admins manage bookings"      ON public.bookings;

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
    -- client_id links a booking to a CRM record. A submitter who learns or guesses
    -- a client uuid could otherwise attach their booking to someone else's record.
    AND client_id         IS NULL
  );

CREATE POLICY "admins manage bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;

-- -----------------------------------------------------------------------------
-- clients + related: admin-only. This is PII.
-- Replaces the inherited `TO authenticated USING (true)` policies, which would
-- otherwise grant EVERY signed-in user full access to every client record.
-- -----------------------------------------------------------------------------
DO $$
DECLARE t text; p text;
BEGIN
  FOREACH t IN ARRAY ARRAY['clients', 'client_communications', 'client_property_interests']
  LOOP
    FOR p IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p, t);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY "admins manage %1$s" ON public.%1$I FOR ALL TO authenticated '
      'USING (public.is_admin()) WITH CHECK (public.is_admin())', t);

    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- admin_settings: public read (drives site-wide branding); admin write
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "public reads settings"  ON public.admin_settings;
DROP POLICY IF EXISTS "admins manage settings" ON public.admin_settings;

CREATE POLICY "public reads settings"
  ON public.admin_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "admins manage settings"
  ON public.admin_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE ON public.admin_settings TO authenticated;

-- -----------------------------------------------------------------------------
-- settings: no access for anon or authenticated. service_role only.
--
-- ⚠️  THIS DOES NOT UNDO THE EXPOSURE. The Cloudinary api_secret in this table
--     has been publicly readable (verified 2026-09-01: RLS off, 0 policies,
--     anon HTTP 206, 1 row with a non-null api_secret). ROTATE IT IN THE
--     CLOUDINARY CONSOLE, move it to a server-side environment variable, then
--     `ALTER TABLE public.settings DROP COLUMN api_secret;`.
--     A secret living in a PostgREST-exposed table is a published secret,
--     whatever the policy says. See ROADMAP Phase 0.2.
-- -----------------------------------------------------------------------------
REVOKE ALL ON public.settings FROM anon;

-- Admins DO need to read this table: AdminProperties.jsx:107-110 reads
-- cloud_name and upload_preset to configure Cloudinary image upload, and it
-- discards the error (`const { data: settings } = ...`). A blanket revoke here
-- would break admin image upload silently, with no diagnostic.
-- So: admins may read, nobody may write from the app, anon has no access at all.
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins read settings" ON public.settings;
CREATE POLICY "admins read settings"
  ON public.settings FOR SELECT
  TO authenticated
  USING (public.is_admin());

GRANT SELECT ON public.settings TO authenticated;

-- -----------------------------------------------------------------------------
-- booking_notes / email_templates: gate them IF they exist.
--
-- Verified 2026-09-01: neither table exists in the live database, because
-- migrations 003 and 004 abort on `CREATE POLICY IF NOT EXISTS` (invalid
-- PostgreSQL in every version) before reaching their CREATE TABLE statements.
-- The admin UI references them anyway — BookingDetailModal.jsx:43,93,120 and
-- settings/EmailSettings.jsx:54,102 — so those features are currently broken.
--
-- This block is defensive: whenever 003/004 are repaired and applied, these two
-- tables must NOT come back with their original `USING (true)` no-TO-clause
-- policies, which would let any signed-in non-admin read every internal note on
-- every customer booking. Gating them here means the fix cannot be forgotten.
-- -----------------------------------------------------------------------------
DO $$
DECLARE t text; p text;
BEGIN
  FOREACH t IN ARRAY ARRAY['booking_notes', 'email_templates']
  LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      RAISE NOTICE 'skipping %: table does not exist', t;
      CONTINUE;
    END IF;

    FOR p IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p, t);
    END LOOP;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY "admins manage %1$s" ON public.%1$I FOR ALL TO authenticated '
      'USING (public.is_admin()) WITH CHECK (public.is_admin())', t);

    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  END LOOP;
END $$;

COMMIT;


-- =============================================================================
-- VERIFICATION — run after COMMIT. Do not skip.
-- =============================================================================
--
-- 1. No permissive policies survive. Expect ZERO rows.
--    (The one documented exception is the public SELECT on admin_settings,
--     which the site needs to render its branding.)
--
--   SELECT tablename, policyname, cmd, roles::text, qual
--   FROM pg_policies
--   WHERE schemaname = 'public'
--     AND qual = 'true'
--     AND NOT (tablename = 'admin_settings' AND cmd = 'SELECT')
--   ORDER BY tablename;
--
-- 2. The anon grant surface. Expect EXACTLY three rows:
--      admin_settings | SELECT
--      bookings       | INSERT
--      properties     | SELECT
--
--   SELECT table_name, string_agg(DISTINCT privilege_type, ',') AS privs
--   FROM information_schema.role_table_grants
--   WHERE table_schema = 'public' AND grantee = 'anon'
--   GROUP BY table_name ORDER BY table_name;
--
-- 3. Prove it from OUTSIDE, with the public anon key. This is the step that
--    actually demonstrates the fix; the SQL above only describes intent.
--
--   U=$(grep '^VITE_SUPABASE_URL=' .env | cut -d= -f2-)
--   K=$(grep '^SUPABASE_ANON_KEY=' .env | cut -d= -f2-)
--
--   # MUST NOT return customer rows
--   curl -s "$U/rest/v1/bookings?select=name,email" -H "apikey: $K" -H "Authorization: Bearer $K"
--   # MUST be rejected
--   curl -s -X DELETE "$U/rest/v1/bookings?id=eq.0" -H "apikey: $K" -H "Authorization: Bearer $K"
--   # MUST be rejected — Cloudinary credentials
--   curl -s "$U/rest/v1/settings?select=id" -H "apikey: $K" -H "Authorization: Bearer $K"
--   # MUST still succeed — the public site depends on these
--   curl -s "$U/rest/v1/properties?select=id,title&limit=1" -H "apikey: $K" -H "Authorization: Bearer $K"
--   curl -s "$U/rest/v1/admin_settings?select=business_name" -H "apikey: $K" -H "Authorization: Bearer $K"
--
-- =============================================================================
