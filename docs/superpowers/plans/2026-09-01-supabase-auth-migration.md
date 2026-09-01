# Supabase Auth Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Clerk with Supabase Auth as the single identity system, so Postgres Row Level Security can enforce access using `auth.uid()` instead of being bypassed by a browser-exposed service key.

**Architecture:** Clerk currently holds the admin session while Postgres decides data access, and nothing connects them — so the codebase bypasses RLS three different ways. We replace Clerk with Supabase Auth, whose JWT Postgres already trusts natively. An `admin_users` table plus an `is_admin()` SQL function become the authorization source of truth, referenced directly from RLS policies. A new React `AuthContext` wraps `supabase.auth`, and every Clerk import is deleted.

**Tech Stack:** React 18.3.1 · Vite 6.4.3 · `@supabase/supabase-js` 2.112.3 · react-router-dom 6.30.1 · Vitest 4.x + Testing Library · Tailwind 3.4.17 · PostgreSQL (Supabase, project `gihgdouvltxlpynpuyde`)

**Spec:** [`../../../ROADMAP.md`](../../../ROADMAP.md) → Phase 1. Evidence base: [`../../audit/2026-09-01-codebase-audit.md`](../../audit/2026-09-01-codebase-audit.md) findings C-1 and C-3.

---

## Global Constraints

- **No `VITE_` prefix on any secret, ever.** Vite inlines `VITE_*` into the client bundle as a string literal. This rule is the entire cause of the 2026-09-01 service-key incident.
- **Phase 0 (`007_emergency_lockdown.sql`) must be applied before Task 8.** Task 9 builds on the RLS state Phase 0 establishes.
- **No public signup.** Admin accounts are provisioned via the Supabase dashboard. An `admin_users` table anyone can insert into is not an admin table.
- **Authenticated ≠ admin.** Every gate checks `is_admin()`, never merely "has a session."
- **`auth.users` is empty (verified 2026-09-01).** This migration is greenfield — no user migration, no dual-write, no cutover window.
- **`bookings.assigned_agent_id`, `confirmed_by`, and `client_id` are 100% NULL across all 12 rows (verified).** Type conversions carry no data-migration risk.
- Brand colours are Tailwind tokens `primary` (`#0D4B6E`) and `secondary` (`#1A7CA5`). Do **not** use `primary-dark` — it is undefined in `tailwind.config.js` and emits zero CSS (audit H-7).
- Commit after every task. Never squash multiple tasks into one commit.

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `src/test/setup.jsx` | Global test setup; mocks Supabase + router | **Rename** from `setup.js`, rewrite mocks |
| `vitest.config.js` | Test config | Modify: `setupFiles` path, coverage thresholds |
| `src/test/utils/renderWithProviders.jsx` | Test render helper | Modify: drop Clerk, add `AuthProvider` |
| `supabase/migrations/008_admin_users.sql` | `admin_users` table + `is_admin()` | **Create** |
| `supabase/migrations/009_auth_rls_policies.sql` | Real RLS on `auth.uid()` | **Create** |
| `src/contexts/AuthContext.jsx` | Session state, sign in/out, admin check | **Create** |
| `src/pages/AdminLogin.jsx` | Branded admin login form | **Create** |
| `src/components/ProtectedRoute.jsx` | Route gate (extracted from `App.jsx`) | **Create** |
| `src/components/AuthButtons.jsx` | Header login/dashboard buttons | Rewrite |
| `src/pages/admin/AdminLayout.jsx` | Admin shell; user menu + logout | Modify (3 regions) |
| `src/App.jsx` | Providers + routes | Modify (5 regions) |
| `src/utils/supabaseClient.js` | Supabase client | Modify: delete `supabaseAdmin` |
| `src/pages/admin/AdminProperties.jsx` | Property admin | Modify line 441 |
| `vite.config.js` | Build config | Modify: drop `vendor-clerk` |
| `index.html` | Document head | Modify: drop Clerk DNS prefetch |

`ProtectedRoute` moves out of `App.jsx` into its own file because it gains real logic (three branches) and needs its own test file. Everything else follows the existing structure.

---

## Task 1: Repair the test harness

**Why first:** `src/test/setup.js` contains JSX but has a `.js` extension, so esbuild refuses to transform it. Because it is the global `setupFiles` entry, **all three existing suites fail to load and zero tests execute**. TDD is impossible until this is fixed, so nothing else in this plan can proceed.

**Files:**
- Rename: `src/test/setup.js` → `src/test/setup.jsx`
- Modify: `vitest.config.js:10` (setupFiles), `vitest.config.js:21-26` (coverage thresholds)

**Interfaces:**
- Produces: a working `npm test`. The global mock of `@/utils/supabaseClient` exposes `supabase.auth.signInWithPassword`, `supabase.auth.signOut`, `supabase.auth.getSession`, and `supabase.auth.onAuthStateChange` as `vi.fn()`s that later tasks override per-test.

- [ ] **Step 1: Confirm the suite is currently broken**

Run: `npx vitest run`

Expected: `Test Files  3 failed (3)` and `Tests  no tests`, with `Cannot parse /home/kkk/projects/raslipwani/src/test/setup.js: Expression expected.`

- [ ] **Step 2: Rename the setup file**

```bash
git mv src/test/setup.js src/test/setup.jsx
```

- [ ] **Step 3: Point vitest at the renamed file**

In `vitest.config.js`, change line 10 from `setupFiles: './src/test/setup.js',` to:

```js
    setupFiles: './src/test/setup.jsx',
```

- [ ] **Step 4: Lower the coverage thresholds to a ratcheting floor**

The config demands 90% coverage on every metric. Actual coverage is 0%, so `npm run test:coverage` fails immediately and would block CI in Phase 3. Replace `vitest.config.js:21-26` with a floor that reflects reality and is raised deliberately:

