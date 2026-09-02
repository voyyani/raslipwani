-- =============================================================================
-- Migration: 010_consolidate_settings.sql
-- Date:      2026-09-02
-- Purpose:   Close the two gaps 000-009 leave open once the chain replays:
--              A. `booking_notes` and `email_templates` exist but deny everyone
--              B. `settings` and `admin_settings` are two tables for one job,
--                 and the older one is where the Cloudinary secret lived
-- Depends:   008 (public.is_admin())
-- =============================================================================
--
-- Apply AFTER 007 → 008 → 009.
--
-- 🔑 OWNER PREREQUISITE: rotate the Cloudinary API secret in the Cloudinary
--    console before running this. Dropping the table removes the secret from
--    the database; it does not invalidate a value that has already been served
--    to every anonymous visitor.
--
-- =============================================================================


-- -----------------------------------------------------------------------------
-- A. Admin-only access for the two tables 003b/004 create
--
-- Both were created with RLS enabled and no policy — deny-by-default — because
-- `is_admin()` does not exist until 008. It does now.
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  t TEXT;
  p TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['booking_notes', 'email_templates']
  LOOP
    -- Skip cleanly if an earlier run of the chain never created the table.
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = t
    ) THEN
      RAISE NOTICE 'skipping %: table does not exist', t;
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    -- Clear anything historical, including any surviving USING (true).
    FOR p IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p, t);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY "admins manage %1$s" ON public.%1$I FOR ALL TO authenticated '
      'USING (public.is_admin()) WITH CHECK (public.is_admin())', t);

    -- Internal admin notes and email templates are never public.
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  END LOOP;
END $$;


-- -----------------------------------------------------------------------------
-- B. Fold `settings` into `admin_settings`, then drop it
--
-- `settings` held exactly two values the application still read — `cloud_name`
-- and `upload_preset`, fetched once by AdminProperties.jsx — alongside the
-- Cloudinary `api_secret` that made it the most dangerous table in the schema.
-- `admin_settings` already has both columns. Keeping two settings tables means
-- two answers to the same question, and this one is the answer nobody audits.
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  legacy RECORD;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'settings'
  ) THEN
    RAISE NOTICE 'settings already gone; nothing to consolidate';
    RETURN;
  END IF;

  SELECT cloud_name, upload_preset INTO legacy FROM public.settings LIMIT 1;

  -- Carry the values over only where admin_settings has no answer of its own.
  -- admin_settings is authoritative; this fills blanks, it does not overwrite.
  IF legacy IS NOT NULL THEN
    UPDATE public.admin_settings
       SET cloud_name    = COALESCE(NULLIF(cloud_name, ''),    legacy.cloud_name),
           upload_preset = COALESCE(NULLIF(upload_preset, ''), legacy.upload_preset);
  END IF;

  DROP TABLE public.settings;
  RAISE NOTICE 'settings consolidated into admin_settings and dropped';
END $$;


-- =============================================================================
-- 🔑 OWNER VERIFICATION
--
--   -- 1. settings is gone
--   SELECT to_regclass('public.settings');            -- expect NULL
--
--   -- 2. Cloudinary config survived the move
--   SELECT cloud_name, upload_preset FROM public.admin_settings;
--
--   -- 3. the two new tables are admin-only
--   SELECT tablename, policyname, roles, cmd
--     FROM pg_policies
--    WHERE schemaname = 'public'
--      AND tablename IN ('booking_notes', 'email_templates');
--
--   -- 4. anon cannot touch either (expect 401/empty, not rows)
--   curl -s "$URL/rest/v1/email_templates?select=*" -H "apikey: $ANON_KEY"
--
-- =============================================================================
