import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronRight, FaHome } from 'react-icons/fa';

/**
 * AdminBreadcrumb - Auto-generated breadcrumb navigation
 * Features:
 * - Auto-generated from route
 * - Clickable navigation back
 * - Current page not linked
 * - Mobile: Show only current + parent
 */
const AdminBreadcrumb = () => {
  const location = useLocation();
  
  // Route configuration for better labels
  const routeLabels = {
    'admin': 'Dashboard',
    'properties': 'Properties',
    'bookings': 'Bookings',
    'viewings': 'Viewings',
    'clients': 'Clients',
    'settings': 'Settings',
    'reports': 'Reports'
  };

  // Parse the current path into breadcrumb items
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    // Build breadcrumb items
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Get label from route config or format the segment
      const label = routeLabels[segment] || 
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      breadcrumbs.push({
        label,
        path: currentPath,
        isLast: index === pathSegments.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on the main admin dashboard
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="mb-4 sm:mb-6"
    >
      {/* Desktop Breadcrumbs - Full path */}
      <ol className="hidden sm:flex items-center space-x-1 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center">
            {index > 0 && (
              <FaChevronRight className="w-3 h-3 mx-2 text-gray-400" />
            )}
            
            {crumb.isLast ? (
              <span 
                className="font-medium text-gray-900"
                aria-current="page"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-gray-500 hover:text-blue-600 hover:underline transition-colors"
              >
                {index === 0 ? (
                  <span className="flex items-center gap-1">
                    <FaHome className="w-3.5 h-3.5" />
                    <span>{crumb.label}</span>
                  </span>
                ) : (
                  crumb.label
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>

      {/* Mobile Breadcrumbs - Only parent + current */}
      <div className="sm:hidden flex items-center text-sm">
        {breadcrumbs.length > 1 && (
          <>
            <Link
              to={breadcrumbs[breadcrumbs.length - 2].path}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <FaChevronRight className="w-3 h-3 mr-1 rotate-180" />
              <span>Back</span>
            </Link>
            <span className="mx-2 text-gray-400">|</span>
            <span className="font-medium text-gray-900 truncate max-w-[200px]">
              {breadcrumbs[breadcrumbs.length - 1].label}
            </span>
          </>
        )}
      </div>
    </nav>
  );
};

export default AdminBreadcrumb;
