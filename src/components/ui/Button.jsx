import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Icon from '../Icon';

/**
 * The one button.
 *
 * Before this existed, a button was a `<div onClick>` here, an `<a>` styled like
 * a button there, and roughly two hundred hand-assembled class strings in
 * between. Three things went wrong every time, and each is fixed once here:
 *
 * 1. **Colour was literal.** `bg-blue-600 hover:bg-blue-700` cannot theme. Every
 *    variant below resolves to semantic tokens, so a button is correct in both
 *    themes without the call site knowing a theme exists.
 * 2. **Focus was invisible or absent.** A `div` takes no focus at all, and the
 *    hand-rolled buttons inherited whatever the browser gave them. Every variant
 *    here carries the same `focus-ring` token, which is a token precisely so it
 *    stays visible on a dark ground.
 * 3. **Loading state lied.** Call sites swapped the label for a spinner, which
 *    removes the control's accessible name mid-submit — a screen reader user
 *    loses track of what they just pressed. The label stays; the spinner joins
 *    it, and `aria-busy` carries the state.
 *
 * ## Element choice
 *
 * `href` or `to` renders an anchor, everything else renders a `<button>`. This
 * is not cosmetic: a link navigates and belongs in the tab order with link
 * semantics, a button acts. Getting this wrong is why "buttons" that were
 * actually divs could not be reached by keyboard at all.
 */

/** Shared by every variant, so the focus and disabled contracts cannot diverge. */
const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-lg ' +
  'transition-colors duration-200 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-surface ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

const VARIANTS = {
  primary: 'bg-brand text-content-on-brand hover:bg-brand-hover',
  secondary:
    'bg-surface-raised text-content border border-line-strong hover:bg-surface-sunken',
  ghost: 'bg-transparent text-brand-content hover:bg-brand-subtle',
  danger: 'bg-danger-content text-content-on-brand hover:opacity-90',
  accent: 'bg-accent text-content-on-accent hover:bg-accent-hover',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

const Button = React.forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    href,
    to,
    target,
    rel,
    type = 'button',
    className = '',
    ...rest
  },
  ref
) {
  const classes = [
    BASE,
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // The spinner sits beside the label rather than replacing it. Replacing it
  // strips the control's accessible name at exactly the moment the user most
  // needs to know which control they are waiting on.
  const content = (
    <>
      {loading && <Icon name="spinner" size={16} className="animate-spin" />}
      {children}
    </>
  );

  if (href || to) {
    // An external link that opens a new tab always gets `noopener`: without it
    // the opened page can reach back through `window.opener`.
    const computedRel =
      target === '_blank' ? [rel, 'noopener', 'noreferrer'].filter(Boolean).join(' ') : rel;

    if (to) {
      return (
        <Link ref={ref} to={to} target={target} rel={computedRel} className={classes} {...rest}>
          {content}
        </Link>
      );
    }

    return (
      <a ref={ref} href={href} target={target} rel={computedRel} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
});

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'accent']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  href: PropTypes.string,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  target: PropTypes.string,
  rel: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};

export default Button;
