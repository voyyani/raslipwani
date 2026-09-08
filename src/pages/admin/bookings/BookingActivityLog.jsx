import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import BookingStatusBadge from '../../../components/BookingStatusBadge';

/**
 * The modal's Activity Log tab — the booking's `status_history` entries, or
 * the empty state when it has none. Moved out of `BookingDetailModal.jsx`
 * (Task 23) unchanged.
 */
const BookingActivityLog = ({ booking }) => (
          <div className="space-y-3">
            {booking.status_history && Array.isArray(booking.status_history) && booking.status_history.length > 0 ? (
              booking.status_history.map((entry, index) => (
                <div key={index} className="bg-surface-raised border border-line rounded-lg p-4 flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <BookingStatusBadge status={entry.status} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-content">
                      Status changed to {entry.status}
                    </div>
                    <div className="text-sm text-content-muted">
                      {entry.changed_at && format(new Date(entry.changed_at), 'PPp')}
                    </div>
                    {entry.reason && (
                      <div className="text-sm text-content-muted mt-1">
                        Reason: {entry.reason}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-content-subtle">
                No activity history available
              </div>
            )}
          </div>
);

BookingActivityLog.propTypes = {
  booking: PropTypes.object.isRequired,
};

export default BookingActivityLog;
