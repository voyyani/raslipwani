import React from 'react';
import PropTypes from 'prop-types';
import { Search, Download, X } from 'lucide-react';

/**
 * The client list's search box, its three dropdown filters, the export button
 * and the clear-filters chip. Moved out of `ClientManagement.jsx` (Task 26);
 * every control reports `(name, value)` and the page owns the state, so the
 * page can reset the pagination on any change in one place instead of four.
 */
const ClientFiltersPanel = ({
  filters, hasActiveFilters, canExport, onFilterChange, onReset, onExport,
}) => (
<div className="bg-surface-raised p-3 sm:p-4 rounded-lg shadow mb-4 sm:mb-6">
  <div className="flex flex-col gap-2 sm:gap-3">
    {/* Search */}
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-content-subtle w-4 h-4 sm:w-5 sm:h-5" />
      <input
        type="text"
        placeholder="Search..."
        value={filters.search}
        onChange={(e) => onFilterChange('search', e.target.value)}
        className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-line-strong rounded-lg focus:ring-2 focus:ring-focus-ring focus:border-transparent"
      />
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {/* Status Filter */}
      <select
        aria-label="Filter by status"
        value={filters.status}
        onChange={(e) => onFilterChange('status', e.target.value)}
        className="px-2 sm:px-4 py-2 text-xs sm:text-sm border border-line-strong rounded-lg focus:ring-2 focus:ring-focus-ring"
      >
        <option value="all">All Status</option>
        <option value="lead">Lead</option>
        <option value="prospect">Prospect</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      {/* Type Filter */}
      <select
        aria-label="Filter by client type"
        value={filters.type}
        onChange={(e) => onFilterChange('type', e.target.value)}
        className="px-2 sm:px-4 py-2 text-xs sm:text-sm border border-line-strong rounded-lg focus:ring-2 focus:ring-focus-ring"
      >
        <option value="all">All Types</option>
        <option value="individual">Individual</option>
        <option value="corporate">Corporate</option>
        <option value="investor">Investor</option>
        <option value="other">Other</option>
      </select>

      {/* Budget Filter */}
      <select
        aria-label="Filter by budget"
        value={filters.budget}
        onChange={(e) => onFilterChange('budget', e.target.value)}
        className="px-2 sm:px-4 py-2 text-xs sm:text-sm border border-line-strong rounded-lg focus:ring-2 focus:ring-focus-ring"
      >
        <option value="all">Budget</option>
        <option value="0-500k">&lt; 500K</option>
        <option value="500k-1m">500K-1M</option>
        <option value="1m-5m">1M-5M</option>
        <option value="5m+">5M+</option>
      </select>

      {/* Export Button */}
      <button
        onClick={onExport}
        className="px-2 sm:px-4 py-2 bg-success-content text-content-on-brand rounded-lg hover:bg-success-content flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
        disabled={!canExport}
      >
        <Download className="w-4 h-4" />
        <span className="hidden xs:inline">Export</span>
      </button>
    </div>

    {/* Clear Filters */}
    {hasActiveFilters && (
      <button
        onClick={onReset}
        className="px-3 sm:px-4 py-2 bg-surface-sunken text-content-muted rounded-lg hover:bg-surface-sunken flex items-center justify-center gap-2 text-xs sm:text-sm"
      >
        <X className="w-4 h-4" />
        Clear Filters
      </button>
    )}
  </div>
</div>
);

ClientFiltersPanel.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    budget: PropTypes.string.isRequired,
  }).isRequired,
  hasActiveFilters: PropTypes.bool.isRequired,
  canExport: PropTypes.bool.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
};

export default ClientFiltersPanel;
