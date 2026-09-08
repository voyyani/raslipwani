import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Icon from '../../components/Icon';
import PropertyCard from './PropertyCard';
import PropertySkeleton from './PropertySkeleton';

/**
 * Everything to the right of the filter sidebar on the properties page: the
 * result count, the chips for the filters currently applied, the skeletons
 * while the query runs, the empty state with its featured suggestions, and the
 * grid itself. Moved out of `Properties.jsx` (Task 25) unchanged.
 */
const PropertyGrid = ({
  properties, filteredProperties, suggestedProperties, activeFilters, isLoading, error = null,
  onSelect, onToggleFilters, onRemoveFilter, onReset,
}) => (
<div className="flex-1">
  <motion.div 
    className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
  >
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-content">
        {filteredProperties.length} Properties Found
      </h2>
      <p className="text-content-muted mt-2">
        Showing {filteredProperties.length} of {properties.length} premium properties across Kenya
      </p>
    </div>
    
    <button 
      onClick={onToggleFilters}
      className="lg:hidden flex items-center gap-2 bg-surface-raised border-2 border-line text-content px-4 py-2 rounded-xl hover:border-primary transition-colors"
    >
      <Icon name="filter" size={18} />
      <span>Filters</span>
    </button>
  </motion.div>
  
  {/* Active Filters */}
  {activeFilters.length > 0 && (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-content">Active Filters</h3>
        <button 
          onClick={onReset}
          className="text-sm text-primary hover:underline font-medium"
        >
          Clear All
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/10 text-primary rounded-full pl-4 pr-3 py-2 flex items-center border border-primary/20"
          >
            <span className="text-sm font-medium mr-2">{filter.label}</span>
            <button 
              type="button"
              onClick={() => onRemoveFilter(filter.type)}
              aria-label={`Remove filter: ${filter.label}`}
              className="text-primary/70 hover:text-primary transition-colors"
            >
              <Icon name="times" size={16} aria-hidden="true" />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )}
  
  {error && (
    <motion.div 
      className="bg-danger-surface border-2 border-danger-border text-danger-content px-6 py-4 rounded-2xl mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center">
        <div className="w-6 h-6 bg-danger-surface rounded-full flex items-center justify-center mr-3">
          <Icon name="times" className="text-danger-content" aria-hidden="true" />
        </div>
        {`Failed to load properties: ${error.message}`}
      </div>
    </motion.div>
  )}
  
  {isLoading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <PropertySkeleton key={item} />
      ))}
    </div>
  ) : filteredProperties.length === 0 ? (
    <div>
      <motion.div 
        className="text-center py-16 bg-surface-raised rounded-2xl shadow-lg mb-12 border border-line"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon name="search" size={30} className="text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-content mb-4">No properties match your criteria</h3>
        <p className="text-content-muted mb-8 max-w-md mx-auto">
          Try adjusting your filters or search terms to find your perfect property in Kenya
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-primary hover:bg-primary-dark text-content-on-brand font-medium py-3 px-8 rounded-xl transition-colors shadow-lg hover:shadow-xl"
          onClick={onReset}
        >
          Reset Filters & Search
        </motion.button>
      </motion.div>
      
      {/* Suggested Properties */}
      {suggestedProperties.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-content mb-8 text-center">
            Featured Properties You Might Like
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestedProperties.map((property, index) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                index={index}
                openModal={onSelect}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  ) : (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {filteredProperties.map((property, index) => (
        <PropertyCard 
          key={property.id} 
          property={property} 
          index={index}
          openModal={onSelect}
        />
      ))}
    </motion.div>
  )}
</div>
);

PropertyGrid.propTypes = {
  properties: PropTypes.array.isRequired,
  filteredProperties: PropTypes.array.isRequired,
  suggestedProperties: PropTypes.array.isRequired,
  activeFilters: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  onToggleFilters: PropTypes.func.isRequired,
  onRemoveFilter: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};


export default PropertyGrid;
