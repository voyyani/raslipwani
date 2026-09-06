import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/utils/supabaseClient';
import { format } from 'date-fns';
import BookingStatusBadge from '../../components/BookingStatusBadge';
import toast from 'react-hot-toast';

import useConfirm from '../../components/ui/useConfirm';
import usePrompt from '../../components/ui/usePrompt';
import useDialog from '../../components/ui/useDialog';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Icon from '../../components/Icon';

/**
 * BookingDetailModal - Comprehensive booking detail and management modal
 * Features: Status workflow, internal notes, quick actions, activity log
 */
const BookingDetailModal = ({ booking, onClose, onUpdate }) => {
  const [confirm, confirmDialog] = useConfirm();
  const [prompt, promptDialog] = usePrompt();
  const queryClient = useQueryClient();
  const panelRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(booking.status);
  const [cancellationReason, setCancellationReason] = useState('');

  // Fetch booking notes
  const { data: notes = [] } = useQuery({
    queryKey: ['booking-notes', booking.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_notes')
        .select('*')
        .eq('booking_id', booking.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, reason }) => {
      const updates = {
        status,
        last_modified_at: new Date().toISOString()
      };

      if (status === 'cancelled') {
        updates.cancellation_reason = reason;
        updates.cancelled_by = 'admin-user-id'; // Replace with actual user ID
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', booking.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
      setIsEditingStatus(false);
      setCancellationReason('');
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-stats'] });
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (noteText) => {
      const { data, error } = await supabase
        .from('booking_notes')
        .insert({
          booking_id: booking.id,
          note_text: noteText,
          created_by: 'admin-user-id', // Replace with actual user ID
          is_internal: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Note added successfully');
      setNewNote('');
      queryClient.invalidateQueries({ queryKey: ['booking-notes', booking.id] });
    },
    onError: () => {
      toast.error('Failed to add note');
    }
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId) => {
      const { error } = await supabase
        .from('booking_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Note deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['booking-notes', booking.id] });
    },
    onError: () => {
      toast.error('Failed to delete note');
    }
  });

  // Update booking priority
  const updatePriorityMutation = useMutation({
    mutationFn: async (priority) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ priority, last_modified_at: new Date().toISOString() })
        .eq('id', booking.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Priority updated successfully');
      onUpdate();
    },
    onError: () => {
      toast.error('Failed to update priority');
    }
  });

  // Quick action handlers
  const handleConfirm = () => {
    if (booking.status === 'pending') {
      updateStatusMutation.mutate({ status: 'confirmed', reason: null });
    }
  };

  const handleComplete = () => {
    if (booking.status === 'confirmed') {
      updateStatusMutation.mutate({ status: 'completed', reason: null });
    }
  };

  /**
   * Cancel the booking, with a reason.
   *
   * This used `prompt()`, whose empty-submission and dismissal cases are both
   * falsy — so an admin who pressed OK without typing cancelled nothing and was
   * told nothing. `usePrompt` requires the value and keeps the dialog open until
   * it has one; `null` still means dismissed.
   */
  const handleCancel = async () => {
    const reason = await prompt({
      title: 'Cancel booking',
      label: 'Cancellation reason',
      hint: 'Recorded against the booking and shown in its history.',
      multiline: true,
      confirmLabel: 'Cancel booking',
      cancelLabel: 'Keep booking',
      requiredMessage: 'A cancellation reason is required.',
    });

    if (reason !== null) {
      updateStatusMutation.mutate({ status: 'cancelled', reason });
    }
  };

  const handleStatusChange = () => {
    if (newStatus === 'cancelled' && !cancellationReason) {
      toast.error('Please provide a cancellation reason');
      return;
    }
    updateStatusMutation.mutate({ status: newStatus, reason: cancellationReason });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }
    addNoteMutation.mutate(newNote);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-content-muted',
      medium: 'text-brand',
      high: 'text-warning-content',
      urgent: 'text-danger-content'
    };
    return colors[priority] || colors.medium;
  };

  /**
   * This sheet cannot wear `Modal`'s chrome: on mobile it is a drag-to-dismiss
   * bottom sheet with a gradient header and a back affordance, and a titled
   * panel would fight all three. `useDialog` is the half it does need — focus
   * enters and is trapped, Escape closes, and focus returns to the row that
   * opened it. It had none of those.
   */
  useDialog({ isOpen: true, onClose, panelRef });

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-scrim/50 flex items-end md:items-center justify-center z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Booking details"
          tabIndex={-1}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          onDragEnd={(e, info) => {
            if (info.offset.y > 100) {
              onClose();
            }
          }}
          className="bg-surface-raised w-full md:max-w-4xl md:rounded-lg shadow-xl 
            h-[95vh] md:h-auto md:max-h-[90vh] 
            overflow-hidden flex flex-col
            rounded-t-2xl md:rounded-lg"
        >
          {/* Mobile Drag Handle */}
          <div className="md:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-surface-sunken rounded-full" />
          </div>

          {/* Header */}
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
                  <span className={`text-xs md:text-sm font-semibold ${getPriorityColor(booking.priority)}`}>
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

          {/* Tab Navigation */}
          <div className="border-b bg-surface overflow-x-auto">
            <div className="flex gap-1 px-3 md:px-6 min-w-max">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 md:px-4 py-2.5 md:py-3 font-medium transition text-sm md:text-base whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'text-brand border-b-2 border-brand bg-surface-raised'
                    : 'text-content-muted hover:text-content'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3 md:px-4 py-2.5 md:py-3 font-medium transition text-sm md:text-base whitespace-nowrap ${
                  activeTab === 'notes'
                    ? 'text-brand border-b-2 border-brand bg-surface-raised'
                    : 'text-content-muted hover:text-content'
                }`}
              >
                Notes ({notes.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 md:px-4 py-2.5 md:py-3 font-medium transition text-sm md:text-base whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'text-brand border-b-2 border-brand bg-surface-raised'
                    : 'text-content-muted hover:text-content'
                }`}
              >
                Activity Log
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
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
                {!isEditingStatus ? (
                  <div className="flex items-center gap-3">
                    <BookingStatusBadge status={booking.status} />
                    <button
                      onClick={() => setIsEditingStatus(true)}
                      className="text-brand hover:text-brand font-medium text-sm flex items-center gap-2"
                    >
                      <Icon name="edit" /> Change Status
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 bg-surface p-4 rounded-lg">
                    <Select
                      label="New Status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                    {newStatus === 'cancelled' && (
                      <Textarea
                        label="Cancellation Reason"
                        required
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        rows={3}
                        placeholder="Please provide a reason for cancellation..."
                      />
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleStatusChange}
                        disabled={updateStatusMutation.isPending}
                        className="px-4 py-2 bg-brand text-content-on-brand rounded-md hover:bg-brand-hover transition disabled:opacity-50"
                      >
                        Save Status
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingStatus(false);
                          setNewStatus(booking.status);
                          setCancellationReason('');
                        }}
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
                  {['low', 'medium', 'high', 'urgent'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => updatePriorityMutation.mutate(priority)}
                      disabled={updatePriorityMutation.isPending}
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
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add Note Form */}
              <div className="bg-surface p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-content mb-3">Add Internal Note</h3>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-line-strong rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring mb-3"
                  placeholder="Add a note visible only to admins..."
                />
                <button
                  onClick={handleAddNote}
                  disabled={addNoteMutation.isPending || !newNote.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-brand text-content-on-brand rounded-md hover:bg-brand-hover transition disabled:opacity-50"
                >
                  <Icon name="plus" /> Add Note
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {notes.length === 0 ? (
                  <div className="text-center py-8 text-content-subtle">
                    No internal notes yet. Add one above to get started.
                  </div>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="bg-surface-raised border border-line rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm text-content-muted">
                          {format(new Date(note.created_at), 'PPp')}
                        </div>
                        <button
                          onClick={async () => {
                            const ok = await confirm({
                              title: 'Delete note',
                              message:
                                'This note will be permanently deleted from the booking.',
                              confirmLabel: 'Delete note',
                            });
                            if (ok) deleteNoteMutation.mutate(note.id);
                          }}
                          className="text-danger-content hover:opacity-80"
                          aria-label="Delete note"
                        >
                          <Icon name="trash" />
                        </button>
                      </div>
                      <p className="text-content-muted">{note.note_text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === 'history' && (
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
          )}
        </div>

        {/* Footer with Quick Actions */}
        <div className="border-t bg-surface p-4 md:p-6 safe-area-pb">
          {/* Mobile Actions - Full Width Buttons */}
          <div className="md:hidden space-y-2">
            {booking.status === 'pending' && (
              <button
                onClick={handleConfirm}
                disabled={updateStatusMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand text-content-on-brand rounded-xl font-medium active:bg-brand-hover transition disabled:opacity-50"
              >
                <Icon name="check" /> Confirm Booking
              </button>
            )}
            {booking.status === 'confirmed' && (
              <button
                onClick={handleComplete}
                disabled={updateStatusMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-success-content text-content-on-brand rounded-xl font-medium active:bg-success-content transition disabled:opacity-50"
              >
                <Icon name="check" /> Mark Completed
              </button>
            )}
            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <button
                onClick={handleCancel}
                disabled={updateStatusMutation.isPending}
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
                onClick={handleConfirm}
                disabled={updateStatusMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-brand text-content-on-brand rounded-md hover:bg-brand-hover transition disabled:opacity-50"
              >
                <Icon name="check" /> Confirm Booking
              </button>
            )}
            {booking.status === 'confirmed' && (
              <button
                onClick={handleComplete}
                disabled={updateStatusMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-success-content text-content-on-brand rounded-md hover:bg-success-content transition disabled:opacity-50"
              >
                <Icon name="check" /> Mark Completed
              </button>
            )}
            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <button
                onClick={handleCancel}
                disabled={updateStatusMutation.isPending}
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
        </motion.div>
      </motion.div>

      {confirmDialog}
      {promptDialog}
    </AnimatePresence>
  );
};

export default BookingDetailModal;
