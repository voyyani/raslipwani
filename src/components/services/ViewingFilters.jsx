import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Icon from '../Icon';

/**
 * The property filter card on the viewing page: the four filter controls, the
 * chips for whatever is currently applied, and the search/reset buttons. Moved
 * out of `ViewingExperience.jsx` (Task 24) unchanged.
 */
const ViewingFilters = ({
  filters, activeFilters, showResults, onFilterChange, onRemoveFilter, onClearAll, onSearch,
}) => (
    <div className="bg-surface-raised rounded-xl shadow-md p-5 mb-8">
    <h3 className="text-lg font-bold mb-4">Filter Properties</h3>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label htmlFor="ve-purpose" className="block text-content-muted mb-2 text-sm">Purpose</label>
        <select
          id="ve-purpose"
          name="purpose"
          value={filters.purpose}
          onChange={onFilterChange}
          className="w-full p-2.5 border border-line-strong rounded-lg text-sm"
        >
          <option value="">All Purposes</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
      </div>
      <div>
        <label htmlFor="ve-propertytype" className="block text-content-muted mb-2 text-sm">Property Type</label>
        <select
          id="ve-propertytype"
          name="propertyType"
          value={filters.propertyType}
          onChange={onFilterChange}
          className="w-full p-2.5 border border-line-strong rounded-lg text-sm"
        >
          <option value="">All Types</option>
          <option value="villa">Villa</option>
          <option value="apartment">Apartment</option>
          <option value="residential">Residential</option>
          <option value="land">Land</option>
          <option value="commercial">Commercial</option>
        </select>
      </div>
      <div>
        <label htmlFor="ve-location" className="block text-content-muted mb-2 text-sm">Location</label>
        <input
          id="ve-location"
          type="text"
          name="location"
          value={filters.location}
          onChange={onFilterChange}
          placeholder="Enter location"
          className="w-full p-2.5 border border-line-strong rounded-lg text-sm"
        />
      </div>
      <div>
        <label htmlFor="ve-bedrooms" className="block text-content-muted mb-2 text-sm">Bedrooms</label>
        <select
          id="ve-bedrooms"
          name="bedrooms"
          value={filters.bedrooms}
          onChange={onFilterChange}
          className="w-full p-2.5 border border-line-strong rounded-lg text-sm"
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5+</option>
        </select>
      </div>
    </div>
    
    {/* Active Filters */}
    {activeFilters.length > 0 && (
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-content">Active Filters</h3>
          <button 
            onClick={onClearAll}
            className="text-xs text-primary hover:underline"
          >
            Clear All Filters
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary/10 text-primary rounded-full pl-2.5 pr-1.5 py-1 flex items-center text-xs"
            >
              <span className="mr-1">{filter.label}</span>
              <button 
                onClick={() => onRemoveFilter(filter.type)}
                className="ml-0.5 text-primary/70 hover:text-primary"
              >
                <Icon name="times" size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    )}
    
    <div className="mt-6 flex justify-between">
      <button
        onClick={onSearch}
        className="bg-primary text-content-on-brand py-2.5 px-6 rounded-lg hover:bg-primary-dark font-medium text-sm"
      >
        {showResults ? 'Update Results' : 'Find Properties'}
      </button>
      
      <button
        onClick={onClearAll}
        className="bg-surface-sunken text-content py-2.5 px-5 rounded-lg hover:bg-surface-sunken font-medium text-sm"
      >
        Reset Filters
      </button>
    </div>
  </div>
);

ViewingFilters.propTypes = {
  filters: PropTypes.object.isRequired,
  activeFilters: PropTypes.array.isRequired,
  showResults: PropTypes.bool.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onRemoveFilter: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default ViewingFilters;
