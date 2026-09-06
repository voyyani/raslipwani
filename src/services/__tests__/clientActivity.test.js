import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/utils/supabaseClient';
import { mockFrom } from '@/test/utils/supabaseQueryMock';
import { listClientInterests, addClientInterest, interestQueries } from '../clientInterests';
import {
  listClientCommunications, deleteClientCommunication, communicationQueries,
} from '../clientCommunications';
import { queryKeys } from '../queryKeys';

beforeEach(() => vi.clearAllMocks());

describe('listClientInterests', () => {
  it('selects the joined property fields the timeline renders', async () => {
    const builders = mockFrom(supabase, { client_property_interests: { data: [], error: null } });
    await listClientInterests(4);
    const [selection] = builders.client_property_interests.select.mock.calls[0];
    expect(selection).toContain('properties');
    expect(selection).toContain('title');
    expect(builders.client_property_interests.eq).toHaveBeenCalledWith('client_id', 4);
    expect(builders.client_property_interests.order)
      .toHaveBeenCalledWith('created_at', { ascending: false });
  });
});

describe('addClientInterest', () => {
  it('inserts and returns the created row', async () => {
    const builders = mockFrom(supabase, { client_property_interests: { data: { id: 9 }, error: null } });
    await expect(addClientInterest({ client_id: 4, property_id: 7 })).resolves.toEqual({ id: 9 });
    expect(builders.client_property_interests.insert)
      .toHaveBeenCalledWith([{ client_id: 4, property_id: 7 }]);
  });
});

describe('listClientCommunications', () => {
  it('orders by communication_date, newest first', async () => {
    const builders = mockFrom(supabase, { client_communications: { data: [], error: null } });
    await listClientCommunications(4);
    expect(builders.client_communications.order)
      .toHaveBeenCalledWith('communication_date', { ascending: false });
  });
});

describe('deleteClientCommunication', () => {
  it('deletes by its own id, not the client id', async () => {
    const builders = mockFrom(supabase, { client_communications: { data: null, error: null } });
    await deleteClientCommunication(12);
    expect(builders.client_communications.eq).toHaveBeenCalledWith('id', 12);
  });
});

describe('query options', () => {
  it('key both lists under the clients root, scoped to the client', () => {
    expect(interestQueries.forClient(4).queryKey).toEqual(queryKeys.clients.interests(4));
    expect(communicationQueries.forClient(4).queryKey)
      .toEqual(queryKeys.clients.communications(4));
  });

  it('are disabled until a client id exists', () => {
    expect(interestQueries.forClient(undefined).enabled).toBe(false);
  });
});
