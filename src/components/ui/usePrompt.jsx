import React, { useCallback, useRef, useState } from 'react';

import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';

/**
 * `window.prompt()`, replaced — the eleventh native dialog.
 *
 * The roadmap counted ten (five `alert()`, five `confirm()`). It missed this
 * one, and the guard rail in `noNativeDialogs.test.js` found it on its first
 * run: `BookingDetailModal` collected a **booking cancellation reason** through
 * `prompt()`. That is the worst of the three to leave native, for a reason that
 * has nothing to do with styling:
 *
 *     const reason = prompt('Please provide a cancellation reason:');
 *     if (reason) { … }
 *
 * `prompt()` returns `null` when dismissed and `''` when submitted empty, and
 * both are falsy. So an admin who opened the dialog and pressed OK without
 * typing got no cancellation, no error, and no feedback of any kind — the
 * booking silently stayed open. The same component already had a validated
 * reason field elsewhere with a proper error message; this path bypassed it.
 *
 * The replacement requires the value by default and says so, rather than
 * discarding the submission.
 *
 * Returns `[prompt, dialog]`, mirroring `useConfirm`. Resolves the string, or
 * `null` if cancelled — so `null` still means "no answer", exactly as before.
 */
export default function usePrompt() {
  const [request, setRequest] = useState(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);
  const resolverRef = useRef(null);

  const prompt = useCallback((options) => {
    setRequest(options);
    setValue(options.defaultValue ?? '');
    setError(null);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = useCallback((answer) => {
    setRequest(null);
    setValue('');
    setError(null);
    const resolve = resolverRef.current;
    resolverRef.current = null;
    resolve?.(answer);
  }, []);

  const submit = useCallback(
    (event) => {
      event?.preventDefault();
      const trimmed = value.trim();
      // Where `prompt()` silently discarded an empty submission, this says what
      // is wrong and keeps the dialog open so it can be fixed.
      if (request?.required !== false && trimmed === '') {
        setError(request?.requiredMessage ?? 'This is required.');
        return;
      }
      settle(trimmed);
    },
    [value, request, settle]
  );

  const Control = request?.multiline ? Textarea : Input;

  const dialog = request ? (
    <Modal
      isOpen
      onClose={() => settle(null)}
      title={request.title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => settle(null)}>
            {request.cancelLabel ?? 'Cancel'}
          </Button>
          <Button onClick={submit}>{request.confirmLabel ?? 'Save'}</Button>
        </>
      }
    >
      <form onSubmit={submit}>
        <Control
          label={request.label}
          hint={request.hint}
          error={error}
          required={request.required !== false}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
        />
      </form>
    </Modal>
  ) : null;

  return [prompt, dialog];
}
