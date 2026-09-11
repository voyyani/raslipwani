import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/utils/renderWithProviders';

import PropertyModal from '../PropertyModal';

/**
 * The property dialog is opened from the home page and the listings grid, and
 * is the one dialog that takes `useDialog`'s behaviour without `Modal`'s
 * chrome. These pin the parts a redesign can quietly lose: the dialog role and
 * name, Escape, the close control, the photo counter, and the two calls to
 * action in the dock.
 */
const property = {
  id: 'p-1',
  title: 'Kikambala beach villa',
  location: 'Kikambala, Kilifi',
  price: 45000000,
  purpose: 'sale',
  bedrooms: 4,
  bathrooms: 3,
  area_sqft: 3200,
  property_type: 'villa',
  description: 'Two minutes from the beach.',
  amenities: ['swimming-pool', 'borehole'],
  images: ['/a.jpg', '/b.jpg', '/c.jpg'],
};

const open = (props = {}) => {
  const closeModal = vi.fn();
  render(<PropertyModal property={property} closeModal={closeModal} {...props} />);
  return { closeModal };
};

describe('PropertyModal', () => {
  beforeEach(() => {
    // jsdom has no matchMedia; the dialog reads the `md` breakpoint from it.
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('min-width: 768px'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  it('is a named dialog carrying the listing', () => {
    open();
    const dialog = screen.getByRole('dialog', { name: /Kikambala beach villa/ });
    expect(within(dialog).getByRole('heading', { level: 2 })).toHaveTextContent(
      'Kikambala beach villa'
    );
    expect(within(dialog).getByText('1 / 3')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /book a viewing/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /contact agent/i })).toBeInTheDocument();
  });

  it('closes on Escape and from the close control', async () => {
    const user = userEvent.setup();
    const { closeModal } = open();

    await user.keyboard('{Escape}');
    expect(closeModal).toHaveBeenCalledTimes(1);

    await user.click(screen.getAllByRole('button', { name: 'Close' })[0]);
    expect(closeModal).toHaveBeenCalledTimes(2);
  });

  it('pages through the photographs', async () => {
    const user = userEvent.setup();
    open();

    await user.click(screen.getByRole('button', { name: /next photo/i }));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Photo 3 of 3' }));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('reveals the office number on request', async () => {
    const user = userEvent.setup();
    open();

    await user.click(screen.getByRole('button', { name: /contact agent/i }));
    // The dock swaps its contents through an exit animation, so wait for it.
    expect(await screen.findByRole('link', { name: '+254 758 066 526' })).toHaveAttribute(
      'href',
      'tel:+254758066526'
    );
  });
});
