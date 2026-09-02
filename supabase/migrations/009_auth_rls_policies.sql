-- =============================================================================
-- 009_auth_rls_policies.sql
-- Date: 2026-09-01  ·  Revised: 2026-09-02 (made runnable + idempotent)
-- Replaces every USING (true) policy with a real rule based on auth.uid().
-- Depends on: 007_emergency_lockdown.sql, 008_admin_users.sql
-- =============================================================================
--
-- ⚠️  Apply 007, then 008, then this file, in that order, and take a database
--     backup first. Verification queries are at the bottom.
--
--     Applying 009 before 007 leaves the blanket anon grants in place, and the
--     policies below will not save you: grants are checked before RLS.
--
-- -----------------------------------------------------------------------------
-- REVISION 2026-09-02 — why this file changed
-- -----------------------------------------------------------------------------
--
-- The previous version aborted against this database, and could not be run
-- twice. Both problems came from the same habit: asserting the schema instead
-- of checking it.
--
--   1. It named columns whose existence it could not know. Every column this
--      file guards is conditional: `status`, `admin_notes`, `internal_notes`,
--      `confirmed_at`, `confirmed_by`, `assigned_agent_id` and `client_id` come
--      from 002, and this file's own header records that 003 and 004 abort
--      partway through. PostgreSQL evaluates a WITH CHECK expression when the
--      policy is CREATEd, so a single absent column aborted the entire
--      transaction with a one-line `column "x" does not exist` and no
--      indication of which of the nine it meant.
--
--      Introspection on 2026-09-02 confirmed all of them are present, and the
--      run-time assembly below now proves that rather than assuming it.
--
--   2. A false alarm worth recording, because the correction matters more than
--      the mistake. `is_archived` was briefly removed from the booking guard on
--      the grounds that no migration creates it. That was true of the migration
--      chain and false of the database: `bookings.is_archived boolean` exists in
--      production, 007 applied cleanly with the guard, and the live policy
--      contains it. `000_baseline.sql` was the thing that was wrong — it had
--      been reconstructed from application code rather than read from
--      pg_catalog. The baseline is now transcribed from the live schema, and
--      the guard is back.
--
--   3. `ALTER COLUMN ... TYPE uuid USING NULL` was a data-loss trap on re-run.
--      Once an admin is assigned to a booking, re-running the old file would
--      silently NULL every assignment. It now converts only a `text` column,
--      refuses to run if the column holds data, and skips a `uuid` column.
--
--   4. `ADD CONSTRAINT` is not re-runnable in PostgreSQL (there is no
--      IF NOT EXISTS form). A second run failed with "constraint already
--      exists". Both foreign keys are now added only when the column has no
--      foreign key at all — which also covers 003b, whose version of
--      `assigned_agent_id` arrives with its own inline FK under a different
--      name.
--
--   5. It retyped columns that a policy depends on, while that policy was
--      still in place. Applying it failed at the first ALTER with
--      `0A000: cannot alter type of a column used in a policy definition` —
--      007's INSERT policy guards `assigned_agent_id IS NULL`, and PostgreSQL
--      tracks that as a dependency on the policy text. The policies are now
--      dropped before the conversion and recreated after it.
--
--   6. Missing prerequisites produced confusing failures deep in the file.
--      There is now a preflight block that fails immediately with a sentence
--      telling you which migration to apply first.
--
-- The security intent is unchanged. Nothing here is weaker than the version it
-- replaces: a guard that is skipped is skipped because the column it protects
-- does not exist, and every skip prints a NOTICE. Read the NOTICEs.
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PRECONDITIONS, VERIFIED AGAINST PRODUCTION 2026-09-02
-- -----------------------------------------------------------------------------
--   007 applied ✅   008 applied ✅   009 (this file) not applied
--   bookings.assigned_agent_id  text, 0 of 12 rows populated  → safe to convert
--   bookings.confirmed_by       text, 0 of 12 rows populated  → safe to convert
--   bookings.client_id          already uuid                  → left alone
--   bookings.is_archived        boolean, present              → guard applies
--   booking types in use: viewing, consultation, contact      → policy matches
--   statuses in use: pending, confirmed, cancelled            → policy matches
--   properties.status: 'available' on all 12 rows             → nothing hidden
--   booking_notes / email_templates                           → absent, skipped
-- -----------------------------------------------------------------------------

BEGIN;

