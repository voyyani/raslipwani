import { supabase } from '@/utils/supabaseClient';
import { unwrap, unwrapCount } from './unwrap';
import { queryKeys } from './queryKeys';
import { STALE_TIME } from './cachePolicy';
import { sanitiseSearch } from './sanitiseSearch';

const TABLE = 'clients';

const isSet = (value) => value !== undefined && value !== null && value !== '' && value !== 'all';

export async function listClientsPage({
  page = 1,
  pageSize = 10,
  status,
  clientType,
  search,
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (isSet(status)) query = query.eq('status', status);
  if (isSet(clientType)) query = query.eq('client_type', clientType);

  if (isSet(search)) {
    const term = sanitiseSearch(search);
    if (term) {
      query = query.or(
        `first_name.ilike.%${term}%,last_name.ilike.%${term}%,` +
          `email.ilike.%${term}%,phone.ilike.%${term}%`
      );
    }
  }

  return unwrapCount(await query, { table: TABLE, operation: 'listClientsPage' });
}

export async function getClientById(clientId) {
  return unwrap(await supabase.from(TABLE).select('*').eq('id', clientId).single(), {
    table: TABLE,
    operation: 'getClientById',
  });
}

/** The three counters on the client detail header. */
export async function getClientStats(clientId) {
  const countFor = async (table, column, operation) =>
    unwrapCount(
      await supabase.from(table).select('id', { count: 'exact', head: true }).eq(column, clientId),
      { table, operation }
    ).count;

  const [interests, communications, bookings] = await Promise.all([
    countFor('client_property_interests', 'client_id', 'getClientStats.interests'),
    countFor('client_communications', 'client_id', 'getClientStats.communications'),
    countFor('bookings', 'client_id', 'getClientStats.bookings'),
  ]);

  return { interests, communications, bookings };
}

export async function createClient(values) {
  return unwrap(await supabase.from(TABLE).insert([values]).select().single(), {
    table: TABLE,
    operation: 'createClient',
  });
}

export async function updateClient(clientId, values) {
  return unwrap(
    await supabase.from(TABLE).update(values).eq('id', clientId).select().single(),
    { table: TABLE, operation: 'updateClient' }
  );
}

export async function deleteClient(clientId) {
  unwrap(await supabase.from(TABLE).delete().eq('id', clientId), {
    table: TABLE,
    operation: 'deleteClient',
  });
}

export const clientQueries = {
  page: (params = {}) => ({
    queryKey: queryKeys.clients.page(params),
    queryFn: () => listClientsPage(params),
    staleTime: STALE_TIME.live,
  }),
  detail: (clientId) => ({
    queryKey: queryKeys.clients.detail(clientId),
    queryFn: () => getClientById(clientId),
    staleTime: STALE_TIME.standard,
    enabled: Boolean(clientId),
  }),
  stats: (clientId) => ({
    queryKey: queryKeys.clients.stats(clientId),
    queryFn: () => getClientStats(clientId),
    staleTime: STALE_TIME.live,
    enabled: Boolean(clientId),
  }),
};
