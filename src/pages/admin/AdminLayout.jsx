import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { bookingQueries } from '@/services/bookings';
import { useAuth } from '../../contexts/AuthContext';
import Header from './AdminHeader';
import AdminBottomNav from './AdminBottomNav';
import AdminBreadcrumb from './AdminBreadcrumb';
import DebugPanel from '../../components/admin/DebugPanel';
import ThemeToggle from '../../components/ui/ThemeToggle';

// Imported here rather than in App.jsx so it rides the lazy admin chunk. As a
// top-level App import it was in the stylesheet every public visitor blocks on,
// which is 328 lines of console styling for an audience of one. Its two global
// rules were redundant: `index.css` already sets `overflow-x: hidden` on html
// and body, and Tailwind's preflight already sets `box-sizing: border-box`.
import '../../styles/admin-mobile.css';
import Icon from '../../components/Icon';
import AdminSidebar from './layout/AdminSidebar';

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
  const { signOut, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Fetch pending bookings count for badges
  const { data: pendingCount = 0 } = useQuery({
    ...bookingQueries.pendingCount(),
    refetchInterval: 60000, // Refetch every minute
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

  const handleLogout = async () => {
    // Await the sign-out before navigating: the previous Clerk version navigated
    // while the request was still in flight, which could leave a stale session.
    await signOut();
    navigate('/');
  };

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Navigation sections for better organization
  const navSections = [
    {
      title: 'Main',
      items: [
        { path: '', label: 'Dashboard', icon: 'home', badge: null }
      ]
    },
    {
      title: 'Management',
      items: [
        { path: '/properties', label: 'Properties', icon: 'building', badge: null },
        { path: '/bookings', label: 'Bookings', icon: 'calendar', badge: pendingCount > 0 ? pendingCount : null },
        { path: '/viewings', label: 'Viewings', icon: 'eye', badge: null },
        { path: '/clients', label: 'Clients', icon: 'users', badge: null }
      ]
    },
    {
      title: 'System',
      items: [
        { path: '/settings', label: 'Settings', icon: 'cog', badge: null }
      ]
    }
  ];

  // Sidebar link component
  return (
    <div className="min-h-screen flex flex-col bg-surface overflow-x-hidden">
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
              className="lg:hidden fixed inset-0 bg-scrim/60 backdrop-blur-sm z-40"
              onClick={closeSidebar}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        <AdminSidebar
          navSections={navSections}
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          isActive={isActive}
          user={user}
          onClose={closeSidebar}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogout={handleLogout}
        />

        
        {/* Main content area */}
        <main className="flex-1 min-h-screen bg-surface w-full overflow-x-hidden pb-20 lg:pb-0">
          <div className="p-3 sm:p-4 lg:p-6 w-full max-w-7xl mx-auto">
            {/* Breadcrumb Navigation, and the theme control beside it — the
                admin console is the surface someone stares at all day, so it is
                the one that most wants a dark option. */}
            <div className="flex items-center justify-between gap-4">
              <AdminBreadcrumb />
              <ThemeToggle />
            </div>

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