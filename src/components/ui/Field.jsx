import React, { useId } from 'react';
import PropTypes from 'prop-types';

/**
 * The shared skeleton behind `Input`, `Textarea` and `Select`.
 *
 * This file exists to make one specific defect structurally impossible. The
 * codebase carried **134 `<label>` elements against 11 `htmlFor` attributes**:
 * roughly 123 form controls announced nothing at all to a screen reader, on
 * effectively every form on the site including the booking flow. That is not a
 * defect you fix by auditing 134 call sites once — it comes back the next time
 * someone hand-writes a field.
 *
 * So the pairing is not something a caller *can* do here; it is something a
 * caller cannot avoid. `useId()` mints the id, the label consumes it, and the
 * control receives it. A caller who passes nothing still gets a correctly
 * labelled field.
 *
 * The same argument applies to the two things call sites also routinely missed:
 * error text that is visible but not programmatically linked (so it is never
 * announced), and hint text that is linked as if it were an error. `describedBy`
 * wires both correctly, and only `error` sets `aria-invalid`.
 */
const Field = ({ id: providedId, label, hint, error, required, children, className = '' }) => {
  const generatedId = useId();
  const id = providedId ?? `field-${generatedId}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  // Order matters: the error is the more urgent of the two, so it is announced
  // first when both are present.
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={id} className="block mb-1.5 text-sm font-medium text-content">
        {label}
        {required && (
          // The asterisk is decorative — `required` on the control is what
          // assistive technology actually reads.
          <span aria-hidden="true" className="ml-1 text-danger-content">
            *
          </span>
        )}
      </label>

      {children({
        id,
        required: required || undefined,
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': describedBy || undefined,
      })}

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-content-subtle">
          {hint}
        </p>
      )}

      {error && (
        // `role="alert"` rather than a plain paragraph: a validation message
        // that appears after a failed submit is only useful if it is announced.
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-danger-content">
          {error}
        </p>
      )}
    </div>
  );
};

Field.propTypes = {
  id: PropTypes.string,
  label: PropTypes.node.isRequired,
  hint: PropTypes.node,
  error: PropTypes.node,
  required: PropTypes.bool,
  /** Render prop: receives the id and ARIA wiring to spread onto the control. */
  children: PropTypes.func.isRequired,
  className: PropTypes.string,
};

/**
 * Control chrome, shared so an input, a textarea and a select cannot drift
 * apart visually — which they had, across roughly a dozen hand-written variants.
 */
export const controlClasses = (error) =>
  [
    'w-full rounded-lg px-4 py-2.5 text-content bg-surface-raised',
    'border transition-colors duration-200',
    'placeholder:text-content-subtle',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:border-brand',
    'disabled:opacity-60 disabled:cursor-not-allowed',
    error ? 'border-danger-border' : 'border-line-strong',
  ].join(' ');

export default Field;
