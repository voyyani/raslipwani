import React from 'react';
import PropTypes from 'prop-types';

import Field, { controlClasses } from './Field';

/** A textarea with the same label and error guarantees as `Input`. */
const Textarea = React.forwardRef(function Textarea(
  { label, hint, error, required, id, rows = 4, className, ...rest },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id} className={className}>
      {(aria) => (
        <textarea ref={ref} rows={rows} className={controlClasses(error)} {...aria} {...rest} />
      )}
    </Field>
  );
});

Textarea.propTypes = {
  label: PropTypes.node.isRequired,
  hint: PropTypes.node,
  error: PropTypes.node,
  required: PropTypes.bool,
  id: PropTypes.string,
  rows: PropTypes.number,
  className: PropTypes.string,
};

export default Textarea;
