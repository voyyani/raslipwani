import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/Icon';
import BookingFiltersPanel from './BookingFiltersPanel';

const CALENDAR_VIEWS = [
  { value: 'timeGridDay', icon: 'calendar-day', label: 'Day' },
  { value: 'timeGridWeek', icon: 'calendar-week', label: 'Week' },
  { value: 'dayGridMonth', icon: 'th', label: 'Month' },
  { value: 'listWeek', icon: 'list', label: 'List' },
];

/**
 * The desktop toolbar: the four calendar-view buttons, the filter toggle and
 * export action, and the desktop mount of `BookingFiltersPanel`. Moved out of
 * `AdminBookings.jsx` (Task 23); the four view buttons were four near-identical
 * copies of the same markup and are now one `CALENDAR_VIEWS` map.
 *
 * Desktop-only, self-gated like the rest of the bookings components — the
 * mobile list/calendar toggle is a different control and stays in the page.
 */
const BookingToolbar = ({
  isMobile, viewType, onViewTypeChange, onExport,
  filters, mobileView, showFilters, onFilterChange, onToggleFilters, onReset,
}) => {
  if (isMobile) return null;

  return (
    <div className="bg-surface-raised rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* View Switcher */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
          {CALENDAR_VIEWS.map(({ value, icon, label }) => (
            <button
              key={value}
              onClick={() => onViewTypeChange(value)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition text-xs sm:text-base whitespace-nowrap ${
                viewType === value
                  ? 'bg-brand text-content-on-brand'
                  : 'bg-surface-sunken text-content-muted hover:bg-surface-sunken'
              }`}
            >
              <Icon name={icon} />
              <span className="hidden xs:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onToggleFilters}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-surface-sunken text-content-muted rounded-md hover:bg-surface-sunken transition text-xs sm:text-base"
          >
            <Icon name="filter" />
            <span className="hidden xs:inline">Filters</span>
          </button>
          <button
            onClick={onExport}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-success-content text-content-on-brand rounded-md hover:bg-success-content transition text-xs sm:text-base"
          >
            <Icon name="download" />
            <span className="hidden xs:inline">Export</span>
          </button>
        </div>
      </div>

      <BookingFiltersPanel
        filters={filters}
        isMobile={isMobile}
        mobileView={mobileView}
        showFilters={showFilters}
        onFilterChange={onFilterChange}
        onToggleFilters={onToggleFilters}
        onReset={onReset}
      />
    </div>
  );
};

BookingToolbar.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  viewType: PropTypes.string.isRequired,
  onViewTypeChange: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  mobileView: PropTypes.string.isRequired,
  showFilters: PropTypes.bool.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onToggleFilters: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default BookingToolbar;
