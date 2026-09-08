import { useEffect, useState } from 'react';

const EMPTY_FILTERS = {
  purpose: '',
  propertyType: '',
  location: '',
  bedrooms: '',
  minPrice: 0,
  maxPrice: 100000000,
};

/**
 * The viewing page's property filtering: the filter values, the list they
 * produce, and the chips that describe what is currently applied. Moved out of
 * `ViewingExperience.jsx` (Task 24) with its two effects intact.
 *
 * `setFilteredProperties` is returned because the page's "Find Properties"
 * button seeds the list straight from its fetch, before the filters effect
 * re-runs over the newly-arrived properties — which is what the component did
 * and what the empty-state copy depends on.
 */
export function useViewingFilters(properties, formatPrice) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    if (properties.length === 0) return;

    let result = [...properties];

    if (filters.purpose) {
      result = result.filter(p =>
        p.purpose?.toLowerCase() === filters.purpose.toLowerCase()
      );
    }

    if (filters.propertyType) {
      result = result.filter(p =>
        p.property_type && p.property_type.toLowerCase() === filters.propertyType.toLowerCase()
      );
    }

    if (filters.location) {
      result = result.filter(p =>
        p.location && p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.bedrooms) {
      result = result.filter(p => p.bedrooms >= parseInt(filters.bedrooms));
    }

    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      result = result.filter(p =>
        p.price >= filters.minPrice && p.price <= filters.maxPrice
      );
    }

    setFilteredProperties(result);
  }, [filters, properties]);

  useEffect(() => {
    const newFilters = [];

    if (filters.purpose) {
      newFilters.push({ type: 'purpose', value: filters.purpose, label: `Purpose: ${filters.purpose}` });
    }

    if (filters.propertyType) {
      newFilters.push({
        type: 'propertyType',
        value: filters.propertyType,
        label: `Property Type: ${filters.propertyType}`,
      });
    }

    if (filters.location) {
      newFilters.push({ type: 'location', value: filters.location, label: `Location: ${filters.location}` });
    }

    if (filters.bedrooms) {
      newFilters.push({ type: 'bedrooms', value: filters.bedrooms, label: `Bedrooms: ${filters.bedrooms}+` });
    }

    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      newFilters.push({
        type: 'priceRange',
        value: { min: filters.minPrice, max: filters.maxPrice },
        label: `Price: ${formatPrice(filters.minPrice)} - ${formatPrice(filters.maxPrice)}`,
      });
    }

    setActiveFilters(newFilters);
  }, [filters, formatPrice]);

  return {
    filters,
    activeFilters,
    filteredProperties,
    setFilteredProperties,
    handleFilterChange: (e) => {
      const { name, value } = e.target;
      setFilters(prev => ({ ...prev, [name]: value }));
    },
    removeFilter: (filterType) => setFilters(prev => ({ ...prev, [filterType]: '' })),
    clearAllFilters: () => setFilters(EMPTY_FILTERS),
  };
}
