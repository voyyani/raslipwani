/**
 * The Supabase client, fetched when something first needs it.
 *
 * `@supabase/supabase-js` is 54.9 kB gzip — the largest single asset in the
 * first load, for a library nothing needs before the first paint. A static
 * import puts it in the entry graph no matter which route is open, so this is
 * a dynamic one, memoised.
 *
 * This module is the only place in the app that constructs a client. There is
 * deliberately no service-key client: Vite inlines every VITE_* variable into
 * the bundle as a plain string, so a privileged key behind that prefix is a
 * published key. That is what caused the 2026-09-01 incident (audit finding
 * C-1), and the note is kept here because this file inherited the job.
 *
 * The module this replaced threw at *import* time on a missing variable; this
 * one throws at first use. That is the better failure — a missing variable now
 * fails the query that needed it, with a message, instead of taking down the
 * module graph before React mounts.
 */
let clientPromise = null;

export function getSupabase() {
  if (!clientPromise) {
    // A rejected promise is not memoised: caching it would let one early call
    // with a missing variable poison the client for the rest of the session,
    // including after the hot reload that fixed the environment.
    clientPromise = (async () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_KEY;

      if (!url || !key) {
        throw new Error(
          'Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY. Add them to .env and restart the dev server.'
        );
      }

      const { createClient } = await import('@supabase/supabase-js');
      return createClient(url, key);
    })();

    clientPromise.catch(() => {
      clientPromise = null;
    });
  }

  return clientPromise;
}

/** Test seam: drops the memoised client so a suite can construct a fresh one. */
export function resetSupabaseClient() {
  clientPromise = null;
}
