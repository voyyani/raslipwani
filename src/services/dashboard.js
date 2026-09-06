import { countProperties, listAll as listAllProperties } from './properties';
import { countBookings, listUpcomingBookings, listRecentBookings } from './bookings';
import { queryKeys } from './queryKeys';
import { STALE_TIME } from './cachePolicy';

/**
 * Everything the admin dashboard shows, in one call.
 *
 * The nine queries were previously spelled out inside the component's
 * useEffect, which meant nothing could assert on them and a slow one blocked
 * the render of all the others. They stay concurrent; only their home changes.
 */
export async function getDashboardStats() {
  const [
    total, featured, pending, sold, available,
    bookingsTotal, bookingsPending,
    upcoming, recentProperties, recentBookings,
  ] = await Promise.all([
    countProperties(),
    countProperties({ featured: true }),
    countProperties({ status: 'pending' }),
    countProperties({ status: 'sold' }),
    countProperties({ status: 'available' }),
    countBookings(),
    countBookings({ status: 'pending' }),
    listUpcomingBookings({ limit: 5 }),
    listAllProperties({ sortField: 'created_at', sortDirection: 'desc' }),
    listRecentBookings({ limit: 5 }),
  ]);

  return {
    properties: { total, featured, pending, sold, available },
    bookings: { total: bookingsTotal, pending: bookingsPending },
    upcoming,
    recentProperties: recentProperties.slice(0, 5),
    recentBookings,
  };
}

export const dashboardQueries = {
  stats: () => ({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => getDashboardStats(),
    staleTime: STALE_TIME.live,
  }),
};
