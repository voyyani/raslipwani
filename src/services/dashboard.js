import { countProperties, listRecentProperties } from './properties';
import { countBookings, listUpcomingBookings, listRecentBookings } from './bookings';
import { queryKeys } from './queryKeys';
import { STALE_TIME } from './cachePolicy';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Everything the admin dashboard shows, in one call.
 *
 * The nine queries were previously spelled out inside the component's
 * useEffect, which meant nothing could assert on them and a slow one blocked
 * the render of all the others. They stay concurrent; only their home changes.
 */
export async function getDashboardStats() {
  const createdAfter = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();

  const [
    total, featured, pending, sold, available,
    bookingsTotal, last7Days,
    upcoming, recentProperties, recentBookings,
  ] = await Promise.all([
    countProperties(),
    countProperties({ featured: true }),
    countProperties({ status: 'pending' }),
    countProperties({ status: 'sold' }),
    countProperties({ status: 'available' }),
    countBookings(),
    countBookings({ createdAfter }),
    listUpcomingBookings({ limit: 4 }),
    listRecentProperties({ limit: 5 }),
    listRecentBookings({ limit: 5 }),
  ]);

  return {
    properties: { total, featured, pending, sold, available },
    bookings: { total: bookingsTotal, last7Days },
    upcoming,
    recentProperties,
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
