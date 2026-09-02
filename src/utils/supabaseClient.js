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
// the browser is what caused the 2026-09-01 incident (audit finding C-1).
// Vite inlines every VITE_* variable into the bundle as a plain string literal,
// so a privileged key behind that prefix is a published key.
export const supabase = createClient(supabaseUrl, supabaseKey);
