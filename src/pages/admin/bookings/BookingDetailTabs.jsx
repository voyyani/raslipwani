import React from 'react';
import PropTypes from 'prop-types';

/**
 * The modal's three tabs. Moved out of `BookingDetailModal.jsx` (Task 23);
 * the three near-identical buttons the original repeated are now one map over
 * the tab list, with the notes count still rendered in its own label.
 */
const BookingDetailTabs = ({ activeTab, onTabChange, noteCount }) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'notes', label: `Notes (${noteCount})` },
    { id: 'history', label: 'Activity Log' },
  ];

  return (
    <div className="border-b bg-surface overflow-x-auto">
      <div className="flex gap-1 px-3 md:px-6 min-w-max">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`px-3 md:px-4 py-2.5 md:py-3 font-medium transition text-sm md:text-base whitespace-nowrap ${
              activeTab === id
                ? 'text-brand border-b-2 border-brand bg-surface-raised'
                : 'text-content-muted hover:text-content'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

BookingDetailTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  noteCount: PropTypes.number.isRequired,
};

export default BookingDetailTabs;
