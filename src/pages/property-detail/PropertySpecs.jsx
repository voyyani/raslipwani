import React from 'react';
import PropTypes from 'prop-types';

/**
 * The listing's own column: title, location, the four headline specs, the
 * description, the amenities, the detail table and the location notes. Moved
 * out of `PropertyDetail.jsx` (Task 25) unchanged.
 */
const PropertySpecs = ({ property, formatPrice }) => (
  <div className="lg:col-span-2">
    <div className="flex justify-between items-start mb-4">
      <h1 className="text-3xl font-bold text-content">{property.title}</h1>
      {property.featured && (
        <span className="bg-warning-surface text-warning-content text-sm font-medium px-3 py-1 rounded-full">
          Featured Property
        </span>
      )}
    </div>
    
    <p className="text-content mb-6 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      {property.location}
    </p>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-surface p-4 rounded-lg text-center border border-line">
        <p className="text-sm text-content-muted">Bedrooms</p>
        <p className="text-xl font-bold">{property.bedrooms}</p>
      </div>
      <div className="bg-surface p-4 rounded-lg text-center border border-line">
        <p className="text-sm text-content-muted">Bathrooms</p>
        <p className="text-xl font-bold">{property.bathrooms}</p>
      </div>
      <div className="bg-surface p-4 rounded-lg text-center border border-line">
        <p className="text-sm text-content-muted">Area</p>
        <p className="text-xl font-bold">{property.area_sqft} sqft</p>
      </div>
      <div className="bg-surface p-4 rounded-lg text-center border border-line">
        <p className="text-sm text-content-muted">Price</p>
        <p className="text-xl font-bold text-primary">{formatPrice(property.price)}</p>
      </div>
    </div>
    
    <h2 className="text-2xl font-semibold mb-3">Property Description</h2>
    <p className="text-content mb-6 whitespace-pre-line">
      {property.description}
    </p>
    
    <h2 className="text-2xl font-semibold mb-3">Property Features</h2>
    <div className="grid grid-cols-2 gap-3 mb-8">
      {property.amenities?.map((amenity, i) => (
        <div key={i} className="flex items-center bg-surface px-4 py-2.5 rounded-lg">
          <span className="text-primary mr-2">✓</span>
          <span className="capitalize">{amenity.replace('-', ' ')}</span>
        </div>
      ))}
    </div>
    
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-3">Property Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-content-muted">Property Type</p>
          <p className="font-medium capitalize">{property.property_type}</p>
        </div>
        <div>
          <p className="text-content-muted">Year Built</p>
          <p className="font-medium">{property.year_built || 'N/A'}</p>
        </div>
        <div>
          <p className="text-content-muted">Lot Size</p>
          <p className="font-medium">{property.lot_size_sqft ? `${property.lot_size_sqft} sqft` : 'N/A'}</p>
        </div>
        <div>
          <p className="text-content-muted">Status</p>
          <p className="font-medium capitalize">{property.status}</p>
        </div>
      </div>
    </div>
    
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-3">Location Details</h2>
      <p className="text-content mb-4">
        {property.address}, {property.city}, {property.state} {property.zip_code}
      </p>
      <div className="bg-surface-sunken rounded-lg p-4">
        <p className="font-medium mb-2">Coastal Kenya Location Highlights:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Proximity to pristine beaches</li>
          <li>Access to local markets and amenities</li>
          <li>Growing real estate investment area</li>
          <li>Tourist-friendly neighborhood</li>
        </ul>
      </div>
    </div>
  </div>
);

PropertySpecs.propTypes = {
  property: PropTypes.object.isRequired,
  formatPrice: PropTypes.func.isRequired,
};

export default PropertySpecs;