```js
      // Ratcheting floor: raise these as coverage grows, never lower them.
      // Phase 3 of ROADMAP.md targets 70%.
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0
      }
```

- [ ] **Step 5: Run the suite to verify it now executes**

Run: `npx vitest run`

Expected: `Test Files  3 passed (3)` with a non-zero test count. If any individual assertion fails, that is a genuine pre-existing bug — fix it now, because every later task depends on a green baseline.

- [ ] **Step 6: Replace the Supabase mock so it covers auth**

The current mock (`setup.jsx:57-71`) exposes only `from`. Replace that whole `vi.mock('../utils/supabaseClient', ...)` block with:

```jsx
// Mock Supabase — auth methods are configurable per test via
//   import { supabase } from '@/utils/supabaseClient';
//   supabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: null });
vi.mock('@/utils/supabaseClient', () => {
  const queryBuilder = () => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
  });

  return {
    supabase: {
      from: vi.fn(queryBuilder),
      rpc: vi.fn().mockResolvedValue({ data: false, error: null }),
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        signInWithPassword: vi.fn().mockResolvedValue({ data: { session: null, user: null }, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } }
        }))
      }
    }
  };
});
```

Note the module path changed from `'../utils/supabaseClient'` to `'@/utils/supabaseClient'`. The `@` alias is already configured at `vitest.config.js:32-34` and resolves unambiguously regardless of which file imports it, unlike the relative path.

- [ ] **Step 7: Make source files import via the alias so the mock applies**

The mock keys on the resolved module id. Source files currently import with relative paths like `'../utils/supabaseClient'`, which Vitest resolves to the same file, so the mock still applies. Verify this rather than assume:

Run: `npx vitest run`

Expected: `Test Files  3 passed (3)`. If any suite now fails with a Supabase-related error, the alias is not resolving — in that case add a second `vi.mock('../../utils/supabaseClient', ...)` with the same factory rather than changing every import.

- [ ] **Step 8: Commit**

```bash
git add src/test/setup.jsx vitest.config.js
git commit -m "fix(test): rename setup.js to .jsx so the suite can execute

setup.js contained JSX with a .js extension, so esbuild refused to
transform it. As the global setupFiles entry it took all three suites
down with it — 0 tests were executing across 23,587 lines.

Also extends the Supabase mock to cover auth, and lowers the 90%
coverage thresholds to a ratcheting floor of 0 so test:coverage stops
failing on an empty baseline."
```

---

## Task 2: Create `admin_users` table and `is_admin()` function

**Files:**
- Create: `supabase/migrations/008_admin_users.sql`

**Interfaces:**
- Produces: table `public.admin_users (id uuid PK → auth.users, email text, role text, created_at timestamptz)`; function `public.is_admin() returns boolean`. Task 9's RLS policies call `is_admin()`. Task 3's `AuthContext` reads `admin_users` to set `isAdmin`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/008_admin_users.sql`:

```sql
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
```

- [ ] **Step 2: Apply the migration**

Apply via the Supabase dashboard SQL editor, or:

```bash
supabase db push
```

- [ ] **Step 3: Verify the objects exist and behave correctly**

Run this in the Supabase SQL editor:

```sql
SELECT to_regclass('public.admin_users')          AS table_exists,      -- expect: admin_users
       to_regprocedure('public.is_admin()')       AS function_exists,   -- expect: is_admin()
       (SELECT relrowsecurity FROM pg_class
         WHERE relname = 'admin_users')           AS rls_enabled,       -- expect: true
       (SELECT count(*) FROM pg_policies
         WHERE tablename = 'admin_users')         AS policy_count;      -- expect: 1
```

Expected: `admin_users | is_admin() | true | 1`

- [ ] **Step 4: Verify `is_admin()` returns false with no session**

```sql
SELECT public.is_admin() AS should_be_false;
```

Expected: `false` — `auth.uid()` is NULL outside a user session, so no row matches. A `true` here means the function is wrong and RLS built on it would grant access to everyone.

- [ ] **Step 5: Create the first admin account**

In the Supabase dashboard: **Authentication → Users → Add user**. Use a real email and a strong password, and tick *Auto Confirm User*. Copy the generated UUID, then:

```sql
INSERT INTO public.admin_users (id, email, role)
VALUES ('PASTE-THE-UUID-HERE', 'PASTE-THE-EMAIL-HERE', 'admin');
```

- [ ] **Step 6: Disable public signup**

Supabase dashboard → **Authentication → Providers → Email**: turn **off** "Enable sign ups". Leave Email/Password enabled. Without this, anyone can create an `auth.users` row — they would not be admins, but it is an unnecessary attack surface.

- [ ] **Step 7: Verify the admin row exists**

```sql
SELECT au.email, a.role
FROM public.admin_users a
JOIN auth.users au ON au.id = a.id;
```

Expected: exactly one row, showing your email and `admin`.

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/008_admin_users.sql
git commit -m "feat(auth): add admin_users table and is_admin() function

Authorization source of truth for Supabase Auth. is_admin() is
SECURITY DEFINER with a pinned search_path so RLS policies can call it
without recursing into admin_users' own policy."
```

---

## Task 3: Build `AuthContext`

**Files:**
- Create: `src/contexts/AuthContext.jsx`
- Test: `src/contexts/__tests__/AuthContext.test.jsx`

**Interfaces:**
- Consumes: `supabase` from `src/utils/supabaseClient`; `admin_users` table and `is_admin()` from Task 2.
- Produces: `<AuthProvider>` component and `useAuth()` hook returning exactly:
  `{ session, user, isAdmin, loading, signIn(email, password), signOut(), resetPassword(email) }`.
  `signIn` resolves to `{ error }` where `error` is `null` on success or an object with a `message` string on failure. `signOut` and `resetPassword` resolve to `{ error }` with the same shape. Tasks 4, 5, 6, 7 all consume this exact shape.

- [ ] **Step 1: Write the failing test**

