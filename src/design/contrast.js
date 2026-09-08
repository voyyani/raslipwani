/**
 * WCAG 2.1 relative luminance and contrast ratio.
 *
 * Small enough to own outright, and owning it means the contrast test has no
 * dependency that could quietly change its answer between CI runs.
 * Formulae: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */

/** `#RGB` or `#RRGGBB` → `[r, g, b]`, each 0–255. */
export function hexToRgb(hex) {
  const value = hex.trim().replace(/^#/, '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Not a hex colour: ${hex}`);
  }

  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

export function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two hex colours, 1:1 (identical) to 21:1 (black on white). */
export function contrastRatio(a, b) {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x
  );

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Composite a translucent overlay over an opaque backdrop, returning the colour
 * the screen actually shows.
 *
 * This exists because glass has no fixed colour. Every other value in the token
 * layer can be checked as written; a panel at 72% opacity can only be checked
 * *against* something, and the honest something is the worst case a photograph
 * can put behind it.
 *
 * Standard source-over alpha compositing, which is what the compositor does.
 * Returns lowercase hex so it can be fed straight back into `contrastRatio`.
 */
export function compositeOver(overlayHex, alpha, backdropHex) {
  const overlay = hexToRgb(overlayHex);
  const backdrop = hexToRgb(backdropHex);

  const channel = (i) => Math.round(overlay[i] * alpha + backdrop[i] * (1 - alpha));

  return `#${[0, 1, 2].map((i) => channel(i).toString(16).padStart(2, '0')).join('')}`;
}

/** WCAG thresholds, named so a failing assertion says which rule it broke. */
export const WCAG = {
  /** 1.4.3 — normal-size text, AA. */
  AA_TEXT: 4.5,
  /** 1.4.3 — text ≥ 18.66px bold or ≥ 24px, AA. */
  AA_LARGE_TEXT: 3,
  /** 1.4.11 — boundaries of interactive components and meaningful graphics. */
  AA_NON_TEXT: 3,
};
