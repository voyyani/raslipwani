import React from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/Icon';

/**
 * The search/status/priority filters, moved verbatim out of
 * `AdminBookings.jsx` (Task 23) — same three regions the original rendered:
 * the mobile search bar + filter toggle, the mobile filter sheet (status and
 * priority chips), and the desktop filter grid (Input/Select/Select/Clear).
 *
 * The three regions sit at different points in the page, not next to each
 * other, so this component is mounted twice — once where the mobile bar and
 * sheet used to live, once inside the desktop toolbar where the filter grid
 * used to live. Each mount renders only the region `isMobile` says applies;
 * the other mount naturally renders nothing, exactly as the original's
 * `isMobile`/`!isMobile` guards did.
 *
 * Two different "clear" behaviours are also unchanged: the mobile sheet's
 * button only clears status/priority (via `onFilterChange`), while
 * `onReset` — the desktop button — clears search, status, priority AND the
 * date range, because that's what the two buttons always did.
 */
const BookingFiltersPanel = ({
  filters, isMobile, mobileView, showFilters, onFilterChange, onToggleFilters, onReset,
}) => (
  <>
    {/* Mobile Search & Filter Bar */}
    {isMobile && mobileView === 'list' && (
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent"
          />
        </div>
        <button
          onClick={onToggleFilters}
          className={`px-3 py-2.5 rounded-lg border transition-all ${
            showFilters || filters.status !== 'all' || filters.priority !== 'all'
              ? 'bg-brand-subtle border-brand-subtle text-brand'
              : 'bg-surface-raised border-line text-content-muted'
          }`}
        >
          <Icon name="filter" />
        </button>
      </div>
    )}

    {/* Mobile Filters Dropdown */}
    <AnimatePresence>
      {isMobile && showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden mb-4"
        >
          <div className="bg-surface-raised rounded-lg shadow p-3 space-y-3">
            <div>
              {/* A named group, not a label: these are toggle buttons, and a
                  <button> cannot be labelled. See AdminProperties for the
                  same fix. */}
              <span id="booking-status-filter" className="block text-xs font-medium text-content-muted mb-1">
                Status
              </span>
              <div role="group" aria-labelledby="booking-status-filter" className="flex flex-wrap gap-2">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => onFilterChange('status', status)}
                    className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                      filters.status === status
                        ? 'bg-brand text-content-on-brand'
                        : 'bg-surface-sunken text-content-muted'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              {/* A named group, not a label: these are toggle buttons, and a
                  <button> cannot be labelled. See AdminProperties for the
                  same fix. */}
              <span id="booking-priority-filter" className="block text-xs font-medium text-content-muted mb-1">
                Priority
              </span>
              <div role="group" aria-labelledby="booking-priority-filter" className="flex flex-wrap gap-2">
                {['all', 'low', 'normal', 'high', 'urgent'].map(priority => (
                  <button
                    key={priority}
                    onClick={() => onFilterChange('priority', priority)}
                    className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                      filters.priority === priority
                        ? 'bg-brand text-content-on-brand'
                        : 'bg-surface-sunken text-content-muted'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {(filters.status !== 'all' || filters.priority !== 'all') && (
              <button
                onClick={() => {
                  onFilterChange('status', 'all');
                  onFilterChange('priority', 'all');
                }}
                className="w-full py-2 text-sm text-danger-content font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Desktop Filters Panel */}
    {!isMobile && showFilters && (
      <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Input
          label="Search"
          type="text"
          placeholder="Name, email, phone..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
        <Select
          label="Status"
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Select
          label="Priority"
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </Select>
        <div>
          <span className="block text-sm font-medium text-content-muted mb-1">Actions</span>
          <button
            onClick={onReset}
            className="w-full px-3 py-2 bg-gray-600 text-content-on-media rounded-md hover:bg-gray-700 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>
    )}
  </>
);

BookingFiltersPanel.propTypes = {
  filters: PropTypes.object.isRequired,
  isMobile: PropTypes.bool.isRequired,
  mobileView: PropTypes.string.isRequired,
  showFilters: PropTypes.bool.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onToggleFilters: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default BookingFiltersPanel;
