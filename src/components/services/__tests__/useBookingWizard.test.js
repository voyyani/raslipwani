import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBookingWizard } from '../useBookingWizard';

const steps = ['service', 'property', 'schedule', 'contact'];

describe('useBookingWizard', () => {
  it('starts on the first step', () => {
    const { result } = renderHook(() => useBookingWizard({ steps, validate: () => ({}) }));
    expect(result.current.step).toBe('service');
    expect(result.current.isFirstStep).toBe(true);
  });

  it('advances only when the current step validates', () => {
    const validate = vi.fn((step) => (step === 'service' ? { service: 'Pick one' } : {}));
    const { result } = renderHook(() => useBookingWizard({ steps, validate }));
    act(() => result.current.next());
    expect(result.current.step).toBe('service');
    expect(result.current.errors.service).toBe('Pick one');
  });

  it('advances when validation passes and clears the errors', () => {
    const { result } = renderHook(() => useBookingWizard({ steps, validate: () => ({}) }));
    act(() => result.current.next());
    expect(result.current.step).toBe('property');
    expect(result.current.errors).toEqual({});
  });

  it('does not go back past the first step', () => {
    const { result } = renderHook(() => useBookingWizard({ steps, validate: () => ({}) }));
    act(() => result.current.back());
    expect(result.current.step).toBe('service');
  });

  it('knows when it is on the last step', () => {
    const { result } = renderHook(() => useBookingWizard({ steps, validate: () => ({}) }));
    act(() => result.current.goTo(3));
    expect(result.current.isLastStep).toBe(true);
  });

  it('skips validation when going backwards', () => {
    // A visitor correcting an earlier answer must not be blocked by the step
    // they are trying to leave. Both wizards got this wrong in the same way.
    const validate = vi.fn(() => ({ any: 'error' }));
    const { result } = renderHook(() => useBookingWizard({ steps, validate }));
    act(() => result.current.goTo(2));
    act(() => result.current.back());
    expect(result.current.step).toBe('property');
  });

  it('does not advance past the last step', () => {
    const { result } = renderHook(() => useBookingWizard({ steps, validate: () => ({}) }));
    act(() => result.current.goTo(3));
    act(() => result.current.next());
    expect(result.current.step).toBe('contact');
  });

  it('reset returns to the first step and drops the errors', () => {
    const validate = vi.fn((step) => (step === 'property' ? { property: 'Pick one' } : {}));
    const { result } = renderHook(() => useBookingWizard({ steps, validate }));
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.errors.property).toBe('Pick one');
    act(() => result.current.reset());
    expect(result.current.step).toBe('service');
    expect(result.current.errors).toEqual({});
  });

  it('shrinks the step index when the step list gets shorter', () => {
    // ServicesMain's wizard is four steps for a viewing and three for anything
    // else: changing the service on step one must not strand the visitor on a
    // step index the shortened list no longer has.
    const { result, rerender } = renderHook(
      ({ steps: s }) => useBookingWizard({ steps: s, validate: () => ({}) }),
      { initialProps: { steps } }
    );
    act(() => result.current.goTo(3));
    rerender({ steps: ['service', 'options', 'contact'] });
    expect(result.current.step).toBe('contact');
    expect(result.current.isLastStep).toBe(true);
  });
});
