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
//   import { __client as supabase } from '@/services/client';
//   supabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: null });
//
// The client is constructed behind `getSupabase()` now (it is fetched
// dynamically, to keep 55 kB of it out of the first load), so the mock hands
// back the same double every service awaits. `__client` is exported so a test
// can still reach that double directly, exactly as it used to reach `supabase`.
vi.mock('@/services/client', () => {
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

  const client = {
      from: vi.fn(queryBuilder),
      rpc: vi.fn().mockResolvedValue({ data: false, error: null }),
      // Realtime. SettingsContext subscribes to admin_settings on mount, so
      // without these any test rendering a page inside SettingsProvider dies
      // on `supabase.channel is not a function` before it asserts anything.
      // The chain returns itself so `.on(...).subscribe()` resolves, and no
      // event is ever delivered — subscriptions are set up under test, not
      // exercised.
      channel: vi.fn(() => {
        const channel = {
          on: vi.fn(() => channel),
          subscribe: vi.fn(() => channel),
          unsubscribe: vi.fn().mockResolvedValue('ok')
        };
        return channel;
      }),
      removeChannel: vi.fn().mockResolvedValue('ok'),
      removeAllChannels: vi.fn().mockResolvedValue([]),
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        signInWithPassword: vi.fn().mockResolvedValue({ data: { session: null, user: null }, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } }
        }))
      }
    };

  return {
    getSupabase: vi.fn(async () => client),
    resetSupabaseClient: vi.fn(),
    __client: client,
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

// jsdom implements no observer APIs, and framer-motion asks for
// IntersectionObserver whenever a component animates into view — which, on
// these pages, is most of them. Without it the component throws during render
// and a test sees an empty tree rather than the interface it meant to assert
// against. A stub that never fires is the right shape here: nothing scrolls
// under test, so the observed elements are simply never in view.
class MockIntersectionObserver {
  constructor(callback, options = {}) {
    this.callback = callback;
    this.root = options.root ?? null;
    this.rootMargin = options.rootMargin ?? '0px';
    this.thresholds = [options.threshold ?? 0].flat();
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver
});
globalThis.IntersectionObserver = MockIntersectionObserver;

// ResizeObserver goes the same way, for the same reason.
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver
});
globalThis.ResizeObserver = MockResizeObserver;
