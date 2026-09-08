import React from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../../../components/Icon';
import { adminNavItems } from './adminNavItems';

/**
 * The admin header's mobile menu. Moved out of `AdminHeader.jsx` (Task 27)
 * unchanged.
 */
const AdminMobileMenu = ({ isOpen, isOnAdminDashboard, openMobileDropdown, onDropdownChange, onClose }) => {
  const navItems = adminNavItems(isOnAdminDashboard);

  return (
<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-scrim/60 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-surface-raised shadow-2xl z-50 lg:hidden overflow-y-auto"
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
        <nav id="admin-mobile-nav" className="flex flex-col py-2">
          {navItems.map((item) => {
                const isActive = location.pathname === item.path;
            
            // Handle dropdown menus
            if (item.dropdown) {
              const isDropdownOpen = openMobileDropdown === item.label;
              return (
                <div key={item.label} className="border-b border-line last:border-b-0">
                  <button
                    onClick={() => onDropdownChange(isDropdownOpen ? null : item.label)}
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
                    <div className="bg-surface py-2">
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
            
            // Regular menu items
            return (
              <div key={item.label} className="border-b border-line last:border-b-0">
                <NavLink 
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-4 px-6 py-5 font-medium transition-all duration-300 group
                   ${isActive 
                      ? 'text-primary bg-primary/5 border-r-4 border-primary' 
                      : 'text-content-muted hover:text-primary hover:bg-surface'}`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive ? 'bg-primary/10 text-primary' : 'bg-surface-sunken text-content-muted group-hover:bg-primary/10 group-hover:text-primary'
                  }`}>
                    <Icon name={item.icon} size={20} />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  <div className={`w-2 h-2 rounded-full transition-colors ${
                    isActive ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/30'
                  }`}></div>
                </NavLink>
              </div>
            );
          })}
        </nav>
        
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
              { icon: 'instagram', href: 'https://www.instagram.com/raslipwani/', color: 'hover:text-pink-500' },
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
      </motion.div>
    </>
  )}
</AnimatePresence>
  );
};

AdminMobileMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isOnAdminDashboard: PropTypes.bool.isRequired,
  openMobileDropdown: PropTypes.string,
  onDropdownChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

AdminMobileMenu.defaultProps = {
  openMobileDropdown: null,
};

export default AdminMobileMenu;
