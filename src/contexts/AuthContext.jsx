import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';

import { logger } from '../utils/logger';
const AuthContext = createContext(null);

/**
 * Reads the caller's own admin_users row. RLS restricts this to `id = auth.uid()`,
 * so a non-admin simply gets no row back rather than an error.
 */
async function fetchIsAdmin(userId) {
  if (!userId) return false;
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    // Fail closed. A lookup failure must never be read as "is an admin".
    logger.error('[AuthContext] admin lookup failed:', error.message);
    return false;
  }
  return Boolean(data);
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Two independent sources feed this state — the one-shot getSession() and the
  // onAuthStateChange stream — and each awaits an async admin lookup before it can
  // commit. Two guards are needed, because they fail differently:
  //
  //  1. `sawAuthEventRef`: onAuthStateChange is authoritative. Once any auth event
  //     has arrived, the initial getSession() result is stale by definition and must
  //     never be applied, even if it started first and resolves later. An invocation
  //     counter alone is NOT sufficient here: getSession() can begin after a sign-out
  //     and would then hold the higher ticket, restoring isAdmin=true.
  //  2. `latestRef`: among auth events, only the newest may commit, so a slow admin
  //     lookup cannot overwrite fresher state.
  //
  // These are refs rather than useEffect-local variables so that signOut() can bump
  // the ticket too. As closure variables they were unreachable from signOut, which
  // let an in-flight lookup re-commit the old session right after signOut cleared it.
  const activeRef = useRef(true);
  const sawAuthEventRef = useRef(false);
  const latestRef = useRef(0);

  useEffect(() => {
    activeRef.current = true;

    const applySession = async (nextSession, { fromAuthEvent }) => {
      if (!activeRef.current) return;
      if (!fromAuthEvent && sawAuthEventRef.current) return;
      if (fromAuthEvent) sawAuthEventRef.current = true;

      const ticket = ++latestRef.current;
      const nextIsAdmin = await fetchIsAdmin(nextSession?.user?.id);

      // Commit session and isAdmin together. Setting session before the await
      // would let a stale call publish a session that disagrees with the
      // isAdmin the newest call goes on to set.
      if (!activeRef.current || ticket !== latestRef.current) return;
      setSession(nextSession);
      setIsAdmin(nextIsAdmin);
      setLoading(false);
    };

    supabase.auth.getSession()
      .then(({ data }) => applySession(data?.session ?? null, { fromAuthEvent: false }))
      // Without this, a rejected getSession leaves loading=true forever and
      // ProtectedRoute spins with no way out. Fail closed: treat it as no session.
      .catch(() => applySession(null, { fromAuthEvent: false }));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => { applySession(nextSession ?? null, { fromAuthEvent: true }); }
    );

    return () => {
      activeRef.current = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    // Claim a fresh ticket so any admin lookup still in flight — e.g. from a
    // TOKEN_REFRESHED event that fired just before this click — loses its race
    // and cannot re-commit the old session after we clear it. Without this,
    // the admin shell can reappear for a signed-out user until SIGNED_OUT lands.
    latestRef.current += 1;

    setSession(null);
    setIsAdmin(false);
    return { error: error ?? null };
  }, []);

  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`
    });
    return { error: error ?? null };
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    isAdmin,
    loading,
    signIn,
    signOut,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
