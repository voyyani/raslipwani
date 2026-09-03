import React from 'react';
import PropTypes from 'prop-types';

import Field, { controlClasses } from './Field';

/**
 * A text input that is labelled whether or not the caller remembers to label it.
 * See `Field.jsx` for why that guarantee is the entire point of this component.
 */
const Input = React.forwardRef(function Input(
  { label, hint, error, required, id, className, ...rest },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id} className={className}>
      {(aria) => <input ref={ref} className={controlClasses(error)} {...aria} {...rest} />}
    </Field>
  );
});

Input.propTypes = {
  label: PropTypes.node.isRequired,
  hint: PropTypes.node,
  error: PropTypes.node,
  required: PropTypes.bool,
  id: PropTypes.string,
  className: PropTypes.string,
};

export default Input;
