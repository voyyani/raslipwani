import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test/utils/renderWithProviders';

import usePrompt from '../usePrompt';

const Harness = ({ onResult, options }) => {
  const [prompt, dialog] = usePrompt();

  const ask = async () => {
    onResult(
      await prompt({
        title: 'Cancel booking',
        label: 'Cancellation reason',
        confirmLabel: 'Cancel booking',
        ...options,
      })
    );
  };

  return (
    <>
      <button type="button" onClick={ask}>
        Ask
      </button>
      {dialog}
    </>
  );
};

describe('usePrompt', () => {
  it('resolves the trimmed value that was typed', async () => {
    const onResult = vi.fn();
    render(<Harness onResult={onResult} />);

    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await userEvent.type(await screen.findByLabelText(/Cancellation reason/), '  Client withdrew  ');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel booking' }));

    expect(onResult).toHaveBeenCalledWith('Client withdrew');
  });

  it('resolves null when dismissed, matching what prompt() returned', async () => {
    const onResult = vi.fn();
    render(<Harness onResult={onResult} />);

    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');

    expect(onResult).toHaveBeenCalledWith(null);
  });

  /**
   * The defect this hook exists to fix. `prompt()` returned `''` for an empty
   * submission and `null` for a dismissal, and the call site tested both with a
   * single falsy check — so pressing OK with an empty box silently did nothing.
   */
  it('refuses an empty submission and says why, instead of discarding it', async () => {
    const onResult = vi.fn();
    render(<Harness onResult={onResult} />);

    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel booking' }));

    expect(onResult).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/required/i);
  });

  it('clears the error as soon as the user starts fixing it', async () => {
    render(<Harness onResult={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel booking' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/Cancellation reason/), 'x');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('allows an empty answer when the caller says the field is optional', async () => {
    const onResult = vi.fn();
    render(<Harness onResult={onResult} options={{ required: false }} />);

    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel booking' }));

    expect(onResult).toHaveBeenCalledWith('');
  });
});
