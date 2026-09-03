import { useCallback, useEffect, useRef } from 'react';

/**
 * The four things every hand-rolled dialog in this codebase forgot.
 *
 * `Modal` provides chrome — a titled panel, a close button, a footer — and most
 * dialogs want it. The property gallery does not: it is a full-bleed lightbox
 * where a header bar would cover the photograph. Before this hook existed the
 * only way to opt out of the chrome was to opt out of the behaviour with it,
 * which is exactly the trade that produced eleven bespoke overlays.
 *
 * So the behaviour lives here and the chrome lives in `Modal`. A surface can
 * take the first without the second; nothing can take the second without the
 * first.
 *
 * What it guarantees, for as long as `isOpen` is true:
 *
 * 1. **Focus enters the panel.** Otherwise focus stays on the page behind, and
 *    a keyboard user tabs through content a dialog is covering.
 * 2. **Focus is trapped.** Tab and Shift+Tab cycle within the panel instead of
 *    walking out into the inert page underneath.
 * 3. **Focus is restored to the opener.** Closing without this drops focus to
 *    `<body>`, which returns a screen-reader user to the top of the document
 *    with no record of where they were.
 * 4. **Escape closes.** Without it the only exit is finding and clicking the X.
 *
 * It also locks background scroll, restoring the previous value rather than
 * clearing it, so a dialog opened from an already-locked surface does not
 * unlock that surface when it closes.
 *
 * @param {object}  options
 * @param {boolean} options.isOpen
 * @param {() => void} options.onClose        Called on Escape.
 * @param {React.RefObject} options.panelRef  The element to trap focus within.
 * @param {React.RefObject} [options.initialFocusRef]
 *        Focus this instead of the first focusable child — e.g. a Cancel
 *        button, so a reflexive Enter lands on the safe choice.
 */

/** Everything focusable, minus anything deliberately removed from the tab order. */
export const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), ' +
  'select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function useDialog({ isOpen, onClose, panelRef, initialFocusRef }) {
  const restoreFocusRef = useRef(null);

  const focusable = useCallback(
    () => Array.from(panelRef.current?.querySelectorAll(FOCUSABLE) ?? []),
    [panelRef]
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
  }, [isOpen, initialFocusRef, focusable, panelRef]);

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

    // Capture phase: a dialog rendered into a portal is not a DOM descendant of
    // whatever opened it, so a bubbling listener would let the opener's own
    // Escape handler run first.
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen, onClose, focusable]);
}
