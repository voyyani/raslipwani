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
    'bg-surface-raised border border-line rounded-xl shadow-sm',
    padded ? 'p-6' : '',
    onClick
      ? 'text-left w-full transition-shadow hover:shadow-md focus:outline-none ' +
        'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 ' +
        'focus-visible:ring-offset-surface'
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
