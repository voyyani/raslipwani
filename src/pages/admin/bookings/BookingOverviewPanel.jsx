import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import BookingStatusBadge from '../../../components/BookingStatusBadge';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/Textarea';
import Icon from '../../../components/Icon';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

/**
 * The modal's Overview tab: customer details, booking details, the status
 * editor and the priority buttons. Moved out of `BookingDetailModal.jsx`
 * (Task 23) with its markup unchanged.
 *
 * The status editor's three pieces of state stay in the modal and arrive here
 * as one `statusEditor` object rather than moving in here, because the modal's
 * footer writes status too and clearing the editor on *any* successful status
 * write is behaviour this split is not allowed to drop.
 */
const BookingOverviewPanel = ({ booking, statusEditor, onPriorityChange, isPriorityPending }) => (
          <div className="space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-content mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="user" className="text-content-subtle" />
                  <div>
                    <div className="text-sm text-content-muted">Name</div>
                    <div className="font-medium text-content">{booking.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="envelope" className="text-content-subtle" />
                  <div>
                    <div className="text-sm text-content-muted">Email</div>
                    <div className="font-medium text-content">{booking.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="phone" className="text-content-subtle" />
                  <div>
                    <div className="text-sm text-content-muted">Phone</div>
                    <div className="font-medium text-content">{booking.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="calendar" className="text-content-subtle" />
                  <div>
                    <div className="text-sm text-content-muted">Appointment</div>
                    <div className="font-medium text-content">
                      {format(new Date(booking.appointment_at), 'PPp')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div>
              <h3 className="text-lg font-semibold text-content mb-4">Booking Details</h3>
              <div className="space-y-3 bg-surface p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-content-muted">Service</span>
                  <span className="font-medium text-content">{booking.service || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">Property ID</span>
                  <span className="font-medium text-content">{booking.property_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">Created</span>
                  <span className="font-medium text-content">
                    {format(new Date(booking.created_at), 'PPp')}
                  </span>
                </div>
                {booking.last_modified_at && (
                  <div className="flex justify-between">
                    <span className="text-content-muted">Last Modified</span>
                    <span className="font-medium text-content">
                      {format(new Date(booking.last_modified_at), 'PPp')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Management */}
            <div>
              <h3 className="text-lg font-semibold text-content mb-4">Status Management</h3>
              {!statusEditor.isEditing ? (
                <div className="flex items-center gap-3">
                  <BookingStatusBadge status={booking.status} />
                  <button
                    onClick={() => statusEditor.onEdit()}
                    className="text-brand hover:text-brand font-medium text-sm flex items-center gap-2"
                  >
                    <Icon name="edit" /> Change Status
                  </button>
                </div>
              ) : (
                <div className="space-y-3 bg-surface p-4 rounded-lg">
                  <Select
                    label="New Status"
                    value={statusEditor.newStatus}
                    onChange={(e) => statusEditor.onStatusSelect(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                  {statusEditor.newStatus === 'cancelled' && (
                    <Textarea
                      label="Cancellation Reason"
                      required
                      value={statusEditor.cancellationReason}
                      onChange={(e) => statusEditor.onReasonChange(e.target.value)}
                      rows={3}
                      placeholder="Please provide a reason for cancellation..."
                    />
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={statusEditor.onSave}
                      disabled={statusEditor.isSaving}
                      className="px-4 py-2 bg-brand text-content-on-brand rounded-md hover:bg-brand-hover transition disabled:opacity-50"
                    >
                      Save Status
                    </button>
                    <button
                      onClick={statusEditor.onCancel}
                      className="px-4 py-2 bg-surface-sunken text-content-muted rounded-md hover:bg-surface-sunken transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Priority Management */}
            <div>
              <h3 className="text-lg font-semibold text-content mb-4">Priority Level</h3>
              <div className="flex gap-2">
                {PRIORITIES.map((priority) => (
                  <button
                    key={priority}
                    onClick={() => onPriorityChange(priority)}
                    disabled={isPriorityPending}
                    className={`px-4 py-2 rounded-md font-medium transition ${
                      booking.priority === priority
                        ? 'bg-brand text-content-on-brand'
                        : 'bg-surface-sunken text-content-muted hover:bg-surface-sunken'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Notes */}
            {booking.notes && (
              <div>
                <h3 className="text-lg font-semibold text-content mb-4">Customer Notes</h3>
                <div className="bg-brand-subtle border border-brand-subtle rounded-lg p-4">
                  <p className="text-content-muted">{booking.notes}</p>
                </div>
              </div>
            )}

            {/* Cancellation Info */}
            {booking.status === 'cancelled' && booking.cancellation_reason && (
              <div>
                <h3 className="text-lg font-semibold text-content mb-4 flex items-center gap-2">
                  <Icon name="exclamation-triangle" className="text-danger-content" />
                  Cancellation Information
                </h3>
                <div className="bg-danger-surface border border-danger-border rounded-lg p-4">
                  <p className="text-content-muted">{booking.cancellation_reason}</p>
                </div>
              </div>
            )}
          </div>
);

BookingOverviewPanel.propTypes = {
  booking: PropTypes.object.isRequired,
  statusEditor: PropTypes.shape({
    isEditing: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    newStatus: PropTypes.string.isRequired,
    cancellationReason: PropTypes.string.isRequired,
    onEdit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onStatusSelect: PropTypes.func.isRequired,
    onReasonChange: PropTypes.func.isRequired,
  }).isRequired,
  onPriorityChange: PropTypes.func.isRequired,
  isPriorityPending: PropTypes.bool.isRequired,
};

export default BookingOverviewPanel;
