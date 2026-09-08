import React from 'react';
import PropTypes from 'prop-types';
import { statusClasses, statusLabel } from '../../design/status';
import Icon from '../Icon';

/**
 * The week and month views of the appointment list: bookings under a heading
 * per day, each with the same actions the table offers. Moved out of
 * `BookingList.jsx` (Task 27) unchanged.
 */
const BookingGroupedList = ({
  groupedBookings, viewFilter, formatDate, updateStatus, toggleArchive, openBookingModal,
}) => (
// Grouped view for week/month
<div className="divide-y divide-line">
  {groupedBookings.map(({ date, bookings }) => (
    <div key={date} className="py-4 px-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-content">
          {date === 'unscheduled' 
            ? 'Unscheduled Appointments' 
            : new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
          }
        </h3>
        <span className="bg-surface-sunken text-content-muted rounded-full px-3 py-1 text-sm">
          {bookings.length} {bookings.length === 1 ? 'appointment' : 'appointments'}
        </span>
      </div>
      
      <div className="space-y-3">
        {bookings.map(booking => (
          <div 
            key={booking.id} 
            className="p-4 bg-surface-raised border border-line rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-content">{booking.name}</div>
                <div className="text-sm text-content-subtle">{booking.service || booking.viewing_type}</div>
              </div>
              <span
              className={`px-2 py-1 rounded-full text-xs font-medium border ${statusClasses(booking.status)}`}
            >
              {statusLabel(booking.status)}
            </span>
            </div>
            
            <div className="mt-3 text-sm">
              {booking.appointment_at ? (
                <div className="flex items-center text-content-muted">
                  <Icon name="clock" className="mr-2 text-content-subtle flex-shrink-0" />
                  {formatDate(booking.appointment_at)}
                </div>
              ) : null}
            </div>
            
            {/* Status Controls */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                {booking.status !== 'confirmed' && (
                  <button
                    onClick={() => updateStatus(booking.id, 'confirmed')}
                    className={`px-3 py-1 rounded-full text-xs flex items-center border ${statusClasses('confirmed')}`}
                    title="Confirm appointment"
                  >
                    <Icon name="check" className="mr-1" /> Confirm
                  </button>
                )}
                {booking.status !== 'cancelled' && (
                  <button
                    onClick={() => updateStatus(booking.id, 'cancelled')}
                    className={`px-3 py-1 rounded-full text-xs flex items-center border ${statusClasses('cancelled')}`}
                    title="Cancel appointment"
                  >
                    <Icon name="times" className="mr-1" /> Cancel
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => openBookingModal(booking)}
                  className="text-brand hover:text-brand-content text-sm flex items-center"
                >
                  <Icon name="eye" className="mr-1" /> Details
                </button>
                <a 
                  href={`mailto:${booking.email}`}
                  className="text-purple-600 hover:text-purple-800 text-sm flex items-center"
                >
                  <Icon name="envelope" className="mr-1" /> Email
                </a>
                {viewFilter === 'active' ? (
                  <button
                    onClick={() => toggleArchive(booking.id, true)}
                    className="text-content-muted hover:text-content text-sm flex items-center"
                  >
                    <Icon name="archive" className="mr-1" /> Archive
                  </button>
                ) : (
                  <button
                    onClick={() => toggleArchive(booking.id, false)}
                    className="text-brand hover:text-brand-content text-sm flex items-center"
                  >
                    <Icon name="trash-restore" className="mr-1" /> Restore
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ))}
</div>
);

BookingGroupedList.propTypes = {
  groupedBookings: PropTypes.array.isRequired,
  viewFilter: PropTypes.string.isRequired,
  formatDate: PropTypes.func.isRequired,
  updateStatus: PropTypes.func.isRequired,
  toggleArchive: PropTypes.func.isRequired,
  openBookingModal: PropTypes.func.isRequired,
};

export default BookingGroupedList;
