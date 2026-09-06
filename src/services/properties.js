import { supabase } from '@/utils/supabaseClient';
import { unwrap, unwrapList, unwrapCount } from './unwrap';
import { queryKeys } from './queryKeys';
import { STALE_TIME } from './cachePolicy';

const TABLE = 'properties';

/** The three featured cards on the home page. */
export async function listFeatured({ limit = 3 } = {}) {
  return unwrapList(
    await supabase
      .from(TABLE)
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit),
    { table: TABLE, operation: 'listFeatured' }
  );
}

/** The five most recently touched rows for the admin dashboard's activity feed. */
export async function listRecentProperties({ limit = 5 } = {}) {
  return unwrapList(
    await supabase
      .from(TABLE)
      .select('id, title, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(limit),
    { table: TABLE, operation: 'listRecentProperties' }
  );
}

/** Everything a visitor may book a viewing on. */
export async function listAvailable() {
  return unwrapList(
    await supabase
      .from(TABLE)
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false }),
    { table: TABLE, operation: 'listAvailable' }
  );
}

/** The public /properties grid, which filters client-side after one fetch. */
export async function listAll({ sortField = 'created_at', sortDirection = 'desc' } = {}) {
  return unwrapList(
    await supabase
      .from(TABLE)
      .select('*')
      .order(sortField, { ascending: sortDirection === 'asc' }),
    { table: TABLE, operation: 'listAll' }
  );
}

/**
 * One page of the admin table, plus the total.
 *
 * `page` is 1-based because that is what the interface shows; Supabase's
 * `range` is 0-based and inclusive at both ends. Converting in one place is the
 * point — the previous inline version was written twice and disagreed with
 * itself by one row.
 */
export async function listPage({
  page = 1,
  pageSize = 10,
  sortField = 'created_at',
  sortDirection = 'desc',
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return unwrapCount(
    await supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order(sortField, { ascending: sortDirection === 'asc' })
      .range(from, to),
    { table: TABLE, operation: 'listPage' }
  );
}

export async function getById(propertyId) {
  return unwrap(await supabase.from(TABLE).select('*').eq('id', propertyId).single(), {
    table: TABLE,
    operation: 'getById',
  });
}

/** Counts for the dashboard tiles. `head: true` fetches no rows. */
export async function countProperties({ featured, status } = {}) {
  let query = supabase.from(TABLE).select('*', { count: 'exact', head: true });
  if (featured !== undefined) query = query.eq('featured', featured);
  if (status !== undefined) query = query.eq('status', status);
  return unwrapCount(await query, { table: TABLE, operation: 'countProperties' }).count;
}

export async function createProperty(values) {
  return unwrap(await supabase.from(TABLE).insert([values]).select().single(), {
    table: TABLE,
    operation: 'createProperty',
  });
}

export async function updateProperty(propertyId, values) {
  return unwrap(
    await supabase.from(TABLE).update(values).eq('id', propertyId).select().single(),
    { table: TABLE, operation: 'updateProperty' }
  );
}

export async function deleteProperty(propertyId) {
  unwrap(await supabase.from(TABLE).delete().eq('id', propertyId), {
    table: TABLE,
    operation: 'deleteProperty',
  });
}

export async function setFeatured(propertyId, featured) {
  return unwrap(
    await supabase.from(TABLE).update({ featured }).eq('id', propertyId).select().single(),
    { table: TABLE, operation: 'setFeatured' }
  );
}

/**
 * Query options, spreadable into useQuery:
 *   const { data = [] } = useQuery(propertyQueries.featured());
 *
 * Key and lifetime travel with the query rather than being retyped per screen,
 * which is what let Home.jsx and App.jsx disagree about staleTime unnoticed.
 */
export const propertyQueries = {
  featured: () => ({
    queryKey: queryKeys.properties.featured(),
    queryFn: () => listFeatured(),
    staleTime: STALE_TIME.standard,
  }),
  available: () => ({
    queryKey: queryKeys.properties.available(),
    queryFn: () => listAvailable(),
    staleTime: STALE_TIME.standard,
  }),
  all: (sort = {}) => ({
    queryKey: queryKeys.properties.list(sort),
    queryFn: () => listAll(sort),
    staleTime: STALE_TIME.standard,
  }),
  page: (params = {}) => ({
    queryKey: queryKeys.properties.page(params),
    queryFn: () => listPage(params),
    staleTime: STALE_TIME.live,
  }),
  detail: (propertyId) => ({
    queryKey: queryKeys.properties.detail(propertyId),
    queryFn: () => getById(propertyId),
    staleTime: STALE_TIME.standard,
    enabled: Boolean(propertyId),
  }),
};
