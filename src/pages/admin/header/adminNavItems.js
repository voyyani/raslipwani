/**
 * The admin navigation. A function, not a constant, because the Dashboard
 * entry is dropped while the admin is already on the dashboard — the one thing
 * this list depends on. Lifted out of `AdminHeader.jsx` (Task 27).
 */
export const adminNavItems = (isOnAdminDashboard) => [
  // Conditionally include Dashboard button
  ...(!isOnAdminDashboard ? [{ 
    path: '/admin', 
    label: 'Dashboard', 
    icon: 'tachometer-alt' 
  }] : []),
  { 
    path: '/', 
    label: 'Home', 
    icon: 'home' 
  },
  { 
    path: '/properties', 
    label: 'Listings', 
    icon: 'th' 
  },
  { 
    path: '/services', 
    label: 'Services', 
    icon: 'tools' 
  },
  // SHELVED for a later phase alongside the public route (see src/App.jsx).
  // { 
  //   path: '/international', 
  //   label: 'International', 
  //   icon: 'th' 
  // },
  { 
    path: '/about', 
    label: 'About', 
    icon: 'info-circle' 
  },
  { 
    path: '/construction-support', 
    label: 'Construction', 
    icon: 'question-circle' 
  },
];
