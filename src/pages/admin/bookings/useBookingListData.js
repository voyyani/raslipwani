import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingQueries } from '@/services/bookings';

// A stable empty array so the default for an unresolved query doesn't hand a
// fresh reference to the dependent useMemo on every render.
const EMPTY_BOOKINGS = [];

/**
 * The bookings screen's two reads, and the two shape adjustments between the
 * service layer and what the screen renders.
 *
 * `listBookings(filters)` only understands `status` and `priority` — it queries
 * the table those two ways and nothing else. The free-text search box and the
 * (currently UI-less) date range have no server-side equivalent, so they stay
 * client-side filters over the fetched page rather than being silently dropped:
 * a wider SQL query filtered in memory, deliberately, so the search box works.
 *
 * `getBookingStats()` returns { total, byStatus, byPriority } — a tally keyed
 * by the exact status/priority value, not the flat { total, pending, ... }
 * shape the tiles read. Remapped here, once. The old tally counted 'high' and
 * 'urgent' priority together, and still does.
 *
 * Returns `listFilters` as well: it is the exact key the list query is cached
 * under, which the optimistic reschedule has to snapshot and restore.
 */
export function useBookingListData(filters) {
  const listFilters = { status: filters.status, priority: filters.priority };

  const { data: rawBookings = EMPTY_BOOKINGS, isLoading } = useQuery(
    bookingQueries.list(listFilters)
  );

  const bookings = useMemo(() => {
    let result = rawBookings;

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(booking =>
        (booking.name || '').toLowerCase().includes(term) ||
        (booking.email || '').toLowerCase().includes(term) ||
        (booking.phone || '').toLowerCase().includes(term)
      );
    }
    if (filters.dateRange.start) {
      result = result.filter(booking => booking.appointment_at >= filters.dateRange.start);
    }
    if (filters.dateRange.end) {
      result = result.filter(booking => booking.appointment_at <= filters.dateRange.end);
    }

    return result;
  }, [rawBookings, filters.search, filters.dateRange.start, filters.dateRange.end]);

  const { data: rawStats } = useQuery(bookingQueries.stats());
  const stats = rawStats && {
    total: rawStats.total,
    pending: rawStats.byStatus?.pending ?? 0,
    confirmed: rawStats.byStatus?.confirmed ?? 0,
    completed: rawStats.byStatus?.completed ?? 0,
    cancelled: rawStats.byStatus?.cancelled ?? 0,
    high_priority: (rawStats.byPriority?.high ?? 0) + (rawStats.byPriority?.urgent ?? 0),
  };

  return { bookings, stats, isLoading, listFilters };
}
