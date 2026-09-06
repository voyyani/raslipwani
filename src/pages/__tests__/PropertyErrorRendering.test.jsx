import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils/renderWithProviders';
import Properties from '../Properties';
import PropertyDetail from '../PropertyDetail';

/**
 * The migration to useQuery changed `error` from a plain string (the old
 * `useState`/`setError` pattern) to the Error object TanStack Query supplies
 * on a rejected queryFn. Both pages render `error` directly in JSX, so a
 * genuine fetch failure used to render a string and now would try to render
 * an Error instance — which React refuses ("Objects are not valid as a React
 * child"). These tests exercise the actual rejection path so a regression
 * here fails loudly instead of silently, the way the original defect did.
 */
vi.mock('@/services/properties', () => ({
  propertyQueries: {
    all: () => ({
      queryKey: ['properties', 'list'],
      queryFn: () => Promise.reject(new Error('network down')),
      retry: false,
    }),
    detail: () => ({
      queryKey: ['properties', 'detail', '1'],
      queryFn: () => Promise.reject(new Error('network down')),
      retry: false,
      enabled: true,
    }),
  },
}));

describe('Properties error rendering', () => {
  it('renders the failure message instead of throwing when the query rejects', async () => {
    render(<Properties />);
    expect(
      await screen.findByText('Failed to load properties: network down')
    ).toBeInTheDocument();
  });
});

describe('PropertyDetail error rendering', () => {
  it('renders the failure message instead of throwing when the query rejects', async () => {
    render(<PropertyDetail />);
    expect(
      await screen.findByText('Failed to load property details: network down')
    ).toBeInTheDocument();
  });
});
