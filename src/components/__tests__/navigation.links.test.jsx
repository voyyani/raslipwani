import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '../../test/utils/renderWithProviders';

// Header/Footer read branding from SettingsContext and Header renders AuthButtons.
// Neither is what this suite is about — it is about where the links point — so both
// are stubbed to keep the assertion on link targets alone.
vi.mock('../../hooks/useSettings', () => ({
  useSettings: () => ({
    loading: false,
    logo: () => '',
    siteName: () => 'Raslipwani Properties',
    tagline: () => 'Test tagline',
    phone: () => '+254700000000',
    email: () => 'info@example.com',
    address: () => 'Nairobi',
    socialMedia: () => ({}),
    serviceLocations: () => ['Nairobi'],
    whatsapp: () => '+254700000000',
  }),
}));

vi.mock('../AuthButtons', () => ({ default: () => null }));

import Header from '../Header';
import Footer from '../Footer';

const repoRoot = path.resolve(__dirname, '../../..');

/**
 * The routing table is declared as JSX in App.jsx, so the only way to compare
 * links against it without booting the whole app is to read the source. Nested
 * <Route path="..."> children (admin) carry no leading slash; they are joined to
 * the nearest preceding absolute path.
 */
function collectRoutePatterns() {
  const source = fs.readFileSync(path.join(repoRoot, 'src/App.jsx'), 'utf8');
  const patterns = [];
  let parent = '';
  for (const match of source.matchAll(/path=(?:"([^"]+)"|\{'([^']+)'\})/g)) {
    const value = match[1] ?? match[2];
    if (value.startsWith('/')) {
      parent = value;
      patterns.push(value);
    } else if (value !== '*') {
      patterns.push(`${parent.replace(/\/$/, '')}/${value}`);
    }
  }
  return patterns;
}

function routeExists(patterns, href) {
  const target = href.split(/[?#]/)[0].replace(/(.)\/$/, '$1');
  return patterns.some((pattern) => {
    const regex = new RegExp(
      `^${pattern
        .split('/')
        .map((segment) => (segment.startsWith(':') ? '[^/]+' : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
        .join('/')}$`
    );
    return regex.test(target);
  });
}

function hrefsIn(container) {
  return Array.from(container.querySelectorAll('a[href]')).map((a) => a.getAttribute('href'));
}

const EXTERNAL_SCHEMES = /^(https?:|mailto:|tel:|#)/;

describe('site navigation links', () => {
  let patterns;

  beforeAll(() => {
    patterns = collectRoutePatterns();
  });

  it('parses the route table from App.jsx', () => {
    expect(patterns).toContain('/');
    expect(patterns).toContain('/properties');
    expect(patterns).toContain('/admin/settings');
  });

  it('every internal Header link resolves to a declared route', () => {
    const { container } = render(<Header />);
    const internal = hrefsIn(container).filter((href) => !EXTERNAL_SCHEMES.test(href));

    expect(internal.length).toBeGreaterThan(0);
    const broken = internal.filter((href) => !routeExists(patterns, href));
    expect(broken).toEqual([]);
  });

  it('every internal Footer link resolves to a declared route', () => {
    const { container } = render(<Footer />);
    const internal = hrefsIn(container).filter((href) => !EXTERNAL_SCHEMES.test(href));

    expect(internal.length).toBeGreaterThan(0);
    const broken = internal.filter((href) => !routeExists(patterns, href));
    expect(broken).toEqual([]);
  });

  it('opens the Nairobuild link in a new tab with a safe rel', () => {
    render(<Header />);
    const link = screen.getByRole('link', { name: /construction/i });

    expect(link).toHaveAttribute('href', 'https://nairobuild.co.ke');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toMatch(/noopener/);
  });

  it('routes the legal pages the footer links to', () => {
    // Mandatory for a business processing personal data under the Kenyan DPA 2019.
    expect(routeExists(patterns, '/privacy')).toBe(true);
    expect(routeExists(patterns, '/terms')).toBe(true);
  });
});
