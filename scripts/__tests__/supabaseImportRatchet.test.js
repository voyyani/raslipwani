import { describe, it, expect } from 'vitest';
import { countDirectImports } from '../supabase-import-ratchet.mjs';

describe('countDirectImports', () => {
  it('counts a file that imports the client by alias', () => {
    const files = { 'src/pages/Home.jsx': "import { supabase } from '@/utils/supabaseClient';" };
    expect(countDirectImports(files)).toEqual(['src/pages/Home.jsx']);
  });

  it('counts a file that imports it by relative path', () => {
    const files = { 'src/pages/Home.jsx': "import { supabase } from '../utils/supabaseClient';" };
    expect(countDirectImports(files)).toEqual(['src/pages/Home.jsx']);
  });

  it('ignores a file that only mentions the client in a comment', () => {
    const files = { 'src/pages/Home.jsx': '// supabaseClient used to live here' };
    expect(countDirectImports(files)).toEqual([]);
  });

  it('ignores a test file, which may configure the mock directly', () => {
    const files = {
      'src/pages/admin/__tests__/AdminBookings.test.jsx':
        "import { supabase } from '@/utils/supabaseClient';",
    };
    expect(countDirectImports(files)).toEqual([]);
  });

  it('ignores a service module, which is allowed to import the client', () => {
    const files = { 'src/services/properties.js': "import { supabase } from '@/utils/supabaseClient';" };
    expect(countDirectImports(files)).toEqual([]);
  });
});
