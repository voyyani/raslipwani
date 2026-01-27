import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useClerk, UserButton } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import { 
  FaHome, 
  FaBuilding, 
  FaCalendarAlt, 
  FaUsers, 
  FaSignOutAlt, 
  FaTimes,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaEye
} from 'react-icons/fa';
import Header from './AdminHeader';
import AdminBottomNav from './AdminBottomNav';
import AdminBreadcrumb from './AdminBreadcrumb';
import DebugPanel from '../../components/admin/DebugPanel';

/**
 * AdminLayout - World-class admin layout with mobile-first navigation
 * Features:
 * - Collapsible sidebar on desktop
 * - Bottom navigation on mobile
 * - Section grouping with headers
 * - Body scroll lock when sidebar open
 * - Breadcrumb navigation
 * - Pending items badge counts
 */
const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useClerk();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Fetch pending bookings count for badges
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['pending-bookings-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('is_archived', false);
      
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000
  });

  // Body scroll lock when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isSidebarOpen]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Keyboard shortcut for sidebar toggle (desktop)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '[' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isActive = useCallback((path) => {
    if (path === '' || path === '/') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname === `/admin${path}`;
  }, [location.pathname]);

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Navigation sections for better organization
  const navSections = [
    {
      title: 'Main',
      items: [
        { path: '', label: 'Dashboard', icon: FaHome, badge: null }
      ]
    },
    {
      title: 'Management',
      items: [
        { path: '/properties', label: 'Properties', icon: FaBuilding, badge: null },
        { path: '/bookings', label: 'Bookings', icon: FaCalendarAlt, badge: pendingCount > 0 ? pendingCount : null },
        { path: '/viewings', label: 'Viewings', icon: FaEye, badge: null },
        { path: '/clients', label: 'Clients', icon: FaUsers, badge: null }
      ]
    },
    {
      title: 'System',
      items: [
        { path: '/settings', label: 'Settings', icon: FaCog, badge: null }
      ]
    }
  ];

  // Sidebar link component
  const SidebarLink = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <Link
        to={`/admin${item.path}`}
        onClick={closeSidebar}
        className={`flex items-center p-3 rounded-lg transition-all duration-200 group relative ${
          active
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
        }`}
        title={isSidebarCollapsed ? item.label : undefined}
      >
        <div className="relative flex-shrink-0">
          <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-blue-300'}`} />
          {/* Badge */}
          {item.badge && (
            <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </div>
        
        {!isSidebarCollapsed && (
          <span className="ml-3 font-medium whitespace-nowrap">{item.label}</span>
        )}
        
        {/* Active indicator */}
        {active && (
          <motion.div
            layoutId="sidebarActiveIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      {/* Top Header */}
      <Header />
      
      <div className="flex flex-1 relative overflow-hidden">
        {/* Mobile sidebar backdrop */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={closeSidebar}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Sidebar - Hidden on mobile unless open */}
        <aside 
          className={`
            bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 
            text-white flex flex-col shrink-0
            fixed top-0 left-0 h-full z-40
            transition-transform duration-300 ease-in-out
            w-[280px] max-w-[85vw]
            lg:relative lg:translate-x-0
            ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {/* Sidebar Header */}
          <div className={`p-4 border-b border-gray-700/50 shrink-0 ${isSidebarCollapsed ? 'lg:px-2' : ''}`}>
            <div className="flex items-center justify-between gap-2">
              {!isSidebarCollapsed && (
                <div>
                  <h2 className="text-lg font-bold text-white">Admin Panel</h2>
                  <p className="text-xs text-blue-300 mt-0.5">Raslipwani Properties</p>
                </div>
              )}
              
              {/* Close button for mobile */}
              <button
                onClick={closeSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="Close sidebar"
              >
                <FaTimes className="w-5 h-5 text-gray-400" />
              </button>
              
              {/* Collapse button for desktop */}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex p-2 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={isSidebarCollapsed ? "Expand (Ctrl+[)" : "Collapse (Ctrl+[)"}
              >
                {isSidebarCollapsed ? (
                  <FaChevronRight className="w-4 h-4 text-gray-400" />
                ) : (
                  <FaChevronLeft className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {navSections.map((section) => (
              <div key={section.title}>
                {/* Section header */}
                {!isSidebarCollapsed && (
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                    {section.title}
                  </h3>
                )}
                
                {/* Section items */}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <SidebarLink key={item.path} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </nav>
          
          {/* User section */}
          <div className={`mt-auto p-4 border-t border-gray-700/50 ${isSidebarCollapsed ? 'lg:px-2' : ''}`}>
            <div className={`flex items-center ${isSidebarCollapsed ? 'lg:justify-center' : 'gap-3'} mb-3`}>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 border-2 border-blue-400",
                    userButtonPopoverCard: "bg-white text-gray-800 rounded-xl shadow-xl",
                    userButtonPopoverActionButton: "hover:bg-gray-100 rounded-lg",
                    userButtonPopoverActionButtonText: "text-gray-700",
                    userButtonPopoverFooter: "hidden"
                  }
                }}
              />
              
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">
                    {user?.fullName || 'Admin'}
                  </p>
                  <p className="text-xs text-blue-300 truncate">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className={`flex items-center w-full p-3 text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors ${
                isSidebarCollapsed ? 'lg:justify-center' : ''
              }`}
              title={isSidebarCollapsed ? "Sign Out" : undefined}
            >
              <FaSignOutAlt className="w-5 h-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="ml-3">Sign Out</span>}
            </button>
          </div>
        </aside>
        
        {/* Main content area */}
        <main className="flex-1 min-h-screen bg-gray-50 w-full overflow-x-hidden pb-20 lg:pb-0">
          <div className="p-3 sm:p-4 lg:p-6 w-full max-w-7xl mx-auto">
            {/* Breadcrumb Navigation */}
            <AdminBreadcrumb />
            
            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <AdminBottomNav 
        onOpenSidebar={openSidebar} 
        pendingBookingsCount={pendingCount}
      />
      
      {/* Debug Panel - Only in development */}
      {import.meta.env.DEV && <DebugPanel />}
    </div>
  );
};

export default AdminLayout;