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
  it('walks the three-step consultation wizard and submits one booking', async () => {
    // The wizard was split into a hook and five components (Task 24); this
    // pins the whole path a visitor actually takes, end to end, through the
    // step machinery and into the write.
    const user = userEvent.setup();
    render(<ServicesMain />);

    await user.click(screen.getAllByRole('button', { name: /get consultation/i })[0]);

    // Step one: the service is preselected by the button that opened the
    // wizard, so Continue moves straight on. A consultation has no property
    // step, so step two is the options summary.
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByRole('heading', { name: /service details/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /continue/i }));

    await user.type(screen.getByLabelText(/full name/i), 'Grace Hopper');
    await user.type(screen.getByLabelText(/email/i), 'grace@example.com');
    await user.type(screen.getByLabelText(/phone/i), '+254711111111');
    await user.type(screen.getByLabelText(/preferred date/i), '2030-01-15');
    await user.type(screen.getByLabelText(/preferred time/i), '10:30');
    await user.click(screen.getByRole('button', { name: /confirm booking/i }));

    await waitFor(() => expect(createBooking).toHaveBeenCalledTimes(1));
    const [record] = createBooking.mock.calls[0];
    expect(record).toMatchObject({
      type: 'consultation',
      service: 'consultation',
      name: 'Grace Hopper',
      email: 'grace@example.com',
      phone: '+254711111111',
      status: 'pending',
      property_id: null,
    });
    expect(record.appointment_at).toContain('2030-01-15');
  });

  it('goes back to an earlier step without losing what was typed', async () => {
    const user = userEvent.setup();
    render(<ServicesMain />);

    await user.click(screen.getAllByRole('button', { name: /get consultation/i })[0]);
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    await user.type(screen.getByLabelText(/full name/i), 'Ada Lovelace');
    await user.click(screen.getByRole('button', { name: /back/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByLabelText(/full name/i)).toHaveValue('Ada Lovelace');
  });
});
