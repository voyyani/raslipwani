import { describe, it, expect, vi, beforeEach } from 'vitest';

// This one file tests the real module, so it opts out of the global mock.
vi.unmock('@/services/client');

beforeEach(() => vi.resetModules());

describe('getSupabase', () => {
  it('constructs the client once, however many callers ask for it', async () => {
    const createClient = vi.fn(() => ({ from: vi.fn() }));
    vi.doMock('@supabase/supabase-js', () => ({ createClient }));

    const { getSupabase } = await import('../client');
    const [a, b] = await Promise.all([getSupabase(), getSupabase()]);

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });

  it('throws a legible error when the environment is not configured', async () => {
    vi.doMock('@supabase/supabase-js', () => ({ createClient: vi.fn() }));
    vi.stubEnv('VITE_SUPABASE_URL', '');

    const { getSupabase } = await import('../client');
    await expect(getSupabase()).rejects.toThrow(/VITE_SUPABASE_URL/);

    vi.unstubAllEnvs();
  });

  it('does not cache the failure, so a later call can still succeed', async () => {
    // The memo holds a promise. Caching a rejected one would mean a single
    // early call with a missing variable poisoned the client for the whole
    // session — including after a hot reload that fixed the environment.
    const createClient = vi.fn(() => ({ from: vi.fn() }));
    vi.doMock('@supabase/supabase-js', () => ({ createClient }));
    vi.stubEnv('VITE_SUPABASE_URL', '');

    const { getSupabase } = await import('../client');
    await expect(getSupabase()).rejects.toThrow();

    vi.unstubAllEnvs();
    await expect(getSupabase()).resolves.toBeDefined();
  });
});
