import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../test/utils/renderWithProviders';
import PropertyInterests from '../PropertyInterests';

vi.mock('@/services/clientInterests', () => ({
  interestQueries: {
    forClient: () => ({
      queryKey: ['clients', 'interests', '4'],
      queryFn: () => Promise.resolve([]),
    }),
  },
  addClientInterest: vi.fn(),
  updateClientInterest: vi.fn(),
  deleteClientInterest: vi.fn(),
}));

vi.mock('@/services/properties', () => ({
  propertyQueries: {
    search: () => ({
      queryKey: ['properties', 'search', ''],
      queryFn: () => Promise.resolve([]),
      enabled: false,
    }),
  },
}));

describe('PropertyInterests — Add Interest form', () => {
  it('opens without throwing and renders the search field', async () => {
    // Regression test: <Input> was used in this form without being
    // imported, so opening "Add Interest" threw `Input is not defined`.
    const user = userEvent.setup();
    render(<PropertyInterests clientId={4} />);

    await screen.findByText('No property interests yet');
    await user.click(screen.getByRole('button', { name: /add interest/i }));

    expect(await screen.findByLabelText('Search Property')).toBeInTheDocument();
  });
});
