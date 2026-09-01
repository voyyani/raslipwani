-- =============================================================================
-- 008_admin_users.sql
-- Date: 2026-09-01
-- Establishes admin identity for Supabase Auth, replacing Clerk.
-- Depends on: 007_emergency_lockdown.sql
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.admin_users (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text NOT NULL,
  role       text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'agent')),
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_users IS
  'Authorization source of truth. Rows are provisioned manually via the '
  'Supabase dashboard — there is deliberately no self-service signup path.';

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- The anon role has no business here at all.
REVOKE ALL ON public.admin_users FROM anon;
GRANT SELECT ON public.admin_users TO authenticated;

-- A signed-in user may read only their own row. Writes are service_role only,
-- which means the Supabase dashboard, never the application.
DROP POLICY IF EXISTS "users read own admin row" ON public.admin_users;
CREATE POLICY "users read own admin row"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- SECURITY DEFINER lets this bypass the SELECT policy above, so a policy that
-- calls is_admin() does not recurse into admin_users' own RLS.
-- search_path is pinned to defeat search-path hijacking.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid());
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

COMMIT;
