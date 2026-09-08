import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  bookingQueries,
  updateBooking,
  setBookingPriority,
  addBookingNote,
  deleteBookingNote,
} from '@/services/bookings';
import { queryKeys } from '@/services/queryKeys';
import BookingDetailHeader from './bookings/BookingDetailHeader';
import BookingDetailTabs from './bookings/BookingDetailTabs';
import BookingOverviewPanel from './bookings/BookingOverviewPanel';
import BookingNotesPanel from './bookings/BookingNotesPanel';
import BookingActivityLog from './bookings/BookingActivityLog';
import BookingDetailFooter from './bookings/BookingDetailFooter';
import toast from 'react-hot-toast';

import useConfirm from '../../components/ui/useConfirm';
import usePrompt from '../../components/ui/usePrompt';
import useDialog from '../../components/ui/useDialog';
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
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(booking.status);
  const [cancellationReason, setCancellationReason] = useState('');

  // Fetch booking notes
  const { data: notes = [] } = useQuery(bookingQueries.notes(booking.id));

  // Update booking status mutation.
  //
  // This writes more than `status`: a cancellation also records
  // `cancellation_reason` and `cancelled_by`, which `setBookingStatus` (a
  // fixed two-field write) has no way to carry — so this calls the more
  // general `updateBooking` directly instead, the same way the previous
  // inline Supabase call built up its own `updates` object.
  const updateStatusMutation = useMutation({
    mutationFn: ({ status, reason }) => {
      const updates = { status };
      if (status === 'cancelled') {
        updates.cancellation_reason = reason;
        updates.cancelled_by = 'admin-user-id'; // Replace with actual user ID
      }
      return updateBooking(booking.id, updates);
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
      setIsEditingStatus(false);
      setCancellationReason('');
      onUpdate();
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: (noteText) =>
      addBookingNote({ bookingId: booking.id, note: noteText, author: 'admin-user-id' }),
    onSuccess: () => {
      toast.success('Note added successfully');
      // Invalidating the whole domain (not just this booking's notes) is
      // deliberate: this is the call site that used to forget the stats key,
      // which is exactly the bug this migration's own test guards against.
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
    onError: () => {
      toast.error('Failed to add note');
    }
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (noteId) => deleteBookingNote(noteId),
    onSuccess: () => {
      toast.success('Note deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
    onError: () => {
      toast.error('Failed to delete note');
    }
  });

  // Update booking priority
  const updatePriorityMutation = useMutation({
    mutationFn: (priority) => setBookingPriority(booking.id, priority),
    onSuccess: () => {
      toast.success('Priority updated successfully');
      onUpdate();
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
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

  const statusEditor = {
    isEditing: isEditingStatus,
    isSaving: updateStatusMutation.isPending,
    newStatus,
    cancellationReason,
    onEdit: () => setIsEditingStatus(true),
    onCancel: () => {
      setIsEditingStatus(false);
      setNewStatus(booking.status);
      setCancellationReason('');
    },
    onSave: handleStatusChange,
    onStatusSelect: setNewStatus,
    onReasonChange: setCancellationReason,
  };

  // Resolves true only when the note actually landed, so the panel clears its
  // draft on success and keeps the admin's typing on failure.
  const handleAddNote = async (noteText) => {
    try {
      await addNoteMutation.mutateAsync(noteText);
      return true;
    } catch {
      return false;
    }
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
          <BookingDetailHeader booking={booking} onClose={onClose} />

          <BookingDetailTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            noteCount={notes.length}
          />

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === 'overview' && (
          <BookingOverviewPanel
            booking={booking}
            statusEditor={statusEditor}
            onPriorityChange={(priority) => updatePriorityMutation.mutate(priority)}
            isPriorityPending={updatePriorityMutation.isPending}
          />
        )}

        {activeTab === 'notes' && (
          <BookingNotesPanel
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={(noteId) => deleteNoteMutation.mutate(noteId)}
            isAdding={addNoteMutation.isPending}
            confirm={confirm}
          />
        )}

        {activeTab === 'history' && <BookingActivityLog booking={booking} />}
        </div>

        <BookingDetailFooter
          booking={booking}
          onConfirm={handleConfirm}
          onComplete={handleComplete}
          onCancel={handleCancel}
          onClose={onClose}
          isSaving={updateStatusMutation.isPending}
        />
        </motion.div>
      </motion.div>

      {confirmDialog}
      {promptDialog}
    </AnimatePresence>
  );
};

export default BookingDetailModal;