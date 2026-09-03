import React, { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

import Icon from '../Icon';
import useDialog from './useDialog';

/**
 * The one dialog.
 *
 * `PropertyModal`, `BookingModal`, `BookingDetailModal` and `ClientForm` each
 * built their own, and all four were missing the same four things. Every one of
 * them is handled here, once:
 *
 * 1. **Focus never entered the dialog.** Opening a modal left focus on the page
 *    behind it, so a keyboard user was tabbing through content they could not
 *    see while a dialog covered it.
 * 2. **Focus was never trapped.** Tab walked straight out of the dialog and into
 *    the inert page underneath.
 * 3. **Focus was never restored.** Closing dropped focus to `<body>`, which
 *    sends a screen-reader user back to the top of the document with no idea
 *    where they were.
 * 4. **Escape did nothing.** The only way out was to find and click the X.
 *
 * All four live in `useDialog`, not here, so that the one surface which cannot
 * wear this chrome — the full-bleed property gallery — still gets them.
 *
 * The portal matters for the same reason the trap does: rendering in place means
 * the dialog inherits the stacking and `overflow` of whatever contained it, and
 * a dialog clipped by an ancestor's `overflow: hidden` is a dialog with content
 * nobody can reach.
 */

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
  '3xl': 'max-w-7xl',
};

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  initialFocusRef,
  closeOnBackdrop = true,
  className = '',
  bodyClassName = 'p-6',
}) => {
  const panelRef = useRef(null);
  const titleId = `modal-title-${useId()}`;
  const descriptionId = `modal-description-${useId()}`;

  useDialog({ isOpen, onClose, panelRef, initialFocusRef });

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        data-testid="modal-backdrop"
        className="absolute inset-0 bg-surface-inverse/60 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
        // The backdrop is a convenience for pointer users; Escape and the close
        // button are the real affordances, so it stays out of the a11y tree.
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`relative w-full ${SIZES[size] ?? SIZES.md} max-h-[90vh] overflow-y-auto
          bg-surface-raised border border-line rounded-2xl shadow-xl focus:outline-none ${className}`}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-line">
          <div>
            <h2 id={titleId} className="text-xl font-bold text-content">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-content-muted">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-content-muted hover:bg-surface-sunken
              hover:text-content focus:outline-none focus-visible:ring-2
              focus-visible:ring-focus-ring"
          >
            <Icon name="times" size={18} label="Close dialog" />
          </button>
        </div>

        <div className={bodyClassName}>{children}</div>

        {footer && <div className="p-6 pt-0 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', '3xl']),
  /** Focus this instead of the first focusable child — e.g. a Cancel button. */
  initialFocusRef: PropTypes.shape({ current: PropTypes.any }),
  closeOnBackdrop: PropTypes.bool,
  className: PropTypes.string,
  /** Padding for the body. Pass `''` when the child brings its own. */
  bodyClassName: PropTypes.string,
};

export default Modal;
