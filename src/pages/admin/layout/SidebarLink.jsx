import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../../../components/Icon';

/**
 * One entry in the admin sidebar, with its badge and its active indicator.
 * Moved out of `AdminLayout.jsx` (Task 27), where it was declared inside the
 * layout component — so React saw a new component type on every render of the
 * layout, remounting every link and restarting the indicator's animation.
 */
const SidebarLink = ({ item, active, isCollapsed, onNavigate }) => {
  return (
    <Link
      to={`/admin${item.path}`}
      onClick={onNavigate}
      className={`flex items-center p-3 rounded-lg transition-all duration-200 group relative ${
        active
          ? 'bg-brand text-content-on-brand shadow-lg'
          : 'text-content-on-media/80 hover:bg-surface-chrome-raised/50 hover:text-content-on-media'
      }`}
      title={isCollapsed ? item.label : undefined}
    >
      <div className="relative flex-shrink-0">
        <Icon name={item.icon} size={20} className={active ? 'text-content-on-media' : 'text-content-on-media/70'} />
        {/* Badge */}
        {item.badge && (
          <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-danger-content text-content-on-brand text-[10px] font-bold rounded-full px-1">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </div>
      
      {!isCollapsed && (
        <span className="ml-3 font-medium whitespace-nowrap">{item.label}</span>
      )}
      
      {/* Active indicator */}
      {active && (
        <motion.div
          layoutId="sidebarActiveIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-surface-raised rounded-r-full"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
    </Link>
  );
};

SidebarLink.propTypes = {
  item: PropTypes.object.isRequired,
  active: PropTypes.bool.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default SidebarLink;
