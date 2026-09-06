import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardStats } from '../dashboard';
import { countProperties, listAll } from '../properties';
import { countBookings, listUpcomingBookings, listRecentBookings } from '../bookings';

// vi.spyOn on an imported ES module namespace throws — the namespace object is
// not extensible. Mocking the modules with factories is the supported way to
// stub named exports that the service under test imports directly.
vi.mock('@/services/properties', () => ({
  countProperties: vi.fn(),
  listAll: vi.fn(),
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
    listAll.mockResolvedValue([{ id: 1 }]);
    countBookings.mockImplementation(async (filters = {}) =>
      filters.status === 'pending' ? 8 : 20
    );
    listUpcomingBookings.mockResolvedValue([{ id: 'a' }]);
    listRecentBookings.mockResolvedValue([{ id: 'b' }]);

    const stats = await getDashboardStats();

    expect(stats.properties).toEqual({ total: 14, featured: 2, pending: 3, sold: 4, available: 5 });
    expect(stats.bookings).toEqual({ total: 20, pending: 8 });
    expect(stats.upcoming).toEqual([{ id: 'a' }]);
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
    listAll.mockImplementation(async () => (await track(), []));
    countBookings.mockImplementation(track);
    listUpcomingBookings.mockImplementation(async () => (await track(), []));
    listRecentBookings.mockImplementation(async () => (await track(), []));

    await getDashboardStats();
    expect(peak).toBeGreaterThan(1);
  });
});
