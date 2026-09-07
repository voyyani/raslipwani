import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilters } from '../useFilters';

const initial = { status: 'all', purpose: 'all', search: '' };

describe('useFilters', () => {
  it('starts at the initial values with nothing active', () => {
    const { result } = renderHook(() => useFilters(initial));
    expect(result.current.filters).toEqual(initial);
    expect(result.current.activeCount).toBe(0);
    expect(result.current.isFiltered).toBe(false);
  });

  it('sets one filter without disturbing the others', () => {
    const { result } = renderHook(() => useFilters(initial));
    act(() => result.current.setFilter('status', 'available'));
    expect(result.current.filters).toEqual({ ...initial, status: 'available' });
    expect(result.current.activeCount).toBe(1);
    expect(result.current.isFiltered).toBe(true);
  });

  it('stops counting a filter that is set back to its initial value', () => {
    const { result } = renderHook(() => useFilters(initial));
    act(() => result.current.setFilter('status', 'available'));
    act(() => result.current.setFilter('status', 'all'));
    expect(result.current.activeCount).toBe(0);
  });

  it('resets everything at once', () => {
    const { result } = renderHook(() => useFilters(initial));
    act(() => result.current.setFilter('status', 'sold'));
    act(() => result.current.setFilter('search', 'gigiri'));
    act(() => result.current.resetFilters());
    expect(result.current.filters).toEqual(initial);
  });

  it('keeps a stable setFilter identity across renders', () => {
    // The filters object is a query key input. A setter that changes identity
    // every render puts it in a dependency array that re-fires forever.
    const { result, rerender } = renderHook(() => useFilters(initial));
    const first = result.current.setFilter;
    rerender();
    expect(result.current.setFilter).toBe(first);
  });
});
