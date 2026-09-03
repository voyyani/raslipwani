import React, { useCallback, useRef, useState } from 'react';

import ConfirmDialog from './ConfirmDialog';

/**
 * `window.confirm()`, replaced without making the call sites worse.
 *
 * The native call was attractive for one reason: it reads as a straight line.
 *
 *     if (window.confirm('Delete this note?')) { await remove(note); }
 *
 * A modal component normally destroys that shape, scattering one decision
 * across a state flag, a handler, a pending-item ref and some JSX. Five call
 * sites written that way is five chances to wire it wrong. So this hook keeps
 * the straight line and resolves a promise instead:
 *
 *     if (await confirm({ title, message, confirmLabel })) { await remove(note); }
 *
 * What the caller gains over the native dialog: it is themed, it traps and
 * restores focus, Escape cancels rather than doing nothing, and `message` is
 * required — so the dialog names the row at risk instead of asking the same
 * unanswerable "are you sure?" for every one of them.
 *
 * Returns `[confirm, dialog]`. Render `dialog` anywhere in the component; it is
 * `null` until something asks.
 */
export default function useConfirm() {
  const [request, setRequest] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((options) => {
    setRequest(options);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  // One settle path for both answers. Anything that closes the dialog resolves
  // the promise exactly once — a cancel that forgot to resolve would leave the
  // caller's `await` hanging forever, which is a deadlock the native dialog
  // could not produce and this one could.
  const settle = useCallback((answer) => {
    setRequest(null);
    const resolve = resolverRef.current;
    resolverRef.current = null;
    resolve?.(answer);
  }, []);

  const dialog = request ? (
    <ConfirmDialog
      isOpen
      title={request.title}
      message={request.message}
      confirmLabel={request.confirmLabel}
      cancelLabel={request.cancelLabel}
      destructive={request.destructive ?? true}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  ) : null;

  return [confirm, dialog];
}
