import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthButtons from './AuthButtons';
import { useSettings } from '../hooks/useSettings';
import DesktopNav from './header/DesktopNav';
import MobileMenu from './header/MobileMenu';

import Icon from './Icon';

/**
 * The site header: the brand, the desktop navigation, the auth buttons and the
 * mobile menu. The two navigations and the nav data are their own modules
 * (Task 27); what stays here is the shell and the four pieces of state the
 * halves share.
 */
const Header = () => {
  const { logo, siteName, tagline } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when route changes
  useEffect(() => {
    setOpenDropdown(null);
    setOpenMobileDropdown(null);
  }, [location]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenMobileDropdown(null);
  };

  return (
    <>
      <header className={`bg-surface-raised/95 backdrop-blur-md sticky top-0 z-50 transition-all duration-500 ${
        isScrolled ? 'shadow-lg py-2 border-b border-line/80' : 'py-4'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo & Brand */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
            onClick={closeMenu}
          >
            <div className="relative">
              <img
                src={logo()}
                alt={`${siteName()} - Premium Real Estate in Kenya`}
                className={`transition-all duration-500 rounded-xl object-cover border-2 border-primary shadow-lg ${
                  isScrolled ? 'w-10 h-10' : 'w-12 h-12 md:w-14 md:h-14'
                } group-hover:scale-105 group-hover:shadow-xl`}
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success-content rounded-full border-2 border-line-media shadow-sm"></div>
            </div>
            <div className="flex flex-col">
              <h1 className={`font-bold text-primary transition-all duration-500 ${
                isScrolled ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'
              }`}>
                {siteName()}
              </h1>
              <p className="hidden md:block text-xs text-content-muted font-medium">
                {tagline() || 'Premium Real Estate Across Kenya'}
              </p>
            </div>
          </Link>
          

          <DesktopNav
            openDropdown={openDropdown}
            isScrolled={isScrolled}
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
              className="lg:hidden relative p-3 rounded-xl border-2 border-primary bg-surface-raised hover:bg-surface transition-all duration-300 hover:scale-105 active:scale-95 group"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
            >
              <div className="relative w-6 h-6">
                <span
                  className={`absolute top-1/2 left-1/2 w-4 h-0.5 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ${
                    isMenuOpen ? 'rotate-45' : '-translate-y-[calc(50%+6px)]'
                  }`}
                />
                <span
                  className={`absolute top-1/2 left-1/2 w-4 h-0.5 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${
                    isMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute top-1/2 left-1/2 w-4 h-0.5 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ${
                    isMenuOpen ? '-rotate-45' : 'translate-y-[calc(6px-50%)]'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMenuOpen}
        openMobileDropdown={openMobileDropdown}
        onDropdownChange={setOpenMobileDropdown}
        onClose={closeMenu}
      />

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-50">
        <div
          className={`h-full origin-left bg-gradient-to-r from-primary to-brand transition-transform duration-300 ${
            isScrolled ? 'scale-x-100' : 'scale-x-0'
          }`}
        />
      </div>
    </>
  );
};

export default Header;
