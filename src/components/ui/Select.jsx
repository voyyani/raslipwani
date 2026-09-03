import React from 'react';
import PropTypes from 'prop-types';

import Field, { controlClasses } from './Field';

/**
 * A native select, deliberately.
 *
 * A custom listbox would need its own keyboard model, its own focus management
 * and its own screen-reader contract, and the app has no requirement a native
 * select fails to meet. On mobile — which is most of this market — the native
 * control is also the better one.
 */
const Select = React.forwardRef(function Select(
  { label, hint, error, required, id, children, className, ...rest },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id} className={className}>
      {(aria) => (
        <select ref={ref} className={controlClasses(error)} {...aria} {...rest}>
          {children}
        </select>
      )}
    </Field>
  );
});

Select.propTypes = {
  label: PropTypes.node.isRequired,
  hint: PropTypes.node,
  error: PropTypes.node,
  required: PropTypes.bool,
  id: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Select;
