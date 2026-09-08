import { __client as supabase } from '@/services/client';

const ADMIN_USER = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'admin@example.test',
  role: 'authenticated',
};

const ADMIN_SESSION = {
  user: ADMIN_USER,
  access_token: 'test-token',
  expires_at: 4102444800,
};

/**
 * Puts an admin session on the mocked Supabase client.
 *
 * Without this, `AuthContext` resolves `getSession` to `{ session: null }`, the
 * admin chrome renders its signed-out branch, and axe cheerfully reports zero
 * violations on a page that is mostly a spinner. A gate that passes by
 * inspecting nothing is worse than no gate, so every admin axe test calls this
 * first and the suite asserts the surface actually rendered.
 *
 * Note what `isAdmin` actually depends on: `AuthContext.fetchIsAdmin` reads the
 * caller's own row out of the `admin_users` **table** with `.maybeSingle()` —
 * it is not an RPC. RLS restricts that read to `id = auth.uid()`, so a
 * non-admin gets `data: null` rather than an error, and the provider fails
 * closed. Mocking the wrong call here would leave the provider fetching `null`
 * and rendering the "not authorised" branch, which is the failure this comment
 * exists to prevent someone re-introducing.
 */
export function signInAsAdmin() {
  supabase.auth.getSession.mockResolvedValue({
    data: { session: ADMIN_SESSION },
    error: null,
  });

  supabase.auth.onAuthStateChange.mockImplementation((callback) => {
    callback('SIGNED_IN', ADMIN_SESSION);
    return { data: { subscription: { unsubscribe: () => {} } } };
  });

  // `from('admin_users').select('id').eq('id', ...).maybeSingle()` must resolve
  // to a row. The global mock's builder returns `this` for select/eq, so only
  // the terminal `maybeSingle` needs an answer — but it is shared across every
  // table, so answer by table name rather than blanketing all of them.
  const realFrom = supabase.from.getMockImplementation();
  supabase.from.mockImplementation((table) => {
    const builder = realFrom(table);
    if (table === 'admin_users') {
      builder.maybeSingle.mockResolvedValue({ data: { id: ADMIN_USER.id }, error: null });
    }
    return builder;
  });
}

export { ADMIN_USER, ADMIN_SESSION };
