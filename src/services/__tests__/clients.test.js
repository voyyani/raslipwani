import { describe, it, expect, beforeEach, vi } from 'vitest';
import { __client as supabase } from '@/services/client';
import { mockFrom } from '@/test/utils/supabaseQueryMock';
import { listClientsPage, getClientById, getClientStats, clientQueries } from '../clients';
import { queryKeys } from '../queryKeys';

beforeEach(() => vi.clearAllMocks());

describe('listClientsPage', () => {
  it('pages newest first and returns the total', async () => {
    const builders = mockFrom(supabase, { clients: { data: [{ id: 1 }], count: 31, error: null } });
    await expect(listClientsPage({ page: 2, pageSize: 10 }))
      .resolves.toEqual({ rows: [{ id: 1 }], count: 31 });
    expect(builders.clients.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(builders.clients.range).toHaveBeenCalledWith(10, 19);
  });

  it('applies status and type filters, ignoring "all"', async () => {
    const builders = mockFrom(supabase, { clients: { data: [], count: 0, error: null } });
    await listClientsPage({ status: 'active', clientType: 'all' });
    expect(builders.clients.eq).toHaveBeenCalledWith('status', 'active');
    expect(builders.clients.eq).not.toHaveBeenCalledWith('client_type', 'all');
  });

  it('searches name, email and phone with one case-insensitive OR', async () => {
    const builders = mockFrom(supabase, { clients: { data: [], count: 0, error: null } });
    await listClientsPage({ search: 'ada' });
    expect(builders.clients.or).toHaveBeenCalledWith(
      'first_name.ilike.%ada%,last_name.ilike.%ada%,email.ilike.%ada%,phone.ilike.%ada%'
    );
  });

  it('escapes a comma in the search term so it cannot inject a second filter', async () => {
    // PostgREST's `or` is comma-separated; an unescaped comma in user input
    // becomes another condition. This is the one place user text reaches a
    // filter grammar.
    const builders = mockFrom(supabase, { clients: { data: [], count: 0, error: null } });
    await listClientsPage({ search: 'a,b' });
    const [filter] = builders.clients.or.mock.calls[0];
    expect(filter).not.toContain('a,b');
  });

  it('filters by budget as an overlap, not a containment, test', async () => {
    // A client whose budget_max reaches at least budgetMin, and whose
    // budget_min stays at or below budgetMax, overlaps the filter's range —
    // the crossover (gte on budget_max, lte on budget_min) is deliberate.
    const builders = mockFrom(supabase, { clients: { data: [], count: 0, error: null } });
    await listClientsPage({ budgetMin: 500000, budgetMax: 1000000 });
    expect(builders.clients.gte).toHaveBeenCalledWith('budget_max', 500000);
    expect(builders.clients.lte).toHaveBeenCalledWith('budget_min', 1000000);
  });

  it('applies only the budget bound that is given', async () => {
    const builders = mockFrom(supabase, { clients: { data: [], count: 0, error: null } });
    await listClientsPage({ budgetMin: 5000000 });
    expect(builders.clients.gte).toHaveBeenCalledWith('budget_max', 5000000);
    expect(builders.clients.lte).not.toHaveBeenCalled();
  });

  it('does not filter by budget when neither bound is given', async () => {
    const builders = mockFrom(supabase, { clients: { data: [], count: 0, error: null } });
    await listClientsPage({});
    expect(builders.clients.gte).not.toHaveBeenCalled();
    expect(builders.clients.lte).not.toHaveBeenCalled();
  });
});

describe('getClientStats', () => {
  it('counts interests, communications and bookings for one client', async () => {
    mockFrom(supabase, {
      client_property_interests: { data: null, count: 3, error: null },
      client_communications: { data: null, count: 7, error: null },
      bookings: { data: null, count: 2, error: null },
    });
    await expect(getClientStats(4)).resolves.toEqual({
      interests: 3, communications: 7, bookings: 2,
    });
  });
});

describe('getClientById', () => {
  it('fetches one client', async () => {
    const builders = mockFrom(supabase, { clients: { data: { id: 4 }, error: null } });
    await expect(getClientById(4)).resolves.toEqual({ id: 4 });
    expect(builders.clients.eq).toHaveBeenCalledWith('id', 4);
  });
});

describe('clientQueries', () => {
  it('keys the detail query by id', () => {
    expect(clientQueries.detail(4).queryKey).toEqual(queryKeys.clients.detail(4));
  });
});
