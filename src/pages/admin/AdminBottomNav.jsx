import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaHome, 
  FaBuilding, 
  FaCalendarAlt, 
  FaUsers, 
  FaBars,
  FaCog
} from 'react-icons/fa';

/**
 * AdminBottomNav - Mobile bottom navigation bar for admin dashboard
 * Features:
 * - 5 primary nav items with icons
 * - Active state indicator with pill animation
 * - Badge counts for pending items
 * - "More" opens full sidebar
 */
const AdminBottomNav = ({ onOpenSidebar, pendingBookingsCount = 0 }) => {
  const location = useLocation();

  const navItems = [
    {
      path: '/admin',
      exact: true,
      label: 'Dashboard',
      icon: FaHome,
      badge: null
    },
    {
      path: '/admin/properties',
      label: 'Properties',
      icon: FaBuilding,
      badge: null
    },
    {
      path: '/admin/bookings',
      label: 'Bookings',
      icon: FaCalendarAlt,
      badge: pendingBookingsCount > 0 ? pendingBookingsCount : null
    },
    {
      path: '/admin/clients',
      label: 'Clients',
      icon: FaUsers,
      badge: null
    },
    {
      path: null, // Special "More" button
      label: 'More',
      icon: FaBars,
      badge: null,
      action: 'openSidebar'
    }
  ];

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return item.path && location.pathname.startsWith(item.path);
  };

  // Haptic feedback helper (if supported)
  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
      role="navigation"
      aria-label="Admin bottom navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-14 px-1 max-w-screen-sm mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          
          // Special handling for "More" button
          if (item.action === 'openSidebar') {
            return (
              <button
                key="more-button"
                onClick={() => {
                  triggerHaptic();
                  onOpenSidebar();
                }}
                className="flex flex-col items-center justify-center flex-1 h-full py-1 group"
                aria-label="Open more options"
              >
                <Icon className="w-5 h-5 text-gray-500 group-active:text-blue-600" />
                <span className="text-[10px] font-medium text-gray-500 mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={triggerHaptic}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 group relative"
              aria-current={active ? 'page' : undefined}
            >
              {/* Active indicator pill */}
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-blue-600 rounded-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              
              <div className="relative">
                <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                
                {/* Badge */}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-0.5">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              
              <span className={`text-[10px] font-medium mt-0.5 ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminBottomNav;
