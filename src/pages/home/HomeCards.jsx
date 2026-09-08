import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../../components/Icon';

/**
 * The four card shapes the home page renders: a service, a property, a
 * property placeholder, and a reason to choose us. Moved out of `Home.jsx`
 * (Task 26), where all four were declared below the page in the same file.
 */
const ServiceCard = ({ icon, title, index }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.05, y: -5 }}
    className="group flex flex-col items-center text-center cursor-pointer"
  >
    <div className="relative">
      <div className="bg-gradient-to-br from-primary to-primary/80 w-14 h-14 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
        {/* Sized by class, not the `size` prop: this is the only icon on the site
            that grows at the `md` breakpoint, and a prop cannot be responsive.
            Tailwind's w/h override the width/height attributes the prop sets. */}
        <Icon name={icon} className="w-5 h-5 md:w-8 md:h-8 text-content-on-brand" />
      </div>
      <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
    </div>
    <h3 className="mt-3 text-xs md:text-sm font-semibold text-content group-hover:text-primary transition-colors">{title}</h3>
  </motion.div>
);


const PropertyCard = ({ property, index, openModal }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="bg-surface-raised rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer"
      onClick={() => openModal(property)}
    >
      <div className="relative pb-[75%] overflow-hidden">
        {property.images?.[0] ? (
          <img 
            src={property.images[0]} 
            alt={`${property.title} in ${property.location}`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading={index > 1 ? "lazy" : "eager"}
            width="400"
            height="300"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-surface-sunken to-surface-sunken flex items-center justify-center">
            <span className="text-content-subtle">No Image Available</span>
          </div>
        )}
        {property.featured && (
          <div className="absolute top-4 right-4 bg-primary text-content-on-brand text-sm font-bold px-3 py-1 rounded-full shadow-md">
            Featured
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-xl font-bold text-content group-hover:text-primary transition-colors">
            {property.title}
          </h2>
          <span className="text-xl font-bold text-primary">
            {formatPrice(property.price)}
          </span>
        </div>
        
        <p className="text-content-muted mb-5 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {property.location}
        </p>
        
        <div className="flex justify-between mb-6">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm">{property.bedrooms || 0} Beds</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">{property.bathrooms || 0} Baths</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
            </svg>
            <span className="text-sm">{property.area_sqft || 'N/A'} sqft</span>
          </div>
        </div>
        
        <div className="mt-4 text-center text-primary font-medium group-hover:text-primary-dark transition-colors">
          View Details
        </div>
      </div>
    </motion.div>
  );
};

const PropertySkeleton = () => (
  <div className="bg-surface-raised rounded-2xl overflow-hidden shadow-xl animate-pulse">
    <div className="pb-[75%] relative bg-gradient-to-br from-surface-sunken to-surface-sunken"></div>
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <div className="h-7 bg-surface-sunken rounded-xl w-3/5"></div>
        <div className="h-7 bg-surface-sunken rounded-xl w-1/4"></div>
      </div>
      <div className="h-5 bg-surface-sunken rounded-xl w-3/4 mb-6"></div>
      <div className="flex justify-between mb-6">
        <div className="h-4 bg-surface-sunken rounded-xl w-16"></div>
        <div className="h-4 bg-surface-sunken rounded-xl w-16"></div>
        <div className="h-4 bg-surface-sunken rounded-xl w-16"></div>
      </div>
      <div className="h-12 bg-surface-sunken rounded-xl"></div>
    </div>
  </div>
);


const BenefitCard = ({ title, description, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="flex items-start"
  >
    <div className="bg-primary rounded-full p-2 mr-4 mt-1 flex-shrink-0">
      <svg className="w-6 h-6 text-content-on-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <div>
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-content-muted">{description}</p>
    </div>
  </motion.div>
);

ServiceCard.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

PropertyCard.propTypes = {
  property: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  openModal: PropTypes.func.isRequired,
};

BenefitCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

export { ServiceCard, PropertyCard, PropertySkeleton, BenefitCard };
