import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import Modal from './Modal';
import Button from './Button';

/**
 * The replacement for `window.confirm()`.
 *
 * Four destructive actions in this app asked "Are you sure?" through a native
 * dialog. Two problems with that, and the second is the serious one:
 *
 * - It is unstyled, thread-blocking, and unthemeable.
 * - **It does not say what is about to be destroyed.** "Are you sure you want to
 *   delete this property?" is the same sentence whichever property is selected,
 *   so the dialog cannot catch the case it exists to catch — the wrong row.
 *
 * `message` is therefore required, and call sites are expected to name the
 * thing. `confirmLabel` defaults to naming the action rather than saying "OK",
 * for the same reason.
 *
 * Initial focus goes to Cancel, deliberately: the safe choice should be the one
 * a reflexive Enter press lands on.
 */
const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const cancelRef = useRef(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      initialFocusRef={cancelRef}
      footer={
        <>
          <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-content-muted">{message}</p>
    </Modal>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool,
  title: PropTypes.node.isRequired,
  /** Name the thing being acted on. A generic message defeats the dialog. */
  message: PropTypes.node.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  destructive: PropTypes.bool,
  loading: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ConfirmDialog;
