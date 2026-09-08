import React from 'react';
import PropTypes from 'prop-types';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import Icon from '../Icon';

/**
 * The calendar's period header: previous, the period's name, next, and a jump
 * back to today. Moved out of `BookingCalendar.jsx` (Task 26) unchanged.
 */
const CalendarToolbar = ({ selectedDate, viewMode, onNavigate, onToday }) => (
<div className="flex justify-between items-center mb-4">
  <div className="flex items-center gap-2">
    <button 
      onClick={() => onNavigate(-1)}
      className="p-2 text-content-muted hover:text-content rounded-full hover:bg-surface-sunken"
    >
      <Icon name="chevron-left" />
    </button>
    
    <h2 className="text-xl font-semibold">
      {viewMode === 'day' && format(selectedDate, 'MMMM d, yyyy')}
      {viewMode === 'week' && (
        `${format(startOfWeek(selectedDate, { weekStartsOn: 0 }), 'MMM d')} - 
        ${format(endOfWeek(selectedDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}`
      )}
      {viewMode === 'month' && format(selectedDate, 'MMMM yyyy')}
    </h2>
    
    <button 
      onClick={() => onNavigate(1)}
      className="p-2 text-content-muted hover:text-content rounded-full hover:bg-surface-sunken"
    >
      <Icon name="chevron-right" />
    </button>
  </div>
  
  <button
    onClick={onToday}
    className="text-brand hover:text-brand-content text-sm flex items-center"
  >
    Today
  </button>
</div>
);

CalendarToolbar.propTypes = {
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  viewMode: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onToday: PropTypes.func.isRequired,
};

export default CalendarToolbar;