-- -----------------------------------------------------------------------------
-- PREFLIGHT — fail loudly and early, not cryptically and late
-- -----------------------------------------------------------------------------
DO $preflight$
BEGIN
  IF to_regprocedure('public.is_admin()') IS NULL THEN
    RAISE EXCEPTION
      'Missing public.is_admin(). Apply 008_admin_users.sql before this file.';
  END IF;

  IF to_regclass('public.bookings') IS NULL THEN
    RAISE EXCEPTION
      'Missing public.bookings. Apply 000_baseline.sql before this file.';
  END IF;

  IF to_regclass('public.properties') IS NULL THEN
    RAISE EXCEPTION
      'Missing public.properties. Apply 000_baseline.sql before this file.';
  END IF;

  IF to_regclass('public.admin_users') IS NULL THEN
    RAISE EXCEPTION
      'Missing public.admin_users. Apply 008_admin_users.sql before this file.';
  END IF;
END
$preflight$;

-- A column-existence helper, scoped to this transaction and discarded with it.
CREATE FUNCTION pg_temp.col_exists(tbl text, col text)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = tbl AND column_name = col
  );
$$;

-- -----------------------------------------------------------------------------
-- Drop the bookings policies BEFORE retyping the columns they reference
-- -----------------------------------------------------------------------------
-- PostgreSQL refuses to change the type of a column that a policy expression
-- mentions:
--
--   ERROR: 0A000: cannot alter type of a column used in a policy definition
--   DETAIL: policy public may submit a booking on table bookings
--           depends on column "assigned_agent_id"
--
-- 007's INSERT policy guards `assigned_agent_id IS NULL` and
-- `confirmed_by IS NULL`, which is exactly the pair this file converts to uuid.
-- The dependency is on the policy TEXT, not on the data, so the only way
-- through is to drop the policies first and recreate them afterwards — which
-- this file does anyway, further down.
--
-- Every policy on the table is dropped rather than the two by name, so a policy
-- added by hand in the dashboard cannot block the conversion either. The full
-- intended end state for `bookings` is recreated below; nothing is left off.
--
-- ⚠️  Between this block and the CREATE POLICY statements below, `bookings` has
--     RLS enabled and no policies, which denies all access. That window is
--     inside this transaction, so no other session ever observes it — but it is
--     also why this file must be run as a single transaction, not statement by
--     statement.
-- -----------------------------------------------------------------------------
DO $dropbookings$
DECLARE p text;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'bookings'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.bookings', p);
    RAISE NOTICE 'dropped bookings policy % (recreated below)', p;
  END LOOP;
END
$dropbookings$;

-- -----------------------------------------------------------------------------
-- Identity columns: text (Clerk IDs) -> uuid (auth.users)
--
-- Verified 2026-09-01 against the live database: assigned_agent_id and
-- confirmed_by were 100% NULL across all 12 bookings. That is re-checked here
-- rather than assumed — if the columns have since been populated, this ABORTS
-- instead of discarding the values.
-- -----------------------------------------------------------------------------
DO $identity$
DECLARE
  col       text;
  coltype   text;
  populated bigint;
BEGIN
  FOREACH col IN ARRAY ARRAY['assigned_agent_id', 'confirmed_by']
  LOOP
    SELECT data_type INTO coltype
      FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = col;

    IF coltype IS NULL THEN
      RAISE NOTICE 'bookings.% does not exist — skipping conversion (002 not applied?)', col;
      CONTINUE;
    END IF;

    IF coltype = 'uuid' THEN
      RAISE NOTICE 'bookings.% is already uuid — nothing to convert', col;
    ELSE
      EXECUTE format('SELECT count(%I) FROM public.bookings', col) INTO populated;

      IF populated > 0 THEN
        RAISE EXCEPTION
          'bookings.% holds % non-null value(s). Converting to uuid would destroy them. '
          'Back them up, decide the auth.users mapping by hand, then re-run.',
          col, populated;
      END IF;

      EXECUTE format(
        'ALTER TABLE public.bookings ALTER COLUMN %I TYPE uuid USING NULL::uuid', col);
      RAISE NOTICE 'bookings.% converted % -> uuid', col, coltype;
    END IF;

    -- Add the FK only if this column has no foreign key yet. 003b may already
    -- have created one inline under a generated name.
    IF EXISTS (
      SELECT 1
        FROM information_schema.table_constraints  tc
        JOIN information_schema.key_column_usage   kcu
          ON  kcu.constraint_name   = tc.constraint_name
          AND kcu.constraint_schema = tc.constraint_schema
       WHERE tc.constraint_type = 'FOREIGN KEY'
         AND tc.table_schema    = 'public'
         AND tc.table_name      = 'bookings'
         AND kcu.column_name    = col
    ) THEN
      RAISE NOTICE 'bookings.% already has a foreign key — leaving it alone', col;
    ELSE
      EXECUTE format(
        'ALTER TABLE public.bookings ADD CONSTRAINT %I FOREIGN KEY (%I) '
        'REFERENCES auth.users(id) ON DELETE SET NULL',
        'bookings_' || col || '_fk', col);
      RAISE NOTICE 'bookings.% foreign key -> auth.users(id) added', col;
    END IF;
  END LOOP;
