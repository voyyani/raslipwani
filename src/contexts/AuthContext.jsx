import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

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
    console.error('[AuthContext] admin lookup failed:', error.message);
    return false;
  }
  return Boolean(data);
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // Two independent sources feed this state — the one-shot getSession() and the
    // onAuthStateChange stream — and each awaits an async admin lookup before it
    // can commit. Two separate guards are needed, because they fail differently:
    //
    //  1. `sawAuthEvent`: onAuthStateChange is authoritative. Once any auth event
    //     has arrived, the initial getSession() result is stale by definition and
    //     must never be applied — even if it started first and resolves later.
    //  2. `latest`: among auth events, only the newest may commit, so a slow admin
    //     lookup cannot overwrite fresher state.
    //
    // An invocation counter alone is NOT sufficient: getSession() can begin after
    // a sign-out event and would then hold the higher ticket, restoring
    // isAdmin=true for a signed-out user.
    let sawAuthEvent = false;
    let latest = 0;

    const applySession = async (nextSession, { fromAuthEvent }) => {
      if (!active) return;
      if (!fromAuthEvent && sawAuthEvent) return;
      if (fromAuthEvent) sawAuthEvent = true;

      const ticket = ++latest;
      const nextIsAdmin = await fetchIsAdmin(nextSession?.user?.id);

      // Commit session and isAdmin together. Setting session before the await
      // would let a stale call publish a session that disagrees with the
      // isAdmin the newest call goes on to set.
      if (!active || ticket !== latest) return;
      setSession(nextSession);
      setIsAdmin(nextIsAdmin);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) =>
      applySession(data?.session ?? null, { fromAuthEvent: false })
    );

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => { applySession(nextSession ?? null, { fromAuthEvent: true }); }
    );

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
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
