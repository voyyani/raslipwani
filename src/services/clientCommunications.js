import { supabase } from '@/utils/supabaseClient';
import { unwrap, unwrapList } from './unwrap';
import { queryKeys } from './queryKeys';
import { STALE_TIME } from './cachePolicy';

const TABLE = 'client_communications';

export async function listClientCommunications(clientId) {
  return unwrapList(
    await supabase
      .from(TABLE)
      .select('*')
      .eq('client_id', clientId)
      .order('communication_date', { ascending: false }),
    { table: TABLE, operation: 'listClientCommunications' }
  );
}

export async function addClientCommunication(values) {
  return unwrap(await supabase.from(TABLE).insert([values]).select().single(), {
    table: TABLE,
    operation: 'addClientCommunication',
  });
}

export async function updateClientCommunication(communicationId, values) {
  return unwrap(
    await supabase.from(TABLE).update(values).eq('id', communicationId).select().single(),
    { table: TABLE, operation: 'updateClientCommunication' }
  );
}

export async function deleteClientCommunication(communicationId) {
  unwrap(await supabase.from(TABLE).delete().eq('id', communicationId), {
    table: TABLE,
    operation: 'deleteClientCommunication',
  });
}

export const communicationQueries = {
  forClient: (clientId) => ({
    queryKey: queryKeys.clients.communications(clientId),
    queryFn: () => listClientCommunications(clientId),
    staleTime: STALE_TIME.live,
    enabled: Boolean(clientId),
  }),
};
