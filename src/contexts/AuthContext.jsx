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

    const applySession = async (nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setIsAdmin(await fetchIsAdmin(nextSession?.user?.id));
      if (active) setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => applySession(data?.session ?? null));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => { applySession(nextSession ?? null); }
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
