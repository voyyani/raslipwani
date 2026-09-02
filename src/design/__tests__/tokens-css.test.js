import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { renderTokensCss, OUTPUT_PATH } from '../../../scripts/generate-tokens.mjs';
import { THEMES, tokensFor } from '../tokens';
import { hexToRgb } from '../contrast';

/**
 * The generated stylesheet is what the browser actually paints. If it drifts from
 * `tokens.js`, the contrast test above proves a palette nobody is looking at —
 * which is worse than no test, because it reads as coverage.
 */
describe('src/styles/tokens.css', () => {
  const onDisk = readFileSync(OUTPUT_PATH, 'utf8');

  it('is in sync with src/design/tokens.js', () => {
    expect(
      onDisk,
      'Stale generated CSS. Run `npm run tokens` and commit the result.'
    ).toBe(renderTokensCss());
  });

  it('declares light on :root and dark on .dark, not on a media query', () => {
    // A media-query theme can only offer what the OS says. The provider in 4D
    // needs a class so a visitor can choose light, dark, or system.
    expect(onDisk).toMatch(/^:root \{/m);
    expect(onDisk).toMatch(/^\.dark \{/m);
    expect(onDisk).not.toMatch(/prefers-color-scheme/);
  });

  it('sets color-scheme per theme so native controls follow', () => {
    expect(onDisk).toMatch(/:root \{\n\s+color-scheme: light;/);
    expect(onDisk).toMatch(/\.dark \{\n\s+color-scheme: dark;/);
  });

  it('emits channels, not hex, so Tailwind alpha modifiers work', () => {
    // `bg-surface/80` compiles to `rgb(var(--surface) / 0.8)`, which a hex
    // custom property cannot satisfy.
    expect(onDisk).toMatch(/--surface: \d+ \d+ \d+;/);
    expect(onDisk).not.toMatch(/--surface: #/);
  });

  it.each(THEMES)('carries every %s token', (theme) => {
    const scope = theme === 'light' ? ':root' : '.dark';
    const block = onDisk.split(`${scope} {`)[1].split('}')[0];

    for (const [name, hex] of Object.entries(tokensFor(theme))) {
      expect(block, `${scope} is missing --${name}`).toContain(
        `--${name}: ${hexToRgb(hex).join(' ')};`
      );
    }
  });
});

describe('the global stylesheet consumes the layer', () => {
  const indexCss = readFileSync(resolve('src/index.css'), 'utf8');
  // Assert against rules, not prose: the comment recording *why* the dark block
  // was deleted names the very things the deletion removed.
  const rules = indexCss.replace(/\/\*[\s\S]*?\*\//g, '');

  it('imports the tokens before Tailwind, which resolves against them', () => {
    expect(rules.indexOf("@import './styles/tokens.css'")).toBeLessThan(
      rules.indexOf('@tailwind')
    );
  });

  it('no longer flips the page dark on an OS preference with no layer beneath', () => {
    // The Vite scaffold block set bare `:root` to #242424 under
    // `prefers-color-scheme: dark` while every component still painted itself
    // light, so dark ground leaked behind light cards. It shipped for months.
    expect(rules).not.toMatch(/prefers-color-scheme:\s*dark/);
    expect(rules).not.toContain('#242424');
  });

  it('paints the page from tokens rather than from hardcoded hex', () => {
    expect(rules).toMatch(/background-color: rgb\(var\(--surface\)\)/);
    expect(rules).toMatch(/color: rgb\(var\(--content\)\)/);
  });
});
