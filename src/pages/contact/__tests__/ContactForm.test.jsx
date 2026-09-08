import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
import ContactForm from '../ContactForm';
import { createBooking } from '@/services/bookings';

vi.mock('@/services/bookings', () => ({ createBooking: vi.fn().mockResolvedValue(undefined) }));

beforeEach(() => vi.clearAllMocks());

describe('ContactForm', () => {
  it('submits the enquiry and tells its parent', async () => {
    const onSubmitted = vi.fn();
    const user = userEvent.setup({ delay: null });
    render(<ContactForm inquiryType="general" onSubmitted={onSubmitted} />);

    await user.type(screen.getByLabelText(/full name/i), 'Ada');
    await user.type(screen.getByLabelText(/email address/i), 'ada@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '+254700000000');
    await user.type(screen.getByLabelText(/your message/i), 'Hello');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => expect(createBooking).toHaveBeenCalled());
    expect(createBooking.mock.calls[0][0]).toMatchObject({
      name: 'Ada',
      email: 'ada@example.com',
      type: 'contact',
      inquiry_type: 'general',
    });
    expect(onSubmitted).toHaveBeenCalled();
  });

  it('does not submit an enquiry with no email', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ContactForm inquiryType="general" onSubmitted={vi.fn()} />);
    await user.type(screen.getByLabelText(/full name/i), 'Ada');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    // The browser's own required-field validation stops the submit before the
    // handler runs; the handler's `validateForm` is the second line of defence
    // for anything that reaches it (a pasted invalid address, say).
    expect(createBooking).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/email address/i)).toBeInvalid();
  });

  it('takes its calls to action from the inquiry type', () => {
    render(<ContactForm inquiryType="selling" onSubmitted={vi.fn()} />);
    expect(screen.getByRole('button', { name: /get property valuation/i })).toBeInTheDocument();
  });
});
