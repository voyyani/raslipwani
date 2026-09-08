import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../../components/Icon';

/**
 * One property in the listings grid. Moved out of `Properties.jsx` (Task 25),
 * where it was declared below the page component in the same file.
 */
const PropertyCard = ({ property, index, openModal }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getPurposeIcon = (purpose) => {
    switch (purpose) {
      case 'sale': return '💰';
      case 'rent': return '📅';
      default: return '🏠';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="bg-surface-raised rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-line"
      onClick={() => openModal(property)}
    >
      <div className="relative pb-[70%] overflow-hidden">
        {property.images?.[0] ? (
          <img 
            src={property.images[0]} 
            alt={`${property.title} in ${property.location}`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading={index > 2 ? "lazy" : "eager"}
            width="400"
            height="280"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-surface-sunken to-surface-sunken flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🏠</div>
              <span className="text-content-subtle text-sm">Image Coming Soon</span>
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {property.featured && (
            <div className="bg-primary text-content-on-brand text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              Featured
            </div>
          )}
          <div className="bg-content-on-brand/90 backdrop-blur-sm text-content text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
            {getPurposeIcon(property.purpose)} {property.purpose === 'sale' ? 'For Sale' : 'For Rent'}
          </div>
        </div>
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-surface-inverse/0 group-hover:bg-surface-inverse/10 transition-all duration-500"></div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-lg font-bold text-content group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {property.title}
          </h2>
          <span className="text-lg font-bold text-primary whitespace-nowrap ml-2">
            {formatPrice(property.price)}
          </span>
        </div>
        
        <p className="text-content-muted mb-4 flex items-center text-sm">
          <Icon name="map-marker-alt" size={16} className="mr-2 text-primary flex-shrink-0" />
          <span className="line-clamp-1">{property.location}</span>
        </p>
        
        <div className="flex justify-between mb-4 text-sm text-content-subtle">
          <div className="flex items-center">
            <span className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center mr-1.5">
              <span className="text-primary text-xs">🛏️</span>
            </span>
            <span>{property.bedrooms || 0} Beds</span>
          </div>
          <div className="flex items-center">
            <span className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center mr-1.5">
              <span className="text-primary text-xs">🚿</span>
            </span>
            <span>{property.bathrooms || 0} Baths</span>
          </div>
          <div className="flex items-center">
            <span className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center mr-1.5">
              <span className="text-primary text-xs">📐</span>
            </span>
            <span>{property.area_sqft || 'N/A'} sqft</span>
          </div>
        </div>
        
        <div className="pt-3 border-t border-line">
          <div className="flex justify-between items-center">
            <span className="text-xs text-content-subtle capitalize">
              {property.property_type}
            </span>
            <div className="text-primary font-medium text-sm group-hover:text-primary-dark transition-colors flex items-center">
              View Details
              <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  openModal: PropTypes.func.isRequired,
};

export default PropertyCard;
