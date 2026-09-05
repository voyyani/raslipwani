import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const repoRoot = path.resolve(__dirname, '../../..');
const home = fs.readFileSync(path.join(repoRoot, 'src/pages/Home.jsx'), 'utf8');

/** Pull a `"key": "value"` pair out of the JSON-LD literal in Home.jsx. */
function field(key) {
  const match = home.match(new RegExp(`"${key}":\\s*"([^"]*)"`));
  return match ? match[1] : undefined;
}

/**
 * A generous box around Kilifi County on the Kenyan coast. The point is not to
 * pin the office to the metre — it is to catch a coordinate that belongs to a
 * different part of the country, which is the failure that actually happened.
 */
const KILIFI_BOUNDS = { minLat: -4.3, maxLat: -2.9, minLon: 39.4, maxLon: 40.3 };

describe('Home JSON-LD', () => {
  /**
   * The published coordinates read -1.2921, 36.8219 — Nairobi city centre —
   * while the `address` in the same block reads Kikambala Road, Kilifi. Roughly
   * 500 km apart, which breaks local-business indexing outright: the two halves
   * of one LocalBusiness record disagreed about which town the business is in.
   */
  it('places the business near the address it declares', () => {
    const latitude = Number(field('latitude'));
    const longitude = Number(field('longitude'));

    expect(field('addressLocality')).toBe('Kilifi');
    expect(Number.isFinite(latitude)).toBe(true);
    expect(Number.isFinite(longitude)).toBe(true);

    expect(latitude, `latitude ${latitude} is outside Kilifi County`).toBeGreaterThan(KILIFI_BOUNDS.minLat);
    expect(latitude, `latitude ${latitude} is outside Kilifi County`).toBeLessThan(KILIFI_BOUNDS.maxLat);
    expect(longitude, `longitude ${longitude} is outside Kilifi County`).toBeGreaterThan(KILIFI_BOUNDS.minLon);
    expect(longitude, `longitude ${longitude} is outside Kilifi County`).toBeLessThan(KILIFI_BOUNDS.maxLon);
  });

  it('agrees with itself on the canonical host', () => {
    expect(field('@id')).toBe(field('url'));
  });
});
