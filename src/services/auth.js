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
