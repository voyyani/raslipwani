import { vi } from 'vitest';

/**
 * A stand-in for a PostgREST query builder.
 *
 * The real builder is *thenable*: `await supabase.from('x').select('*')`
 * resolves because the builder implements `then`. The global mock in
 * src/test/setup.jsx does not — its methods return `this` and nothing ever
 * resolves — which is fine for "did this component subscribe" and useless for
 * "what does this service return". Service tests use this instead.
 *
 *   import { __client as supabase } from '@/services/client';
 *   const builders = mockFrom(supabase, { properties: { data: [{ id: 1 }], error: null } });
 *   await expect(listFeatured()).resolves.toEqual([{ id: 1 }]);
 *   expect(builders.properties.eq).toHaveBeenCalledWith('featured', true);
 */
const CHAINABLE = [
  'select', 'insert', 'update', 'upsert', 'delete',
  'eq', 'neq', 'in', 'is', 'gt', 'gte', 'lt', 'lte',
  'like', 'ilike', 'or', 'contains', 'order', 'range', 'limit',
];

export function queryBuilderMock(result = { data: null, error: null }) {
  const builder = {};
  for (const method of CHAINABLE) builder[method] = vi.fn(() => builder);
  builder.single = vi.fn(() => Promise.resolve(result));
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));
  // Thenable, so `await builder` and `await builder.select(...)` both resolve.
  builder.then = (onFulfilled, onRejected) =>
    Promise.resolve(result).then(onFulfilled, onRejected);
  return builder;
}

/**
 * Point `supabase.from` at one result per table, and hand back the builders so
 * a test can assert on the calls that were made.
 */
export function mockFrom(supabase, resultsByTable) {
  const builders = {};
  for (const [table, result] of Object.entries(resultsByTable)) {
    builders[table] = queryBuilderMock(result);
  }
  supabase.from.mockImplementation((table) => {
    if (!builders[table]) throw new Error(`Test did not stub a result for table "${table}"`);
    return builders[table];
  });
  return builders;
}
