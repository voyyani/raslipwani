import { describe, it, expect, vi } from 'vitest';
import { unwrap, unwrapList, unwrapCount, ServiceError } from '../unwrap';
import { queryBuilderMock } from '@/test/utils/supabaseQueryMock';

vi.mock('@/utils/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));

const ctx = { table: 'properties', operation: 'listFeatured' };

describe('unwrap', () => {
  it('returns the data when there is no error', () => {
    expect(unwrap({ data: { id: 1 }, error: null }, ctx)).toEqual({ id: 1 });
  });

  it('throws a ServiceError naming the table and the operation', () => {
    expect(() => unwrap({ data: null, error: { message: 'permission denied' } }, ctx))
      .toThrow(ServiceError);
    try {
      unwrap({ data: null, error: { message: 'permission denied' } }, ctx);
    } catch (err) {
      expect(err.table).toBe('properties');
      expect(err.operation).toBe('listFeatured');
      expect(err.message).toContain('permission denied');
    }
  });

  it('does not put the raw error payload into the message', () => {
    // The 2026-09-01 audit found Supabase error objects printed into visitors'
    // consoles. A ServiceError carries a message and a context, not a payload;
    // the payload stays on `.cause` for a developer to inspect.
    try {
      unwrap({ data: null, error: { message: 'boom', details: 'select "secret" from ...' } }, ctx);
    } catch (err) {
      expect(err.message).not.toContain('secret');
      expect(err.cause.details).toContain('secret');
    }
  });
});

describe('unwrapList', () => {
  it('returns an empty array when the query returns null data', () => {
    expect(unwrapList({ data: null, error: null }, ctx)).toEqual([]);
  });

  it('returns the rows when there are some', () => {
    expect(unwrapList({ data: [{ id: 1 }], error: null }, ctx)).toEqual([{ id: 1 }]);
  });

  it('throws rather than returning [] when the query failed', () => {
    // The bug this prevents: a failed query rendering as "no properties found",
    // which is indistinguishable from an empty database to everyone but the
    // person who wrote it.
    expect(() => unwrapList({ data: null, error: { message: 'nope' } }, ctx)).toThrow(ServiceError);
  });
});

describe('unwrapCount', () => {
  it('returns rows and count together', () => {
    expect(unwrapCount({ data: [{ id: 1 }], count: 47, error: null }, ctx))
      .toEqual({ rows: [{ id: 1 }], count: 47 });
  });

  it('reports a count of 0 rather than null when the table is empty', () => {
    expect(unwrapCount({ data: null, count: null, error: null }, ctx))
      .toEqual({ rows: [], count: 0 });
  });
});

describe('queryBuilderMock', () => {
  it('is thenable, so an awaited chain resolves to the stubbed result', async () => {
    const builder = queryBuilderMock({ data: [{ id: 1 }], error: null });
    await expect(builder.select('*').eq('featured', true).order('created_at'))
      .resolves.toEqual({ data: [{ id: 1 }], error: null });
  });

  it('resolves .single() to the same result', async () => {
    const builder = queryBuilderMock({ data: { id: 1 }, error: null });
    await expect(builder.select('*').eq('id', 1).single())
      .resolves.toEqual({ data: { id: 1 }, error: null });
  });
});
