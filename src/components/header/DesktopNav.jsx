import React from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Icon from '../Icon';
import { navItems } from './navItems';

const slug = (label) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/**
 * The desktop navigation bar and its dropdowns.
 *
 * `onMedia` is the header sitting on a photograph rather than on the page's own
 * ground — see `Header.jsx`. The link colours are the only thing it changes, but
 * they are the thing that decides whether the navigation is readable at all: on
 * an uncontrolled image, `content-muted` is a coin flip. Same treatment as a
 * `media` glass panel, for the same reason.
 */
const linkClasses = (onMedia, isActive) =>
  [
    'relative flex items-center gap-2 rounded-lg px-4 py-3 font-medium',
    'transition-colors duration-fast ease-spring motion-reduce:transition-none',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
    onMedia
      ? isActive
        ? 'bg-content-on-media/15 text-content-on-media'
        : 'text-content-on-media/85 hover:bg-content-on-media/10 hover:text-content-on-media'
      : isActive
        ? 'bg-brand-subtle text-brand-content'
        : 'text-content-muted hover:bg-surface-sunken hover:text-brand-content',
  ].join(' ');

const DesktopNav = ({ openDropdown = null, isScrolled, onMedia = false, onDropdownChange }) => {
  const location = useLocation();

  return (
    <nav className="hidden items-center gap-1 lg:flex">
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
                className={linkClasses(onMedia, isOpen)}
              >
                <Icon
                  name={item.icon}
                  size={16}
                  className={`transition-transform duration-base ease-spring motion-reduce:transition-none ${
                    isScrolled ? 'scale-90' : 'scale-100'
                  }`}
                />
                <span>{item.label}</span>
                <Icon
                  name="chevron-down"
                  size={16}
                  className={`transition-transform duration-fast ease-spring motion-reduce:transition-none ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* The dropdown is a menu on the page's own ground, not on the
                  photograph — so it keeps its opaque surface in both states. */}
              {isOpen && (
                <div
                  id={menuId}
                  className="absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border border-line bg-surface-raised py-2 shadow-raised"
                >
                  {item.dropdown.map((subItem) => (
                    <Link
                      key={subItem.path}
                      to={subItem.path}
                      className="block px-4 py-3 text-content-muted transition-colors hover:bg-surface-sunken hover:text-brand-content"
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
            <a
              key={item.label}
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClasses(onMedia, false)}
            >
              <Icon
                name={item.icon}
                size={16}
                className={`transition-transform duration-base ease-spring motion-reduce:transition-none ${
                  isScrolled ? 'scale-90' : 'scale-100'
                }`}
              />
              <span>{item.label}</span>
              <Icon name="external-link-alt" size={14} aria-hidden="true" className="opacity-70" />
            </a>
          );
        }

        // Regular menu items
        return (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => linkClasses(onMedia, isActive || location.pathname === item.path)}
          >
            <Icon
              name={item.icon}
              size={16}
              className={`transition-transform duration-base ease-spring motion-reduce:transition-none ${
                isScrolled ? 'scale-90' : 'scale-100'
              }`}
            />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

DesktopNav.propTypes = {
  openDropdown: PropTypes.string,
  isScrolled: PropTypes.bool.isRequired,
  /** The header is sitting on a photograph, so the links go on-media. */
  onMedia: PropTypes.bool,
  onDropdownChange: PropTypes.func.isRequired,
};

export default DesktopNav;
