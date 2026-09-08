import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Icon from '../Icon';

/**
 * The viewing page's results region: the spinner while properties are being
 * fetched, the empty state when nothing matches, and the property cards that
 * each open the booking flow. Moved out of `ViewingExperience.jsx` (Task 24)
 * unchanged — including the rule that nothing renders until a search has been
 * run at least once.
 */
const ViewingResults = ({ properties, isLoading, showResults, formatPrice, onBook, onClearFilters }) => (
  <>
  
    {isLoading && (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
    </div>
  )}
  
  {showResults && !isLoading && properties.length === 0 && (
    <div className="bg-surface-raised rounded-xl shadow-md p-8 text-center">
      <Icon name="search" size={30} className="text-content-subtle mb-3" />
      <h3 className="text-lg font-bold mb-1">No properties match your criteria</h3>
      <p className="text-content-muted mb-4 text-sm">Try adjusting your filters or check back later</p>
      <button 
        onClick={onClearFilters}
        className="bg-primary text-content-on-brand py-1.5 px-5 rounded-lg hover:bg-primary-dark text-sm"
      >
        Reset Filters
      </button>
    </div>
  )}
  
  {showResults && !isLoading && properties.length > 0 && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map(property => (
        <motion.div
          key={property.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5 }}
          className="bg-surface-raised rounded-xl shadow-lg overflow-hidden hover:shadow-md transition-all"
        >
          <div className="relative pb-[75%] overflow-hidden">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-surface-sunken border-2 border-dashed rounded-xl flex items-center justify-center text-content-subtle">
                <Icon name="home" size={30} />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-scrim/70 to-transparent p-3">
              <h3 className="text-content-on-media font-bold text-md">{property.title}</h3>
              <p className="text-content-on-media/90 text-xs">{property.location}</p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-primary font-bold text-lg">
                {formatPrice(property.price)}
              </span>
              <div className="flex gap-2 text-content-muted text-xs">
                <span>
                  <Icon name="bed" className="mr-1" /> {property.bedrooms || '-'}
                </span>
                <span>
                  <Icon name="bath" className="mr-1" /> {property.bathrooms || '-'}
                </span>
                <span>
                  <Icon name="ruler-combined" className="mr-1" /> {property.area_sqft || '-'} sqft
                </span>
              </div>
            </div>
            
            <p className="text-content-muted mb-3 line-clamp-2 text-sm">
              {property.description || 'No description available'}
            </p>
            
            <div className="flex justify-between items-center pt-3 border-t border-line">
              <button
                onClick={() => onBook(property)}
                className="w-full bg-primary text-content-on-brand py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors text-sm flex items-center justify-center"
              >
                <Icon name="calendar-check" className="mr-1.5" /> Book Viewing
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )}
  </>
);

ViewingResults.propTypes = {
  properties: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  showResults: PropTypes.bool.isRequired,
  formatPrice: PropTypes.func.isRequired,
  onBook: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
};

export default ViewingResults;
