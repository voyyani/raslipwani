import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PropertyCard, PropertySkeleton } from './HomeCards';

/**
 * The featured listings, their skeletons, and the failure state. Moved out
 * of `Home.jsx` (Task 26) unchanged.
 */
const FeaturedProperties = ({ properties, isLoading, error, onSelect }) => (
<section className="py-20 bg-surface-raised">
  <div className="container mx-auto px-4">
    <div className="text-center mb-16">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl font-bold text-primary mb-4"
      >
        Featured Properties
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-content-muted max-w-2xl mx-auto"
      >
        Exclusive listings currently available across Kenya
      </motion.p>
    </div>
    
    {error && (
      <div className="bg-danger-surface border border-danger-border text-danger-content px-4 py-3 rounded mb-6 text-center">
        {error?.message || 'Failed to load featured properties. Please try again.'}
      </div>
    )}
    
    {isLoading ? (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((item) => (
          <PropertySkeleton key={item} />
        ))}
      </div>
    ) : properties.length === 0 ? (
      <div className="text-center py-12">
        <h3 className="text-xl mb-4">No featured properties available</h3>
        <p className="text-content-muted">Check back later for new listings</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {properties.map((property, index) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            index={index}
            openModal={onSelect}
          />
        ))}
      </div>
    )}
    
    <div className="text-center mt-12">
      <Link 
        to="/properties" 
        className="inline-block bg-primary hover:bg-primary-dark text-content-on-brand font-bold py-3 px-8 rounded-md transition-colors duration-300 shadow-lg hover:shadow-xl"
      >
        View All Properties
      </Link>
    </div>
  </div>
</section>
);

FeaturedProperties.propTypes = {
  properties: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
};

export default FeaturedProperties;
