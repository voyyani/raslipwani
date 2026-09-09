import React from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';
import Icon from '../Icon';
import AuthButtons from '../AuthButtons';
import ThemeToggle from '../ui/ThemeToggle';
import { navItems } from './navItems';

const slug = (label) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/**
 * The mobile menu: the backdrop, the sliding panel, the same navigation as the
 * desktop bar with its dropdowns expanded in place, and the contact and social
 * blocks at the foot of it. Moved out of `Header.jsx` (Task 27).
 *
 * The slide-in was framer-motion and is now a CSS transform transition
 * (Task 30). The header is in every first load, so an animation library here
 * cost every visitor ~50 kB for one panel. The panel stays mounted and is
 * hidden with `hidden`, which keeps it out of the accessibility tree and out
 * of the tab order while closed — `AnimatePresence` unmounted it instead, and
 * `aria-controls` pointed at nothing for as long as the menu was shut.
 */
const MobileMenu = ({ isOpen, openMobileDropdown = null, onDropdownChange, onClose }) => (
<>
      {/* Backdrop. `aria-hidden` and not focusable: the panel's own controls
          are the way out, and the click target is a convenience. */}
      <div
        aria-hidden="true"
        hidden={!isOpen}
        className={`fixed inset-0 bg-scrim/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        hidden={!isOpen}
        className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-surface-raised shadow-2xl z-50 lg:hidden overflow-y-auto transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-line bg-gradient-to-r from-primary to-brand text-content-on-media">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src="https://res.cloudinary.com/dzqdxosk2/image/upload/v1751885050/Raslipwani_Logo_qgwaen.jpg"
                alt="Raslipwani Properties"
                className="w-12 h-12 rounded-xl object-cover border-2 border-line-media"
              />
              <div>
                <h2 className="text-lg font-bold">Raslipwani</h2>
                <p className="text-content-on-media/80 text-xs">Properties</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg bg-surface-raised/20 hover:bg-surface-raised/30 transition-colors"
              aria-label="Close menu"
            >
              <Icon name="times" size={20} />
            </button>
          </div>
          
          {/* Quick Contact */}
          <div className="text-xs space-y-1">
            <p>📞 +254 758 066 526</p>
            <p>📧 info@raslipwani.co.ke</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav id="mobile-nav" className="flex flex-col py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            // Handle dropdown menus
            if (item.dropdown) {
              const isDropdownOpen = openMobileDropdown === item.label;
              return (
                <div key={item.label} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    onClick={() => onDropdownChange(isDropdownOpen ? null : item.label)}
                    aria-expanded={isDropdownOpen}
                    aria-controls={`mobile-nav-dropdown-${slug(item.label)}`}
                    className="flex items-center gap-4 px-6 py-5 font-medium transition-all duration-300 group text-content-muted hover:text-primary hover:bg-surface w-full"
                  >
                    <div className="p-2 rounded-lg transition-colors bg-surface-sunken text-content-muted group-hover:bg-primary/10 group-hover:text-primary">
                      <Icon name={item.icon} size={20} />
                    </div>
                    <span className="flex-1 text-left">{item.label}</span>
                    {isDropdownOpen ? (
                      <Icon name="chevron-up" size={20} />
                    ) : (
                      <Icon name="chevron-down" size={20} />
                    )}
                  </button>
                  
                  {/* Dropdown items */}
                  {isDropdownOpen && (
                    <div id={`mobile-nav-dropdown-${slug(item.label)}`} className="bg-surface py-2">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={onClose}
                          className="flex items-center gap-4 px-6 py-3 pl-16 text-content-muted hover:text-primary hover:bg-surface-raised transition-colors"
                        >
                          <span>{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            
            if (item.external) {
              return (
                <div key={item.label} className="border-b border-line last:border-b-0">
                  <a
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="flex items-center gap-4 px-6 py-5 font-medium transition-all duration-300 group text-content-muted hover:text-primary hover:bg-surface"
                  >
                    <div className="p-2 rounded-lg transition-colors bg-surface-sunken text-content-muted group-hover:bg-primary/10 group-hover:text-primary">
                      <Icon name={item.icon} size={20} />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    <Icon name="external-link-alt" size={16} className="text-content-subtle group-hover:text-primary transition-colors" aria-hidden="true" />
                  </a>
                </div>
              );
            }

            // Regular menu items. The active row used to be marked three times
            // over — a tinted ground, a 4px colour bar down the right edge, and
            // a dot. One of those is a state; three is decoration. The ground
            // and the text colour stay; the bar and the dot are gone.
            return (
              <div key={item.label} className="border-b border-line last:border-b-0">
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={`group flex items-center gap-4 px-6 py-5 font-medium transition-colors duration-fast motion-reduce:transition-none ${
                    isActive
                      ? 'bg-brand-subtle text-brand-content'
                      : 'text-content-muted hover:bg-surface hover:text-brand-content'
                  }`}
                >
                  <div className={`rounded-md p-2 transition-colors ${
                    isActive
                      ? 'bg-surface-raised text-brand-content'
                      : 'bg-surface-sunken text-content-muted group-hover:text-brand-content'
                  }`}>
                    <Icon name={item.icon} size={20} />
                  </div>
                  <span className="flex-1">{item.label}</span>
                </NavLink>
              </div>
            );
          })}
        </nav>
        
        {/* Theme, then auth. The header hides its own theme control below `sm`
            rather than crowding the brand, so this is where a phone gets it —
            labelled, because in the panel there is room to say what it does. */}
        <div className="flex items-center justify-between gap-4 border-t border-line px-6 py-4">
          <span className="text-sm font-medium text-content-muted">Theme</span>
          <ThemeToggle />
        </div>

        {/* Auth Section for Mobile */}
        <div className="px-6 py-4 border-t border-line bg-brand-subtle">
          <div className="flex items-center justify-center">
            <AuthButtons />
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="p-6 border-t border-line bg-surface">
          <div className="space-y-3">
            <p className="text-sm text-content-muted text-center mb-4">
              Ready to find your dream property?
            </p>
            
            <Link
              to="/properties"
              onClick={onClose}
              className="block w-full bg-primary hover:bg-primary-dark text-content-on-brand text-center font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              Browse Listings
            </Link>
            
            <Link
              to="/contact"
              onClick={onClose}
              className="block w-full border-2 border-primary text-primary hover:bg-primary hover:text-content-on-brand text-center font-semibold py-3 px-4 rounded-xl transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-4 mt-6 pt-6 border-t border-line">
            {[
              { icon: 'whatsapp', href: 'https://wa.me/254758066526', color: 'hover:text-success-content' },
              { icon: 'instagram', href: 'https://www.instagram.com/raslipwani/', color: 'hover:text-brand-content' },
              { icon: 'facebook', href: 'https://www.facebook.com/raslipwani/', color: 'hover:text-brand' },
              { icon: 'tiktok', href: 'https://www.tiktok.com/@raslipwani0', color: 'hover:text-content' }
            ].map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-content-subtle ${social.color} transition-colors duration-300 text-xl`}
                aria-label={social.icon.split('-')[1]}
              >
                <Icon name={social.icon} />
              </a>
            ))}
          </div>
        </div>
      </div>
</>

);

MobileMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  openMobileDropdown: PropTypes.string,
  onDropdownChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};


export default MobileMenu;
