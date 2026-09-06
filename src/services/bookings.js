import { supabase } from '@/utils/supabaseClient';
import { unwrap, unwrapList, unwrapCount } from './unwrap';
import { queryKeys } from './queryKeys';
import { STALE_TIME } from './cachePolicy';

const TABLE = 'bookings';
const NOTES_TABLE = 'booking_notes';

/** The admin filter dropdowns default to this, and it means "no filter". */
const isSet = (value) => value !== undefined && value !== null && value !== '' && value !== 'all';

const now = () => new Date().toISOString();

export async function listBookings({ status, priority } = {}) {
  let query = supabase
    .from(TABLE)
    .select('*')
    .eq('is_archived', false)
    .order('appointment_at', { ascending: true });

  if (isSet(status)) query = query.eq('status', status);
  if (isSet(priority)) query = query.eq('priority', priority);

  return unwrapList(await query, { table: TABLE, operation: 'listBookings' });
}

/**
 * The four counters above the admin bookings table.
 *
 * One query fetching two columns, tallied here. The previous version ran the
 * same query and tallied it inside the component, which is why the numbers and
 * the list could disagree after a status change: two cache entries, one
 * invalidation.
 */
export async function getBookingStats() {
  const rows = unwrapList(
    await supabase.from(TABLE).select('status, priority').eq('is_archived', false),
    { table: TABLE, operation: 'getBookingStats' }
  );

  const tally = (values) =>
    values.reduce((acc, value) => {
      const key = value ?? 'unset';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

  return {
    total: rows.length,
    byStatus: tally(rows.map((row) => row.status)),
    byPriority: tally(rows.map((row) => row.priority)),
  };
}

export async function countPendingBookings() {
  return unwrapCount(
    await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .eq('is_archived', false),
    { table: TABLE, operation: 'countPendingBookings' }
  ).count;
}

export async function countBookings({ status } = {}) {
  let query = supabase.from(TABLE).select('*', { count: 'exact', head: true });
  if (isSet(status)) query = query.eq('status', status);
  return unwrapCount(await query, { table: TABLE, operation: 'countBookings' }).count;
}

export async function listUpcomingBookings({ limit = 5 } = {}) {
  return unwrapList(
    await supabase
      .from(TABLE)
      .select('id, name, appointment_at, service, viewing_type')
      .gte('appointment_at', now())
      .order('appointment_at', { ascending: true })
      .limit(limit),
    { table: TABLE, operation: 'listUpcomingBookings' }
  );
}

export async function listRecentBookings({ limit = 5 } = {}) {
  return unwrapList(
    await supabase
      .from(TABLE)
      .select('id, name, service, viewing_type, type, created_at')
      .order('created_at', { ascending: false })
      .limit(limit),
    { table: TABLE, operation: 'listRecentBookings' }
  );
}

/**
 * The public enquiry path — Contact, ServicesMain and ViewingExperience.
 *
 * Returns nothing on purpose: migration 009's INSERT policy requires every
 * admin-only column to be NULL on submission, so the row a prospect creates is
 * not theirs to read back.
 */
export async function createBooking(record) {
  unwrap(await supabase.from(TABLE).insert([record]), {
    table: TABLE,
    operation: 'createBooking',
  });
}

export async function updateBooking(bookingId, updates) {
  return unwrap(
    await supabase
      .from(TABLE)
      .update({ ...updates, last_modified_at: now() })
      .eq('id', bookingId)
      .select()
      .single(),
    { table: TABLE, operation: 'updateBooking' }
  );
}

export const setBookingStatus = (bookingId, status) => updateBooking(bookingId, { status });

export const setBookingPriority = (bookingId, priority) => updateBooking(bookingId, { priority });

export const rescheduleBooking = (bookingId, { appointmentAt }) =>
  updateBooking(bookingId, { appointment_at: appointmentAt });

export async function listBookingNotes(bookingId) {
  return unwrapList(
    await supabase
      .from(NOTES_TABLE)
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false }),
    { table: NOTES_TABLE, operation: 'listBookingNotes' }
  );
}

export async function addBookingNote({ bookingId, note, author }) {
  return unwrap(
    await supabase
      .from(NOTES_TABLE)
      .insert({ booking_id: bookingId, note, author })
      .select()
      .single(),
    { table: NOTES_TABLE, operation: 'addBookingNote' }
  );
}

export async function deleteBookingNote(noteId) {
  unwrap(await supabase.from(NOTES_TABLE).delete().eq('id', noteId), {
    table: NOTES_TABLE,
    operation: 'deleteBookingNote',
  });
}

export const bookingQueries = {
  list: (filters = {}) => ({
    queryKey: queryKeys.bookings.list(filters),
    queryFn: () => listBookings(filters),
    staleTime: STALE_TIME.live,
  }),
  stats: () => ({
    queryKey: queryKeys.bookings.stats(),
    queryFn: () => getBookingStats(),
    staleTime: STALE_TIME.live,
  }),
  pendingCount: () => ({
    queryKey: queryKeys.bookings.pendingCount(),
    queryFn: () => countPendingBookings(),
    staleTime: STALE_TIME.live,
  }),
  notes: (bookingId) => ({
    queryKey: queryKeys.bookings.notes(bookingId),
    queryFn: () => listBookingNotes(bookingId),
    staleTime: STALE_TIME.live,
    enabled: Boolean(bookingId),
  }),
};
