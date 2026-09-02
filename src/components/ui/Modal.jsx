import React, { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

import Icon from '../Icon';

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
 * The portal matters for the same reason the trap does: rendering in place means
 * the dialog inherits the stacking and `overflow` of whatever contained it, and
 * a dialog clipped by an ancestor's `overflow: hidden` is a dialog with content
 * nobody can reach.
 */

/** Everything focusable, minus anything deliberately removed from the tab order. */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), ' +
  'select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
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
}) => {
  const panelRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const titleId = `modal-title-${useId()}`;
  const descriptionId = `modal-description-${useId()}`;

  const focusable = useCallback(
    () => Array.from(panelRef.current?.querySelectorAll(FOCUSABLE) ?? []),
    []
  );

  // Remember the opener before the dialog steals focus, and give it back on the
  // way out. Reading it in an effect keyed on `isOpen` catches the element that
  // was actually focused at open time.
  useEffect(() => {
    if (!isOpen) return undefined;

    restoreFocusRef.current = document.activeElement;

    const target = initialFocusRef?.current ?? focusable()[0] ?? panelRef.current;
    // A frame's delay lets the portal mount before focus moves into it.
    const raf = requestAnimationFrame(() => target?.focus());

    return () => {
      cancelAnimationFrame(raf);
      const opener = restoreFocusRef.current;
      if (opener && typeof opener.focus === 'function' && document.contains(opener)) {
        opener.focus();
      }
    };
  }, [isOpen, initialFocusRef, focusable]);

  // Background scroll lock. The previous value is restored rather than cleared,
  // so nesting a dialog inside a already-locked surface does not unlock it.
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const items = focusable();
      if (items.length === 0) {
        // Nothing to move to — keep focus on the panel rather than letting it
        // escape to the page behind.
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen, onClose, focusable]);

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

        <div className="p-6">{children}</div>

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
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  /** Focus this instead of the first focusable child — e.g. a Cancel button. */
  initialFocusRef: PropTypes.shape({ current: PropTypes.any }),
  closeOnBackdrop: PropTypes.bool,
  className: PropTypes.string,
};

export default Modal;
