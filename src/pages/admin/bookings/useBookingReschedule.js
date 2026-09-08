import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { rescheduleBooking } from '@/services/bookings';
import { queryKeys } from '@/services/queryKeys';

/**
 * The optimistic drag-and-drop reschedule, kept apart from
 * `useBookingMutations` because it needs the page's list filters: the entry it
 * rewrites lives under `queryKeys.bookings.list(listFilters)`, and the rollback
 * has to restore the *same* key it snapshotted or the optimistic guess survives
 * the failure it was meant to undo.
 *
 * `listFilters` must be the object the page hands `bookingQueries.list()`,
 * nothing wider — that is the cache entry FullCalendar is drawing.
 */
export function useBookingReschedule(listFilters) {
  const queryClient = useQueryClient();
  const listKey = queryKeys.bookings.list(listFilters);

  const mutation = useMutation({
    mutationFn: ({ id, appointmentAt }) => rescheduleBooking(id, { appointmentAt }),
    onMutate: async ({ id, appointmentAt }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.all });

      const previousBookings = queryClient.getQueryData(listKey);

      queryClient.setQueryData(listKey, (old) =>
        old?.map((booking) =>
          booking.id === id ? { ...booking, appointment_at: appointmentAt } : booking
        )
      );

      return { previousBookings };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(listKey, context?.previousBookings);
      toast.error('Failed to reschedule booking');
    },
    onSuccess: () => {
      toast.success('Booking rescheduled successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });

  return { reschedule: mutation.mutate, isRescheduling: mutation.isPending };
}
