import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test/utils/renderWithProviders';

import useConfirm from '../useConfirm';

/**
 * A harness shaped like the call sites this replaces: an async handler that
 * asks, then acts on the answer.
 */
const Harness = ({ onResult }) => {
  const [confirm, dialog] = useConfirm();

  const remove = async () => {
    const ok = await confirm({
      title: 'Delete property',
      message: '"Kilifi Beach Villa" will be permanently deleted.',
      confirmLabel: 'Delete property',
    });
    onResult(ok);
  };

  return (
    <>
      <button type="button" onClick={remove}>
        Delete
      </button>
      {dialog}
    </>
  );
};

describe('useConfirm', () => {
  it('renders no dialog until something asks', () => {
    render(<Harness onResult={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('resolves true when confirmed', async () => {
    const onResult = vi.fn();
    render(<Harness onResult={onResult} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Delete property' }));
    expect(onResult).toHaveBeenCalledWith(true);
  });

  it('resolves false when cancelled, and never leaves the promise hanging', async () => {
    const onResult = vi.fn();
    render(<Harness onResult={onResult} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
    expect(onResult).toHaveBeenCalledWith(false);
  });

  it('resolves false on Escape', async () => {
    const onResult = vi.fn();
    render(<Harness onResult={onResult} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    expect(onResult).toHaveBeenCalledWith(false);
  });

  it('closes the dialog after answering, so it does not linger', async () => {
    render(<Harness onResult={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Delete property' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the caller-supplied message, so the dialog names the thing at risk', async () => {
    render(<Harness onResult={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByText(/Kilifi Beach Villa/)).toBeInTheDocument();
  });
});
