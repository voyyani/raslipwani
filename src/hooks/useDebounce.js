import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * @param {*} value - Value to debounce
 * @param {Number} delay - Delay in milliseconds (default: 500)
 * @returns {*} Debounced value
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
