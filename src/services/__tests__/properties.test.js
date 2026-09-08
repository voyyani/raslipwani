import { describe, it, expect, beforeEach, vi } from 'vitest';
import { __client as supabase } from '@/services/client';
import { mockFrom } from '@/test/utils/supabaseQueryMock';
import {
  listFeatured, listAll, listRecentProperties, listPage, getById, updateProperty, setFeatured,
  searchProperties, listBySegment, propertyQueries,
} from '../properties';
import { ServiceError } from '../unwrap';
import { queryKeys } from '../queryKeys';
import { STALE_TIME } from '../cachePolicy';

const row = { id: 7, title: 'Gigiri Apartment', featured: true };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('listFeatured', () => {
  it('asks for featured rows, newest first, three of them', async () => {
    const builders = mockFrom(supabase, { properties: { data: [row], error: null } });

    await expect(listFeatured()).resolves.toEqual([row]);

    expect(supabase.from).toHaveBeenCalledWith('properties');
    expect(builders.properties.eq).toHaveBeenCalledWith('featured', true);
    expect(builders.properties.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(builders.properties.limit).toHaveBeenCalledWith(3);
  });

  it('honours an explicit limit', async () => {
    const builders = mockFrom(supabase, { properties: { data: [], error: null } });
    await listFeatured({ limit: 6 });
    expect(builders.properties.limit).toHaveBeenCalledWith(6);
  });

  it('returns [] rather than null when there are no featured properties', async () => {
    mockFrom(supabase, { properties: { data: null, error: null } });
    await expect(listFeatured()).resolves.toEqual([]);
  });

  it('throws a ServiceError when the query fails', async () => {
    mockFrom(supabase, { properties: { data: null, error: { message: 'denied' } } });
    await expect(listFeatured()).rejects.toBeInstanceOf(ServiceError);
  });
});

describe('listBySegment', () => {
  it('asks for one audience, available only, newest first', async () => {
    const builders = mockFrom(supabase, { properties: { data: [row], error: null } });

    await expect(listBySegment('un-diplomatic')).resolves.toEqual([row]);

    expect(builders.properties.eq).toHaveBeenCalledWith('segment', 'un-diplomatic');
    expect(builders.properties.eq).toHaveBeenCalledWith('status', 'available');
    expect(builders.properties.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('is keyed by the segment, so two audiences cannot share a cache entry', () => {
    expect(propertyQueries.segment('un-diplomatic').queryKey)
      .toEqual(queryKeys.properties.segment('un-diplomatic'));
    expect(propertyQueries.segment('corporate').queryKey)
      .not.toEqual(propertyQueries.segment('un-diplomatic').queryKey);
  });
});

describe('listAll', () => {
  it('defaults to newest first and accepts an ascending sort', async () => {
    const builders = mockFrom(supabase, { properties: { data: [row], error: null } });

    await listAll();
    expect(builders.properties.order).toHaveBeenCalledWith('created_at', { ascending: false });

    await listAll({ sortField: 'price', sortDirection: 'asc' });
    expect(builders.properties.order).toHaveBeenCalledWith('price', { ascending: true });
  });
});

describe('listRecentProperties', () => {
  it('asks for four columns, newest first, five of them', async () => {
    const builders = mockFrom(supabase, { properties: { data: [row], error: null } });

    await expect(listRecentProperties()).resolves.toEqual([row]);

    expect(builders.properties.select).toHaveBeenCalledWith('id, title, created_at, updated_at');
    expect(builders.properties.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(builders.properties.limit).toHaveBeenCalledWith(5);
  });

  it('honours an explicit limit', async () => {
    const builders = mockFrom(supabase, { properties: { data: [], error: null } });
    await listRecentProperties({ limit: 8 });
    expect(builders.properties.limit).toHaveBeenCalledWith(8);
  });
});

describe('listPage', () => {
  it('translates a 1-based page into a Supabase range and returns the total', async () => {
    const builders = mockFrom(supabase, {
      properties: { data: [row], count: 47, error: null },
    });

    await expect(listPage({ page: 3, pageSize: 10 })).resolves.toEqual({ rows: [row], count: 47 });

    // Page 3 of 10 is rows 20..29 — the off-by-one that made the admin table
    // skip a property between every page before this function existed.
    expect(builders.properties.range).toHaveBeenCalledWith(20, 29);
    expect(builders.properties.select).toHaveBeenCalledWith('*', { count: 'exact' });
  });

  it('starts page 1 at row 0', async () => {
    const builders = mockFrom(supabase, { properties: { data: [], count: 0, error: null } });
    await listPage({ page: 1, pageSize: 12 });
    expect(builders.properties.range).toHaveBeenCalledWith(0, 11);
  });

  it('filters by title or location when a search term is given', async () => {
    const builders = mockFrom(supabase, { properties: { data: [row], count: 1, error: null } });
    await listPage({ page: 1, pageSize: 10, search: 'Gigiri' });
    expect(builders.properties.or).toHaveBeenCalledWith('title.ilike.%Gigiri%,location.ilike.%Gigiri%');
  });

  it('does not filter when no search term is given', async () => {
    const builders = mockFrom(supabase, { properties: { data: [row], count: 1, error: null } });
    await listPage({ page: 1, pageSize: 10 });
    expect(builders.properties.or).not.toHaveBeenCalled();
  });

  it('escapes a comma in the search term so it cannot inject a second filter', async () => {
    // PostgREST's `or` is comma-separated; an unescaped comma in user input
    // becomes another condition. This is the one place user text reaches a
    // filter grammar.
    const builders = mockFrom(supabase, { properties: { data: [row], count: 1, error: null } });
    await listPage({ page: 1, pageSize: 10, search: 'a,b' });
    const [filter] = builders.properties.or.mock.calls[0];
    expect(filter).not.toContain('a,b');
  });
});

describe('searchProperties', () => {
  it('asks for seven columns, no ordering, no count, capped at the limit', async () => {
    const builders = mockFrom(supabase, { properties: { data: [row], error: null } });

    await expect(searchProperties({ term: 'Gigiri' })).resolves.toEqual([row]);

    expect(builders.properties.select).toHaveBeenCalledWith(
      'id, title, location, price, bedrooms, bathrooms, images'
    );
    expect(builders.properties.or).toHaveBeenCalledWith(
      'title.ilike.%Gigiri%,location.ilike.%Gigiri%'
    );
    expect(builders.properties.limit).toHaveBeenCalledWith(10);
    expect(builders.properties.order).not.toHaveBeenCalled();
  });

  it('honours an explicit limit', async () => {
    const builders = mockFrom(supabase, { properties: { data: [], error: null } });
    await searchProperties({ term: 'Gigiri', limit: 5 });
    expect(builders.properties.limit).toHaveBeenCalledWith(5);
  });

  it('escapes a comma in the search term so it cannot inject a second filter', async () => {
    const builders = mockFrom(supabase, { properties: { data: [], error: null } });
    await searchProperties({ term: 'a,b' });
    const [filter] = builders.properties.or.mock.calls[0];
    expect(filter).not.toContain('a,b');
  });

  it('returns [] without querying for an empty or whitespace-only term', async () => {
    await expect(searchProperties({ term: '' })).resolves.toEqual([]);
    await expect(searchProperties({ term: '   ' })).resolves.toEqual([]);
    expect(supabase.from).not.toHaveBeenCalled();
  });
});

describe('getById', () => {
  it('fetches one row by id', async () => {
    const builders = mockFrom(supabase, { properties: { data: row, error: null } });
    await expect(getById(7)).resolves.toEqual(row);
    expect(builders.properties.eq).toHaveBeenCalledWith('id', 7);
    expect(builders.properties.single).toHaveBeenCalled();
  });
});

describe('writes', () => {
  it('updates by id and returns the updated row', async () => {
    const builders = mockFrom(supabase, { properties: { data: { ...row, price: 10 }, error: null } });
    await expect(updateProperty(7, { price: 10 })).resolves.toEqual({ ...row, price: 10 });
    expect(builders.properties.update).toHaveBeenCalledWith({ price: 10 });
    expect(builders.properties.eq).toHaveBeenCalledWith('id', 7);
  });

  it('toggles featured and returns the updated row', async () => {
    const builders = mockFrom(supabase, { properties: { data: { ...row, featured: false }, error: null } });
    await setFeatured(7, false);
    expect(builders.properties.update).toHaveBeenCalledWith({ featured: false });
  });
});

describe('propertyQueries', () => {
  it('builds featured options from the registry and the standard lifetime', () => {
    const options = propertyQueries.featured();
    expect(options.queryKey).toEqual(queryKeys.properties.featured());
    expect(options.staleTime).toBe(STALE_TIME.standard);
    expect(typeof options.queryFn).toBe('function');
  });

  it('builds detail options keyed by the id', () => {
    expect(propertyQueries.detail(7).queryKey).toEqual(queryKeys.properties.detail(7));
  });
});
