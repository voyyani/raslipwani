import { useCallback, useEffect, useState } from 'react';

// A stable reference for the "no property" (add) case so callers relying on
// referential equality (e.g. a `useEffect` dependency elsewhere) don't see a
// fresh object every render.
const EMPTY_FORM = {
  title: '',
  description: '',
  price: '',
  property_type: '',
  status: 'available',
  purpose: 'sale',
  // The audience this listing is marketed to. '' is the general market, which
  // the database stores as NULL — see `toSubmitData` and migration 013.
  segment: '',
  location: '',
  address: '',
  bedrooms: '',
  bathrooms: '',
  area_sqft: '',
  lot_size_sqft: '',
  has_pool: false,
  has_garden: false,
  featured: false,
  images: [],
  amenities: [],
};

function formFromProperty(property) {
  if (!property) return EMPTY_FORM;
  return {
    title: property.title,
    description: property.description,
    price: property.price,
    property_type: property.property_type,
    status: property.status,
    purpose: property.purpose || 'sale',
    segment: property.segment || '',
    location: property.location,
    address: property.address || '',
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area_sqft: property.area_sqft,
    lot_size_sqft: property.lot_size_sqft || '',
    has_pool: property.has_pool || false,
    has_garden: property.has_garden || false,
    featured: property.featured || false,
    images: property.images || [],
    amenities: property.amenities || [],
  };
}

/**
 * The create/edit property form's state and validation, extracted verbatim
 * from `AdminProperties.jsx` (Task 22 — this task does not decide what a
 * valid property is, it only moves the rules).
 *
 * `property` is the row being edited, or `null` when adding. The form
 * re-seeds itself whenever `property` changes identity, mirroring the old
 * `setupEditForm` behaviour.
 */
export function usePropertyForm(property) {
  const [formData, setFormData] = useState(() => formFromProperty(property));
  const [errors, setErrors] = useState({});

  // Keyed on the id, not the `property` object itself: a caller that re-fetches
  // (React Query, or a test that passes a fresh object literal each render)
  // hands us a new reference for the same logical row every render, and
  // depending on the object would re-seed the form — wiping in-progress edits
  // — on every unrelated re-render, or loop forever against a literal that is
  // never referentially stable.
  const propertyId = property?.id ?? null;
  useEffect(() => {
    setFormData(formFromProperty(property));
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    // Reset property type when purpose changes
    if (name === 'purpose') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        property_type: '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    // Clear error when field changes
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const addAmenity = useCallback((amenity) => {
    const trimmed = amenity.trim();
    if (!trimmed) return;
    setFormData((prev) =>
      prev.amenities.includes(trimmed)
        ? prev
        : { ...prev, amenities: [...prev.amenities, trimmed] }
    );
  }, []);

  const removeAmenity = useCallback((index) => {
    setFormData((prev) => {
      const newAmenities = [...prev.amenities];
      newAmenities.splice(index, 1);
      return { ...prev, amenities: newAmenities };
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormData(EMPTY_FORM);
    setErrors({});
  }, []);

  // `imageFilesCount` is the number of not-yet-uploaded files selected in
  // PropertyImageUploader — the caller owns that state, this hook only owns
  // the form fields, so the count crosses the boundary as an argument.
  const validateForm = useCallback(
    (imageFilesCount = 0) => {
      const newErrors = {};
      const requiredFields = [
        'title', 'description', 'price', 'property_type',
        'location', 'address', 'bedrooms', 'bathrooms', 'area_sqft'
      ];

      requiredFields.forEach((field) => {
        if (!formData[field]) {
          newErrors[field] = `${field.replace('_', ' ')} is required`;
        }
      });

      // Not present in the original inline validateForm — added per the
      // Task 22 brief's own hook test ("rejects a non-numeric price"), which
      // the pre-extraction code did not cover (a non-numeric price sailed
      // through validateForm and only became NaN later, silently, in
      // handleSubmit's numeric-field conversion).
      if (formData.price && Number.isNaN(Number(formData.price))) {
        newErrors.price = 'Price must be a number';
      }

      if (formData.images.length === 0 && imageFilesCount === 0) {
        newErrors.images = 'At least one image is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData]
  );

  // `overrideImages`, when given, replaces formData.images — the caller uses
  // this to fold in freshly-uploaded Cloudinary URLs. `properties.images` and
  // `properties.amenities` are TEXT[] columns, not jsonb, so these must stay
  // arrays, never a JSON string.
  const toSubmitData = useCallback(
    (overrideImages) => {
      const numericFields = ['price', 'bedrooms', 'bathrooms', 'area_sqft', 'lot_size_sqft'];
      const submitData = { ...formData, images: overrideImages ?? formData.images };

      numericFields.forEach((field) => {
        if (submitData[field]) submitData[field] = Number(submitData[field]);
      });

      // The general market is NULL in the database, not ''. Migration 013's
      // CHECK allows NULL or one of three names, and '' is neither — sending
      // the empty string would fail the write.
      submitData.segment = submitData.segment || null;

      return submitData;
    },
    [formData]
  );

  return {
    formData,
    errors,
    handleInputChange,
    addAmenity,
    removeAmenity,
    validateForm,
    resetForm,
    toSubmitData,
  };
}
