import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, MapPin } from 'lucide-react';
import { propertyQueries } from '@/services/properties';

/**
 * The UN and diplomatic listings, read from the database (Task 34).
 *
 * This section used to render a hardcoded `unProperties` array: three
 * listings with Unsplash photographs, invented prices, and an availability
 * date of 2026-02-01 that was already in the past. Migration 013 added
 * `properties.segment` so the admin CRM manages these rows like any other
 * listing, and this reads them.
 *
 * Four fields the array had are gone rather than reproduced: `distance`,
 * `furnished`, `security`, `parking`, `preferredTenants` and `leaseTerms` were
 * prose with no column behind them. They live in the seeded `description`,
 * which is rendered where the badges used to be — five columns for one page
 * would have been the wrong trade.
 */
const UnHousingProperties = ({ formatCurrency }) => {
  const { data: properties = [], isLoading } = useQuery(
    propertyQueries.segment('un-diplomatic')
  );

  return (
    <section id="properties" className="py-16 bg-surface-raised">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-content mb-4">
            Featured Properties Near UN Complex
          </h2>
          <p className="text-lg text-content-muted max-w-3xl mx-auto">
            Handpicked properties in Gigiri, Runda, and Rosslyn - all within minutes of the UN headquarters
          </p>
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-3 gap-8" aria-hidden="true">
            {[1, 2, 3].map((placeholder) => (
              <div
                key={placeholder}
                className="bg-surface rounded-xl h-96 animate-pulse border border-line"
              />
            ))}
          </div>
        )}

        {!isLoading && properties.length === 0 && (
          <p className="text-content-muted text-center py-12 max-w-2xl mx-auto">
            No UN or diplomatic listings are available right now. Call us on{' '}
            <a href="tel:+254758066526" className="text-brand-content font-semibold">
              +254 758 066 526
            </a>{' '}
            and we will match you to something that has not been listed yet.
          </p>
        )}

        {!isLoading && properties.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-surface-raised rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-line"
              >
                {property.images?.[0] ? (
                  <div className="relative h-64">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-success-content text-content-on-brand px-3 py-1 rounded-full text-sm font-semibold">
                        Available
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 bg-surface-sunken flex items-center justify-center text-content-subtle">
                    <MapPin className="w-10 h-10" aria-hidden="true" />
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-content mb-2">{property.title}</h3>
                  {property.address && (
                    <p className="text-content-muted mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4" aria-hidden="true" />
                      {property.address}
                    </p>
                  )}

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-brand-content">
                      {formatCurrency(property.price)}
                    </span>
                    <span className="text-content-muted">/ month</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-line">
                    <div>
                      <div className="text-sm text-content-subtle">Bedrooms</div>
                      <div className="font-semibold text-content">{property.bedrooms ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-content-subtle">Bathrooms</div>
                      <div className="font-semibold text-content">{property.bathrooms ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-content-subtle">Size</div>
                      <div className="font-semibold text-content">
                        {property.area_sqft ? `${property.area_sqft} sqft` : '—'}
                      </div>
                    </div>
                  </div>

                  {property.description && (
                    <p className="text-sm text-content-muted mb-4 line-clamp-4">
                      {property.description}
                    </p>
                  )}

                  {property.amenities?.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-content mb-2">Key Amenities:</div>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.slice(0, 3).map((amenity) => (
                          <span key={amenity} className="text-xs bg-surface-sunken px-2 py-1 rounded">
                            <CheckCircle className="w-3 h-3 inline mr-1 text-success-content" aria-hidden="true" />
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
                  )}

                  <Link
                    to={`/properties/${property.id}`}
                    className="block w-full bg-brand hover:bg-brand-hover text-content-on-brand text-center py-3 rounded-lg font-semibold transition-colors"
                  >
                    View Details &amp; Book Tour
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            to="/properties?filter=un-area"
            className="inline-flex items-center gap-2 text-brand-content hover:text-brand-content font-semibold text-lg"
          >
            View All UN-Area Properties
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

UnHousingProperties.propTypes = {
  formatCurrency: PropTypes.func.isRequired,
};

export default UnHousingProperties;
