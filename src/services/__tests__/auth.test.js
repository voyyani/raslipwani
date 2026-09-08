import { describe, it, expect, beforeEach, vi } from 'vitest';
import { __client as supabase } from '@/services/client';
import { getSession, signIn, signOut, onAuthStateChange, isAdmin } from '../auth';
import { ServiceError } from '../unwrap';

beforeEach(() => vi.clearAllMocks());

describe('getSession', () => {
  it('returns the session', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u' } } }, error: null });
    await expect(getSession()).resolves.toEqual({ user: { id: 'u' } });
  });

  it('returns null when there is no session, rather than throwing', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    await expect(getSession()).resolves.toBeNull();
  });
});

describe('signIn', () => {
  it('throws a ServiceError on bad credentials', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: null }, error: { message: 'Invalid login credentials' },
    });
    await expect(signIn({ email: 'a@b.c', password: 'x' })).rejects.toBeInstanceOf(ServiceError);
  });

  it('returns the session on success', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: { user: { id: 'u' } } }, error: null,
    });
    await expect(signIn({ email: 'a@b.c', password: 'x' })).resolves.toEqual({ user: { id: 'u' } });
  });
});

describe('signOut', () => {
  it('throws when sign-out fails, so the UI cannot show a signed-out state that is not real', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: { message: 'network' } });
    await expect(signOut()).rejects.toBeInstanceOf(ServiceError);
  });
});

describe('onAuthStateChange', () => {
  it('hands back an unsubscribe that actually unsubscribes', async () => {
    const unsubscribe = vi.fn();
    supabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe } } });
    // Async since the client is fetched on demand (Task 29).
    const stop = await onAuthStateChange(vi.fn());
    stop();
    expect(unsubscribe).toHaveBeenCalled();
  });
});

describe('isAdmin', () => {
  it('returns what the RPC says', async () => {
    supabase.rpc.mockResolvedValue({ data: true, error: null });
    await expect(isAdmin()).resolves.toBe(true);
  });

  it('returns false rather than throwing when the RPC errors', async () => {
    // A failed admin check must deny, never crash a route guard into an
    // undefined state that renders the console while the answer is pending.
    supabase.rpc.mockResolvedValue({ data: null, error: { message: 'denied' } });
    await expect(isAdmin()).resolves.toBe(false);
  });
});
