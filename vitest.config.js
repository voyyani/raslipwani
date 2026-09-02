import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.jsx',
    // supabaseClient.js throws at import time when these are absent. The global
    // mock only intercepts the `@/utils/supabaseClient` specifier, so any file
    // importing it by relative path loads the real module and takes its whole
    // suite down. These are inert placeholders — no test reaches the network —
    // and they let the suite run on a clean checkout or in CI, where no .env exists.
    env: {
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_KEY: 'test-anon-key'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**'
      ],
      // Ratcheting floor: raise these as coverage grows, never lower them.
      // Phase 3 of ROADMAP.md targets 70%.
      //
      // Set from the real measurement on 2026-09-02 (61.00 lines / 59.92
      // statements / 46.21 functions / 47.06 branches), a couple of points
      // below each so ordinary refactoring does not trip CI while a genuine
      // regression does. They sat at 0 until now, and 0 enforces nothing.
      thresholds: {
        lines: 58,
        functions: 44,
        branches: 45,
        statements: 57
      }
    },
    include: ['**/*.{test,spec}.{js,jsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
