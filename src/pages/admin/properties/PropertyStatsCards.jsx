import React from 'react';
import PropTypes from 'prop-types';

/**
 * The four counters at the top of the admin properties screen. Moved
 * verbatim out of `AdminProperties.jsx` (Task 22) — same markup, same class
 * strings, same order.
 */
const PropertyStatsCards = ({ properties }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
    <div className="bg-brand-subtle border border-brand-subtle rounded-lg p-3 sm:p-4">
      <p className="text-xs sm:text-sm text-brand-content font-medium">Total</p>
      <p className="text-xl sm:text-2xl font-bold mt-1">{properties.length}</p>
    </div>
    <div className="bg-success-surface border border-success-border rounded-lg p-3 sm:p-4">
      <p className="text-xs sm:text-sm text-success-content font-medium">Featured</p>
      <p className="text-xl sm:text-2xl font-bold mt-1">
        {properties.filter(p => p.featured).length}
      </p>
    </div>
    <div className="bg-warning-surface border border-warning-border rounded-lg p-3 sm:p-4">
      <p className="text-xs sm:text-sm text-warning-content font-medium">Pending</p>
      <p className="text-xl sm:text-2xl font-bold mt-1">
        {properties.filter(p => p.status === 'pending').length}
      </p>
    </div>
    <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 sm:p-4">
      <p className="text-xs sm:text-sm text-purple-800 font-medium">Sold</p>
      <p className="text-xl sm:text-2xl font-bold mt-1">
        {properties.filter(p => p.status === 'sold').length}
      </p>
    </div>
  </div>
);

PropertyStatsCards.propTypes = {
  properties: PropTypes.array.isRequired,
  totalCount: PropTypes.number,
};

export default PropertyStatsCards;
