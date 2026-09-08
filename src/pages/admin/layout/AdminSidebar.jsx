import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/Icon';
import SidebarLink from './SidebarLink';

/**
 * The admin sidebar: brand, the navigation sections, the collapse control and
 * the sign-out. Moved out of `AdminLayout.jsx` (Task 27) unchanged.
 */
const AdminSidebar = ({
  navSections, isOpen, isCollapsed, isActive, user, onClose, onToggleCollapse, onLogout,
}) => (
<aside 
  className={`
    bg-gradient-to-b from-surface-chrome via-surface-chrome to-surface-chrome-raised 
    text-content-on-media flex flex-col shrink-0
    fixed top-0 left-0 h-full z-40
    transition-transform duration-300 ease-in-out
    w-[280px] max-w-[85vw]
    lg:relative lg:translate-x-0
    ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `}
>
  {/* Sidebar Header */}
  <div className={`p-4 border-b border-line-media/20 shrink-0 ${isCollapsed ? 'lg:px-2' : ''}`}>
    <div className="flex items-center justify-between gap-2">
      {!isCollapsed && (
        <div>
          <h2 className="text-lg font-bold text-content-on-media">Admin Panel</h2>
          <p className="text-xs text-content-on-media/70 mt-0.5">Raslipwani Properties</p>
        </div>
      )}
      
      {/* Close button for mobile */}
      <button
        onClick={onClose}
        className="lg:hidden p-2 rounded-lg hover:bg-surface-chrome-raised transition-colors"
        aria-label="Close sidebar"
      >
        <Icon name="times" size={20} className="text-content-subtle" />
      </button>
      
      {/* Collapse button for desktop */}
      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex p-2 rounded-lg hover:bg-surface-chrome-raised transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={isCollapsed ? "Expand (Ctrl+[)" : "Collapse (Ctrl+[)"}
      >
        {isCollapsed ? (
          <Icon name="chevron-right" size={16} className="text-content-subtle" />
        ) : (
          <Icon name="chevron-left" size={16} className="text-content-subtle" />
        )}
      </button>
    </div>
  </div>
  
  {/* Navigation */}
  <nav className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-surface-chrome-raised scrollbar-track-transparent">
    {navSections.map((section) => (
      <div key={section.title}>
        {/* Section header */}
        {!isCollapsed && (
          <h3 className="text-xs font-semibold text-content-subtle uppercase tracking-wider mb-2 px-3">
            {section.title}
          </h3>
        )}
        
        {/* Section items */}
        <div className="space-y-1">
          {section.items.map((item) => (
            <SidebarLink
              key={item.path}
              item={item}
              active={isActive(item.path)}
              isCollapsed={isCollapsed}
              onNavigate={onClose}
            />
          ))}
        </div>
      </div>
    ))}
  </nav>
  
  {/* User section */}
  <div className={`mt-auto p-4 border-t border-line-media/20 ${isCollapsed ? 'lg:px-2' : ''}`}>
    <div className={`flex items-center ${isCollapsed ? 'lg:justify-center' : 'gap-3'} mb-3`}>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-brand bg-primary text-sm font-bold uppercase text-content-on-brand"
        aria-hidden="true"
      >
        {(user?.email?.[0] ?? '?')}
      </div>
      
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <p className="font-medium text-content-on-media text-sm truncate">
            {user?.email?.split('@')[0] ?? 'Admin'}
          </p>
          <p className="text-xs text-content-on-media/70 truncate">
            {user?.email ?? ''}
          </p>
        </div>
      )}
    </div>
    
    <button
      onClick={onLogout}
      className={`flex items-center w-full p-3 text-content-on-media/80 hover:bg-surface-chrome-raised/50 hover:text-content-on-media rounded-lg transition-colors ${
        isCollapsed ? 'lg:justify-center' : ''
      }`}
      title={isCollapsed ? "Sign Out" : undefined}
    >
      <Icon name="sign-out-alt" size={20} className="flex-shrink-0" />
      {!isCollapsed && <span className="ml-3">Sign Out</span>}
    </button>
  </div>
</aside>
);

AdminSidebar.propTypes = {
  navSections: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  isActive: PropTypes.func.isRequired,
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

AdminSidebar.defaultProps = {
  user: null,
};

export default AdminSidebar;
