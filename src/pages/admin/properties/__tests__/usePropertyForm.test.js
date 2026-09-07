import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePropertyForm } from '../usePropertyForm';

describe('usePropertyForm', () => {
  it('starts empty for a new property', () => {
    const { result } = renderHook(() => usePropertyForm(null));
    expect(result.current.formData.title).toBe('');
    expect(result.current.formData.amenities).toEqual([]);
  });

  it('loads an existing property into the form', () => {
    const { result } = renderHook(() =>
      usePropertyForm({ id: 7, title: 'Gigiri', price: 100, amenities: ['Pool'] })
    );
    expect(result.current.formData.title).toBe('Gigiri');
    expect(result.current.formData.amenities).toEqual(['Pool']);
  });

  it('reports the missing required fields rather than the first one only', () => {
    const { result } = renderHook(() => usePropertyForm(null));
    act(() => { result.current.validateForm(); });
    expect(Object.keys(result.current.errors)).toEqual(
      expect.arrayContaining(['title', 'price'])
    );
  });

  it('rejects a non-numeric price', () => {
    const { result } = renderHook(() => usePropertyForm(null));
    act(() => result.current.handleInputChange({ target: { name: 'price', value: 'free' } }));
    act(() => { result.current.validateForm(); });
    expect(result.current.errors.price).toBeTruthy();
  });

  it('adds and removes amenities without mutating the previous array', () => {
    const { result } = renderHook(() => usePropertyForm(null));
    act(() => result.current.addAmenity('Pool'));
    const afterAdd = result.current.formData.amenities;
    act(() => result.current.addAmenity('Gym'));
    expect(afterAdd).toEqual(['Pool']);
    expect(result.current.formData.amenities).toEqual(['Pool', 'Gym']);
    act(() => result.current.removeAmenity(0));
    expect(result.current.formData.amenities).toEqual(['Gym']);
  });

  it('sends amenities and images as arrays, which is what the columns are', () => {
    // properties.amenities and properties.images are TEXT[], not jsonb. A
    // JSON string here is accepted by PostgREST and read back as one amenity
    // whose name is the whole array.
    const { result } = renderHook(() => usePropertyForm(null));
    act(() => result.current.addAmenity('Pool'));
    expect(Array.isArray(result.current.toSubmitData().amenities)).toBe(true);
  });
});