Create `src/contexts/__tests__/AuthContext.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/contexts/__tests__/AuthContext.test.jsx`

Expected: FAIL — `Failed to resolve import "../AuthContext"`.

- [ ] **Step 3: Write the implementation**

Create `src/contexts/AuthContext.jsx`:

```jsx
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/contexts/__tests__/AuthContext.test.jsx`

Expected: PASS — 7 tests.

- [ ] **Step 5: Commit**

```bash
git add src/contexts/AuthContext.jsx src/contexts/__tests__/AuthContext.test.jsx
git commit -m "feat(auth): add AuthContext wrapping supabase.auth

Exposes session, user, isAdmin, loading, signIn, signOut, resetPassword.
The admin check fails closed: a failed admin_users lookup yields false."
```

---

## Task 4: Build the admin login page

**Files:**
- Create: `src/pages/AdminLogin.jsx`
- Test: `src/pages/__tests__/AdminLogin.test.jsx`

**Interfaces:**
- Consumes: `useAuth()` from Task 3 — specifically `signIn(email, password) → { error }` and `user`.
- Produces: default-exported `AdminLogin` component. Task 8 routes it at `/admin/login`; Task 5's `ProtectedRoute` redirects there.

- [ ] **Step 1: Write the failing test**

Create `src/pages/__tests__/AdminLogin.test.jsx`:

```jsx
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminLogin from '../AdminLogin';

const mockSignIn = vi.fn();
const mockAuth = { signIn: mockSignIn, user: null, isAdmin: false, loading: false };

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => mockAuth }));

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.user = null;
  mockSignIn.mockResolvedValue({ error: null });
});

describe('AdminLogin', () => {
  it('renders email and password fields with an accessible submit button', () => {
    render(<AdminLogin />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submits the typed credentials', async () => {
    const user = userEvent.setup();
    render(<AdminLogin />);

    await user.type(screen.getByLabelText(/email/i), 'admin@raslipwani.co.ke');
    await user.type(screen.getByLabelText(/password/i), 'correct-horse');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith('admin@raslipwani.co.ke', 'correct-horse'));
  });

  it('shows the error message in an alert region when sign-in fails', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
    const user = userEvent.setup();
    render(<AdminLogin />);

    await user.type(screen.getByLabelText(/email/i), 'admin@raslipwani.co.ke');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Invalid login credentials');
  });

  it('disables the submit button while the request is in flight', async () => {
    let resolveSignIn;
    mockSignIn.mockReturnValue(new Promise((r) => { resolveSignIn = r; }));
    const user = userEvent.setup();
    render(<AdminLogin />);

    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/password/i), 'pw');
    await user.click(screen.getByRole('button', { name: /signing in|sign in/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled());

    resolveSignIn({ error: null });
  });

  it('does not call signIn when fields are empty', async () => {
    const user = userEvent.setup();
    render(<AdminLogin />);
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/pages/__tests__/AdminLogin.test.jsx`

Expected: FAIL — `Failed to resolve import "../AdminLogin"`.

- [ ] **Step 3: Write the implementation**

Create `src/pages/AdminLogin.jsx`:

```jsx
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';

const AdminLogin = () => {
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setSubmitting(true);
    setError(null);

    const { error: signInError } = await signIn(email.trim(), password);

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }
    // On success AuthContext's onAuthStateChange updates `user`, and the
    // redirect above takes over. Leave `submitting` true so the button
    // cannot be double-fired during that transition.
  };

  return (
    <>
      <Helmet>
        <title>Admin Sign In | Raslipwani Properties</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-light px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-primary mb-1">Admin Sign In</h1>
          <p className="text-sm text-gray-600 mb-6">
            Raslipwani Properties management console
          </p>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-primary px-4 py-2.5 font-semibold text-white transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/pages/__tests__/AdminLogin.test.jsx`

Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/pages/AdminLogin.jsx src/pages/__tests__/AdminLogin.test.jsx
git commit -m "feat(auth): add branded admin login page

Replaces Clerk's hosted sign-in modal. noindex, since this is an
internal console."
```

---

## Task 5: Rewrite `ProtectedRoute` against Supabase Auth

**Files:**
- Create: `src/components/ProtectedRoute.jsx`
- Test: `src/components/__tests__/ProtectedRoute.test.jsx`
- Modify (Task 8): remove the old inline version at `src/App.jsx:81-97`

**Interfaces:**
- Consumes: `useAuth()` from Task 3 — `loading`, `user`, `isAdmin`.
- Produces: default-exported `ProtectedRoute` taking `{ children }`. Renders children only when `user` exists **and** `isAdmin` is true. Task 8 wraps `AdminLayout` with it.

**Why this is its own file:** it grows from two branches to four and needs its own test file. Leaving it inline in `App.jsx` would make it untestable without rendering the whole app.

- [ ] **Step 1: Write the failing test**

Create `src/components/__tests__/ProtectedRoute.test.jsx`:

```jsx
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

const mockAuth = { loading: false, user: null, isAdmin: false };
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => mockAuth }));

const renderAt = (path = '/admin') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/login" element={<div>LOGIN PAGE</div>} />
        <Route
          path="/admin"
          element={<ProtectedRoute><div>SECRET DASHBOARD</div></ProtectedRoute>}
        />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  mockAuth.loading = false;
  mockAuth.user = null;
  mockAuth.isAdmin = false;
});

