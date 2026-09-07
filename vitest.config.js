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
      //
      // Ratcheted again after the 4C surface passes, which measured
      // 70.61 lines / 69.78 statements / 57.45 functions / 60.09 branches.
      // The jump is not new test-writing so much as the surface migrations
      // routing four large pages through primitives that already had suites.
      // This crosses the roadmap's 70% line target.
      //
      // Lowered once, deliberately, on 2026-09-06 — the only time this file has
      // moved a floor down, and it needs its reasoning on the record.
      //
      // The axe suite (src/test/a11y) renders six full public pages plus the
      // header and footer. Those pages had no suite of their own, so v8 never
      // counted them; rendering them adds 476 statements to the denominator and
      // executes a first render's worth of them. Measured both ways on the same
      // tree:
      //
      //   without the axe suite   43 files   835 of 1205 statements   69.3%
      //   with the axe suite      52 files  1013 of 1681 statements   60.3%
      //
      // 178 more statements are covered and nine more files are exercised. The
      // percentage fell because the denominator grew faster than the numerator,
      // which is what happens whenever testing reaches previously untested
      // ground — a ratchet on a ratio punishes exactly that. Refusing to lower
      // it here would have meant deleting the accessibility gate to protect a
      // number, which is the tail wagging the dog.
      //
      // Set ~1 point under the new measurement (60.26 statements / 61.22 lines /
      // 50.87 functions / 50.83 branches). The rule is unchanged from here on:
      // this only goes up, and the next block to add tests raises it again.
      //
      // Lowered a SECOND time on 2026-09-06, in the same session and for the
      // same structural reason, which is worth stating plainly rather than
      // quietly re-baselining.
      //
      // Block 2 extended the axe gate over the admin console: five admin pages
      // plus the admin chrome, in both themes. Those pages had no suite of any
      // kind, so v8 had never counted them at all. Rendering them adds 908
      // statements to the denominator and executes a first render's worth.
      // Measured both ways on the same tree:
      //
      //   without the admin axe suite  373 tests  1099 of 1810 statements  60.71%
      //   with the admin axe suite     387 tests  1266 of 2718 statements  46.57%
      //
      // 167 more statements are covered and the admin console is exercised for
      // the first time. The percentage fell because the denominator grew five
      // times faster than the numerator — the standing flaw in ratcheting a
      // *ratio*, and the second time this repo has hit it.
      //
      // The previous entry said "this only goes up from here". That rule was
      // written one measurement too early, and this is the honest correction:
      // a ratio floor cannot survive contact with newly-reached ground, and
      // pretending otherwise would have meant deleting the admin accessibility
      // gate to protect a number — the same trade this file already refused
      // once. What the number now says is true: **admin is almost entirely
      // untested**, which was equally true yesterday and simply invisible.
      //
      // Block 3's data-access layer and decomposition are where this is
      // repaid, because both require tests for the surfaces now being counted.
      // Set ~1 point under the new measurement.
      //
      // Raised at the end of Block 3 Phase 1. The data layer added roughly 110
      // pure unit tests over src/services — no jsdom rendering, no new
      // component or page under test. Unlike the two give-backs above, this
      // moves the numerator without touching the denominator: it does not
      // reach previously-uncounted ground the way the axe suites did, it tests
      // ground that already existed and was already counted as uncovered.
      // That is exactly the shape of test-writing a ratio floor rewards rather
      // than punishes.
      //
      // Measured on 2026-09-07: 52.73% lines / 51.66% statements / 41.48%
      // functions / 43.86% branches. Each floor sits ~1 point under.
      thresholds: {
        lines: 51,
        functions: 40,
        branches: 42,
        statements: 50
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
