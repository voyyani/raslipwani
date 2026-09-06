import { readFileSync } from 'node:fs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
import Contact from '@/pages/Contact';
import ServicesMain from '@/pages/ServicesMain';
import { createBooking } from '@/services/bookings';

vi.mock('@/services/bookings', () => ({ createBooking: vi.fn().mockResolvedValue(undefined) }));

const { availableQueryFn } = vi.hoisted(() => ({
  availableQueryFn: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/services/properties', () => ({
  propertyQueries: {
    available: () => ({
      queryKey: ['properties', 'available'],
      queryFn: availableQueryFn,
      staleTime: 0,
    }),
  },
}));

beforeEach(() => vi.clearAllMocks());

describe('Contact', () => {
  it('submits an enquiry through createBooking with every required field', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(/full name/i), 'Ada Lovelace');
    await user.type(screen.getByLabelText(/email address/i), 'ada@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '+254700000000');
    await user.type(screen.getByLabelText(/your message/i), 'Interested in Gigiri');
    await user.click(screen.getByRole('button', { name: /send|submit/i }));

    await waitFor(() => expect(createBooking).toHaveBeenCalledTimes(1));
    const [record] = createBooking.mock.calls[0];
    expect(record).toMatchObject({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+254700000000',
      type: expect.any(String),
    });
  });

  it('never sets an admin-only field on submission', () => {
    // Migration 009's INSERT policy requires status, admin_notes and
    // assigned_to to be NULL on a prospect's row. A form that sets one is
    // rejected by the database, and the visitor sees a generic failure.
    const source = readFileSync('src/pages/Contact.jsx', 'utf8');
    expect(source).not.toMatch(/admin_notes|assigned_to/);
  });
});

describe('ServicesMain', () => {
  it('does not fetch properties on mount, only once the viewing booking modal opens', async () => {
    const user = userEvent.setup();
    render(<ServicesMain />);

    // Regression pin: an earlier version of this migration dropped the
    // useEffect's gate (`activeModal === 'booking' && serviceType ===
    // 'viewing'`) and fetched on every mount instead.
    expect(availableQueryFn).not.toHaveBeenCalled();

    await user.click(screen.getAllByRole('button', { name: /book a viewing/i })[0]);

    await waitFor(() => expect(availableQueryFn).toHaveBeenCalled());
  });
});
