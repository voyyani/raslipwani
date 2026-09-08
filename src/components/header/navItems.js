/**
 * The site's primary navigation, with the dropdown each top-level item opens.
 * Lifted out of `Header.jsx` (Task 27), where it was rebuilt on every render
 * of a component that renders on every route change.
 */
export const navItems = [
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
  {
    path: '/international',
    label: 'International',
    icon: 'globe',
    dropdown: [
      { path: '/international', label: 'Overview' },
      { path: '/international/un-housing', label: 'UN & Diplomatic Housing' },
    ],
  },
  {
    path: '/about',
    label: 'About',
    icon: 'info-circle'
  },
  {
    // Construction support was shelved here and shipped as its own brand.
    // The route never existed, so this link 404'd on every page.
    path: 'https://nairobuild.co.ke',
    label: 'Construction',
    icon: 'question-circle',
    external: true,
  },
];
