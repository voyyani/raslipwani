import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/Icon';

const VIEWS = [
  { value: 'list', icon: 'list', label: 'List' },
  { value: 'calendar', icon: 'calendar', label: 'Calendar' },
];

/**
 * The mobile list/calendar switch. Moved out of `AdminBookings.jsx` (Task 23)
 * and, like its siblings, self-gated on `isMobile` — on desktop the calendar
 * view is chosen from `BookingToolbar` instead.
 */
const BookingViewToggle = ({ isMobile, mobileView, onChange }) => {
  if (!isMobile) return null;

  return (
    <div className="flex gap-1 mb-4 bg-surface-sunken p-1 rounded-lg">
      {VIEWS.map(({ value, icon, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
            mobileView === value
              ? 'bg-surface-raised text-brand shadow-sm'
              : 'text-content-muted'
          }`}
        >
          <Icon name={icon} size={14} />
          {label}
        </button>
      ))}
    </div>
  );
};

BookingViewToggle.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  mobileView: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default BookingViewToggle;
