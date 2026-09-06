import React, { useId } from 'react';
import PropTypes from 'prop-types';

/**
 * A checkbox with the same labelling guarantee as `Input`, and a different
 * layout.
 *
 * `Field` puts the label above a full-width control, which is right for a text
 * input and wrong for a checkbox — a checkbox reads as a box with a sentence
 * beside it, not as a caption over a widget. So this composes the same
 * `useId()` guarantee rather than composing `Field` itself: the id is minted
 * here, the label consumes it, the control receives it, and a caller who passes
 * nothing still gets a correctly labelled control.
 */
const Checkbox = ({ id: providedId, label, hint, className = '', ...rest }) => {
  const generatedId = useId();
  const id = providedId ?? `checkbox-${generatedId}`;
  const hintId = `${id}-hint`;

  return (
    <div className={className}>
      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          id={id}
          aria-describedby={hint ? hintId : undefined}
          className="mt-0.5 h-4 w-4 rounded border-line-strong text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          {...rest}
        />
        <label htmlFor={id} className="text-sm font-medium text-content">
          {label}
        </label>
      </div>

      {hint && (
        <p id={hintId} className="mt-1.5 ml-6 text-xs text-content-subtle">
          {hint}
        </p>
      )}
    </div>
  );
};

Checkbox.propTypes = {
  id: PropTypes.string,
  label: PropTypes.node.isRequired,
  hint: PropTypes.node,
  className: PropTypes.string,
};

export default Checkbox;
