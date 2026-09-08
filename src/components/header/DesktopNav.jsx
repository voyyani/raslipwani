import React from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Icon from '../Icon';
import { navItems } from './navItems';

const slug = (label) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/**
 * The desktop navigation bar and its dropdowns. Moved out of `Header.jsx`
 * (Task 27) unchanged.
 */
const DesktopNav = ({ openDropdown, isScrolled, onDropdownChange }) => {
  const location = useLocation();

  return (
<nav className="hidden lg:flex items-center space-x-1">
  {navItems.map((item) => {
    
    // Handle dropdown menus
    if (item.dropdown) {
      const isOpen = openDropdown === item.label;
      const menuId = `nav-dropdown-${slug(item.label)}`;

      return (
        <div 
          key={item.label} 
          className="relative"
          onMouseEnter={() => onDropdownChange(item.label)}
          onMouseLeave={() => onDropdownChange(null)}
          onKeyDown={(e) => {
            // Escape closes the menu and puts focus back on the
            // control that opened it, rather than stranding it on a
            // link that has just been unmounted.
            if (e.key === 'Escape' && isOpen) {
              onDropdownChange(null);
              e.currentTarget.querySelector('button')?.focus();
            }
          }}
        >
          <button
            type="button"
            onClick={() => onDropdownChange(isOpen ? null : item.label)}
            aria-expanded={isOpen}
            aria-controls={menuId}
            aria-haspopup="true"
            className="relative font-semibold transition-all duration-300 px-4 py-3 rounded-xl flex items-center gap-2 group text-content-muted hover:text-primary hover:bg-surface/80"
          >
            <Icon name={item.icon} size={16} className={`transition-transform duration-300 ${
              isScrolled ? 'scale-90' : 'scale-100'
            }`} />
            <span className="relative">{item.label}</span>
            <Icon name="chevron-down" size={16} className={`transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`} />
          </button>
          
          {/* Dropdown Menu */}
          {isOpen && (
            <div id={menuId} className="absolute top-full left-0 mt-2 w-56 bg-surface-raised rounded-xl shadow-xl border border-line py-2 z-50">
              {item.dropdown.map((subItem) => (
                <Link
                  key={subItem.path}
                  to={subItem.path}
                  className="block px-4 py-3 text-content-muted hover:text-primary hover:bg-surface transition-colors"
                  onClick={() => onDropdownChange(null)}
                >
                  {subItem.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    // Links that leave the site render as plain anchors — NavLink would
    // treat the URL as an in-app route and never navigate.
    if (item.external) {
      return (
        <div key={item.label} className="relative">
          <a
            href={item.path}
            target="_blank"
            rel="noopener noreferrer"
            className="relative font-semibold transition-all duration-300 px-4 py-3 rounded-xl flex items-center gap-2 group text-content-muted hover:text-primary hover:bg-surface/80"
          >
            <Icon name={item.icon} size={16} className={`transition-transform duration-300 ${
              isScrolled ? 'scale-90' : 'scale-100'
            }`} />
            <span className="relative">
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </span>
            <Icon name="external-link-alt" className="w-3.5 h-3.5 text-content-subtle group-hover:text-primary transition-colors" aria-hidden="true" />
          </a>
        </div>
      );
    }

    // Regular menu items
    return (
      <div key={item.label} className="relative">
        <NavLink
          to={item.path}
          className={({ isActive }) => 
            `relative font-semibold transition-all duration-300 px-4 py-3 rounded-xl flex items-center gap-2 group
             ${isActive 
                ? 'text-primary bg-primary/10 shadow-sm' 
                : 'text-content-muted hover:text-primary hover:bg-surface/80'}`
          }
        >
          <Icon name={item.icon} size={16} className={`transition-transform duration-300 ${
            isScrolled ? 'scale-90' : 'scale-100'
          }`} />
          <span className="relative">
            {item.label}
            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ${
              location.pathname === item.path ? 'w-full' : 'group-hover:w-full'
            }`}></span>
          </span>
        </NavLink>
      </div>
    );
  })}
</nav>
  );
};

DesktopNav.propTypes = {
  openDropdown: PropTypes.string,
  isScrolled: PropTypes.bool.isRequired,
  onDropdownChange: PropTypes.func.isRequired,
};

DesktopNav.defaultProps = {
  openDropdown: null,
};

export default DesktopNav;
