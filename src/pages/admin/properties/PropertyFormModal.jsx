import React, { useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { createProperty, updateProperty } from '@/services/properties';
import { settingsQueries } from '@/services/settings';
import { logger } from '../../../utils/logger';
import { usePropertyForm } from './usePropertyForm';
import PropertyFormFields from './PropertyFormFields';

/**
 * The create/edit property modal, moved out of `AdminProperties.jsx`
 * (Task 22). Owns the image-file selection, the Cloudinary upload and the
 * create/update mutation; the form fields and their validation live in
 * `usePropertyForm`.
 *
 * The dialog fields are still hand-written and still carry unassociated
 * labels where `Input`/`Select`/`Checkbox` aren't already used — that was
 * true before this extraction too, and moves verbatim rather than being
 * fixed here.
 */
const PropertyFormModal = ({ isOpen, property, onClose, onSaved, onSubmittingChange }) => {
  const [isSubmitting, setIsSubmittingState] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [newAmenity, setNewAmenity] = useState('');

  // AdminProperties gates the table/pagination on a page-level "is anything
  // mutating" flag (the pre-Task-22 `loading = isPageLoading ||
  // isSubmitting`). This modal owns the create/update submit, so it reports
  // its own submitting state up rather than the page inventing a second,
  // disagreeing one.
  const setIsSubmitting = (value) => {
    setIsSubmittingState(value);
    onSubmittingChange?.(value);
  };

  const {
    formData,
    errors,
    handleInputChange,
    addAmenity,
    removeAmenity,
    validateForm,
    resetForm,
    toSubmitData,
  } = usePropertyForm(property);

  // Cloudinary settings. `admin_settings` is the single source of truth since
  // 010; the legacy `settings` table it replaced also held the Cloudinary
  // api_secret in a browser-readable row, so this reads only the two columns
  // the service names rather than the whole row.
  const { data: cloudinaryConfig } = useQuery(settingsQueries.cloudinary());
  const cloudinarySettings = {
    cloudName: cloudinaryConfig?.cloud_name || '',
    uploadPreset: cloudinaryConfig?.upload_preset || '',
  };

  const loading = isSubmitting;

  const handleAddAmenity = () => {
    const trimmed = newAmenity.trim();
    if (trimmed && !formData.amenities.includes(trimmed)) {
      addAmenity(trimmed);
      setNewAmenity('');
    }
  };

  const handleImageAdd = (files) => {
    setImageFiles(files);
  };

  const handleDeleteImage = (index, type) => {
    if (type === 'existing') {
      // Delete from Cloudinary URLs. Routed back through handleInputChange
      // rather than a new hook method, so usePropertyForm's public surface
      // stays exactly what the Task 22 brief specifies.
      const newImages = [...formData.images];
      newImages.splice(index, 1);
      handleInputChange({ target: { name: 'images', value: newImages, type: 'text' } });
    } else {
      // Delete from new selections
      setImageFiles(prev => {
        const newFiles = [...prev];
        newFiles.splice(index, 1);
        return newFiles;
      });
    }
  };

  const handleModalClose = () => {
    resetForm();
    setImageFiles([]);
    setNewAmenity('');
    onClose();
  };

  // Upload multiple images to Cloudinary
  const uploadImages = async () => {
    if (!imageFiles.length || !cloudinarySettings.cloudName || !cloudinarySettings.uploadPreset) {
      return [];
    }

    try {
      setIsSubmitting(true);
      const uploadPromises = imageFiles.map(file => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', cloudinarySettings.uploadPreset);

        return fetch(
          `https://api.cloudinary.com/v1_1/${cloudinarySettings.cloudName}/image/upload`,
          { method: 'POST', body: fd }
        ).then(res => res.json());
      });

      const results = await Promise.all(uploadPromises);
      return results.map(result => result.secure_url);
    } catch (err) {
      logger.error('Image upload error:', err);
      toast.error('Failed to upload images. Please check Cloudinary settings.');
      return [];
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm(imageFiles.length)) return;

    try {
      setIsSubmitting(true);

      // Upload new images if selected
      let cloudinaryUrls = [...formData.images];

      if (imageFiles.length) {
        const uploadedUrls = await uploadImages();
        cloudinaryUrls = [...cloudinaryUrls, ...uploadedUrls];
      }

      const submitData = toSubmitData(cloudinaryUrls);

      if (property) {
        // Update
        await updateProperty(property.id, submitData);
        toast.success('Property updated successfully!');
      } else {
        // Create
        await createProperty(submitData);
        toast.success('Property added successfully!');
      }

      onSaved();
      handleModalClose();
    } catch (error) {
      toast.error('Error saving property: ' + error.message);
      toast.error('Failed to save property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    /*
      The property form. It was a hand-rolled overlay with a sticky header:
      focus never entered it, Tab left the form for the table behind, and
      Escape did nothing. `Modal` supplies all three. The fields inside are
      still hand-written and still carry unassociated labels — they move to
      `Input`/`Select` with this surface's own migration, which is a larger
      change than putting the dialog in the right shell.
    */
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={property ? 'Edit Property' : 'Add New Property'}
      size="xl"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={handleModalClose}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} disabled={loading}>
            {loading
              ? property
                ? 'Updating...'
                : 'Adding...'
              : property
                ? 'Update Property'
                : 'Add Property'}
          </Button>
        </>
      }
    >
      <PropertyFormFields
        formData={formData}
        errors={errors}
        newAmenity={newAmenity}
        imageFiles={imageFiles}
        loading={loading}
        onInputChange={handleInputChange}
        onNewAmenityChange={setNewAmenity}
        onAddAmenity={handleAddAmenity}
        onRemoveAmenity={removeAmenity}
        onImageAdd={handleImageAdd}
        onImageRemove={handleDeleteImage}
      />
    </Modal>
  );
};

PropertyFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  property: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
  onSubmittingChange: PropTypes.func,
};

export default PropertyFormModal;
