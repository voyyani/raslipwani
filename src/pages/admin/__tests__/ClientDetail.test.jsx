import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/utils/renderWithProviders';
import ClientDetail from '../ClientDetail';

/**
 * The global `useParams` mock (src/test/setup.jsx) always returns `{}`, so
 * `id` is undefined here — the mocked query options below ignore it and
 * return `enabled: true` regardless, which is enough to exercise the render.
 */
const client = {
  id: 4,
  first_name: 'Amina',
  last_name: 'Noor',
  status: 'active',
  client_type: 'individual',
  email: 'amina@example.com',
  phone: '+254700000000',
  created_at: '2026-01-01T00:00:00Z',
};

vi.mock('@/services/clients', () => ({
  clientQueries: {
    detail: () => ({
      queryKey: ['clients', 'detail', '4'],
      queryFn: () => Promise.resolve(client),
      enabled: true,
    }),
    stats: () => ({
      queryKey: ['clients', 'stats', '4'],
      queryFn: () => Promise.resolve({ interests: 3, communications: 6, bookings: 2 }),
      enabled: true,
    }),
  },
}));

describe('ClientDetail', () => {
  it('renders the client and the three stat counters the service returns', async () => {
    render(<ClientDetail />);

    expect(await screen.findByText('Amina Noor')).toBeInTheDocument();
    // Three counters from clientQueries.stats — interests, communications,
    // bookings. Each count also echoes onto its tab badge, so this asserts
    // on the quick-stats header specifically rather than by bare text.
    const header = (await screen.findByText('Property Interests')).closest('.grid');
    expect(header).toHaveTextContent('3');
    expect(header).toHaveTextContent('6');
    expect(header).toHaveTextContent('2');
  });
});
