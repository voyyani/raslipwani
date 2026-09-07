import React from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import { statusClasses } from '../../../design/status';
import Icon from '../../../components/Icon';

/**
 * The stats tiles at the top of the bookings screen — a collapsible summary
 * on mobile, a six-tile grid on desktop. Moved verbatim out of
 * `AdminBookings.jsx` (Task 23), including the pre-remapped `stats` shape
 * ({ total, pending, confirmed, completed, cancelled, high_priority }) the
 * page builds from `bookingQueries.stats()`.
 */
const BookingStatsCards = ({ stats, isMobile, expandedStats, onToggleExpand }) => {
  if (!stats) return null;

  return (
    <>
      {/* Mobile Stats - Collapsible */}
      {isMobile && (
        <div className="mb-4">
          <button
            onClick={onToggleExpand}
            className="w-full flex items-center justify-between bg-surface-raised rounded-lg shadow p-3"
          >
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-content">{stats.total}</span>
              <span className="text-sm text-content-muted">Total Bookings</span>
              {stats.pending > 0 && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusClasses('pending')}`}>
                  {stats.pending} pending
                </span>
              )}
            </div>
            {expandedStats ? <Icon name="chevron-up" className="text-content-subtle" /> : <Icon name="chevron-down" className="text-content-subtle" />}
          </button>

          <AnimatePresence>
            {expandedStats && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="bg-warning-surface rounded-lg p-2 text-center border border-warning-border">
                    <div className="text-lg font-bold text-warning-content">{stats.pending}</div>
                    <div className="text-xs text-warning-content">Pending</div>
                  </div>
                  <div className="bg-brand-subtle rounded-lg p-2 text-center border border-brand-subtle">
                    <div className="text-lg font-bold text-brand-content">{stats.confirmed}</div>
                    <div className="text-xs text-brand">Confirmed</div>
                  </div>
                  <div className="bg-success-surface rounded-lg p-2 text-center border border-success-border">
                    <div className="text-lg font-bold text-success-content">{stats.completed}</div>
                    <div className="text-xs text-success-content">Completed</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Desktop Stats Dashboard */}
      {!isMobile && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
          <div className="bg-surface-raised rounded-lg shadow p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-content">{stats.total}</div>
            <div className="text-xs sm:text-sm text-content-muted">Total</div>
          </div>
          <div className="bg-warning-surface rounded-lg shadow p-3 sm:p-4 border border-warning-border">
            <div className="text-xl sm:text-2xl font-bold text-warning-content">{stats.pending}</div>
            <div className="text-xs sm:text-sm text-warning-content">Pending</div>
          </div>
          <div className="bg-brand-subtle rounded-lg shadow p-3 sm:p-4 border border-brand-subtle">
            <div className="text-xl sm:text-2xl font-bold text-brand-content">{stats.confirmed}</div>
            <div className="text-xs sm:text-sm text-brand">Confirmed</div>
          </div>
          <div className="bg-success-surface rounded-lg shadow p-3 sm:p-4 border border-success-border">
            <div className="text-xl sm:text-2xl font-bold text-success-content">{stats.completed}</div>
            <div className="text-xs sm:text-sm text-success-content">Completed</div>
          </div>
          <div className="bg-danger-surface rounded-lg shadow p-3 sm:p-4 border border-danger-border">
            <div className="text-xl sm:text-2xl font-bold text-danger-content">{stats.cancelled}</div>
            <div className="text-xs sm:text-sm text-danger-content">Cancelled</div>
          </div>
          <div className="bg-warning-surface rounded-lg shadow p-3 sm:p-4 border border-warning-border">
            <div className="text-xl sm:text-2xl font-bold text-warning-content">{stats.high_priority}</div>
            <div className="text-xs sm:text-sm text-warning-content">High Priority</div>
          </div>
        </div>
      )}
    </>
  );
};

BookingStatsCards.propTypes = {
  stats: PropTypes.shape({
    total: PropTypes.number,
    pending: PropTypes.number,
    confirmed: PropTypes.number,
    completed: PropTypes.number,
    cancelled: PropTypes.number,
    high_priority: PropTypes.number,
  }),
  isMobile: PropTypes.bool.isRequired,
  expandedStats: PropTypes.bool.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
};

export default BookingStatsCards;
