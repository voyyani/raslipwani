import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../usePagination';

describe('usePagination', () => {
  it('starts on page 1 with a zero-based range', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 20, totalCount: 47 }));
    expect(result.current.page).toBe(1);
    expect(result.current.range).toEqual({ from: 0, to: 19 });
    expect(result.current.totalPages).toBe(3);
  });

  it('moves the range with the page', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 20, totalCount: 47 }));
    act(() => result.current.nextPage());
    expect(result.current.range).toEqual({ from: 20, to: 39 });
  });

  it('will not advance past the last page', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 20, totalCount: 25 }));
    act(() => result.current.nextPage());
    act(() => result.current.nextPage());
    expect(result.current.page).toBe(2);
  });

  it('will not go below page 1', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 20, totalCount: 25 }));
    act(() => result.current.previousPage());
    expect(result.current.page).toBe(1);
  });

  it('reports one page for an empty result rather than zero', () => {
    // totalPages: 0 renders "Page 1 of 0", which is how the admin table used to
    // read on an empty filter.
    const { result } = renderHook(() => usePagination({ pageSize: 20, totalCount: 0 }));
    expect(result.current.totalPages).toBe(1);
  });

  it('clamps the current page when the total shrinks under it', () => {
    // Filtering while on page 3 of 5 used to leave the table on a page that no
    // longer existed, showing nothing and offering no way back.
    const { result, rerender } = renderHook((props) => usePagination(props), {
      initialProps: { pageSize: 10, totalCount: 50 },
    });
    act(() => result.current.setPage(5));
    rerender({ pageSize: 10, totalCount: 12 });
    expect(result.current.page).toBe(2);
  });
});
