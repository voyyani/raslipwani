import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Car, CheckCircle, MapPin, Shield } from 'lucide-react';
import { unProperties } from './unHousingContent';

/**
 * The featured UN-suitable listings. Moved out of `UNHousing.jsx`
 * (Task 27) unchanged.
 */
const UnHousingProperties = ({ formatCurrency }) => (
  <section id="properties" className="py-16 bg-surface-raised">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-content mb-4">
          Available Properties Near UN Complex
        </h2>
        <p className="text-xl text-content-muted">
          Premium locations within 5km of UN offices
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {unProperties.map((property) => (
          <div
            key={property.id}
            className="bg-surface-raised rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-line"
          >
            <div className="relative h-64">
              <img 
                src={property.imageUrl} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-brand text-content-on-brand px-3 py-1 rounded-full text-sm font-semibold">
                  {property.distance}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="bg-success-content text-content-on-brand px-3 py-1 rounded-full text-sm font-semibold">
                  Available
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-bold text-content mb-2">{property.title}</h3>
              <p className="text-content-muted mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {property.address}
              </p>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-brand-content">{formatCurrency(property.price)}</span>
                <span className="text-content-muted">/ month</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-line">
                <div>
                  <div className="text-sm text-content-subtle">Bedrooms</div>
                  <div className="font-semibold text-content">{property.bedrooms}</div>
                </div>
                <div>
                  <div className="text-sm text-content-subtle">Bathrooms</div>
                  <div className="font-semibold text-content">{property.bathrooms}</div>
                </div>
                <div>
                  <div className="text-sm text-content-subtle">Size</div>
                  <div className="font-semibold text-content">{property.size}m²</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-content">
                  <CheckCircle className="w-4 h-4 text-success-content mr-2" />
                  {property.furnished ? 'Fully Furnished' : 'Unfurnished'}
                </div>
                <div className="flex items-center text-sm text-content">
                  <Shield className="w-4 h-4 text-success-content mr-2" />
                  {property.security}
                </div>
                <div className="flex items-center text-sm text-content">
                  <Car className="w-4 h-4 text-success-content mr-2" />
                  {property.parking} Parking Spaces
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-semibold text-content mb-2">Key Amenities:</div>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.slice(0, 3).map((amenity, idx) => (
                    <span key={idx} className="text-xs bg-surface-sunken px-2 py-1 rounded">
                      {amenity}
                    </span>
                  ))}
                  {property.amenities.length > 3 && (
                    <span className="text-xs bg-surface-sunken px-2 py-1 rounded">
                      +{property.amenities.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-brand-subtle rounded-lg p-3 mb-4">
                <div className="text-xs text-brand-content font-medium mb-1">Preferred Tenants</div>
                <div className="text-sm text-brand-content">{property.preferredTenants}</div>
              </div>

              <Link
                to={`/properties/${property.id}`}
                className="block w-full bg-brand hover:bg-brand-hover text-content-on-brand text-center py-3 rounded-lg font-semibold transition-colors"
              >
                View Details & Book Tour
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          to="/properties?filter=un-area"
          className="inline-flex items-center gap-2 text-brand-content hover:text-brand-content font-semibold text-lg"
        >
          View All UN-Area Properties
          <span>→</span>
        </Link>
      </div>
    </div>
  </section>
);

UnHousingProperties.propTypes = {
  formatCurrency: PropTypes.func.isRequired,
};

export default UnHousingProperties;
