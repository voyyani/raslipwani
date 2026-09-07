import { supabase } from '@/utils/supabaseClient';
import { ServiceError } from './unwrap';
import { logger } from '@/utils/logger';

const TABLE = 'auth';

function assertOk(error, operation) {
  if (!error) return;
  logger.error(`[auth.${operation}]`, error);
  throw new ServiceError(`${operation} failed: ${error.message}`, {
    table: TABLE,
    operation,
    cause: error,
  });
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  assertOk(error, 'getSession');
  return data?.session ?? null;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  assertOk(error, 'signIn');
  return data?.session ?? null;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  assertOk(error, 'signOut');
}

export async function requestPasswordReset(email, { redirectTo } = {}) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  assertOk(error, 'requestPasswordReset');
}

/** Returns an unsubscribe, so no caller has to know the shape Supabase returns. */
export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => callback(event, session));
  return () => data?.subscription?.unsubscribe?.();
}

/**
 * Reads the caller's own admin_users row. RLS restricts this to `id =
 * auth.uid()`, so a non-admin simply gets no row back rather than an error.
 *
 * Distinct from `isAdmin()` below: that one asks the `is_admin` RPC about the
 * currently authenticated user; this one takes a user id and queries
 * `admin_users` directly, which is what `AuthContext.jsx` needs — it decides
 * whether to trust a session it already has in hand, before any RPC round
 * trip, and must fail closed the same way.
 */
export async function checkAdminUser(userId) {
  if (!userId) return false;
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    // Fail closed. A lookup failure must never be read as "is an admin".
    logger.error('[auth.checkAdminUser]', error.message);
    return false;
  }
  return Boolean(data);
}

/**
 * Deny on failure, never throw.
 *
 * This answer gates a route. A thrown error would leave the guard in an
 * undefined state; `false` is the safe reading of "we could not confirm you are
 * an admin".
 */
export async function isAdmin() {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) {
    logger.error('[auth.isAdmin]', error);
    return false;
  }
  return data === true;
}
