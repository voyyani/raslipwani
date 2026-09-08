import React from 'react';
import PropTypes from 'prop-types';
import BookingStatusBadge from '../../../components/BookingStatusBadge';
import Icon from '../../../components/Icon';

const PRIORITY_COLOURS = {
  low: 'text-content-muted',
  medium: 'text-brand',
  high: 'text-warning-content',
  urgent: 'text-danger-content',
};

/**
 * The modal's gradient header: the mobile back affordance, the title, the
 * status badge, the priority tint and the booking id — plus the desktop close
 * button. Moved out of `BookingDetailModal.jsx` (Task 23) unchanged.
 */
const BookingDetailHeader = ({ booking, onClose }) => (
    <div className="bg-gradient-to-r from-brand to-brand-hover text-content-on-media p-4 md:p-6 flex justify-between items-start">
      <div className="flex-1 min-w-0">
        {/* Mobile Back Button */}
        <button 
          onClick={onClose}
          className="md:hidden flex items-center gap-1 text-content-on-media/80 text-sm mb-2"
        >
          <Icon name="chevron-left" size={12} />
          Back
        </button>
        <h2 className="text-lg md:text-2xl font-bold mb-2">Booking Details</h2>
        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          <BookingStatusBadge status={booking.status} className="bg-surface-raised bg-opacity-20 border-line-media border-opacity-30 text-xs md:text-sm" />
          {booking.priority && (
            <span className={`text-xs md:text-sm font-semibold ${PRIORITY_COLOURS[booking.priority] ?? PRIORITY_COLOURS.medium}`}>
              {booking.priority.toUpperCase()} Priority
            </span>
          )}
          <span className="text-xs md:text-sm opacity-90">#{booking.id}</span>
        </div>
      </div>
      <button
        onClick={onClose}
        className="hidden md:block text-content-on-media hover:text-content-on-media/90 transition p-2 flex-shrink-0"
      >
        <Icon name="times" size={24} />
      </button>
    </div>
);

BookingDetailHeader.propTypes = {
  booking: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BookingDetailHeader;
