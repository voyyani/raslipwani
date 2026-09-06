import { supabase } from '@/utils/supabaseClient';
import { unwrap, unwrapList } from './unwrap';
import { queryKeys } from './queryKeys';
import { STALE_TIME } from './cachePolicy';

const TABLE = 'client_property_interests';

/**
 * The join is part of the query, not of the component: PropertyInterests.jsx
 * used to fetch interests and then fetch every referenced property separately,
 * which is one request per interest on a screen that shows a dozen.
 */
const SELECTION = `
  *,
  properties (
    id,
    title,
    location,
    price,
    bedrooms,
    bathrooms,
    images
  )
`;

export async function listClientInterests(clientId) {
  return unwrapList(
    await supabase
      .from(TABLE)
      .select(SELECTION)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false }),
    { table: TABLE, operation: 'listClientInterests' }
  );
}

export async function addClientInterest(values) {
  return unwrap(await supabase.from(TABLE).insert([values]).select().single(), {
    table: TABLE,
    operation: 'addClientInterest',
  });
}

export async function updateClientInterest(interestId, values) {
  return unwrap(
    await supabase.from(TABLE).update(values).eq('id', interestId).select().single(),
    { table: TABLE, operation: 'updateClientInterest' }
  );
}

export async function deleteClientInterest(interestId) {
  unwrap(await supabase.from(TABLE).delete().eq('id', interestId), {
    table: TABLE,
    operation: 'deleteClientInterest',
  });
}

export const interestQueries = {
  forClient: (clientId) => ({
    queryKey: queryKeys.clients.interests(clientId),
    queryFn: () => listClientInterests(clientId),
    staleTime: STALE_TIME.live,
    enabled: Boolean(clientId),
  }),
};
