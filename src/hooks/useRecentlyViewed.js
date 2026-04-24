import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'raslipwani_recently_viewed';
const MAX_ITEMS = 8;

/**
 * Custom hook for managing recently viewed properties
 * Persists to localStorage and provides add/get/clear operations
 */
export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate stored data is an array
        if (Array.isArray(parsed)) {
          setRecentlyViewed(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading recently viewed properties:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Add a property to recently viewed
  const addToRecentlyViewed = useCallback((property) => {
    if (!property || !property.id) return;

    // Create a slim version to save storage space
    const slimProperty = {
      id: property.id,
      title: property.title,
      slug: property.slug,
      price: property.price,
      location: property.location,
      property_type: property.property_type,
      purpose: property.purpose,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area_sqft: property.area_sqft,
      images: property.images?.slice(0, 1) || [], // Only first image
      viewedAt: Date.now()
    };

    setRecentlyViewed((prev) => {
      // Remove if already exists (to move to front)
      const filtered = prev.filter((p) => p.id !== property.id);
      // Add to front, limit to MAX_ITEMS
      const updated = [slimProperty, ...filtered].slice(0, MAX_ITEMS);
      
      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving recently viewed properties:', error);
      }
      
      return updated;
    });
  }, []);

  // Clear all recently viewed
  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing recently viewed properties:', error);
    }
  }, []);

  // Remove a specific property from recently viewed
  const removeFromRecentlyViewed = useCallback((propertyId) => {
    setRecentlyViewed((prev) => {
      const updated = prev.filter((p) => p.id !== propertyId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error updating recently viewed properties:', error);
      }
      return updated;
    });
  }, []);

  return {
    recentlyViewed,
    addToRecentlyViewed,
    removeFromRecentlyViewed,
    clearRecentlyViewed
  };
};

export default useRecentlyViewed;