END
$identity$;

-- -----------------------------------------------------------------------------
-- properties: public reads available listings; admins do everything
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "public reads available properties" ON public.properties;
DROP POLICY IF EXISTS "admins manage properties"          ON public.properties;

DO $properties$
DECLARE
  read_rule text;
BEGIN
  IF pg_temp.col_exists('properties', 'status') THEN
    read_rule := $rule$status = 'available' OR public.is_admin()$rule$;
  ELSE
    -- Listings are public by nature, so a missing status column is not an
    -- exposure — but it does mean unpublished rows would be visible if the
    -- column is added later without revisiting this policy.
    RAISE NOTICE 'properties.status does not exist — public SELECT is unfiltered';
    read_rule := 'true';
  END IF;

  EXECUTE 'CREATE POLICY "public reads available properties" ON public.properties '
       || 'FOR SELECT TO anon, authenticated USING (' || read_rule || ')';
END
$properties$;

CREATE POLICY "admins manage properties"
  ON public.properties FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;

-- -----------------------------------------------------------------------------
-- bookings: anon may submit only; admins read and manage
--
-- The absence of an anon SELECT policy is the point — it is what stops a
-- competitor from harvesting your leads with the public anon key.
--
-- The WITH CHECK expression is assembled from the columns that actually exist,
-- because PostgreSQL validates it at CREATE POLICY time and one absent column
-- aborts the entire migration. Every omission raises a NOTICE.
-- -----------------------------------------------------------------------------
-- Already dropped above, before the column retype. Kept as a no-op so this
-- section still states its own preconditions if it is ever read in isolation.
DROP POLICY IF EXISTS "public may submit a booking" ON public.bookings;
DROP POLICY IF EXISTS "admins manage bookings"      ON public.bookings;

DO $bookings$
DECLARE
  checks     text[] := ARRAY[]::text[];
  admin_only text[] := ARRAY['admin_notes', 'internal_notes', 'confirmed_at',
                             'confirmed_by', 'assigned_agent_id', 'client_id'];
  col        text;
  rule       text;
BEGIN
  -- What kind of booking this is.
  IF pg_temp.col_exists('bookings', 'type') THEN
    checks := array_append(checks, $c$type IN ('viewing', 'consultation', 'contact')$c$);
  ELSE
    RAISE NOTICE 'bookings.type missing — booking type is unconstrained';
  END IF;

  -- Contact details must be present and sanely bounded.
  IF pg_temp.col_exists('bookings', 'name') THEN
    checks := array_append(checks, $c$name IS NOT NULL AND length(trim(name)) BETWEEN 1 AND 200$c$);
  END IF;

  IF pg_temp.col_exists('bookings', 'email') THEN
    checks := array_append(checks, $c$email IS NOT NULL AND length(trim(email)) BETWEEN 3 AND 320$c$);
  END IF;

  -- A submitter may not self-confirm.
  IF pg_temp.col_exists('bookings', 'status') THEN
    checks := array_append(checks, $c$(status IS NULL OR status = 'pending')$c$);
  ELSE
    RAISE NOTICE 'bookings.status missing — submitters cannot be held to pending';
  END IF;

  -- A submitter may not file a booking that is already archived, which would
  -- hide it from the admin queue on arrival. Confirmed present in production
  -- 2026-09-02; still conditional, because it is absent from every migration
  -- older than the 2026-09-02 baseline rewrite.
  IF pg_temp.col_exists('bookings', 'is_archived') THEN
    checks := array_append(checks, $c$is_archived IS NOT TRUE$c$);
  ELSE
    RAISE NOTICE 'bookings.is_archived missing — archived-on-arrival is possible';
  END IF;

  -- Admin-only fields must not be settable by the submitter. client_id links a
  -- booking to a CRM record: a submitter who learns or guesses a client uuid
  -- could otherwise attach their booking to someone else's record.
  FOREACH col IN ARRAY admin_only
  LOOP
    IF pg_temp.col_exists('bookings', col) THEN
      checks := array_append(checks, format('%I IS NULL', col));
    ELSE
      RAISE NOTICE 'bookings.% missing — no submitter guard needed for it', col;
    END IF;
  END LOOP;

  IF array_length(checks, 1) IS NULL THEN
    RAISE EXCEPTION
      'No recognisable columns on public.bookings. Refusing to create an '
      'unconstrained INSERT policy. Check that 000_baseline.sql applied.';
  END IF;

  rule := array_to_string(checks, E'\n    AND ');

  EXECUTE 'CREATE POLICY "public may submit a booking" ON public.bookings '
       || 'FOR INSERT TO anon, authenticated WITH CHECK (' || E'\n    ' || rule || E'\n  )';

  RAISE NOTICE 'bookings INSERT policy created with % guard(s)', array_length(checks, 1);
