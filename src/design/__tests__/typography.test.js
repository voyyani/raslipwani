import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
const tailwind = readFileSync(resolve(ROOT, 'tailwind.config.js'), 'utf8');

/**
 * The font strategy is a performance decision as much as a visual one, so it is
 * asserted rather than trusted.
 *
 * A render-blocking font stylesheet is one of the few things that can regress
 * first paint without moving any number CI already watches: `bundle-budget.json`
 * counts the JavaScript and CSS this app ships, not a third-party stylesheet in
 * <head>. Nothing else here would notice it coming back.
 */
describe('font strategy', () => {
  it('ships no render-blocking font stylesheet', () => {
    const links = html.match(/<link[^>]+fonts\.googleapis\.com[^>]*>/gs) ?? [];

    expect(links.length, 'expected the Poppins link to still be present').toBeGreaterThan(0);

    for (const link of links) {
      // Either it is deferred (media=print, promoted onload) or it is the
      // <noscript> fallback, which by definition cannot block a scripted render.
      const deferred = /media=["']print["']/.test(link);
      const inNoscript = html.includes('<noscript>') &&
        html.indexOf('<noscript>') < html.indexOf(link) &&
        html.indexOf(link) < html.indexOf('</noscript>');

      expect(
        deferred || inNoscript,
        `Font stylesheet must not block render:\n${link}`
      ).toBe(true);
    }
  });

  it('asks for only the display weight', () => {
    // 400/500/600/700 existed to set body copy. Body copy is the system face now,
    // so three of those four weights were being downloaded for nothing.
    expect(html).toMatch(/family=Poppins:wght@600/);
    expect(html).not.toMatch(/wght@400;500;600;700/);
  });

  it('leads the sans stack with the system face', () => {
    expect(tailwind).toMatch(/-apple-system/);
    expect(tailwind).toMatch(/BlinkMacSystemFont/);
  });

  it('keeps Poppins as a display face only, never as the body face', () => {
    const sansStack = tailwind.match(/sans:\s*\[([^\]]+)\]/s)?.[1] ?? '';

    expect(sansStack, 'sans stack should not contain Poppins').not.toMatch(/Poppins/);
    expect(tailwind).toMatch(/display:\s*\[[^\]]*Poppins/s);
  });
});
