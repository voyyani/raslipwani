import React from 'react';
import PropTypes from 'prop-types';

/**
 * A frosted layer.
 *
 * This is the only component in the codebase permitted to emit a
 * `backdrop-filter`, and that restriction is the point. DESIGN.md caps live blur
 * at three composited surfaces per viewport because blur is a real GPU cost on
 * the mid-range Android this market actually browses on — a cap that is only
 * checkable if the surfaces come from one place. `noBespokeGlass.test.js` holds
 * the line; `data-glass` on every panel is what makes a per-viewport count
 * possible from a test or from the console.
 *
 * The other rule it enforces is DESIGN.md's first: glass is a layer, not a
 * texture. It belongs over a photograph, over the page while scrolling, over the
 * map. A panel on flat ground is a `Card`.
 *
 * ## Three grounds, and why `media` is not one of the others
 *
 * `default`, `strong` and `subtle` are white-tinted and take their colour from
 * the app's own ground, which the token layer has already proven readable in
 * both themes. `media` composites over a *photograph*, which can be any colour
 * at all — so it tints dark and carries its own white text rather than trusting
 * a backdrop nobody controls. Using `default` over an image is the specific
 * mistake that measured 1.13:1 before the material layer existed.
 *
 * ## When the filter is not there
 *
 * `blur={false}` is the escape hatch for the fourth panel in a viewport, and it
 * goes fully opaque rather than keeping a tint: translucency without blur is not
 * a softer effect, it is washed-out text. The same substitution happens without
 * any React involvement for browsers with no `backdrop-filter` and for visitors
 * who have asked the OS to reduce transparency — see the `.glass-surface` block
 * in `src/index.css`, which is why every panel carries that class.
 */

/** Translucent grounds. Each pairs with the opaque ground on the same row. */
const TONES = {
  default: { glass: 'bg-glass', opaque: 'bg-surface-raised', text: '' },
  strong: { glass: 'bg-glass-strong', opaque: 'bg-surface-raised', text: '' },
  subtle: { glass: 'bg-glass-subtle', opaque: 'bg-surface-raised', text: '' },
  // Over photography. Carries its own text colour because the ground it
  // composites onto is dark in both themes — see materials.js. Its opaque
  // counterpart has to stay dark for the same reason: `content-on-media` is
  // white in both themes, so falling back to `surface-raised` would put white
  // text on a white panel in light mode.
  media: {
    glass: 'bg-glass-media',
    opaque: 'bg-glass-media-solid',
    // The panel's own text, and the labels of any `Field` inside it. A label
    // hard-codes `text-content` — correct on every opaque ground in the app, and
    // wrong on this one, which is dark in *both* themes. Overriding it here
    // rather than at the call site is what keeps the media contract in the one
    // file that measured it.
    text: 'text-content-on-media [&_label]:text-content-on-media',
  },
  // Chrome with no ground yet: a bar floating over a photograph, before the page
  // has scrolled anything underneath it. Not a material — the absence of one —
  // so it emits no filter and takes no edge.
  none: { glass: 'bg-transparent', opaque: 'bg-transparent', text: '' },
};

/**
 * The shape of the surface.
 *
 * `panel` is a floating rectangle: rounded on every corner, edged all the way
 * round, lifted off the page. `bar` is chrome pinned to an edge of the viewport
 * — the header, and the sticky filter bar — where a radius would leave four
 * gaps against the window and a drop shadow would double the border. Same
 * material, same fallbacks, same `data-glass` marker; different geometry.
 */
const SHAPES = {
  panel: 'relative rounded-xl border border-glass-border shadow-glass',
  bar: 'relative border-b border-glass-border',
};

const GlassPanel = React.forwardRef(function GlassPanel(
  {
    children,
    tone = 'default',
    shape = 'panel',
    as: Component = 'div',
    blur = true,
    className = '',
    ...rest
  },
  ref
) {
  const material = TONES[tone] ?? TONES.default;
  // `none` is the absence of a material, so it also declines the edge: a border
  // over a photograph with nothing behind it is a line, not a boundary.
  const live = blur && tone !== 'none';

  const classes = [
    tone === 'none' ? 'relative' : SHAPES[shape] ?? SHAPES.panel,
    material.text,
    // `glass-surface` is not decoration: it is the hook the stylesheet's
    // no-backdrop-filter and reduced-transparency fallbacks bind to.
    live ? 'glass-surface' : '',
    live && tone === 'media' ? 'glass-surface-media' : '',
    live ? `${material.glass} backdrop-blur-glass backdrop-saturate-glass` : material.opaque,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component
      ref={ref}
      className={classes}
      // Counting live blur surfaces is the only way the three-per-viewport cap
      // is enforceable after the fact.
      data-glass={live ? tone : 'off'}
      {...rest}
    >
      {children}
    </Component>
  );
});

GlassPanel.propTypes = {
  children: PropTypes.node,
  tone: PropTypes.oneOf(['default', 'strong', 'subtle', 'media', 'none']),
  /** `panel` floats; `bar` is pinned to a viewport edge and drops the radius. */
  shape: PropTypes.oneOf(['panel', 'bar']),
  /** The element to render. A panel with a heading should be a `section`. */
  as: PropTypes.elementType,
  /** Drop the filter — for the fourth panel in a viewport. Goes opaque. */
  blur: PropTypes.bool,
  className: PropTypes.string,
};

export default GlassPanel;
