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
      // Set from the real measurement on 2026-09-02, after Release 4 Slice 4A
      // (62.59 lines / 61.51 statements / 47.14 functions / 48.75 branches),
      // a couple of points below each so ordinary refactoring does not trip CI
      // while a genuine regression does. They sat at 0 until Release 3, and 0
      // enforces nothing.
      // Ratcheted at the end of Release 4 Slice 4B, which measured
      // 63.26 lines / 62.38 statements / 49.45 functions / 49.47 branches.
      // Each floor sits ~1 point under its measurement: enough headroom that
      // ordinary work does not trip CI, tight enough that deleting a suite does.
      thresholds: {
        lines: 62,
        functions: 48,
        branches: 48,
        statements: 61
      }
    },
    include: ['**/*.{test,spec}.{js,jsx}'],
    // '.claude' matters: agent worktrees are checked out at
    // .claude/worktrees/<name>, and each is a full copy of this source. Without
    // it, a developer with a worktree open runs every suite twice — against two
    // different revisions — and the second copy's failures look like real ones.
    exclude: ['node_modules', 'dist', 'coverage', '.claude', '.idea', '.git', '.cache']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
