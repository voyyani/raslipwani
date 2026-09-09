/**
 * The one entrance this page uses.
 *
 * DESIGN.md sanctions three motions by role, and everything on Home is the first
 * of them: **Enter** — a 12px rise and a fade, on `--dur-base` and
 * `--ease-out-soft`, staggered 40ms across siblings, played once. The outgoing
 * page ran a different distance and duration in every section (20px over 0.8s
 * here, 50px over 0.5s there, a 0.9 scale somewhere else), which is what a page
 * looks like when nobody owns its motion.
 *
 * Framer Motion cannot read the CSS custom properties, so the curve is written
 * out here and nowhere else.
 */

/** `--ease-out-soft`, as a cubic-bezier array. */
export const EASE_OUT_SOFT = [0.16, 1, 0.3, 1];

/** `--dur-base`, in seconds. */
export const DUR_BASE = 0.25;

/** The Enter motion, for content that scrolls into view. `index` staggers siblings by 40ms. */
export const enter = (index = 0) => ({
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: DUR_BASE, ease: EASE_OUT_SOFT, delay: index * 0.04 },
});

/** The same motion for content already in the first viewport, which never scrolls in. */
export const enterOnMount = (index = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DUR_BASE, ease: EASE_OUT_SOFT, delay: index * 0.04 },
});
