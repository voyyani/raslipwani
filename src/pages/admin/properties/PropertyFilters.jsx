import React from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../../../components/Icon';

/**
 * Search + sort (desktop and mobile alike) and the mobile-only filter sheet
 * (status/purpose chips), moved verbatim out of `AdminProperties.jsx`
 * (Task 22).
 *
 * `filters` carries `{ search, status, purpose, sortField, sortDirection,
 * showMobileFilters, mobileViewMode }`; `onFilterChange(name, value)` reports
 * every change back to the parent, which owns the state (via `useFilters`
 * where that fits) and re-renders with the next `filters`.
 *
 * `showMobileControls` (default true) gates the mobile view-toggle, filter
 * button and filter sheet — in the original these sat inside the same
 * loading/empty/data branch as the table and mobile card grid, not always
 * mounted, and the axe suite catches the difference: the toggle buttons
 * carry only an icon, so mounting them outside that branch (e.g. while the
 * page is still loading) puts two unlabelled buttons in the DOM the original
 * never rendered in that state.
 */
// eslint-disable-next-line no-unused-vars -- activeCount is part of the Task 22 interface; the original had no "N filters active" indicator to wire it into.
const PropertyFilters = ({ filters, onFilterChange, onReset, activeCount, showMobileControls = true }) => {
  const {
    search = '',
    status = 'all',
    purpose = 'all',
    sortField = 'created_at',
    sortDirection = 'desc',
    showMobileFilters = false,
    mobileViewMode = 'grid',
  } = filters;

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1 sm:flex-initial sm:min-w-[250px]">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full border border-line-strong rounded-lg px-3 sm:px-4 py-2 pl-9 sm:pl-10 text-sm sm:text-base focus:ring-2 focus:ring-focus-ring focus:outline-none"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-content-subtle">
            <Icon name="search" size={14} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="hidden sm:flex gap-2">
          <select
            aria-label="Status"
            value={status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="border border-line-strong rounded-lg px-2 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-focus-ring focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </select>
          <select
            aria-label="Purpose"
            value={purpose}
            onChange={(e) => onFilterChange('purpose', e.target.value)}
            className="border border-line-strong rounded-lg px-2 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-focus-ring focus:outline-none"
          >
            <option value="all">All Purposes</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>
        <div className="flex gap-2 flex-1 sm:flex-initial">
          <select
            aria-label="Sort properties by"
            value={sortField}
            onChange={(e) => onFilterChange('sortField', e.target.value)}
            className="flex-1 sm:flex-initial border border-line-strong rounded-lg px-2 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-focus-ring focus:outline-none"
          >
            <option value="created_at">Date Added</option>
            <option value="price">Price</option>
            <option value="bedrooms">Bedrooms</option>
            <option value="bathrooms">Bathrooms</option>
          </select>
          <button
            onClick={() => onFilterChange('sortDirection', sortDirection === 'asc' ? 'desc' : 'asc')}
            className="bg-surface-sunken border border-line-strong hover:bg-surface-sunken px-3 sm:px-4 py-2 rounded-lg flex items-center text-sm sm:text-base"
          >
            {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      {showMobileControls && (
        <>
          {/* Mobile View Toggle & Filters */}
          <div className="flex gap-2 mb-4 lg:hidden">
            {/* View Mode Toggle */}
            <div className="flex bg-surface-sunken rounded-lg p-1">
              <button
                onClick={() => onFilterChange('mobileViewMode', 'grid')}
                className={`p-2 rounded-md transition-all ${
                  mobileViewMode === 'grid' ? 'bg-surface-raised text-brand shadow-sm' : 'text-content-muted'
                }`}
              >
                <Icon name="th" />
              </button>
              <button
                onClick={() => onFilterChange('mobileViewMode', 'list')}
                className={`p-2 rounded-md transition-all ${
                  mobileViewMode === 'list' ? 'bg-surface-raised text-brand shadow-sm' : 'text-content-muted'
                }`}
              >
                <Icon name="list" />
              </button>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => onFilterChange('showMobileFilters', !showMobileFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                showMobileFilters || status !== 'all' || purpose !== 'all'
                  ? 'bg-brand-subtle border-brand-subtle text-brand'
                  : 'bg-surface-raised border-line text-content-muted'
              }`}
            >
              <Icon name="filter" size={14} />
              <span className="text-sm">Filter</span>
            </button>
          </div>

          {/* Mobile Filters Dropdown */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-4 lg:hidden"
              >
                <div className="bg-surface-raised rounded-lg shadow p-3 space-y-3">
                  <div>
                    {/*
                      A group, not a label. These are toggle buttons, and a
                      <button> is not a labellable control — the <label> that
                      used to sit here named nothing at all. aria-labelledby
                      keeps the visible text and gives the group a real name.
                    */}
                    <span id="status-filter-label" className="block text-xs font-medium text-content-muted mb-1">
                      Status
                    </span>
                    <div role="group" aria-labelledby="status-filter-label" className="flex flex-wrap gap-2">
                      {['all', 'available', 'pending', 'sold', 'rented'].map(s => (
                        <button
                          key={s}
                          onClick={() => onFilterChange('status', s)}
                          className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                            status === s
                              ? 'bg-brand text-content-on-brand'
                              : 'bg-surface-sunken text-content-muted'
                          }`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    {/*
                      A group, not a label. These are toggle buttons, and a
                      <button> is not a labellable control — the <label> that
                      used to sit here named nothing at all. aria-labelledby
                      keeps the visible text and gives the group a real name.
                    */}
                    <span id="purpose-filter-label" className="block text-xs font-medium text-content-muted mb-1">
                      Purpose
                    </span>
                    <div role="group" aria-labelledby="purpose-filter-label" className="flex flex-wrap gap-2">
                      {['all', 'sale', 'rent'].map(p => (
                        <button
                          key={p}
                          onClick={() => onFilterChange('purpose', p)}
                          className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                            purpose === p
                              ? 'bg-brand text-content-on-brand'
                              : 'bg-surface-sunken text-content-muted'
                          }`}
                        >
                          {p === 'all' ? 'All' : p === 'sale' ? 'For Sale' : 'For Rent'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(status !== 'all' || purpose !== 'all') && (
                    <button
                      onClick={onReset}
                      className="w-full py-2 text-sm text-danger-content font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
};

PropertyFilters.propTypes = {
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  activeCount: PropTypes.number,
  showMobileControls: PropTypes.bool,
};

export default PropertyFilters;
