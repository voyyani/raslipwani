import React from 'react';
import PropTypes from 'prop-types';

/**
 * The wizard's progress bar. `aria-hidden` because the step count is already
 * announced in the dialog's description, so the bars would only repeat it.
 * Moved out of `ServicesMain.jsx` (Task 24).
 */
const BookingStepper = ({ totalSteps, currentStep }) => (
  <div className="mb-8" aria-hidden="true">
    <div className="flex justify-between mb-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={`flex-1 h-2 rounded-full mx-1 ${
            step <= currentStep ? 'bg-brand' : 'bg-surface-sunken'
          }`}
        />
      ))}
    </div>
  </div>
);

BookingStepper.propTypes = {
  totalSteps: PropTypes.number.isRequired,
  currentStep: PropTypes.number.isRequired,
};

export default BookingStepper;
