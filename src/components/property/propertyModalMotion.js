/**
 * The property modal's motion, written out once.
 *
 * DESIGN.md sanctions three motions by role. This surface uses two of them:
 *
 * - **Present** for the dialog itself: scale from 0.96 and fade, on `--dur-base`
 *   and `--ease-spring`. Below `md` it is a sheet, and sheets rise from the
 *   bottom edge instead of scaling from the centre — the gesture a thumb can
 *   reverse.
 * - **Enter** for the details column: a 12px rise and fade, staggered 40ms
 *   across the blocks, once. It starts after the panel has settled so the two
 *   never fight.
 *
 * Framer Motion cannot read CSS custom properties, so the curves are copied
 * from `src/design/materials.js` here and nowhere else in this folder.
 */

/** `--ease-spring`: the decelerating spring iOS uses for sheets and pushes. */
export const EASE_SPRING = [0.32, 0.72, 0, 1];

/** `--ease-out-soft`. */
export const EASE_OUT_SOFT = [0.16, 1, 0.3, 1];

export const DUR_FAST = 0.15;
export const DUR_BASE = 0.25;
export const DUR_SLOW = 0.4;

/** The scrim: a plain fade, out faster than in so the page comes back promptly. */
export const scrim = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DUR_BASE, ease: EASE_OUT_SOFT } },
  exit: { opacity: 0, transition: { duration: DUR_FAST, ease: EASE_OUT_SOFT } },
};

/**
 * Present, in its two geometries. `custom` is `{ sheet, reduced }` — the parent
 * measures the breakpoint and reads `prefers-reduced-motion`, and the variants
 * resolve from that so the same element can switch geometry on resize.
 */
export const panel = {
  initial: ({ sheet, reduced }) =>
    reduced ? { opacity: 0 } : sheet ? { opacity: 1, y: '100%' } : { opacity: 0, scale: 0.96 },
  animate: ({ sheet, reduced }) =>
    reduced
      ? { opacity: 1, transition: { duration: DUR_BASE } }
      : sheet
        ? { opacity: 1, y: 0, transition: { duration: DUR_SLOW, ease: EASE_SPRING } }
        : { opacity: 1, scale: 1, transition: { duration: DUR_BASE, ease: EASE_SPRING } },
  exit: ({ sheet, reduced }) =>
    reduced
      ? { opacity: 0, transition: { duration: DUR_FAST } }
      : sheet
        ? { opacity: 1, y: '100%', transition: { duration: DUR_BASE, ease: EASE_SPRING } }
        : { opacity: 0, scale: 0.97, transition: { duration: DUR_FAST, ease: EASE_OUT_SOFT } },
};

/** Enter, for the details blocks. `index` staggers siblings; the offset waits for the panel. */
export const enter = (index = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DUR_BASE, ease: EASE_OUT_SOFT, delay: 0.12 + index * 0.04 },
});

/**
 * The photograph changing. The incoming image slides in from the side the
 * viewer travelled toward and settles from a hair above its final size; the
 * outgoing one fades under it. Both run at once — a `wait` crossfade leaves the
 * stage empty for a frame, which reads as a flicker.
 */
export const slide = {
  initial: (direction) => ({ opacity: 0, x: direction * 32, scale: 1.02 }),
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: DUR_SLOW, ease: EASE_SPRING } },
  exit: (direction) => ({
    opacity: 0,
    x: direction * -24,
    transition: { duration: DUR_BASE, ease: EASE_OUT_SOFT },
  }),
};
