-- =============================================================================
-- 012_lock_admin_users_and_defaults.sql
-- Date: 2026-09-02
-- Severity: HIGH — becomes exploitable the moment the first account is created
-- Depends on: 008_admin_users.sql
-- =============================================================================
--
-- WHAT THIS FIXES
--
-- Two related findings from live introspection on 2026-09-02.
--
-- -----------------------------------------------------------------------------
-- 1. `authenticated` can TRUNCATE public.admin_users
-- -----------------------------------------------------------------------------
--
-- Measured grant on admin_users:
--
--   authenticated → DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
--
-- 008 intended `GRANT SELECT ... TO authenticated` and nothing more. It got the
-- grant right and never revoked what was already there — because admin_users
-- was CREATEd by 008, which ran AFTER 007's `REVOKE ALL ... FROM anon`. A table
-- that did not exist when the revoke ran cannot be covered by it. The table was
-- therefore born with Supabase's default privileges, which are `arwdDxtm` —
-- everything, including TRUNCATE — for both anon and authenticated. 008
-- revoked anon. Nobody revoked authenticated.
--
-- RLS hides most of that. admin_users has RLS enabled with a single SELECT
-- policy, so INSERT / UPDATE / DELETE are all denied for want of a policy.
--
-- TRUNCATE is the exception, and it is the dangerous one:
--
--   ⚠️  ROW LEVEL SECURITY DOES NOT APPLY TO TRUNCATE.
--       PostgreSQL gates TRUNCATE on the table privilege alone.
--
-- So any authenticated user could run `TRUNCATE public.admin_users` and delete
-- every admin row in the system — locking every administrator out of the admin
-- panel, since ProtectedRoute checks is_admin(), which reads that table. It is
-- not currently exploitable only because `auth.users` is empty. It becomes
-- exploitable the moment you create the first account, and trivially so if
-- public signup is ever left on.
--
-- -----------------------------------------------------------------------------
-- 2. The next table created will have the same problem
-- -----------------------------------------------------------------------------
--
-- The root cause is not admin_users. It is this, from pg_default_acl:
--
--   postgres, tables:  anon=arwdDxtm | authenticated=arwdDxtm | service_role=…
--
-- Every table created in `public` by `postgres` is granted, automatically and
-- silently, full privileges to anon and authenticated. 007's revoke was a
-- one-time sweep over the tables that existed that day. Any table added later —
-- `booking_notes` and `email_templates` when 003b/004 are repaired, an
-- `owner_properties` table for the diaspora portal, anything at all — arrives
-- world-writable and has to be locked down by hand, or it is not locked down.
--
-- Fixing the default is the difference between a lockdown that holds and a
-- lockdown that has to be re-performed after every schema change.
--
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- STEP 1 — admin_users: SELECT and nothing else
-- -----------------------------------------------------------------------------
-- Writes stay service_role only, i.e. the Supabase dashboard. Admin rows are
-- provisioned, never self-served — an admin table anyone can INSERT into is not
-- an admin table, and one anyone can TRUNCATE is not one either.

REVOKE ALL ON public.admin_users FROM anon, authenticated;
GRANT SELECT ON public.admin_users TO authenticated;

-- -----------------------------------------------------------------------------
-- STEP 2 — remove TRUNCATE everywhere it is not needed
-- -----------------------------------------------------------------------------
-- 007 did this for the tables that existed then. Repeated so it also covers
-- admin_users and anything else added since. Nothing in this application ever
-- truncates a table; the admin UI deletes rows individually.

REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- -----------------------------------------------------------------------------
-- STEP 3 — stop new tables being born public
-- -----------------------------------------------------------------------------
-- Default privileges are per-granting-role, so this covers objects created by
-- `postgres` — which is what the SQL editor and every migration in this folder
-- run as.
--
-- NOTE: Supabase also maintains a default ACL owned by `supabase_admin`, which
-- `postgres` cannot alter. Objects created by Supabase's own internals may
-- still arrive with grants attached. The verification query below is the check
-- that matters; run it after any schema change.
--
-- After this, a new table has NO anon/authenticated access until a migration
-- grants it deliberately. That is the correct default: access should be a
-- decision, not an inheritance.

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES    FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

-- -----------------------------------------------------------------------------
-- STEP 4 — restore the one sequence grant the public site needs
-- -----------------------------------------------------------------------------
-- STEP 3 changes only FUTURE objects, but 007 granted anon USAGE on all
-- sequences for booking inserts. `bookings.id` is a uuid with a
-- `uuid_generate_v4()` default and needs no sequence at all, and no other anon
-- insert path exists, so that grant is withdrawn rather than preserved.
--
-- If a future table gives anon INSERT on a serial column, grant USAGE on that
-- one sequence explicitly. Never re-grant across the whole schema.

REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

COMMIT;


-- =============================================================================
-- VERIFICATION — run after COMMIT
-- =============================================================================
--
-- 1. admin_users: expect exactly one row — authenticated | SELECT.
--
--   SELECT grantee, string_agg(DISTINCT privilege_type, ',' ORDER BY privilege_type) AS privs
--   FROM information_schema.role_table_grants
--   WHERE table_schema = 'public' AND table_name = 'admin_users'
--     AND grantee IN ('anon', 'authenticated')
--   GROUP BY grantee;
--
-- 2. Nobody holds TRUNCATE. Expect ZERO rows.
--
--   SELECT table_name, grantee, privilege_type
--   FROM information_schema.role_table_grants
--   WHERE table_schema = 'public'
--     AND grantee IN ('anon', 'authenticated')
--     AND privilege_type IN ('TRUNCATE', 'TRIGGER', 'REFERENCES')
--   ORDER BY table_name;
--
-- 3. The default ACL no longer hands out access. Expect anon and authenticated
--    to be absent from the `postgres`-owned rows.
--
--   SELECT pg_get_userbyid(defaclrole) AS granted_by,
--          defaclobjtype AS objtype,
--          array_to_string(defaclacl, ' | ') AS acl
--   FROM pg_default_acl d JOIN pg_namespace n ON n.oid = d.defaclnamespace
--   WHERE n.nspname = 'public';
--
-- 4. Prove the public site still works — this migration touches grants the
--    front end depends on. Featured properties on the homepage, the listings
--    page, header branding, and a test booking submission must all still work.
--
-- =============================================================================
