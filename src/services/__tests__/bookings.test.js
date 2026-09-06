import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/utils/supabaseClient';
import { mockFrom } from '@/test/utils/supabaseQueryMock';
import {
  listBookings, getBookingStats, countPendingBookings, createBooking,
  setBookingStatus, rescheduleBooking, addBookingNote, bookingQueries,
} from '../bookings';
import { queryKeys } from '../queryKeys';
import { STALE_TIME } from '../cachePolicy';

beforeEach(() => vi.clearAllMocks());

describe('listBookings', () => {
  it('excludes archived bookings and orders by appointment, soonest first', async () => {
    const builders = mockFrom(supabase, { bookings: { data: [], error: null } });
    await listBookings();
    expect(builders.bookings.eq).toHaveBeenCalledWith('is_archived', false);
    expect(builders.bookings.order).toHaveBeenCalledWith('appointment_at', { ascending: true });
  });

  it('applies a status filter when one is given', async () => {
    const builders = mockFrom(supabase, { bookings: { data: [], error: null } });
    await listBookings({ status: 'pending' });
    expect(builders.bookings.eq).toHaveBeenCalledWith('status', 'pending');
  });

  it('ignores an "all" filter rather than querying for the literal string', async () => {
    // The bug this prevents: the admin filter's default option is the string
    // 'all', and passing it through returned zero rows on every screen.
    const builders = mockFrom(supabase, { bookings: { data: [], error: null } });
    await listBookings({ status: 'all', priority: 'all' });
    expect(builders.bookings.eq).not.toHaveBeenCalledWith('status', 'all');
    expect(builders.bookings.eq).not.toHaveBeenCalledWith('priority', 'all');
  });
});

describe('getBookingStats', () => {
  it('counts by status and by priority in one pass', async () => {
    mockFrom(supabase, {
      bookings: {
        data: [
          { status: 'pending', priority: 'high' },
          { status: 'pending', priority: 'low' },
          { status: 'confirmed', priority: 'high' },
        ],
        error: null,
      },
    });

    await expect(getBookingStats()).resolves.toEqual({
      total: 3,
      byStatus: { pending: 2, confirmed: 1 },
      byPriority: { high: 2, low: 1 },
    });
  });

  it('returns zeroed maps for an empty table rather than undefined', async () => {
    mockFrom(supabase, { bookings: { data: [], error: null } });
    await expect(getBookingStats()).resolves.toEqual({ total: 0, byStatus: {}, byPriority: {} });
  });

  it('buckets a row with no priority under "unset" instead of dropping it', async () => {
    mockFrom(supabase, { bookings: { data: [{ status: 'pending', priority: null }], error: null } });
    const stats = await getBookingStats();
    expect(stats.byPriority).toEqual({ unset: 1 });
    expect(stats.total).toBe(1);
  });
});

describe('countPendingBookings', () => {
  it('counts pending, unarchived bookings without fetching their rows', async () => {
    const builders = mockFrom(supabase, { bookings: { data: null, count: 8, error: null } });
    await expect(countPendingBookings()).resolves.toBe(8);
    expect(builders.bookings.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
    expect(builders.bookings.eq).toHaveBeenCalledWith('status', 'pending');
    expect(builders.bookings.eq).toHaveBeenCalledWith('is_archived', false);
  });
});

describe('createBooking', () => {
  it('inserts the record the public forms build', async () => {
    const builders = mockFrom(supabase, { bookings: { data: null, error: null } });
    const record = { type: 'viewing', name: 'A', email: 'a@b.c', phone: '1' };
    await createBooking(record);
    expect(builders.bookings.insert).toHaveBeenCalledWith([record]);
  });
});

describe('writes', () => {
  it('stamps last_modified_at when the status changes', async () => {
    const builders = mockFrom(supabase, { bookings: { data: { id: 'x' }, error: null } });
    await setBookingStatus('x', 'confirmed');
    const [updates] = builders.bookings.update.mock.calls[0];
    expect(updates.status).toBe('confirmed');
    expect(updates.last_modified_at).toEqual(expect.any(String));
  });

  it('reschedules to the given appointment time', async () => {
    const builders = mockFrom(supabase, { bookings: { data: { id: 'x' }, error: null } });
    await rescheduleBooking('x', { appointmentAt: '2026-10-01T09:00:00.000Z' });
    const [updates] = builders.bookings.update.mock.calls[0];
    expect(updates.appointment_at).toBe('2026-10-01T09:00:00.000Z');
  });

  it('writes a note against the booking', async () => {
    const builders = mockFrom(supabase, { booking_notes: { data: { id: 1 }, error: null } });
    await addBookingNote({ bookingId: 'x', note: 'called back', author: 'admin' });
    expect(builders.booking_notes.insert).toHaveBeenCalledWith({
      booking_id: 'x',
      note: 'called back',
      author: 'admin',
    });
  });
});

describe('bookingQueries', () => {
  it('uses the registry key and the live lifetime for the pending counter', () => {
    const options = bookingQueries.pendingCount();
    expect(options.queryKey).toEqual(queryKeys.bookings.pendingCount());
    expect(options.staleTime).toBe(STALE_TIME.live);
  });

  it('includes the filters in the list key', () => {
    expect(bookingQueries.list({ status: 'pending' }).queryKey)
      .toEqual(queryKeys.bookings.list({ status: 'pending' }));
  });
});
