import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { supabase } from '@/utils/supabaseClient';
import { AuthProvider, useAuth } from '../AuthContext';

function Probe() {
  const { loading, user, isAdmin, signIn, signOut } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="email">{user?.email ?? 'none'}</span>
      <span data-testid="isAdmin">{String(isAdmin)}</span>
      <button onClick={() => signIn('a@b.com', 'pw')}>in</button>
      <button onClick={() => signOut()}>out</button>
    </div>
  );
}

const renderProbe = () => render(<AuthProvider><Probe /></AuthProvider>);

const sessionFor = (email) => ({
  user: { id: 'user-uuid-1', email },
  access_token: 'token'
});

beforeEach(() => {
  vi.clearAllMocks();
  supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
  supabase.auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } }
  });
});

describe('AuthContext', () => {
  it('starts loading, then settles to no user when there is no session', async () => {
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('email')).toHaveTextContent('none');
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('false');
  });

  it('exposes the user and sets isAdmin true when an admin_users row exists', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: sessionFor('admin@raslipwani.co.ke') }, error: null
    });
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'user-uuid-1' }, error: null })
    });

    renderProbe();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('email')).toHaveTextContent('admin@raslipwani.co.ke');
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('true');
  });

  it('sets isAdmin false when the user has no admin_users row', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: sessionFor('nobody@example.com') }, error: null
    });
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
    });

    renderProbe();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('email')).toHaveTextContent('nobody@example.com');
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('false');
  });

  it('signIn forwards credentials to supabase and returns the error on failure', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: null }, error: { message: 'Invalid login credentials' }
    });

    let result;
    function Caller() {
      const { signIn } = useAuth();
      return <button onClick={async () => { result = await signIn('a@b.com', 'pw'); }}>go</button>;
    }
    render(<AuthProvider><Caller /></AuthProvider>);

    await act(async () => { screen.getByText('go').click(); });

    expect(supabase.auth.signInWithPassword)
      .toHaveBeenCalledWith({ email: 'a@b.com', password: 'pw' });
    expect(result.error.message).toBe('Invalid login credentials');
  });

  it('signOut calls supabase and clears the session', async () => {
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    await act(async () => { screen.getByText('out').click(); });

    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(screen.getByTestId('email')).toHaveTextContent('none');
  });

  it('unsubscribes from auth changes on unmount', async () => {
    const unsubscribe = vi.fn();
    supabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe } } });

    const { unmount } = renderProbe();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('throws a helpful error when useAuth is used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/useAuth must be used within an AuthProvider/);
    spy.mockRestore();
  });
});
