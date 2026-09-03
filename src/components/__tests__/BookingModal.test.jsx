import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/utils/renderWithProviders';

import BookingModal from '../BookingModal';

/**
 * `BookingModal` is opened from the public services page as well as the admin
 * console, so the overlay it used to hand-roll — no focus trap, no Escape, no
 * focus restored — was a public defect, not an internal one.
 */
const booking = {
  id: 'bk-1',
  name: 'Amina Otieno',
  email: 'amina@example.com',
  phone: '+254700000000',
  status: 'confirmed',
  type: 'Viewing',
  subject: 'Kilifi plot',
  message: 'Can we move it to the afternoon?',
  appointment_at: '2026-03-01T09:00:00Z',
  created_at: '2026-02-20T12:00:00Z',
};

const open = (props = {}) =>
  render(
    <BookingModal
      isOpen
      booking={booking}
      viewFilter="active"
      onClose={vi.fn()}
      onArchive={vi.fn()}
      onExport={vi.fn()}
      {...props}
    />
  );

describe('BookingModal', () => {
  it('is a real dialog, not a div over the page', () => {
    open();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Booking Details');
  });

  it('closes on Escape, which the hand-rolled overlay ignored', async () => {
    const onClose = vi.fn();
    open({ onClose });
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('renders nothing when there is no booking to show', () => {
    open({ booking: null });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the client and booking detail it was opened for', () => {
    open();
    expect(screen.getByText('Amina Otieno')).toBeInTheDocument();
    expect(screen.getByText('amina@example.com')).toBeInTheDocument();
    expect(screen.getByText('Can we move it to the afternoon?')).toBeInTheDocument();
  });

  it('renders the status through the shared pill rather than a local ternary', () => {
    open({ booking: { ...booking, status: 'cancelled' } });
    expect(screen.getByText(/cancelled/i)).toBeInTheDocument();
  });

  it('reads "Not scheduled" for a missing or unparseable date', () => {
    open({ booking: { ...booking, appointment_at: null } });
    expect(screen.getAllByText('Not scheduled').length).toBeGreaterThan(0);
  });

  it('offers Archive on an active booking and Restore on an archived one', async () => {
    const onArchive = vi.fn();
    const { unmount } = open({ onArchive });
    await userEvent.click(screen.getByRole('button', { name: /archive booking/i }));
    expect(onArchive).toHaveBeenCalledWith('bk-1', true);
    unmount();

    open({ onArchive, viewFilter: 'archived' });
    await userEvent.click(screen.getByRole('button', { name: /restore booking/i }));
    expect(onArchive).toHaveBeenCalledWith('bk-1', false);
  });

  it('falls back to a dash rather than a blank gap for a missing field', () => {
    open({ booking: { id: 'bk-2' } });
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
  });
});
