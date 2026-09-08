import { getSupabase } from './client';
import { unwrap, unwrapList, unwrapCount } from './unwrap';
import { queryKeys } from './queryKeys';
import { STALE_TIME } from './cachePolicy';
import { sanitiseSearch } from './sanitiseSearch';

const TABLE = 'properties';

/** The three featured cards on the home page. */
export async function listFeatured({ limit = 3 } = {}) {
  const db = await getSupabase();
  return unwrapList(
    await db
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
  const db = await getSupabase();
  return unwrapList(
    await db
      .from(TABLE)
      .select('id, title, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(limit),
    { table: TABLE, operation: 'listRecentProperties' }
  );
}

/** Everything a visitor may book a viewing on. */
export async function listAvailable() {
  const db = await getSupabase();
  return unwrapList(
    await db
      .from(TABLE)
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false }),
    { table: TABLE, operation: 'listAvailable' }
  );
}

/** The public /properties grid, which filters client-side after one fetch. */
/**
 * Everything listed to one audience — the UN and diplomatic page is the first
 * caller. `status = 'available'` because a segment page is a shop window, not
 * an archive.
 */
export async function listBySegment(segment) {
  const db = await getSupabase();
  return unwrapList(
    await db
      .from(TABLE)
      .select('*')
      .eq('segment', segment)
      .eq('status', 'available')
      .order('created_at', { ascending: false }),
    { table: TABLE, operation: 'listBySegment' }
  );
}

export async function listAll({ sortField = 'created_at', sortDirection = 'desc' } = {}) {
  const db = await getSupabase();
  return unwrapList(
    await db
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
 *
 * `search`, when given, matches the admin table's search box: an `ilike` on
 * title or location, applied before the range so pagination counts the
 * filtered set rather than the whole table.
 */
export async function listPage({
  page = 1,
  pageSize = 10,
  sortField = 'created_at',
  sortDirection = 'desc',
  search,
} = {}) {
  const db = await getSupabase();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = db
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order(sortField, { ascending: sortDirection === 'asc' });

  if (search) {
    const term = sanitiseSearch(search);
    if (term) {
      query = query.or(`title.ilike.%${term}%,location.ilike.%${term}%`);
    }
  }

  return unwrapCount(await query.range(from, to), { table: TABLE, operation: 'listPage' });
}

/**
 * The narrow typeahead behind PropertyInterests.jsx's "Add Interest" search
 * box. Deliberately not `listPage`: this fires on every keystroke, so it
 * asks for the seven columns the card needs, no ordering, no count — the
 * same shape the inline query had before the client surfaces moved onto the
 * service layer.
 */
export async function searchProperties({ term, limit = 10 } = {}) {
  const db = await getSupabase();
  const cleaned = term ? sanitiseSearch(term) : '';
  if (!cleaned) return [];

  return unwrapList(
    await db
      .from(TABLE)
      .select('id, title, location, price, bedrooms, bathrooms, images')
      .or(`title.ilike.%${cleaned}%,location.ilike.%${cleaned}%`)
      .limit(limit),
    { table: TABLE, operation: 'searchProperties' }
  );
}

export async function getById(propertyId) {
  const db = await getSupabase();
  return unwrap(await db.from(TABLE).select('*').eq('id', propertyId).single(), {
    table: TABLE,
    operation: 'getById',
  });
}

/** Counts for the dashboard tiles. `head: true` fetches no rows. */
export async function countProperties({ featured, status } = {}) {
  const db = await getSupabase();
  let query = db.from(TABLE).select('*', { count: 'exact', head: true });
  if (featured !== undefined) query = query.eq('featured', featured);
  if (status !== undefined) query = query.eq('status', status);
  return unwrapCount(await query, { table: TABLE, operation: 'countProperties' }).count;
}

export async function createProperty(values) {
  const db = await getSupabase();
  return unwrap(await db.from(TABLE).insert([values]).select().single(), {
    table: TABLE,
    operation: 'createProperty',
  });
}

export async function updateProperty(propertyId, values) {
  const db = await getSupabase();
  return unwrap(
    await db.from(TABLE).update(values).eq('id', propertyId).select().single(),
    { table: TABLE, operation: 'updateProperty' }
  );
}

export async function deleteProperty(propertyId) {
  const db = await getSupabase();
  unwrap(await db.from(TABLE).delete().eq('id', propertyId), {
    table: TABLE,
    operation: 'deleteProperty',
  });
}

export async function setFeatured(propertyId, featured) {
  const db = await getSupabase();
  return unwrap(
    await db.from(TABLE).update({ featured }).eq('id', propertyId).select().single(),
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
  segment: (segment) => ({
    queryKey: queryKeys.properties.segment(segment),
    queryFn: () => listBySegment(segment),
    staleTime: STALE_TIME.standard,
    enabled: Boolean(segment),
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
  /** The two-character gate lives here, with the query it gates. */
  search: (term) => ({
    queryKey: queryKeys.properties.search(term),
    queryFn: () => searchProperties({ term }),
    staleTime: STALE_TIME.live,
    enabled: Boolean(term) && term.length >= 2,
  }),
};
