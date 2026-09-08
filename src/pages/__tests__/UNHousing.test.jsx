import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { render, screen } from '@/test/utils/renderWithProviders';
import UNHousing from '../UNHousing';

vi.mock('@/services/properties', () => ({
  propertyQueries: {
    segment: () => ({
      queryKey: ['properties', 'segment', 'un-diplomatic'],
      queryFn: () =>
        Promise.resolve([
          { id: 1, title: 'Executive Apartment - Gigiri', price: 2500, bedrooms: 3, bathrooms: 2, images: [] },
        ]),
    }),
  },
}));

describe('UNHousing', () => {
  it('renders inventory from the database', async () => {
    render(<UNHousing />);
    expect(await screen.findByText('Executive Apartment - Gigiri')).toBeInTheDocument();
  });

  it('carries no hardcoded inventory', () => {
    // URLs and values, not prose — the file explains in a comment what used
    // to be here and why it left.
    const source = readFileSync('src/pages/un-housing/unHousingContent.js', 'utf8');
    expect(source).not.toMatch(/https?:\/\/[^\s'"]*unsplash/i);
    expect(source).not.toMatch(/unProperties\s*=\s*\[/);
    // Fixed dates in a component go stale silently; this one was 2026-02-01.
    expect(source).not.toMatch(/'\d{4}-\d{2}-\d{2}'/);
  });

  it('carries an empty state, for the day before the seed runs', () => {
    // An empty segment must read as "nothing listed right now", not as a
    // broken page. Asserted on the source rather than by re-rendering with a
    // second mock, because the module mock above is file-scoped.
    const source = readFileSync('src/pages/un-housing/UnHousingProperties.jsx', 'utf8');
    expect(source).toMatch(/No UN or diplomatic listings/);
  });
});
