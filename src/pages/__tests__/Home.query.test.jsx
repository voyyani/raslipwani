import { readFileSync } from 'node:fs';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils/renderWithProviders';
import Home from '../Home';

vi.mock('@/services/properties', () => ({
  propertyQueries: {
    featured: () => ({
      queryKey: ['properties', 'featured'],
      queryFn: () => Promise.resolve([{ id: 1, title: 'Gigiri Apartment', price: 100 }]),
    }),
  },
}));

describe('Home', () => {
  it('renders the featured properties the service returns', async () => {
    render(<Home />);
    expect(await screen.findByText('Gigiri Apartment')).toBeInTheDocument();
  });

  it('does not import the Supabase client', () => {
    const source = readFileSync('src/pages/Home.jsx', 'utf8');
    expect(source).not.toMatch(/supabaseClient/);
  });
});
