-- =============================================================================
-- 011_close_definer_rpc.sql
-- Date: 2026-09-02
-- Severity: HIGH — an anon-callable write path that survived the lockdown
-- Depends on: nothing. Can be applied immediately, independently of 009.
-- =============================================================================
--
-- WHAT THIS FIXES
--
-- 007 revoked every table grant from `anon` and turned RLS on. Introspection on
-- 2026-09-02 confirmed that worked. It also found a write path that goes around
-- both, because it is not a table:
--
--   public.update_setting(setting_name text, setting_value text, user_id text)
--     SECURITY DEFINER, owned by postgres
--     ACL: =X/postgres | anon=X/postgres | authenticated=X/postgres
--
--   body:  UPDATE admin_settings
--          SET updated_by = user_id, updated_at = NOW();
--
-- Three things are wrong with it at once:
--
--   1. SECURITY DEFINER means it executes as `postgres`, the table owner, so it
--      BYPASSES row level security completely. The policies 007 installed on
--      admin_settings do not apply inside this function.
--   2. EXECUTE is granted to PUBLIC and explicitly to `anon`. The anon key
--      ships in the public JavaScript bundle, and PostgREST exposes every
--      public function at POST /rest/v1/rpc/<name>. So this is callable by
--      anyone on the internet, today.
--   3. The UPDATE has NO WHERE CLAUSE. Every call rewrites `updated_by` and
--      `updated_at` on every row of admin_settings.
--
-- The blast radius is smaller than it first looks — the function only writes
-- those two columns, so it cannot rewrite your business phone or WhatsApp
-- number. But it is an unauthenticated, RLS-bypassing write into a table that
-- 007 was specifically supposed to make read-only for anon, and it also has no
-- `SET search_path`, which is the standard hardening for SECURITY DEFINER.
--
-- `get_setting(text)` has the same exposure and is worse-written: it declares a
-- variable, never assigns it, and returns NULL. It does nothing at all.
--
-- Neither function is called anywhere. Verified 2026-09-02:
--   grep -rn "\.rpc(" src api   →  no matches
--
-- So they are dropped rather than repaired. A SECURITY DEFINER function that no
-- caller needs is pure attack surface.
--
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Drop the two anon-callable SECURITY DEFINER functions
-- -----------------------------------------------------------------------------
-- Signatures are given explicitly so this cannot drop some future overload by
-- accident. IF EXISTS keeps the file re-runnable.

DROP FUNCTION IF EXISTS public.update_setting(text, text, text);
DROP FUNCTION IF EXISTS public.get_setting(text);

-- -----------------------------------------------------------------------------
-- Stop leaving EXECUTE open by default on the trigger helper
-- -----------------------------------------------------------------------------
-- update_updated_at_column() is SECURITY INVOKER and only useful inside a
-- trigger, so this is hygiene rather than a hole. PostgreSQL checks EXECUTE
-- when a trigger is CREATED, not each time it fires, so revoking here does not
-- affect the five triggers already using it.

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Re-assert the intended ACL on is_admin()
-- -----------------------------------------------------------------------------
-- 008 already did this. Repeated because it is the one SECURITY DEFINER
-- function that SHOULD stay callable, and stating it here means a reader of
-- this file sees the whole end state rather than a list of removals.
--
-- It is safe to expose: it takes no arguments, reads one row keyed on
-- auth.uid(), returns a boolean, and pins its search_path.

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

COMMIT;


-- =============================================================================
-- VERIFICATION — run after COMMIT
-- =============================================================================
--
-- 1. Expect exactly one row: is_admin, prosecdef = true.
--    Any other SECURITY DEFINER function in `public` needs the same review.
--
--   SELECT p.proname, p.prosecdef, array_to_string(p.proacl, ' | ') AS acl
--   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--   WHERE n.nspname = 'public' AND p.prosecdef
--   ORDER BY p.proname;
--
-- 2. Prove the endpoint is gone, from outside, with the public anon key.
--    Before this migration it returned 200 and silently wrote to your database.
--    After it, expect 404 (PGRST202: function not found).
--
--   U=$(grep '^VITE_SUPABASE_URL=' .env | cut -d= -f2-)
--   K=$(grep '^SUPABASE_ANON_KEY=' .env | cut -d= -f2-)
--
--   curl -s -X POST "$U/rest/v1/rpc/update_setting" \
--     -H "apikey: $K" -H "Authorization: Bearer $K" \
--     -H "Content-Type: application/json" \
--     -d '{"setting_name":"x","setting_value":"y","user_id":"probe"}'
--
-- 3. Confirm the triggers still fire — update any property from the dashboard
--    and check that updated_at moved.
--
-- =============================================================================
