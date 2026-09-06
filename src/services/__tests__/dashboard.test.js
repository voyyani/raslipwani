import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardStats } from '../dashboard';
import { countProperties, listRecentProperties } from '../properties';
import { countBookings, listUpcomingBookings, listRecentBookings } from '../bookings';

// vi.spyOn on an imported ES module namespace throws — the namespace object is
// not extensible. Mocking the modules with factories is the supported way to
// stub named exports that the service under test imports directly.
vi.mock('@/services/properties', () => ({
  countProperties: vi.fn(),
  listRecentProperties: vi.fn(),
}));
vi.mock('@/services/bookings', () => ({
  countBookings: vi.fn(),
  listUpcomingBookings: vi.fn(),
  listRecentBookings: vi.fn(),
}));

beforeEach(() => vi.resetAllMocks());

describe('getDashboardStats', () => {
  it('composes the property and booking counters into one shape', async () => {
    countProperties.mockImplementation(async (filters = {}) => {
      if (filters.featured) return 2;
      if (filters.status === 'pending') return 3;
      if (filters.status === 'sold') return 4;
      if (filters.status === 'available') return 5;
      return 14;
    });
    listRecentProperties.mockResolvedValue([{ id: 1 }]);
    countBookings.mockImplementation(async (filters = {}) =>
      filters.createdAfter ? 8 : 20
    );
    listUpcomingBookings.mockResolvedValue([{ id: 'a' }]);
    listRecentBookings.mockResolvedValue([{ id: 'b' }]);

    const stats = await getDashboardStats();

    expect(stats.properties).toEqual({ total: 14, featured: 2, pending: 3, sold: 4, available: 5 });
    expect(stats.bookings).toEqual({ total: 20, last7Days: 8 });
    expect(stats.upcoming).toEqual([{ id: 'a' }]);
    expect(stats.recentProperties).toEqual([{ id: 1 }]);
  });

  // The dashboard's "New Bookings" tile has always meant bookings created in
  // the last 7 days (a `created_at` cutoff), not a status filter. A plan that
  // wires the tile to countBookings({ status: 'pending' }) instead passes the
  // shape-only assertion above while silently changing what the number means —
  // this pins the actual query so that regression fails loudly.
  it('counts bookings created in the last 7 days, not by status', async () => {
    countProperties.mockResolvedValue(0);
    listRecentProperties.mockResolvedValue([]);
    countBookings.mockResolvedValue(0);
    listUpcomingBookings.mockResolvedValue([]);
    listRecentBookings.mockResolvedValue([]);

    const before = Date.now();
    await getDashboardStats();
    const after = Date.now();

    const last7DaysCall = countBookings.mock.calls.find(([filters]) => filters?.createdAfter);
    expect(last7DaysCall).toBeDefined();
    expect(last7DaysCall[0].status).toBeUndefined();

    const cutoff = new Date(last7DaysCall[0].createdAfter).getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    // The cutoff was computed as "now - 7 days" at call time, within the
    // window this test itself ran in.
    expect(cutoff).toBeGreaterThanOrEqual(before - sevenDaysMs - 1000);
    expect(cutoff).toBeLessThanOrEqual(after - sevenDaysMs + 1000);
  });

  // Fetching every property with `select('*')` to show five rows in a
  // four-column activity feed is the kind of over-fetch that doesn't show up
  // until the table has thousands of rows. Pinning the narrow call, not just
  // the five-item result, is what makes a regression to listAll() fail here.
  it('fetches recent properties narrowly rather than listing everything', async () => {
    countProperties.mockResolvedValue(0);
    listRecentProperties.mockResolvedValue([]);
    countBookings.mockResolvedValue(0);
    listUpcomingBookings.mockResolvedValue([]);
    listRecentBookings.mockResolvedValue([]);

    await getDashboardStats();

    expect(listRecentProperties).toHaveBeenCalledWith({ limit: 5 });
  });

  // The upcoming-viewings tile has always shown 4, not 5.
  it('asks for exactly four upcoming bookings', async () => {
    countProperties.mockResolvedValue(0);
    listRecentProperties.mockResolvedValue([]);
    countBookings.mockResolvedValue(0);
    listUpcomingBookings.mockResolvedValue([]);
    listRecentBookings.mockResolvedValue([]);

    await getDashboardStats();

    expect(listUpcomingBookings).toHaveBeenCalledWith({ limit: 4 });
  });

  it('runs its queries concurrently rather than one after another', async () => {
    // Nine sequential round trips is the difference between a dashboard that
    // paints and one that hangs on a slow connection.
    let inFlight = 0;
    let peak = 0;
    const track = async () => {
      inFlight += 1;
      peak = Math.max(peak, inFlight);
      await Promise.resolve();
      inFlight -= 1;
      return 0;
    };
    countProperties.mockImplementation(track);
    listRecentProperties.mockImplementation(async () => (await track(), []));
    countBookings.mockImplementation(track);
    listUpcomingBookings.mockImplementation(async () => (await track(), []));
    listRecentBookings.mockImplementation(async () => (await track(), []));

    await getDashboardStats();
    expect(peak).toBeGreaterThan(1);
  });
});
