import React, { useRef, useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test/utils/renderWithProviders';

import useDialog from '../useDialog';

/**
 * `Modal` is covered by its own suite. These assertions exist for the two
 * surfaces that consume the hook *without* `Modal` — the property gallery and
 * the admin booking sheet — because those keep their own chrome and so would
 * silently lose the behaviour if the hook regressed.
 */
const Bare = ({ onClose, withControls = true }) => {
  const panelRef = useRef(null);
  useDialog({ isOpen: true, onClose, panelRef });
  return (
    <div ref={panelRef} role="dialog" aria-modal="true" aria-label="Gallery" tabIndex={-1}>
      {withControls && (
        <>
          <button type="button">First</button>
          <button type="button">Last</button>
        </>
      )}
    </div>
  );
};

describe('useDialog', () => {
  it('moves focus into the panel it is given', async () => {
    render(<Bare onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
    });
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(<Bare onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('cycles Tab from the last control back to the first', async () => {
    render(<Bare onClose={vi.fn()} />);
    const first = screen.getByText('First');
    const last = screen.getByText('Last');

    await waitFor(() => expect(document.activeElement).toBe(first));
    last.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(first);
  });

  it('cycles Shift+Tab from the first control back to the last', async () => {
    render(<Bare onClose={vi.fn()} />);
    const first = screen.getByText('First');
    const last = screen.getByText('Last');

    await waitFor(() => expect(document.activeElement).toBe(first));
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(last);
  });

  it('keeps focus on the panel when there is nothing inside to move to', async () => {
    render(<Bare onClose={vi.fn()} withControls={false} />);
    const dialog = screen.getByRole('dialog');
    await waitFor(() => expect(document.activeElement).toBe(dialog));
    await userEvent.tab();
    expect(document.activeElement).toBe(dialog);
  });

  it('returns focus to whatever opened it', async () => {
    const Harness = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open gallery
          </button>
          {open && <Bare onClose={() => setOpen(false)} />}
        </>
      );
    };

    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Open gallery' });
    opener.focus();
    await userEvent.click(opener);

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(document.activeElement).toBe(opener));
  });

  it('restores the previous overflow rather than clearing it', async () => {
    document.body.style.overflow = 'scroll';
    const { unmount } = render(<Bare onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('scroll');
    document.body.style.overflow = '';
  });
});
