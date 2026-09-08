import React from 'react';
import PropTypes from 'prop-types';

/**
 * A raised surface.
 *
 * The `onClick` branch is the reason this is a component rather than a class
 * string. A card that responds to a click is a control, and the codebase had a
 * habit of expressing that as `<div onClick>` — which no keyboard can reach and
 * no screen reader announces. Passing `onClick` here yields a real `<button>`
 * with a focus ring; there is no route through this component to a clickable
 * div.
 */
const Card = ({ as, onClick, children, padded = true, className = '', ...rest }) => {
  const classes = [
    'bg-surface-raised border border-line rounded-lg shadow-raised',
    padded ? 'p-6' : '',
    // The lift is reserved for the clickable branch on purpose. A card that
    // rises under the cursor and then does nothing when clicked is a promise
    // the interface does not keep — and on a listings grid, where most cards
    // are links and a few are not, that promise is being read constantly.
    onClick
      ? 'text-left w-full ' +
        'transition-[transform,box-shadow] duration-base ease-spring ' +
        'hover:-translate-y-1 hover:shadow-glass active:translate-y-0 active:scale-[0.99] ' +
        'focus:outline-none ' +
        'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 ' +
        'focus-visible:ring-offset-surface ' +
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0 ' +
        'motion-reduce:active:scale-100'
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes} {...rest}>
        {children}
      </button>
    );
  }

  const Tag = as ?? 'div';
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
};

Card.propTypes = {
  as: PropTypes.elementType,
  onClick: PropTypes.func,
  children: PropTypes.node,
  padded: PropTypes.bool,
  className: PropTypes.string,
};

export default Card;
