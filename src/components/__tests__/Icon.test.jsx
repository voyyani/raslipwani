import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '../../test/utils/renderWithProviders';
import Icon, { ICON_NAMES } from '../Icon';

const repoRoot = path.resolve(__dirname, '../../..');

/** Every `.jsx`/`.js` under `src/`, excluding tests. */
function sourceFiles(dir = path.join(repoRoot, 'src'), acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__') sourceFiles(full, acc);
    } else if (/\.jsx?$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

describe('Icon registry', () => {
  it('renders an SVG for every registered name', () => {
    expect(ICON_NAMES.length).toBeGreaterThan(30);

    for (const name of ICON_NAMES) {
      const { container, unmount } = render(<Icon name={name} />);
      expect(container.querySelector('svg'), `<Icon name="${name}"> rendered no svg`).not.toBeNull();
      unmount();
    }
  });

  it('hides decorative icons from assistive technology by default', () => {
    const { container } = render(<Icon name="home" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('exposes an accessible name when one is given', () => {
    const { container } = render(<Icon name="home" label="Home" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', 'Home');
    expect(svg).not.toHaveAttribute('aria-hidden');
  });

  it('renders nothing, and warns, for a name that is not registered', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(<Icon name="not-a-real-icon" />);

    expect(container.querySelector('svg')).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('FontAwesome stays gone', () => {
  // Phase 6.2/5.6. One CSS import emitted 999 kB of icon fonts. Removing it is
  // only durable if re-adding it fails something, so: this.
  afterEach(() => vi.restoreAllMocks());

  it('has no `fa-` class names left in src/', () => {
    const offenders = [];
    for (const file of sourceFiles()) {
      const source = fs.readFileSync(file, 'utf8');
      // `Icon.jsx` documents the vocabulary it replaced, in prose.
      if (file.endsWith(path.join('components', 'Icon.jsx'))) continue;
      if (/\bfa[srlbd]?\s+fa-[a-z0-9-]+/.test(source)) {
        offenders.push(path.relative(repoRoot, file));
      }
    }
    expect(offenders).toEqual([]);
  });

  it('does not depend on @fortawesome/fontawesome-free', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    expect(Object.keys(deps).filter((d) => d.startsWith('@fortawesome/'))).toEqual([]);
  });
});

describe('console output stays out of shipping source', () => {
  it('routes diagnostics through the logger, not `console`', () => {
    // The production build drops bare `console.*` (vite.config.js `esbuild.drop`)
    // and `scripts/check-dist-console.mjs` asserts that on the artifact. This
    // catches it earlier, in the source, where the fix is obvious.
    const ALLOWED = [
      path.join('utils', 'logger.js'), // the logger is the console
      path.join('admin', 'DebugPanel.jsx'), // a panel that captures console output
      path.join('components', 'Icon.jsx'), // dev-only registry warning
    ];

    const offenders = [];
    for (const file of sourceFiles()) {
      if (ALLOWED.some((suffix) => file.endsWith(suffix))) continue;
      const source = fs.readFileSync(file, 'utf8');
      for (const [index, line] of source.split('\n').entries()) {
        if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue; // a comment, not a call
        if (/\bconsole\s*\.\s*[a-z]+\s*\(/.test(line)) {
          offenders.push(`${path.relative(repoRoot, file)}:${index + 1}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
