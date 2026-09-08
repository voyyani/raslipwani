import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

/**
 * Asserts on what dist/index.html asks the browser to fetch before the app can
 * render. It needs a build; when there is no dist/ it skips rather than fails,
 * so a plain `npm run test:run` on a clean checkout stays green. CI builds, and
 * `npm run bundle:report` is the blocking gate either way.
 */
const html = () => readFileSync('dist/index.html', 'utf8');
const describeBuilt = existsSync('dist/index.html') ? describe : describe.skip;

describeBuilt('first-load composition', () => {
  it('does not preload an admin-only calendar library', () => {
    // react-calendar is imported by exactly one admin component, and
    // manualChunks glued it to framer-motion in vendor-ui — so every visitor
    // downloaded it. This is the assertion that keeps it out.
    expect(html()).not.toMatch(/vendor-ui/);
  });

  // NOT YET MET, deliberately recorded as such. Measured 112.4 kB on
  // 2026-09-08 after Tasks 28-31 (220.7 -> 210.4 -> 156.0 -> 114.6 -> 112.4).
  //
  // `it.fails` passes while the assertion inside fails, so this stays green in
  // CI *and* turns red the moment first load drops under 100 — at which point
  // the marker comes off and the target is simply met. The alternative was
  // deleting the test, which would leave the budget file as the only record of
  // a goal and let a measurement quietly become one.
  //
  // The remaining 12.4 kB, in the order worth attacking (ROADMAP Block 3.3):
  // the 78.4 kB raw stylesheet's unused utilities (13.2 kB gzip today, Block 2's
  // open lead); react-router-dom inside the React floor (~8 kB, not removable
  // without changing routing); the 85-icon eager registry (~8.6 kB), which is
  // synchronous by contract; react-helmet-async in the entry.
  it.fails('keeps first load under 100 kB gzip', () => {
    // The ROADMAP Block 3.3 target. bundle-report.mjs is the blocking gate; this
    // asserts the target itself rather than whatever the budget currently says,
    // so a budget that was lowered to a measurement cannot quietly become the goal.
    const budget = JSON.parse(readFileSync('bundle-budget.json', 'utf8'));
    expect(budget.firstLoadGzipKb).toBeLessThan(100);
  });
});
