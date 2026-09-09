import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import AuthButtons from './AuthButtons';
import { useSettings } from '../hooks/useSettings';
import GlassPanel from './ui/GlassPanel';
import DesktopNav from './header/DesktopNav';
import MobileMenu from './header/MobileMenu';

/**
 * The site header: the brand, the desktop navigation, the auth buttons and the
 * mobile menu.
 *
 * This is the one persistent surface on the site, and it is where glass earns
 * its keep — it is the only thing that genuinely floats over whatever is
 * scrolling beneath it. Three states, and the third is the one that is usually
 * got wrong:
 *
 * 1. **Scrolled, anywhere.** Frosted `subtle` glass with the bright bottom edge.
 *    Content is passing underneath; without a ground the links land on whatever
 *    happens to be there.
 * 2. **At the top of an ordinary page.** No ground at all. The page's own
 *    `surface` is directly behind it, already the right colour, and a frosted
 *    bar over it is a seam for nothing.
 * 3. **At the top of a page whose hero is a photograph.** Also no ground — but
 *    the brand blue and `content-muted` links would then be sitting on an
 *    uncontrolled image. So the header flips to `content-on-media`, exactly as a
 *    `media` glass panel does, and the hero carries a scrim at its top edge for
 *    the header to read against. The old header dodged this by frosting from the
 *    first pixel, which covered the top of every photograph on the site.
 *
 * The outgoing version also carried a "scroll progress" bar that was not a
 * progress bar: it scaled from 0 to 1 the moment `scrollY` passed 10px and then
 * stayed there for the rest of the page. It has been removed rather than fixed —
 * a reading-progress indicator is for long-form reading, and nothing here is.
 */

/**
 * Routes whose first viewport is a full-bleed photograph the header sits on.
 * Everything else has the page's own ground behind the header at scroll zero.
 */
const OVER_MEDIA_ROUTES = new Set(['/']);

/** Past this many pixels there is content under the header, so it needs a ground. */
const FROST_AT = 24;

/**
 * One bar of the mobile menu icon. Three of them, and the only difference is
 * where each sits when the menu is closed.
 */
const BAR = 'absolute left-1/2 top-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current transition-transform duration-fast ease-spring motion-reduce:transition-none';

const Header = ({ scrolled }) => {
  const { logo, siteName, tagline } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const location = useLocation();

  // The prop is the override a test drives the three states from; the listener
  // is what actually runs in a browser. `passive` because this handler never
  // calls `preventDefault`, and saying so keeps scrolling off the main thread's
  // critical path on the mid-range Android this market browses on.
  const isScrolled = scrolled ?? hasScrolled;

  useEffect(() => {
    if (scrolled !== undefined) return undefined;

    const onScroll = () => setHasScrolled(window.scrollY > FROST_AT);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrolled]);

  // Close dropdowns when route changes
  useEffect(() => {
    setOpenDropdown(null);
    setOpenMobileDropdown(null);
  }, [location]);

  // Route, not scroll position: a header that changed between `sticky` and
  // `fixed` at 24px would take its own height out of the document mid-scroll and
  // jump the page. On a media route it is `fixed` for the whole page, and the
  // hero's top padding is what reserves the space it no longer occupies.
  const isMediaRoute = OVER_MEDIA_ROUTES.has(location.pathname);
  const overMedia = isMediaRoute && !isScrolled;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenMobileDropdown(null);
  };

  return (
    <>
      <GlassPanel
        as="header"
        shape="bar"
        tone={isScrolled ? 'subtle' : 'none'}
        className={[
          isMediaRoute ? 'fixed inset-x-0 top-0 z-50' : 'sticky top-0 z-50',
          // Only the material transitions. The condense — padding, logo, type
          // size — lands immediately, because those are layout properties and
          // animating layout on every scroll frame is precisely the cost
          // DESIGN.md caps blur to avoid on a mid-range Android.
          'transition-[background-color,backdrop-filter] duration-base ease-spring',
          'motion-reduce:transition-none',
          isScrolled ? 'py-2' : 'py-4',
          overMedia ? 'text-content-on-media' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="container mx-auto flex items-center justify-between px-4">
          {/* Logo & Brand */}
          <Link to="/" className="group flex items-center gap-3" onClick={closeMenu}>
            <img
              src={logo()}
              alt={`${siteName()} - Premium Real Estate in Kenya`}
              className={`rounded-lg object-cover ${
                isScrolled ? 'h-10 w-10' : 'h-12 w-12 md:h-14 md:w-14'
              }`}
            />
            <div className="flex flex-col">
              <span
                className={`font-display font-semibold tracking-tight ${
                  overMedia ? 'text-content-on-media' : 'text-brand-content'
                } ${isScrolled ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'}`}
              >
                {siteName()}
              </span>
              <span
                className={`hidden text-xs font-medium md:block ${
                  overMedia ? 'text-content-on-media/80' : 'text-content-muted'
                }`}
              >
                {tagline() || 'Premium Real Estate Across Kenya'}
              </span>
            </div>
          </Link>

          <DesktopNav
            openDropdown={openDropdown}
            isScrolled={isScrolled}
            onMedia={overMedia}
            onDropdownChange={setOpenDropdown}
          />

          {/* Right Section - Auth & Mobile Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <AuthButtons />
            </div>

            {/* Mobile Menu Button */}
            {/* The three bars fold into a cross on open. This was framer-motion
                and is now a transform transition: the header is in every first
                load, so an animation library here costs every visitor ~50 kB
                for four moving elements. */}
            <button
              type="button"
              onClick={toggleMenu}
              className={[
                'relative rounded-lg border p-3 lg:hidden',
                'transition-[transform,background-color] duration-fast ease-spring',
                'active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
                overMedia
                  ? 'border-line-media bg-content-on-media/10 hover:bg-content-on-media/20'
                  : 'border-line-strong bg-surface-raised hover:bg-surface-sunken',
              ].join(' ')}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
            >
              <span className="relative block h-6 w-6">
                <span className={`${BAR} ${isMenuOpen ? 'rotate-45' : '-translate-y-[calc(50%+6px)]'}`} />
                <span className={`${BAR} ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                <span className={`${BAR} ${isMenuOpen ? '-rotate-45' : 'translate-y-[calc(6px-50%)]'}`} />
              </span>
            </button>
          </div>
        </div>
      </GlassPanel>

      <MobileMenu
        isOpen={isMenuOpen}
        openMobileDropdown={openMobileDropdown}
        onDropdownChange={setOpenMobileDropdown}
        onClose={closeMenu}
      />
    </>
  );
};

Header.propTypes = {
  /** Overrides the scroll listener. Undefined in the app; set by tests. */
  scrolled: PropTypes.bool,
};

export default Header;
