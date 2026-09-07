import { useCallback, useMemo, useRef, useState } from 'react';

/**
 * Filter state for a list screen.
 *
 * `filters` goes straight into a query key, so it must be a plain object whose
 * identity changes only when a value does — otherwise every render is a new key
 * and TanStack Query refetches forever.
 */
export function useFilters(initial) {
  const initialRef = useRef(initial);
  const [filters, setFilters] = useState(initial);

  const setFilter = useCallback((name, value) => {
    setFilters((current) => (current[name] === value ? current : { ...current, [name]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(initialRef.current), []);

  const activeCount = useMemo(
    () =>
      Object.entries(filters).filter(([name, value]) => value !== initialRef.current[name]).length,
    [filters]
  );

  return { filters, setFilter, resetFilters, activeCount, isFiltered: activeCount > 0 };
}
