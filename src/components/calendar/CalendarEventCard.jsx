import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';

/**
 * One appointment in the booking calendar's list. Moved out of
 * `BookingCalendar.jsx` (Task 26), which carried three copies of this markup —
 * one per view — differing only in the label on the details button and whether
 * an email link appeared. Those are the two props below; everything else was
 * already identical, drift included.
 */
const CalendarEventCard = ({ booking, formatDate, onSelect, onStatusChange, detailsLabel = 'Details', showEmail = false }) => (
<div 
  key={booking.id} 
  className={`p-4 rounded-lg border-l-4 shadow-sm ${
    booking.status === 'confirmed' ? 'border-success-border bg-success-surface' :
    booking.status === 'cancelled' ? 'border-danger-border bg-danger-surface' :
    'border-warning-border bg-warning-surface'
  }`}
>
  <div className="flex justify-between items-start">
    <div>
      <h3 className="font-medium text-content">{booking.name}</h3>
      <p className="text-sm text-content-muted">{booking.service || booking.viewing_type}</p>
    </div>
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      booking.status === 'confirmed' ? 'bg-success-surface text-success-content' :
      booking.status === 'cancelled' ? 'bg-danger-surface text-danger-content' :
      'bg-warning-surface text-warning-content'
    }`}>
      {booking.status}
    </span>
  </div>
  
  <div className="mt-3">
    <p className="text-sm text-content-muted flex items-center">
      <Icon name="clock" className="mr-2 text-content-subtle flex-shrink-0" />
      <span>{formatDate(booking.appointment_at)}</span>
    </p>
  </div>
  
  {/* Status Controls */}
  <div className="flex justify-between mt-4">
    <div className="flex gap-2">
      {booking.status !== 'confirmed' && (
        <button
          onClick={() => onStatusChange(booking.id, 'confirmed')}
          className="px-3 py-1 bg-success-surface text-success-content rounded-full text-xs flex items-center"
          title="Confirm appointment"
        >
          <Icon name="check" className="mr-1" /> Confirm
        </button>
      )}
      {booking.status !== 'cancelled' && (
        <button
          onClick={() => onStatusChange(booking.id, 'cancelled')}
          className="px-3 py-1 bg-danger-surface text-danger-content rounded-full text-xs flex items-center"
          title="Cancel appointment"
        >
          <Icon name="times" className="mr-1" /> Cancel
        </button>
      )}
    </div>
    
    <div className="flex space-x-2">
      <button
        onClick={() => onSelect(booking)}
        className="text-brand hover:text-brand-content text-sm flex items-center"
      >
        <Icon name="eye" className="mr-1" /> {detailsLabel}
      </button>
      {showEmail && (
        <a 
          href={`mailto:${booking.email}`}
          className="text-purple-600 hover:text-purple-800 text-sm flex items-center"
        >
          <Icon name="envelope" className="mr-1" /> Email
        </a>
      )}
    </div>
  </div>
</div>
);

CalendarEventCard.propTypes = {
  booking: PropTypes.object.isRequired,
  formatDate: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  detailsLabel: PropTypes.string,
  showEmail: PropTypes.bool,
};


export default CalendarEventCard;
