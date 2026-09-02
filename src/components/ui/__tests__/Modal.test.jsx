import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test/utils/renderWithProviders';

import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';

/**
 * Four components each hand-rolled a modal, and none of them trapped focus,
 * restored it, or closed on Escape. These assertions are the contract that
 * replaces all four.
 */
describe('Modal', () => {
  const openModal = (props = {}) =>
    render(
      <Modal isOpen onClose={vi.fn()} title="Book a viewing" {...props}>
        <button type="button">First</button>
        <button type="button">Last</button>
      </Modal>
    );

  it('renders nothing at all when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Hidden">
        <p>Body</p>
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is a modal dialog named by its title', () => {
    openModal();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Book a viewing');
  });

  it('moves focus into the dialog on open, rather than leaving it behind', async () => {
    openModal();
    await waitFor(() => {
      expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
    });
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    openModal({ onClose });
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when the backdrop is clicked but not when the panel is', async () => {
    const onClose = vi.fn();
    openModal({ onClose });

    await userEvent.click(screen.getByText('First'));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });

  it('traps Tab inside the dialog, cycling from the last control back to the first', async () => {
    openModal();
    const closeButton = screen.getByRole('button', { name: /close/i });
    const last = screen.getByRole('button', { name: 'Last' });

    // The open effect moves focus on the next frame. Let it land before moving
    // focus by hand, or it arrives afterwards and undoes the setup.
    await waitFor(() => expect(document.activeElement).toBe(closeButton));

    last.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(closeButton);
  });

  it('cycles backwards from the first control to the last on Shift+Tab', async () => {
    openModal();
    const closeButton = screen.getByRole('button', { name: /close/i });
    const last = screen.getByRole('button', { name: 'Last' });

    closeButton.focus();
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(last);
  });

  it('restores focus to whatever opened it', async () => {
    const Harness = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Modal isOpen={open} onClose={() => setOpen(false)} title="Panel">
            <p>Body</p>
          </Modal>
        </>
      );
    };

    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(trigger);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('locks background scrolling while open and releases it on close', () => {
    const { unmount } = openModal();
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});

describe('ConfirmDialog', () => {
  it('names what is about to be destroyed, rather than asking "are you sure?"', () => {
    render(
      <ConfirmDialog
        isOpen
        title="Delete property"
        message='"Kilifi Beach Villa" will be permanently deleted.'
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText(/Kilifi Beach Villa/)).toBeInTheDocument();
  });

  it('confirms and cancels through real buttons', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen
        title="Delete note"
        message="This note will be removed."
        confirmLabel="Delete note"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Delete note' }));
    expect(onConfirm).toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('treats Escape as cancel, never as confirm', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen
        title="Delete"
        message="Gone forever."
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('does not put initial focus on the destructive action', async () => {
    render(
      <ConfirmDialog
        isOpen
        title="Delete"
        message="Gone forever."
        confirmLabel="Delete"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(document.activeElement).not.toBe(screen.getByRole('button', { name: 'Delete' }));
    });
  });
});
