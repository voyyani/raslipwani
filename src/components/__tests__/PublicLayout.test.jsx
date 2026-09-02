import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// `src/test/setup.jsx` mocks `useLocation` globally to a fixed `/admin`, which
// is right for the admin components it was written for and wrong for anything
// route-aware: with it in place this layout would report the same canonical on
// every route, and the bug this suite exists to catch would be invisible. Undo
// it here — the real hook, reading the MemoryRouter each test supplies.
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}) };
});

// Header and Footer read branding from SettingsContext, and Header renders
// AuthButtons. Neither is what this suite is about — it is about how many times
// the chrome mounts — so both are stubbed down to something countable.
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

const headerMounts = vi.fn();
const footerMounts = vi.fn();

// Named, not anonymous: `react-hooks/rules-of-hooks` identifies components by
// an uppercase name, and an arrow function assigned to `default` has none.
vi.mock('../Header', () => {
  const HeaderStub = () => {
    React.useEffect(() => {
      headerMounts();
    }, []);
    return <header data-testid="header">header</header>;
  };
  return { default: HeaderStub };
});

vi.mock('../Footer', () => {
  const FooterStub = () => {
    React.useEffect(() => {
      footerMounts();
    }, []);
    return <footer data-testid="footer">footer</footer>;
  };
  return { default: FooterStub };
});

const { default: PublicLayout } = await import('../PublicLayout');

const repoRoot = path.resolve(__dirname, '../../..');

function renderAt(route) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<main>home</main>} />
            <Route path="/about" element={<main>about</main>} />
            <Route path="/properties/:id" element={<main>detail</main>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('PublicLayout', () => {
  beforeEach(() => {
    headerMounts.mockClear();
    footerMounts.mockClear();
  });

  it('renders the chrome around the routed page', () => {
    renderAt('/');

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('home')).toBeInTheDocument();
  });

  it('renders exactly one header and one footer', () => {
    renderAt('/about');

    expect(screen.getAllByTestId('header')).toHaveLength(1);
    expect(screen.getAllByTestId('footer')).toHaveLength(1);
  });

  it('emits a canonical for the route being viewed, not the homepage', async () => {
    // The defect this replaced: DynamicSEO wrote a homepage canonical on every
    // route, which tells a crawler that /about is a duplicate of / and should
    // not be indexed on its own.
    renderAt('/about');

    await vi.waitFor(() => {
      const canonical = document.head.querySelector('link[rel="canonical"]');
      expect(canonical).not.toBeNull();
      expect(canonical.getAttribute('href')).toBe('https://raslipwani.co.ke/about');
    });
  });
});

describe('the chrome lives in the layout route, not in pages', () => {
  // Phase 4.3. Header.jsx registers a `scroll` listener in a mount effect; while
  // each page rendered its own <Header />, the router replaced that element on
  // every navigation, tearing the listener down and resetting sticky state. The
  // guarantee is structural — no page may render the chrome itself — so that is
  // what this asserts.
  it('has no <Header /> or <Footer /> outside the layout and the admin shell', () => {
    const ALLOWED = [
      path.join('components', 'PublicLayout.jsx'), // the layout route itself
      path.join('admin', 'AdminLayout.jsx'), // the admin shell has its own chrome
    ];

    const offenders = [];
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__') walk(full);
        } else if (/\.jsx$/.test(entry.name)) {
          if (ALLOWED.some((suffix) => full.endsWith(suffix))) continue;
          const source = fs.readFileSync(full, 'utf8');
          if (/<(Header|Footer)\s*\/>/.test(source)) {
            offenders.push(path.relative(repoRoot, full));
          }
        }
      }
    };
    walk(path.join(repoRoot, 'src'));

    expect(offenders).toEqual([]);
  });

  it('gives every public page a <main> landmark', () => {
    // The chrome moved out; the landmark had to move in. Two pages
    // (International, UNHousing) never had one at all.
    const pages = [
      'src/pages/Home.jsx',
      'src/pages/Properties.jsx',
      'src/pages/PropertyDetail.jsx',
      'src/pages/About.jsx',
      'src/pages/Contact.jsx',
      'src/pages/ServicesMain.jsx',
      'src/pages/International.jsx',
      'src/pages/UNHousing.jsx',
      'src/components/LegalLayout.jsx',
      'src/components/services/ViewingExperience.jsx',
    ];

    const missing = pages.filter(
      (p) => !/<main[\s>]/.test(fs.readFileSync(path.join(repoRoot, p), 'utf8'))
    );
    expect(missing).toEqual([]);
  });
});
