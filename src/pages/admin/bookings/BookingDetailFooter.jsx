import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/Icon';

/**
 * The modal's footer of quick actions — confirm, complete, cancel — drawn as
 * stacked full-width buttons on mobile and a right-aligned row (plus Close) on
 * desktop. Moved out of `BookingDetailModal.jsx` (Task 23); the two variants
 * differ in more than spacing, so they stay as the two blocks the original had
 * rather than being collapsed into one.
 */
const BookingDetailFooter = ({ booking, onConfirm, onComplete, onCancel, onClose, isSaving }) => (
      <div className="border-t bg-surface p-4 md:p-6 safe-area-pb">
        {/* Mobile Actions - Full Width Buttons */}
        <div className="md:hidden space-y-2">
          {booking.status === 'pending' && (
            <button
              onClick={onConfirm}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand text-content-on-brand rounded-xl font-medium active:bg-brand-hover transition disabled:opacity-50"
            >
              <Icon name="check" /> Confirm Booking
            </button>
          )}
          {booking.status === 'confirmed' && (
            <button
              onClick={onComplete}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-success-content text-content-on-brand rounded-xl font-medium active:bg-success-content transition disabled:opacity-50"
            >
              <Icon name="check" /> Mark Completed
            </button>
          )}
          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-surface-raised text-danger-content border border-danger-border rounded-xl font-medium active:bg-danger-surface transition disabled:opacity-50"
            >
              <Icon name="ban" /> Cancel Booking
            </button>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex flex-wrap gap-3 justify-end">
          {booking.status === 'pending' && (
            <button
              onClick={onConfirm}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-content-on-brand rounded-md hover:bg-brand-hover transition disabled:opacity-50"
            >
              <Icon name="check" /> Confirm Booking
            </button>
          )}
          {booking.status === 'confirmed' && (
            <button
              onClick={onComplete}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-success-content text-content-on-brand rounded-md hover:bg-success-content transition disabled:opacity-50"
            >
              <Icon name="check" /> Mark Completed
            </button>
          )}
          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-danger-content text-content-on-brand rounded-md hover:bg-danger-content transition disabled:opacity-50"
            >
              <Icon name="ban" /> Cancel Booking
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-sunken text-content-muted rounded-md hover:bg-surface-sunken transition"
          >
            Close
          </button>
        </div>
      </div>
);

BookingDetailFooter.propTypes = {
  booking: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
};

export default BookingDetailFooter;
