import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getSession,
  signIn as signInService,
  signOut as signOutService,
  requestPasswordReset,
  onAuthStateChange,
  checkAdminUser,
} from '@/services/auth';

const AuthContext = createContext(null);

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
      const nextIsAdmin = await checkAdminUser(nextSession?.user?.id);

      // Commit session and isAdmin together. Setting session before the await
      // would let a stale call publish a session that disagrees with the
      // isAdmin the newest call goes on to set.
      if (!activeRef.current || ticket !== latestRef.current) return;
      setSession(nextSession);
      setIsAdmin(nextIsAdmin);
      setLoading(false);
    };

    getSession()
      .then((nextSession) => applySession(nextSession, { fromAuthEvent: false }))
      // Without this, a rejected getSession leaves loading=true forever and
      // ProtectedRoute spins with no way out. Fail closed: treat it as no session.
      .catch(() => applySession(null, { fromAuthEvent: false }));

    // The client is fetched on demand, so the subscription arrives
    // asynchronously: a fast unmount can resolve after this cleanup has run,
    // which would leave the auth listener attached to a dead provider.
    let unsubscribe;
    let cancelled = false;

    onAuthStateChange(
      (_event, nextSession) => { applySession(nextSession ?? null, { fromAuthEvent: true }); }
    ).then((stop) => {
      if (cancelled) stop();
      else unsubscribe = stop;
    });

    return () => {
      activeRef.current = false;
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    try {
      await signInService({ email, password });
      return { error: null };
    } catch (err) {
      // Unwrap the service's ServiceError back to the original Supabase
      // error, so callers (AdminLogin.jsx renders `error.message`) see the
      // same text as before the service layer wrapped it.
      return { error: err.cause ?? err };
    }
  }, []);

  const signOut = useCallback(async () => {
    let error = null;
    try {
      await signOutService();
    } catch (err) {
      error = err.cause ?? err;
    }

    // Claim a fresh ticket so any admin lookup still in flight — e.g. from a
    // TOKEN_REFRESHED event that fired just before this click — loses its race
    // and cannot re-commit the old session after we clear it. Without this,
    // the admin shell can reappear for a signed-out user until SIGNED_OUT lands.
    latestRef.current += 1;

    setSession(null);
    setIsAdmin(false);
    return { error };
  }, []);

  const resetPassword = useCallback(async (email) => {
    try {
      await requestPasswordReset(email, { redirectTo: `${window.location.origin}/admin/login` });
      return { error: null };
    } catch (err) {
      return { error: err.cause ?? err };
    }
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