END
$bookings$;

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
DO $clients$
DECLARE t text; p text;
BEGIN
  FOREACH t IN ARRAY ARRAY['clients', 'client_communications', 'client_property_interests']
  LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      RAISE NOTICE 'skipping %: table does not exist (001 not applied?)', t;
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
END
$clients$;

-- -----------------------------------------------------------------------------
-- admin_settings: public read (drives site-wide branding); admin write
-- -----------------------------------------------------------------------------
DO $adminsettings$
BEGIN
  IF to_regclass('public.admin_settings') IS NULL THEN
    RAISE NOTICE 'skipping admin_settings: table does not exist (003a not applied?)';
    RETURN;
  END IF;

  DROP POLICY IF EXISTS "public reads settings"  ON public.admin_settings;
  DROP POLICY IF EXISTS "admins manage settings" ON public.admin_settings;

  ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

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
END
$adminsettings$;

-- -----------------------------------------------------------------------------
-- settings: no access for anon. Admin read only.
--
-- ⚠️  THIS DOES NOT UNDO THE EXPOSURE. The Cloudinary api_secret in this table
--     has been publicly readable (verified 2026-09-01: RLS off, 0 policies,
--     anon HTTP 206, 1 row with a non-null api_secret). ROTATE IT IN THE
--     CLOUDINARY CONSOLE, move it to a server-side environment variable, then
--     `ALTER TABLE public.settings DROP COLUMN api_secret;`.
--     A secret living in a PostgREST-exposed table is a published secret,
--     whatever the policy says. See ROADMAP Phase 0.2.
--
-- The admin read policy below is precautionary, not required. Re-checked
-- 2026-09-02: no code queries this table — `grep -rn "from('settings')" src api`
-- returns nothing, because 010 repointed AdminProperties.jsx at `admin_settings`
-- (it reads cloud_name and upload_preset from there, discarding the error).
-- The policy costs nothing and avoids a silent breakage if something is still
-- pointed here; 010 retires the table outright.
-- -----------------------------------------------------------------------------
DO $settings$
BEGIN
  IF to_regclass('public.settings') IS NULL THEN
    RAISE NOTICE 'skipping settings: table does not exist (already retired by 010?)';
    RETURN;
  END IF;

  REVOKE ALL ON public.settings FROM anon;

  ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "admins read settings" ON public.settings;
  CREATE POLICY "admins read settings"
    ON public.settings FOR SELECT
    TO authenticated
    USING (public.is_admin());

  GRANT SELECT ON public.settings TO authenticated;
END
$settings$;

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
DO $optional$
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
END
$optional$;

COMMIT;


-- =============================================================================
-- VERIFICATION — run after COMMIT. Do not skip.
-- =============================================================================
--
-- 0. Read the NOTICEs this migration printed. Every "skipping" line is a column
--    or table that is absent, which means a guard you expected is not there.
--    In the Supabase SQL editor they appear under the results pane.
--
-- 1. Confirm the booking INSERT policy has the guards you expect. In
--    particular, check that the admin-only fields present in your schema all
--    appear as `IS NULL`:
--
--   SELECT policyname, with_check
--   FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'bookings';
--
-- 2. No permissive policies survive. Expect ZERO rows.
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
-- 3. The anon grant surface. Expect EXACTLY three rows:
--      admin_settings | SELECT
--      bookings       | INSERT
--      properties     | SELECT
--
--   SELECT table_name, string_agg(DISTINCT privilege_type, ',') AS privs
--   FROM information_schema.role_table_grants
--   WHERE table_schema = 'public' AND grantee = 'anon'
--   GROUP BY table_name ORDER BY table_name;
--
-- 4. Prove it from OUTSIDE, with the public anon key. This is the step that
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
