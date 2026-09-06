import { describe, it, expect } from 'vitest';
import { queryKeys } from '../queryKeys';
import { STALE_TIME } from '../cachePolicy';

describe('queryKeys', () => {
  it('nests every property key under one root, so a single invalidate clears them all', () => {
    expect(queryKeys.properties.featured()[0]).toBe('properties');
    expect(queryKeys.properties.detail(7)[0]).toBe('properties');
    expect(queryKeys.properties.page({ page: 2 })[0]).toBe('properties');
    expect(queryKeys.properties.all).toEqual(['properties']);
  });

  it('coerces ids to strings, so 7 and "7" are one cache entry rather than two', () => {
    expect(queryKeys.properties.detail(7)).toEqual(queryKeys.properties.detail('7'));
    expect(queryKeys.clients.detail(7)).toEqual(queryKeys.clients.detail('7'));
  });

  it('includes the filters in a filtered list key', () => {
    expect(queryKeys.bookings.list({ status: 'pending' }))
      .toEqual(['bookings', 'list', { status: 'pending' }]);
  });

  it('gives an unfiltered list a stable key rather than one built from undefined', () => {
    expect(queryKeys.bookings.list()).toEqual(['bookings', 'list', {}]);
  });

  it('keeps booking notes under the bookings root', () => {
    expect(queryKeys.bookings.notes('abc')).toEqual(['bookings', 'notes', 'abc']);
  });
});

describe('STALE_TIME', () => {
  it('names three lifetimes and nothing else', () => {
    expect(Object.keys(STALE_TIME).sort()).toEqual(['live', 'standard', 'static']);
  });

  it('orders them shortest to longest', () => {
    expect(STALE_TIME.live).toBeLessThan(STALE_TIME.standard);
    expect(STALE_TIME.standard).toBeLessThan(STALE_TIME.static);
  });
});
