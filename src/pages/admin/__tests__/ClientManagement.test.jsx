import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test/utils/renderWithProviders';
import ClientManagement from '../ClientManagement';

const pageMock = vi.fn((params = {}) => ({
  queryKey: ['clients', 'page', params],
  queryFn: () => Promise.resolve({ rows: [], count: 0 }),
}));

vi.mock('@/services/clients', () => ({
  clientQueries: { page: (params) => pageMock(params) },
  deleteClient: vi.fn(),
}));

describe('ClientManagement budget filter', () => {
  it('resolves the selected bucket to numeric bounds and reaches the query', async () => {
    const user = userEvent.setup();
    render(<ClientManagement />);

    await screen.findByText('No clients found');
    pageMock.mockClear();

    await user.selectOptions(screen.getByLabelText('Filter by budget'), '500k-1m');

    await screen.findByText('No clients found');

    const lastCall = pageMock.mock.calls.at(-1)[0];
    expect(lastCall.budgetMin).toBe(500000);
    expect(lastCall.budgetMax).toBe(1000000);
  });
});