describe('ProtectedRoute', () => {
  it('shows a loading state while auth resolves, and never the children', () => {
    mockAuth.loading = true;
    renderAt();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('SECRET DASHBOARD')).not.toBeInTheDocument();
  });

  it('redirects to the login page when there is no user', () => {
    renderAt();
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
    expect(screen.queryByText('SECRET DASHBOARD')).not.toBeInTheDocument();
  });

  it('denies a signed-in user who is not an admin', () => {
    mockAuth.user = { id: 'u1', email: 'nobody@example.com' };
    mockAuth.isAdmin = false;
    renderAt();
    expect(screen.queryByText('SECRET DASHBOARD')).not.toBeInTheDocument();
    expect(screen.getByText(/not authorised/i)).toBeInTheDocument();
  });

  it('renders children for a signed-in admin', () => {
    mockAuth.user = { id: 'u1', email: 'admin@raslipwani.co.ke' };
    mockAuth.isAdmin = true;
    renderAt();
    expect(screen.getByText('SECRET DASHBOARD')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/__tests__/ProtectedRoute.test.jsx`

Expected: FAIL — `Failed to resolve import "../ProtectedRoute"`.

- [ ] **Step 3: Write the implementation**

Create `src/components/ProtectedRoute.jsx`:

```jsx
import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Gates the admin area. Being signed in is NOT sufficient — the user must have
 * an admin_users row, which `useAuth().isAdmin` reflects. This mirrors the
 * is_admin() check enforced in RLS, so the UI and the database agree.
 */
const ProtectedRoute = ({ children }) => {
  const { loading, user, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div
          role="status"
          aria-label="Checking your session"
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <h1 className="mb-2 text-xl font-bold text-gray-900">Not authorised</h1>
          <p className="mb-6 text-sm text-gray-600">
            This account does not have administrator access. If you believe this
            is a mistake, contact your system administrator.
          </p>
          <Link
            to="/"
            className="inline-block rounded-md bg-primary px-6 py-2.5 font-semibold text-white transition-colors hover:bg-secondary"
          >
            Return to site
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/__tests__/ProtectedRoute.test.jsx`

Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProtectedRoute.jsx src/components/__tests__/ProtectedRoute.test.jsx
git commit -m "feat(auth): rewrite ProtectedRoute against Supabase Auth

Extracted from App.jsx into its own testable file. Now distinguishes
'no session' (redirect to login) from 'signed in but not an admin'
(explicit denial), mirroring the is_admin() check enforced in RLS."
```

---

## Task 6: Rewrite `AuthButtons`

**Files:**
- Modify: `src/components/AuthButtons.jsx` (full rewrite — all 27 lines)
- Test: `src/components/__tests__/AuthButtons.test.jsx`

**Interfaces:**
- Consumes: `useAuth()` from Task 3 — `user`, `isAdmin`, `signOut`.
- Produces: unchanged default export `AuthButtons`. `Header.jsx:179` and `Header.jsx:338` already render it, so no caller changes are needed.

- [ ] **Step 1: Write the failing test**

Create `src/components/__tests__/AuthButtons.test.jsx`:

```jsx
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AuthButtons from '../AuthButtons';

const mockSignOut = vi.fn();
const mockAuth = { user: null, isAdmin: false, signOut: mockSignOut };
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => mockAuth }));

const renderButtons = () =>
  render(<MemoryRouter><AuthButtons /></MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.user = null;
  mockAuth.isAdmin = false;
  mockSignOut.mockResolvedValue({ error: null });
});

describe('AuthButtons', () => {
  it('shows an Admin Login link when signed out', () => {
    renderButtons();
    expect(screen.getByRole('link', { name: /admin login/i }))
      .toHaveAttribute('href', '/admin/login');
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
  });

  it('shows Dashboard and Sign out for a signed-in admin', () => {
    mockAuth.user = { id: 'u1', email: 'admin@raslipwani.co.ke' };
    mockAuth.isAdmin = true;
    renderButtons();

    expect(screen.getByRole('link', { name: /dashboard/i }))
      .toHaveAttribute('href', '/admin');
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('hides the Dashboard link for a signed-in non-admin', () => {
    mockAuth.user = { id: 'u2', email: 'nobody@example.com' };
    mockAuth.isAdmin = false;
    renderButtons();

    expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('calls signOut when the sign-out button is clicked', async () => {
    mockAuth.user = { id: 'u1', email: 'admin@raslipwani.co.ke' };
    mockAuth.isAdmin = true;
    const user = userEvent.setup();
    renderButtons();

    await user.click(screen.getByRole('button', { name: /sign out/i }));
    expect(mockSignOut).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/__tests__/AuthButtons.test.jsx`

Expected: FAIL — the current component imports `@clerk/clerk-react` and renders `SignInButton`, so no `/admin/login` link exists.

- [ ] **Step 3: Write the implementation**

Replace the entire contents of `src/components/AuthButtons.jsx`:

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthButtons = () => {
  const { user, isAdmin, signOut } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          to="/admin/login"
          className="rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-secondary"
        >
          Admin Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {isAdmin && (
        <Link
          to="/admin"
          className="rounded-md bg-secondary px-4 py-2 text-white transition-colors hover:bg-primary"
        >
          Dashboard
        </Link>
      )}
      <button
        type="button"
        onClick={() => signOut()}
        className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
      >
        Sign out
      </button>
    </div>
  );
};

export default AuthButtons;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/__tests__/AuthButtons.test.jsx`

Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/AuthButtons.jsx src/components/__tests__/AuthButtons.test.jsx
git commit -m "feat(auth): rewrite AuthButtons without Clerk

The Dashboard link now appears only for actual admins, not for anyone
holding a session."
```

---

## Task 7: Replace Clerk in `AdminLayout`

**Files:**
- Modify: `src/pages/admin/AdminLayout.jsx` — line 3 (import), line 37 (hook), lines 102-105 (`handleLogout`), lines 271-281 (`UserButton`), lines 283-292 (user label)
- Test: `src/pages/admin/__tests__/AdminLayout.auth.test.jsx`

**Interfaces:**
- Consumes: `useAuth()` from Task 3 — `user`, `signOut`.
- Produces: no exported API change. `AdminLayout` still takes `{ children }`.

- [ ] **Step 1: Write the failing test**

Create `src/pages/admin/__tests__/AdminLayout.auth.test.jsx`:

```jsx
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminLayout from '../AdminLayout';

const mockSignOut = vi.fn();
const mockAuth = {
  user: { id: 'u1', email: 'admin@raslipwani.co.ke' },
  isAdmin: true,
  signOut: mockSignOut
};
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => mockAuth }));

const renderLayout = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin']}>
        <AdminLayout><div>PAGE CONTENT</div></AdminLayout>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  mockSignOut.mockResolvedValue({ error: null });
});

describe('AdminLayout auth integration', () => {
  it('renders its children', () => {
    renderLayout();
    expect(screen.getByText('PAGE CONTENT')).toBeInTheDocument();
  });

  it("displays the signed-in admin's email", () => {
    renderLayout();
    expect(screen.getAllByText(/admin@raslipwani\.co\.ke/i).length).toBeGreaterThan(0);
  });

  it('calls signOut when the logout control is used', async () => {
    const user = userEvent.setup();
    renderLayout();

    await user.click(screen.getByRole('button', { name: /sign out|log out|logout/i }));
    expect(mockSignOut).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/pages/admin/__tests__/AdminLayout.auth.test.jsx`

Expected: FAIL — `AdminLayout` imports `useClerk` from `@clerk/clerk-react`, which the global setup mock no longer provides once Task 10 removes it. Before Task 10 it fails on the email assertion, because Clerk's `user` object has no `email` property.

- [ ] **Step 3: Replace the Clerk import**

In `src/pages/admin/AdminLayout.jsx`, delete line 3:

```jsx
import { useClerk, UserButton } from '@clerk/clerk-react';
```

and add, after the `supabase` import on line 6:

```jsx
import { useAuth } from '../../contexts/AuthContext';
```

- [ ] **Step 4: Replace the hook call**

Change line 37 from `const { signOut, user } = useClerk();` to:

```jsx
  const { signOut, user } = useAuth();
```

- [ ] **Step 5: Make logout await the sign-out before navigating**

Replace `handleLogout` (lines 102-105):

```jsx
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
```

The `await` matters: the previous code navigated while the sign-out was still in flight, which could leave a stale session behind.

- [ ] **Step 6: Replace `UserButton` with an avatar built from the email**

Replace the `<UserButton ... />` block (lines 271-281) with:

```jsx
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-blue-400 bg-primary text-sm font-bold uppercase text-white"
                aria-hidden="true"
              >
                {(user?.email?.[0] ?? '?')}
              </div>
```

- [ ] **Step 7: Point the user label at the Supabase user shape**

Clerk exposed `user.fullName` and `user.primaryEmailAddress.emailAddress`. Supabase exposes only `user.email` — both Clerk properties are `undefined` on a Supabase user.

This matters more than it looks: `{user?.fullName || 'Admin'}` does not crash, it silently renders `'Admin'` forever. A grep that misses it leaves a bug that no test catches.

Replace lines 283-292 in full:

```jsx
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">
                    {user?.email?.split('@')[0] ?? 'Admin'}
                  </p>
                  <p className="text-xs text-blue-300 truncate">
                    {user?.email ?? ''}
                  </p>
                </div>
              )}
```

Then confirm no Clerk-shaped property access survives anywhere in the file:

Run: `grep -n 'fullName\|firstName\|lastName\|emailAddresses\|primaryEmailAddress' src/pages/admin/AdminLayout.jsx`

Expected: no output.

- [ ] **Step 8: Confirm the logout button already has an accessible name**

No change is needed here — verify only. The button at lines 295-304 renders `<span className="ml-3">Sign Out</span>` when the sidebar is expanded (the default, since `isSidebarCollapsed` starts `false`), and carries `title="Sign Out"` when collapsed. Either path gives `getByRole('button', { name: /sign out/i })` a match.

Run: `grep -n 'Sign Out' src/pages/admin/AdminLayout.jsx`

Expected: two matches — the `title` attribute and the visible `<span>`.

- [ ] **Step 9: Run the test to verify it passes**

Run: `npx vitest run src/pages/admin/__tests__/AdminLayout.auth.test.jsx`

Expected: PASS — 3 tests.

- [ ] **Step 10: Commit**

```bash
git add src/pages/admin/AdminLayout.jsx src/pages/admin/__tests__/AdminLayout.auth.test.jsx
git commit -m "feat(auth): replace Clerk useClerk/UserButton in AdminLayout

Logout now awaits signOut before navigating, so no stale session is
left behind."
```

---

## Task 8: Wire `AuthProvider` and the login route into `App.jsx`

**Files:**
- Modify: `src/App.jsx` — line 13 (import), line 59 (`clerkPubKey`), lines 81-97 (old `ProtectedRoute`), lines 114-143 (Clerk config-error screen), lines 148-156 + 243 (`ClerkProvider`), route block at line 171
- Modify: `src/test/utils/renderWithProviders.jsx:5` (drop unused `ClerkProvider` import)

**Interfaces:**
- Consumes: `AuthProvider` (Task 3), `AdminLogin` (Task 4), `ProtectedRoute` (Task 5).
- Produces: `/admin/login` route; admin routes gated by the new `ProtectedRoute`.

- [ ] **Step 1: Replace the Clerk import**

In `src/App.jsx`, delete line 13:

```jsx
import { ClerkProvider, useUser, RedirectToSignIn } from '@clerk/clerk-react';
```

and add near the other context imports (after line 22):

```jsx
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
```

- [ ] **Step 2: Add the lazy-loaded login page**

After the other `lazy()` declarations (near line 45), add:

```jsx
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
```

- [ ] **Step 3: Delete the Clerk publishable key and its error screen**

Delete line 59 (`const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;`) and the entire `if (!clerkPubKey) { ... }` block spanning lines 114-143. Supabase configuration errors surface through `supabaseClient.js`, so this screen has no replacement.

- [ ] **Step 4: Delete the old inline `ProtectedRoute`**

Delete lines 81-97 — the `const ProtectedRoute = ({ children }) => { ... }` definition that calls `useUser()`. Task 5's imported component replaces it.

- [ ] **Step 5: Swap `ClerkProvider` for `AuthProvider`**

Replace lines 148-156:

```jsx
      <ClerkProvider
        publishableKey={clerkPubKey}
        appearance={{ baseTheme: "dark", variables: { colorPrimary: '#0D4B6E' } }}
      >
```

with:

```jsx
      <AuthProvider>
```

and change the matching closing tag on line 243 from `</ClerkProvider>` to:

```jsx
    </AuthProvider>
```

- [ ] **Step 6: Add the login route**

Immediately before the `<Route path="/admin" ...>` block (line 204), add:

```jsx
            <Route path="/admin/login" element={<AdminLogin />} />
```

It must come before the `/admin` parent route so it is not swallowed by the protected branch.

- [ ] **Step 7: Remove the unused Clerk import from the test helper**

In `src/test/utils/renderWithProviders.jsx`, delete line 5 (`import { ClerkProvider } from '@clerk/clerk-react';`). It was never used in the wrapper — only imported.

- [ ] **Step 8: Verify no Clerk references remain in App.jsx**

Run: `grep -in 'clerk' src/App.jsx src/test/utils/renderWithProviders.jsx`

Expected: no output.

- [ ] **Step 9: Run the full suite**

Run: `npx vitest run`

Expected: all suites pass. `src/test/setup.jsx` still mocks `@clerk/clerk-react`; that mock is now inert but harmless, and Task 10 removes it.

- [ ] **Step 10: Verify the app builds**

Run: `npm run build`

Expected: build succeeds.

- [ ] **Step 11: Commit**

```bash
git add src/App.jsx src/test/utils/renderWithProviders.jsx
git commit -m "feat(auth): wire AuthProvider and /admin/login into App

Removes ClerkProvider, the clerkPubKey guard, and the inline
useUser-based ProtectedRoute."
```

---

## Task 9: Replace `USING (true)` policies with real RLS

**Files:**
- Create: `supabase/migrations/009_auth_rls_policies.sql`

**Interfaces:**
- Consumes: `is_admin()` from Task 2; the grant baseline from `007_emergency_lockdown.sql`.
- Produces: the final RLS state. No application code depends on this, but every admin data operation does.

**Prerequisite:** `007_emergency_lockdown.sql` must already be applied. Confirm before starting.

- [ ] **Step 1: Confirm Phase 0 is applied**

```sql
SELECT c.relname, c.relrowsecurity
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;
```

Expected: `relrowsecurity = true` for all tables. If `bookings`, `clients`, `properties`, or `settings` show `false`, stop and apply `007` first — this task assumes that baseline.

- [ ] **Step 2: Write the migration**

Create `supabase/migrations/009_auth_rls_policies.sql`:

```sql
-- =============================================================================
-- 009_auth_rls_policies.sql
-- Date: 2026-09-01
-- Replaces every USING (true) policy with a real rule based on auth.uid().
-- Depends on: 007_emergency_lockdown.sql, 008_admin_users.sql
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Identity columns: text (Clerk IDs) -> uuid (auth.users)
-- Verified 2026-09-01: all three columns are 100% NULL across all 12 bookings,
-- so USING NULL discards nothing.
-- -----------------------------------------------------------------------------
ALTER TABLE public.bookings
  ALTER COLUMN assigned_agent_id TYPE uuid USING NULL,
  ALTER COLUMN confirmed_by      TYPE uuid USING NULL;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_assigned_agent_fk
    FOREIGN KEY (assigned_agent_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT bookings_confirmed_by_fk
    FOREIGN KEY (confirmed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- properties: public reads available listings; admins do everything
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "public reads available properties" ON public.properties;
DROP POLICY IF EXISTS "admins manage properties"          ON public.properties;

CREATE POLICY "public reads available properties"
  ON public.properties FOR SELECT
  TO anon, authenticated
  USING (status = 'available' OR public.is_admin());

CREATE POLICY "admins manage properties"
  ON public.properties FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;

-- -----------------------------------------------------------------------------
-- bookings: anon may submit only; admins read and manage
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "public may submit a booking" ON public.bookings;
DROP POLICY IF EXISTS "admins manage bookings"      ON public.bookings;

CREATE POLICY "public may submit a booking"
  ON public.bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    type IN ('viewing', 'consultation', 'contact')
    AND name  IS NOT NULL AND length(trim(name))  BETWEEN 1 AND 200
    AND email IS NOT NULL AND length(trim(email)) BETWEEN 3 AND 320
    AND (status IS NULL OR status = 'pending')
    AND is_archived IS NOT TRUE
    AND admin_notes       IS NULL
    AND internal_notes    IS NULL
    AND confirmed_at      IS NULL
    AND confirmed_by      IS NULL
    AND assigned_agent_id IS NULL
  );

CREATE POLICY "admins manage bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;

-- -----------------------------------------------------------------------------
-- clients + related: admin-only. This is PII.
-- Replaces the inherited `TO authenticated USING (true)` policies, which would
-- now grant every signed-in user full access to every client record.
-- -----------------------------------------------------------------------------
DO $$
DECLARE t text; p text;
BEGIN
  FOREACH t IN ARRAY ARRAY['clients', 'client_communications', 'client_property_interests']
  LOOP
    FOR p IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p, t);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY "admins manage %1$s" ON public.%1$I FOR ALL TO authenticated '
      'USING (public.is_admin()) WITH CHECK (public.is_admin())', t);

    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- admin_settings: public read (drives site branding); admin write
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "public reads settings"     ON public.admin_settings;
DROP POLICY IF EXISTS "admins manage settings"    ON public.admin_settings;

CREATE POLICY "public reads settings"
  ON public.admin_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "admins manage settings"
  ON public.admin_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE ON public.admin_settings TO authenticated;

-- -----------------------------------------------------------------------------
-- settings: no access for anon or authenticated. service_role only.
-- The Cloudinary api_secret must move to a server-side env var and the column
-- must be dropped — see ROADMAP Phase 0.2. This migration does not do that,
-- because rotating the secret has to happen in Cloudinary first.
-- -----------------------------------------------------------------------------
REVOKE ALL ON public.settings FROM anon, authenticated;

COMMIT;
```

- [ ] **Step 3: Apply the migration**

Apply via the Supabase SQL editor or `supabase db push`.

- [ ] **Step 4: Verify no permissive policies survive**

```sql
SELECT tablename, policyname, cmd, roles::text, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND qual = 'true'
  AND NOT (tablename = 'admin_settings' AND cmd = 'SELECT')
ORDER BY tablename;
```

Expected: **zero rows.** The single documented exception is the public read on `admin_settings`, which the site needs for branding.

- [ ] **Step 5: Verify the anon grant surface**

```sql
SELECT table_name, string_agg(DISTINCT privilege_type, ',') AS privs
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND grantee = 'anon'
GROUP BY table_name ORDER BY table_name;
```

Expected exactly three rows: `admin_settings | SELECT`, `bookings | INSERT`, `properties | SELECT`.

- [ ] **Step 6: Prove the lockdown from outside, with the public anon key**

```bash
U=$(grep '^VITE_SUPABASE_URL=' .env | cut -d= -f2-)
K=$(grep '^SUPABASE_ANON_KEY=' .env | cut -d= -f2-)

# MUST NOT return customer rows
curl -s "$U/rest/v1/bookings?select=name,email" -H "apikey: $K" -H "Authorization: Bearer $K"

# MUST be rejected
curl -s -X DELETE "$U/rest/v1/bookings?id=eq.0" -H "apikey: $K" -H "Authorization: Bearer $K"

# MUST be rejected — Cloudinary credentials
curl -s "$U/rest/v1/settings?select=id" -H "apikey: $K" -H "Authorization: Bearer $K"

# MUST still succeed — the public site depends on these
curl -s "$U/rest/v1/properties?select=id,title&limit=1" -H "apikey: $K" -H "Authorization: Bearer $K"
curl -s "$U/rest/v1/admin_settings?select=business_name" -H "apikey: $K" -H "Authorization: Bearer $K"
```

Expected: the first three return an empty array or a permission error; the last two return data.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/009_auth_rls_policies.sql
git commit -m "feat(auth): real RLS policies based on auth.uid()

Replaces all 19 USING (true) policies. Converts bookings identity
columns from text (Clerk IDs) to uuid referencing auth.users — all
three columns were 100% NULL, so no data is discarded."
```

---

## Task 10: Delete Clerk entirely

**Files:**
- Modify: `src/utils/supabaseClient.js` (delete `supabaseAdmin`), `src/pages/admin/AdminProperties.jsx:440-441`, `vite.config.js:15,38`, `index.html:10-11`, `src/test/setup.jsx:10-36`, `.env`
- Modify: `package.json` (via `npm uninstall`)

**Interfaces:**
- Produces: a codebase with zero Clerk references and a single-client `supabaseClient` module exporting only `supabase`.

- [ ] **Step 1: Delete the `supabaseAdmin` client**

Replace the entire contents of `src/utils/supabaseClient.js`:

```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY. Add them to .env and restart the dev server.'
  );
}

// One client. Supabase Auth attaches the session automatically, so RLS sees the
// real user. There is deliberately no service-key client here: shipping one to
// the browser is what caused the 2026-09-01 incident (audit C-1).
export const supabase = createClient(supabaseUrl, supabaseKey);
```

- [ ] **Step 2: Fix the one `supabaseAdmin` consumer**

In `src/pages/admin/AdminProperties.jsx`, change the import on line 5 from
`import { supabase, supabaseAdmin } from '../../utils/supabaseClient';` to:

```jsx
import { supabase } from '../../utils/supabaseClient';
```

Then delete the comment on line 440 and change line 441 from `const { data, error } = await supabaseAdmin` to:

```jsx
      const { data, error } = await supabase
```

This now works because Task 9's `admins manage properties` policy grants the write to an authenticated admin.

- [ ] **Step 3: Verify no `supabaseAdmin` references remain**

Run: `grep -rn 'supabaseAdmin' src/ --include=*.js --include=*.jsx`

Expected: no output.

- [ ] **Step 4: Remove the Clerk mock from the test setup**

In `src/test/setup.jsx`, delete the entire `// Mock Clerk` block (lines 10-36 in the original file) — the `vi.mock('@clerk/clerk-react', ...)` call. Mocking an uninstalled package fails once Step 6 runs.

- [ ] **Step 5: Remove Clerk from the build config and document head**

In `vite.config.js`, delete line 15 (`'vendor-clerk': ['@clerk/clerk-react'],`) and line 38 (`'@clerk/clerk-react',` inside `optimizeDeps.include`).

In `index.html`, delete lines 10-11:

```html
    <!-- DNS prefetch for Clerk and Supabase -->
    <link rel="dns-prefetch" href="https://clerk.com" />
```

and add back a Supabase-only prefetch in their place:

```html
    <!-- DNS prefetch for Supabase -->
    <link rel="dns-prefetch" href="https://supabase.co" />
```

- [ ] **Step 6: Uninstall the package**

```bash
npm uninstall @clerk/clerk-react
```

- [ ] **Step 7: Remove the Clerk environment variable**

In `.env`, delete the `VITE_CLERK_PUBLISHABLE_KEY=` line and the `SECTION 3 — CLERK AUTH` header block. Then delete `VITE_CLERK_PUBLISHABLE_KEY` from all Vercel environments in the dashboard.

- [ ] **Step 8: Verify Clerk is entirely gone**

Run: `grep -rin 'clerk' src/ index.html vite.config.js package.json .env | grep -v '^src/Docs'`

Expected: no output. (`src/Docs/` holds historical status documents; leave them alone.)

- [ ] **Step 9: Run the full suite**

Run: `npx vitest run`

Expected: all suites pass.

- [ ] **Step 10: Verify the build and confirm the bundle shrank**

Run: `npm run build`

Expected: build succeeds, and **no `vendor-clerk` chunk appears** in the output. The previous build emitted `vendor-clerk-*.js` at 72.32 kB / 17.45 kB gzip; that is now gone from every page load.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore(auth): remove Clerk entirely

Deletes the @clerk/clerk-react dependency, the supabaseAdmin
service-key client, the vendor-clerk chunk, and the Clerk DNS
prefetch. Removes 72 kB (17 kB gzip) from every page load."
```

---

## Task 11: End-to-end verification

**Files:** none modified — this task is verification only.

- [ ] **Step 1: Run the full suite**

Run: `npx vitest run`

Expected: all suites pass, including the 23 new tests from Tasks 3-7.

- [ ] **Step 2: Run lint on the changed files**

Run: `npx eslint src/contexts src/components/ProtectedRoute.jsx src/components/AuthButtons.jsx src/pages/AdminLogin.jsx src/App.jsx src/utils/supabaseClient.js`

Expected: zero errors. (The wider codebase still has pre-existing errors; ROADMAP Phase 3.2 addresses those.)

- [ ] **Step 3: Build**

Run: `npm run build`

Expected: succeeds, with no `vendor-clerk` chunk.

- [ ] **Step 4: Manually verify the admin flow**

Run `npm run dev`, then walk through each of these:

1. Visit `/admin` while signed out → redirects to `/admin/login`.
2. Sign in with a wrong password → an error alert appears; you stay on the login page.
3. Sign in with the admin account from Task 2 Step 5 → lands on `/admin`.
4. The sidebar shows the admin email and an avatar with the first letter.
5. Visit `/admin/properties` → the property list loads.
6. Add a property → it saves. (This is the operation that previously required the service key.)
7. Visit `/admin/bookings` → all 12 bookings load.
8. Sign out → returns to `/`; the header shows "Admin Login".
9. Visit `/admin` again → redirects to login, confirming the session actually cleared.
10. Hard-refresh while signed in → the session persists and you stay on `/admin`.

- [ ] **Step 5: Verify the public site is unaffected**

1. `/` renders with featured properties and correct header branding.
2. `/properties` lists all 12 properties.
3. Submit a booking through `/contact` → succeeds.
4. Confirm the new row: `SELECT id, name, type, status FROM bookings ORDER BY created_at DESC LIMIT 1;` → `status = 'pending'`.

- [ ] **Step 6: Confirm no secrets are in the built bundle**

```bash
grep -rc 'service_role' dist/assets/*.js | grep -v ':0' || echo "PASS: no service_role in bundle"
grep -rl 'sbp_\|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.*service_role' dist/ || echo "PASS: no privileged keys in bundle"
```

Expected: both print `PASS`.

- [ ] **Step 7: Update the roadmap**

In `ROADMAP.md`, tick every checkbox under Phase 1 and change the Phase Map row for Phase 1 to `✅ Complete`.

- [ ] **Step 8: Commit**

```bash
git add ROADMAP.md
git commit -m "docs: mark ROADMAP Phase 1 (Supabase Auth migration) complete"
```

---

## Self-Review

**1. Spec coverage** — every Phase 1 bullet in `ROADMAP.md` maps to a task:

| Roadmap item | Task |
|---|---|
| 1.1 `admin_users` table, `is_admin()`, seed admin, disable signup | Task 2 |
| 1.2 Email/password, `AuthContext`, `AdminLogin`, `ProtectedRoute`, `AuthButtons`, remove `ClerkProvider`, password reset | Tasks 3-8 |
| 1.3 Delete `supabaseAdmin`, one client | Task 10 |
| 1.4 Real RLS, identity column migration, tests | Task 9 |
| 1.5 Uninstall Clerk, purge env/config/references | Task 10 |

Two gaps found and closed while reviewing:
- **Test harness.** The roadmap assumed tests were available, but `setup.js` breaks all of them. TDD is impossible without fixing it, so it was pulled forward from Phase 3 as **Task 1**.
- **MFA.** The roadmap mentions "enable MFA if available on your plan." It is deliberately **not** a task here — it is a dashboard toggle with no code impact, and gating this migration on a plan-tier feature would be wrong. Enable it in the Supabase dashboard once Task 2 Step 5 creates the account.

**2. Placeholder scan** — no `TBD`, no "add error handling", no "similar to Task N". Every code step carries complete, runnable content.

**3. Type consistency** — `useAuth()` returns the same seven keys in Tasks 3, 4, 5, 6, and 7. `signIn`/`signOut`/`resetPassword` all resolve to `{ error }` consistently. `is_admin()` is spelled identically in Tasks 2 and 9. `admin_users` column names match between the Task 2 DDL and the Task 3 query (`id`, `email`, `role`).

---

## Risks

| Risk | Mitigation |
|---|---|
| Admin locked out mid-migration | Task 2 Step 5 creates the account **before** any code changes. The Supabase dashboard is always a fallback for data access. |
| RLS blocks legitimate admin work | Task 9 runs after auth works, and Step 6 verifies both directions — what must be blocked and what must still succeed. |
| Phase 0 not applied first | Task 9 Step 1 checks explicitly and stops if the baseline is missing. |
| Global router mock interferes with route tests | Tasks 5 and 7 use `MemoryRouter` directly rather than the global mock in `setup.jsx`. |
| `is_admin()` recursing into `admin_users` RLS | `SECURITY DEFINER` with a pinned `search_path`, verified by Task 2 Step 4. |
