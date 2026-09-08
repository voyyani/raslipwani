import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Icon from '../../components/Icon';

/**
 * The properties page's filter sidebar: purpose, property type and sort order,
 * plus the reset. Moved out of `Properties.jsx` (Task 25) unchanged.
 *
 * It owns no state — every control reports to `onFilterChange(name, value)`,
 * whose names are the page's `useFilters` keys, so the URL, the query and the
 * chips above the results cannot drift from what the sidebar shows.
 */
const PropertyFilterBar = ({ filters, isOpen, onFilterChange, onReset, onClose }) => (
    <motion.div 
    className={`lg:w-80 ${isOpen ? 'block' : 'hidden lg:block'}`}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="bg-surface-raised rounded-2xl shadow-lg p-6 sticky top-24 border border-line">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-content">Filter Properties</h2>
        <button 
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className="lg:hidden text-content-subtle hover:text-content-muted"
        >
          <Icon name="times" size={20} aria-hidden="true" />
        </button>
      </div>
      
      {/* Purpose Filter (Rent/Sale) */}
      <div className="mb-6">
        <span id="purpose-filter-label" className="block text-content mb-3 font-medium">Purpose</span>
        <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="purpose-filter-label">
          {[
            { value: 'all', label: 'All', icon: '🏠' },
            { value: 'sale', label: 'For Sale', icon: '💰' },
            { value: 'rent', label: 'For Rent', icon: '📅' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange('purpose', option.value)}
              aria-pressed={filters.purpose === option.value}
              className={`p-3 rounded-xl border-2 transition-all duration-300 text-center ${
                filters.purpose === option.value
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-line hover:border-line-strong text-content'
              }`}
            >
              <div className="text-lg mb-1">{option.icon}</div>
              <div className="text-sm">{option.label}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Property Type */}
      <div className="mb-6">
        <label htmlFor="property-type-filter" className="block text-content mb-3 font-medium">Property Type</label>
        <select
          id="property-type-filter"
          className="w-full px-4 py-3 border-2 border-line rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-surface-raised"
          value={filters.type}
          onChange={(e) => onFilterChange('type', e.target.value)}
        >
          <option value="all">All Property Types</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="villa">Villa</option>
          <option value="land">Land</option>
          <option value="commercial">Commercial</option>
        </select>
      </div>
      
      {/* Sort By */}
      <div className="mb-6">
        <label htmlFor="sort-by-filter" className="block text-content mb-3 font-medium">Sort By</label>
        <select
          id="sort-by-filter"
          className="w-full px-4 py-3 border-2 border-line rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-surface-raised"
          value={filters.sort}
          onChange={(e) => onFilterChange('sort', e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
      
      {/* Reset Filters */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-surface-sunken hover:bg-surface-sunken text-content font-medium py-3 rounded-xl transition-colors border-2 border-transparent hover:border-line-strong"
        onClick={onReset}
      >
        Reset All Filters
      </motion.button>
    </div>
  </motion.div>
);

PropertyFilterBar.propTypes = {
  filters: PropTypes.shape({
    purpose: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    sort: PropTypes.string.isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PropertyFilterBar;
