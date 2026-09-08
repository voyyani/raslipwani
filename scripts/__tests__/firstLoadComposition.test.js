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
});
