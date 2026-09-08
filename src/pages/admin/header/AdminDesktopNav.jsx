import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Icon from '../../../components/Icon';
import { adminNavItems } from './adminNavItems';

/**
 * The admin header's desktop navigation and its dropdowns. Moved out of
 * `AdminHeader.jsx` (Task 27) unchanged.
 */
const AdminDesktopNav = ({ isOnAdminDashboard, openDropdown, isScrolled, onDropdownChange }) => {
  const location = useLocation();
  const navItems = adminNavItems(isOnAdminDashboard);

  return (
<nav className="hidden lg:flex items-center space-x-1">
  {navItems.map((item) => {
    
    // Handle dropdown menus
    if (item.dropdown) {
      return (
        <div 
          key={item.label} 
          className="relative"
          onMouseEnter={() => onDropdownChange(item.label)}
          onMouseLeave={() => onDropdownChange(null)}
        >
          <button
            className="relative font-semibold transition-all duration-300 px-4 py-3 rounded-xl flex items-center gap-2 group text-content-muted hover:text-primary hover:bg-surface/80"
          >
            <Icon name={item.icon} size={16} className={`transition-transform duration-300 ${
              isScrolled ? 'scale-90' : 'scale-100'
            }`} />
            <span className="relative">{item.label}</span>
            <Icon name="chevron-down" size={16} className={`transition-transform duration-300 ${
              openDropdown === item.label ? 'rotate-180' : ''
            }`} />
          </button>
          
          {/* Dropdown Menu */}
          {openDropdown === item.label && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-surface-raised rounded-xl shadow-xl border border-line py-2 z-50">
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

AdminDesktopNav.propTypes = {
  isOnAdminDashboard: PropTypes.bool.isRequired,
  openDropdown: PropTypes.string,
  isScrolled: PropTypes.bool.isRequired,
  onDropdownChange: PropTypes.func.isRequired,
};

AdminDesktopNav.defaultProps = {
  openDropdown: null,
};

export default AdminDesktopNav;
