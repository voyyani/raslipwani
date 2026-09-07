import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/Icon';

/**
 * Image select, preview, and delete for the property form. Moved out of
 * `AdminProperties.jsx` (Task 22).
 *
 * The Task 22 interface passes raw `File[]` for not-yet-uploaded images
 * rather than the pre-rendered data-URL previews the original inline version
 * built with `FileReader` — so previews for those are generated here, via
 * `URL.createObjectURL`, and revoked when the file list changes or the
 * component unmounts.
 */
const PropertyImageUploader = ({ images, files, onAdd, onRemove, error, uploading }) => {
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return (
    <div>
      <span className="block text-sm font-medium text-content-muted mb-2">Property Images</span>
      <div className="flex items-center justify-center w-full border-2 border-dashed border-line-strong rounded-lg p-8 text-center bg-surface">
        <div>
          <Icon name="upload" size={24} className="mx-auto text-content-subtle mb-2" />
          <p className="text-sm text-content-muted">
            Drag & drop images here or
            <label htmlFor="property-images" className="text-brand cursor-pointer ml-1 font-medium">
              browse files
            </label>
          </p>
          <input
            type="file"
            id="property-images"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const selected = Array.from(e.target.files);
              if (selected.length === 0) return;
              onAdd(selected);
            }}
            multiple
          />
        </div>
      </div>

      {error && <p className="text-danger-content text-sm mt-1">{error}</p>}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
        {/* Existing images */}
        {images.map((img, index) => (
          <div key={`existing-${index}`} className="relative">
            <img
              src={img}
              alt={`Property ${index}`}
              className="w-full h-24 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => onRemove(index, 'existing')}
              className="absolute top-1 right-1 bg-danger-content text-content-on-brand rounded-full w-6 h-6 flex items-center justify-center"
            >
              <Icon name="times" size={12} />
            </button>
          </div>
        ))}

        {/* New image previews */}
        {previews.map((preview, index) => (
          <div key={`preview-${index}`} className="relative">
            <img
              src={preview}
              alt={`Preview ${index}`}
              className="w-full h-24 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => onRemove(index, 'preview')}
              className="absolute top-1 right-1 bg-danger-content text-content-on-brand rounded-full w-6 h-6 flex items-center justify-center"
            >
              <Icon name="times" size={12} />
            </button>
          </div>
        ))}
      </div>

      {uploading && (
        <div className="mt-3 text-brand flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-brand mr-2"></div>
          Uploading images...
        </div>
      )}
    </div>
  );
};

PropertyImageUploader.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  files: PropTypes.array.isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  error: PropTypes.string,
  uploading: PropTypes.bool,
};

export default PropertyImageUploader;
