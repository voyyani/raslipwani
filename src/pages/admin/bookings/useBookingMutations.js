import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  setBookingStatus, setBookingPriority, rescheduleBooking, addBookingNote, deleteBookingNote,
} from '@/services/bookings';
import { queryKeys } from '@/services/queryKeys';

/**
 * Every write against a booking, with one invalidation between them.
 *
 * Before this hook the same four mutations were declared in two components and
 * invalidated two flat keys by hand at six call sites — and the seventh forgot
 * one, which is why the counters could disagree with the list.
 *
 * The optimistic reschedule that AdminBookings.jsx drives from drag-and-drop
 * is deliberately NOT this hook's `reschedule` — that one needs `filters` for
 * its rollback key, which this hook cannot see, so it stays in the page. The
 * `reschedule` mutation below is the plain (non-optimistic) write, kept here
 * for interface completeness per the migration brief; neither page currently
 * calls it.
 *
 * `isPending` is the aggregate across all five mutations. Each mutation also
 * exposes its own `is*Pending` flag, because BookingDetailModal disables its
 * priority buttons only while a priority write is in flight, and its add-note
 * button only while a note write is in flight — not while *any* booking
 * mutation anywhere is running. Collapsing those into the one aggregate flag
 * would have quietly widened what gets disabled and when.
 */
export function useBookingMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });

  const status = useMutation({
    mutationFn: ({ id, status: next }) => setBookingStatus(id, next),
    onSuccess: invalidate,
  });
  const priority = useMutation({
    mutationFn: ({ id, priority: next }) => setBookingPriority(id, next),
    onSuccess: invalidate,
  });
  const reschedule = useMutation({
    mutationFn: ({ id, appointmentAt }) => rescheduleBooking(id, { appointmentAt }),
    onSuccess: invalidate,
  });
  const note = useMutation({ mutationFn: addBookingNote, onSuccess: invalidate });
  const removeNoteMutation = useMutation({ mutationFn: deleteBookingNote, onSuccess: invalidate });

  return {
    setStatus: status.mutateAsync,
    setPriority: priority.mutateAsync,
    reschedule: reschedule.mutateAsync,
    addNote: note.mutateAsync,
    removeNote: removeNoteMutation.mutateAsync,
    isPending:
      status.isPending || priority.isPending || reschedule.isPending ||
      note.isPending || removeNoteMutation.isPending,
    isStatusPending: status.isPending,
    isPriorityPending: priority.isPending,
    isReschedulePending: reschedule.isPending,
    isNotePending: note.isPending,
    isRemoveNotePending: removeNoteMutation.isPending,
  };
}
