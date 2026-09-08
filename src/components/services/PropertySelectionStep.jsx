import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Step two of the service booking wizard, reached only for a viewing: the list
 * of available properties, one of which has to be picked before Continue is
 * enabled. Moved out of `ServicesMain.jsx` (Task 24) unchanged.
 */
const PropertySelectionStep = ({ properties, isLoading, value, onChange, onBack, onNext, formatCurrency }) => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <fieldset className="border-0 p-0 m-0">
        <legend className="block text-content-muted mb-4 font-medium text-lg">Select a Property to View</legend>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-content-muted mt-4">Loading available properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-xl">
            <p className="text-content-muted">No properties currently available for viewing.</p>
            <p className="text-sm text-content-subtle mt-2">Please contact us for upcoming listings.</p>
          </div>
        ) : (
          <div className="grid gap-4 max-h-96 overflow-y-auto">
            {properties.map(property => (
              <label 
                key={property.id}
                htmlFor={`svc-property-${property.id}`}
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  value === property.id 
                    ? 'border-primary bg-brand-subtle' 
                    : 'border-line hover:border-primary'
                }`}
              >
                <div className="flex-shrink-0 mt-1 mr-4">
                  <input
                    id={`svc-property-${property.id}`}
                    type="radio"
                    name="propertyId"
                    value={property.id}
                    checked={value === property.id}
                    onChange={(e) => onChange(e.target.value)}
                    className="hidden"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    value === property.id 
                      ? 'border-primary bg-primary' 
                      : 'border-line-strong bg-surface-raised'
                  }`}>
                    {value === property.id && (
                      <div className="w-2 h-2 bg-surface-raised rounded-full"></div>
                    )}
                  </div>
                </div>
                
                {/* Property Image */}
                {property.images && property.images.length > 0 && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden mr-4 flex-shrink-0 border border-line">
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-content">{property.title}</h4>
                      <p className="text-content-muted text-sm">{property.location}</p>
                    </div>
                    <span className="font-bold text-primary whitespace-nowrap ml-4">
                      {property.price ? formatCurrency(property.price) : 'Price on request'}
                    </span>
                  </div>
                  <p className="text-content-muted text-sm mt-1 line-clamp-2">
                    {property.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {property.bedrooms && <span className="text-xs bg-surface-sunken px-2 py-1 rounded">🛏 {property.bedrooms} beds</span>}
                    {property.bathrooms && <span className="text-xs bg-surface-sunken px-2 py-1 rounded">🚿 {property.bathrooms} baths</span>}
                    {property.size && <span className="text-xs bg-surface-sunken px-2 py-1 rounded">📐 {property.size} sqft</span>}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-line-strong rounded-lg font-medium hover:bg-surface transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!value}
          className="bg-primary text-content-on-brand px-6 py-3 rounded-lg font-medium hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </motion.div>
);

PropertySelectionStep.propTypes = {
  properties: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  formatCurrency: PropTypes.func.isRequired,
};

export default PropertySelectionStep;
