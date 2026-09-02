import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from './Header';
import Footer from './Footer';

/** Where the site is served from. Canonical URLs must be absolute. */
const SITE_ORIGIN = 'https://raslipwani.co.ke';

/**
 * The chrome every public page shares, mounted once by the router.
 *
 * ## Why this is not tidying
 *
 * Each page used to render its own `<Header />` and `<Footer />`. Because the
 * router swaps the whole element on navigation, the header **unmounted and
 * remounted on every single route change** — and `Header.jsx` registers a
 * `scroll` listener in a mount effect to drive its sticky/condensed state. Every
 * navigation therefore tore that listener down, rebuilt it, and reset
 * `isScrolled` to `false`, so a visitor who scrolled down and clicked a nav link
 * landed with the header in its unscrolled state. Hoisting the chrome above the
 * `<Outlet />` means it mounts once per session and the listener survives.
 *
 * It also removes eleven duplicated render sites, which is eleven fewer places
 * for Release 4's theming work to reach.
 *
 * ## The canonical tag
 *
 * `DynamicSEO` emits `<link rel="canonical" href="https://raslipwani.co.ke">` —
 * unconditionally, on every route. A canonical tag naming a *different* URL than
 * the page it appears on tells search engines the page is a duplicate of the
 * homepage and should not be indexed in its own right. Every property listing,
 * every service page and both statutory pages carried it. Emitting a
 * route-aware canonical here fixes that for the whole public tree at once.
 *
 * React Helmet resolves duplicate tags last-one-wins, and this renders below
 * `DynamicSEO` in the tree, so this tag is the one that ships.
 *
 * ## What pages still own
 *
 * Their `<main>`, including its background and spacing, and their own `<Helmet>`
 * title and description. Only the chrome moved.
 */
const PublicLayout = () => {
  const { pathname } = useLocation();

  // A trailing slash makes `/about/` and `/about` look like two documents.
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '';

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <link rel="canonical" href={`${SITE_ORIGIN}${path}`} />
      </Helmet>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default PublicLayout;
