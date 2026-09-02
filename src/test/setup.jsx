import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      pathname: '/admin',
      search: '',
      hash: '',
      state: null
    }),
    useParams: () => ({}),
    // Substitute an in-memory router rather than dropping the router entirely.
    // A passthrough leaves NavLink (and anything else reading router context
    // directly rather than through the mocked hooks above) with a null context,
    // which crashes the render — Header could not be tested at all.
    BrowserRouter: ({ children }) => <actual.MemoryRouter>{children}</actual.MemoryRouter>
    // Link is deliberately NOT stubbed: with real router context the genuine
    // component renders the same anchor and resolves `to` correctly.
  };
});

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

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});
