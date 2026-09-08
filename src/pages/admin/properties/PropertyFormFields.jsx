import React from 'react';
import PropTypes from 'prop-types';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/Textarea';
import Checkbox from '../../../components/ui/Checkbox';
import Icon from '../../../components/Icon';
import PropertyImageUploader from './PropertyImageUploader';

// Property types based on purpose
const propertyTypes = {
  sale: ['land', 'residential', 'commercial'],
  rent: ['apartment', 'villa', 'office'],
};

/**
 * Every field in the property dialog, in the two columns it always had. Moved
 * out of `PropertyFormModal.jsx` (Task 27), which keeps the dialog chrome, the
 * upload and the write.
 */
const PropertyFormFields = ({
  formData, errors, newAmenity, imageFiles, loading,
  onInputChange, onNewAmenityChange, onAddAmenity, onRemoveAmenity, onImageAdd, onImageRemove,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  <div className="space-y-4">
    <Input
      label="Title"
      required
      error={errors.title}
      type="text"
      name="title"
      value={formData.title}
      onChange={onInputChange}
    />

    <Textarea
      label="Description"
      required
      error={errors.description}
      name="description"
      value={formData.description}
      onChange={onInputChange}
    />

    <Input
      label="Price (KES)"
      required
      error={errors.price}
      type="number"
      name="price"
      value={formData.price}
      onChange={onInputChange}
    />

    <div className="grid grid-cols-2 gap-4">
      <Select
        label="Purpose"
        required
        name="purpose"
        value={formData.purpose}
        onChange={onInputChange}
      >
        <option value="sale">For Sale</option>
        <option value="rent">For Rent</option>
      </Select>

      <Select
        label="Property Type"
        required
        error={errors.property_type}
        name="property_type"
        value={formData.property_type}
        onChange={onInputChange}
      >
        <option value="">Select Type</option>
        {propertyTypes[formData.purpose]?.map(type => (
          <option key={type} value={type}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </option>
        ))}
      </Select>
    </div>

    <Input
      label="Location"
      required
      error={errors.location}
      type="text"
      name="location"
      value={formData.location}
      onChange={onInputChange}
    />

    <Input
      label="Address"
      required
      error={errors.address}
      type="text"
      name="address"
      value={formData.address}
      onChange={onInputChange}
    />

    <div className="grid grid-cols-3 gap-4">
      <Input
        label="Bedrooms"
        required
        error={errors.bedrooms}
        type="number"
        name="bedrooms"
        value={formData.bedrooms}
        onChange={onInputChange}
      />

      <Input
        label="Bathrooms"
        required
        error={errors.bathrooms}
        type="number"
        name="bathrooms"
        value={formData.bathrooms}
        onChange={onInputChange}
      />

      <Input
        label="Area (sqft)"
        required
        error={errors.area_sqft}
        type="number"
        name="area_sqft"
        value={formData.area_sqft}
        onChange={onInputChange}
      />
    </div>
  </div>

  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Lot Size (sqft)"
        type="number"
        name="lot_size_sqft"
        value={formData.lot_size_sqft}
        onChange={onInputChange}
      />

      <Select
        label="Status"
        required
        name="status"
        value={formData.status}
        onChange={onInputChange}
      >
        <option value="available">Available</option>
        <option value="pending">Pending</option>
        <option value="sold">Sold</option>
        <option value="off-market">Off Market</option>
      </Select>

      {/* The vocabulary migration 013's CHECK allows, so an admin cannot type a
          value the database will reject. The segment pages under /international
          read these. */}
      <Select
        label="Audience"
        name="segment"
        value={formData.segment}
        onChange={onInputChange}
      >
        <option value="">General market</option>
        <option value="un-diplomatic">UN &amp; diplomatic</option>
        <option value="corporate">Corporate</option>
        <option value="student">Student</option>
      </Select>
    </div>

    <div className="bg-surface p-4 rounded-lg">
      <label htmlFor="new-amenity" className="block text-sm font-medium text-content-muted mb-2">Amenities</label>
      <div className="flex mb-3">
        <input
          id="new-amenity"
          type="text"
          value={newAmenity}
          onChange={(e) => onNewAmenityChange(e.target.value)}
          placeholder="Add amenity (e.g. Swimming Pool)"
          className="flex-grow border border-line-strong rounded-lg p-2 focus:ring-2 focus:ring-focus-ring focus:outline-none"
        />
        <button
          type="button"
          onClick={onAddAmenity}
          className="ml-2 bg-brand text-content-on-brand px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {formData.amenities.map((amenity, index) => (
          <div
            key={index}
            className="bg-brand-subtle text-brand-content rounded-full pl-3 pr-2 py-1.5 flex items-center"
          >
            <span className="text-sm">{amenity}</span>
            <button
              type="button"
              onClick={() => onRemoveAmenity(index)}
              className="ml-1 text-brand hover:text-brand-content"
            >
              <Icon name="times" size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>

    <div className="flex flex-wrap gap-4">
      <div className="flex items-center">
        <Checkbox
          label="Has Pool"
          name="has_pool"
          checked={formData.has_pool}
          onChange={onInputChange}
        />
      </div>

      <div className="flex items-center">
        <Checkbox
          label="Has Garden"
          name="has_garden"
          checked={formData.has_garden}
          onChange={onInputChange}
        />
      </div>

      <div className="flex items-center">
        <Checkbox
          label="Featured Property"
          name="featured"
          checked={formData.featured}
          onChange={onInputChange}
        />
      </div>
    </div>

    <PropertyImageUploader
      images={formData.images}
      files={imageFiles}
      onAdd={onImageAdd}
      onRemove={onImageRemove}
      error={errors.images}
      uploading={loading}
    />
  </div>
  </div>
);

PropertyFormFields.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  newAmenity: PropTypes.string.isRequired,
  imageFiles: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onNewAmenityChange: PropTypes.func.isRequired,
  onAddAmenity: PropTypes.func.isRequired,
  onRemoveAmenity: PropTypes.func.isRequired,
  onImageAdd: PropTypes.func.isRequired,
  onImageRemove: PropTypes.func.isRequired,
};

export default PropertyFormFields;
