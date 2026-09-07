import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBookingMutations } from '../useBookingMutations';
import { setBookingStatus } from '@/services/bookings';
import { queryKeys } from '@/services/queryKeys';

vi.mock('@/services/bookings', () => ({
  setBookingStatus: vi.fn().mockResolvedValue({ id: 'x' }),
  setBookingPriority: vi.fn().mockResolvedValue({ id: 'x' }),
  rescheduleBooking: vi.fn().mockResolvedValue({ id: 'x' }),
  addBookingNote: vi.fn().mockResolvedValue({ id: 1 }),
  deleteBookingNote: vi.fn().mockResolvedValue(undefined),
}));

const wrapper = ({ children }) => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

beforeEach(() => vi.clearAllMocks());

describe('useBookingMutations', () => {
  it('invalidates the whole bookings domain once per mutation', async () => {
    const client = new QueryClient();
    const spy = vi.spyOn(client, 'invalidateQueries');
    const localWrapper = ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useBookingMutations(), { wrapper: localWrapper });
    await act(async () => result.current.setStatus({ id: 'x', status: 'confirmed' }));

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.bookings.all })
    );
    expect(setBookingStatus).toHaveBeenCalledWith('x', 'confirmed');
  });

  it('reports pending while a mutation is in flight', async () => {
    const { result } = renderHook(() => useBookingMutations(), { wrapper });
    expect(result.current.isPending).toBe(false);
  });
});
