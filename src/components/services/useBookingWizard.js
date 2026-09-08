import { useCallback, useState } from 'react';

/**
 * The step machinery the two booking flows each had their own copy of.
 *
 * `validate(step)` returns an errors object for the step being left; an empty
 * object means "go on". Going backwards never validates — a visitor correcting
 * an earlier answer must not be held by the step they are leaving.
 *
 * `steps` may change while the wizard is open: ServicesMain's flow is four
 * steps for a viewing and three for every other service, so the index is
 * clamped on read rather than only on write. Without that, choosing a
 * non-viewing service while parked on step four leaves the wizard pointing
 * past the end of its own list.
 */
export function useBookingWizard({ steps, validate }) {
  const [rawIndex, setRawIndex] = useState(0);
  const [errors, setErrors] = useState({});

  const lastIndex = Math.max(steps.length - 1, 0);
  const stepIndex = Math.min(rawIndex, lastIndex);

  const next = useCallback(() => {
    const stepErrors = validate(steps[stepIndex]) ?? {};
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      setRawIndex(Math.min(stepIndex + 1, lastIndex));
    }
  }, [steps, stepIndex, lastIndex, validate]);

  const back = useCallback(() => {
    setErrors({});
    setRawIndex(Math.max(stepIndex - 1, 0));
  }, [stepIndex]);

  const goTo = useCallback(
    (index) => {
      setErrors({});
      setRawIndex(Math.max(0, Math.min(index, lastIndex)));
    },
    [lastIndex]
  );

  const reset = useCallback(() => {
    setErrors({});
    setRawIndex(0);
  }, []);

  return {
    step: steps[stepIndex],
    stepIndex,
    next,
    back,
    goTo,
    reset,
    isFirstStep: stepIndex === 0,
    isLastStep: stepIndex === lastIndex,
    errors,
  };
}
