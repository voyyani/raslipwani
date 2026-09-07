import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import Icon from '../../../components/Icon';
import MobileBookingCard from '../../../components/admin/MobileBookingCard';

/**
 * The mobile list view — bookings grouped by date and rendered as
 * `MobileBookingCard`s — moved verbatim out of `AdminBookings.jsx` (Task 23),
 * including the grouping/sorting `useMemo` that used to live in the page.
 *
 * Named `BookingTable` per the Task 23 interface, but there is no `<table>`
 * anywhere in this screen: the desktop surface is FullCalendar, and this
 * grouped list is the only "one row per booking, pick one to act on" view
 * the app has. It's the closest real match to what the interface describes
 * (`bookings`, `onSelect`, `onStatusChange`), so it took the name — see the
 * Task 23 report for the fuller reasoning, and for why the desktop calendar
 * and its toolbar were left in the page rather than folded in here.
 *
 * `isMobile`/`mobileView` are accepted (not part of the bare interface, same
 * as `BookingStatsCards`/`BookingFiltersPanel` before it) so this component
 * can self-gate exactly like its siblings, rather than the page wrapping it
 * in the same condition from outside.
 *
 * `onStatusChange(id, status)` replaces the page's two separate
 * `onConfirm`/`onCancel` handlers, each of which hard-coded one status.
 * Behaviour is unchanged: the same two statuses reach the same mutation.
 */
const BookingTable = ({ bookings, isMobile, mobileView, onSelect, onStatusChange, onCall, onEmail }) => {
  // Group bookings by date for mobile list view
  const groupedBookings = useMemo(() => {
    const groups = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    bookings.forEach(booking => {
      const date = new Date(booking.appointment_at);
      date.setHours(0, 0, 0, 0);

      let key;
      if (isToday(date)) {
        key = 'Today';
      } else if (isTomorrow(date)) {
        key = 'Tomorrow';
      } else if (isPast(date)) {
        key = 'Past';
      } else {
        key = format(date, 'EEEE, MMMM d');
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(booking);
    });

    // Sort by date within each group
    Object.values(groups).forEach(group => {
      group.sort((a, b) => new Date(a.appointment_at) - new Date(b.appointment_at));
    });

    // Order groups: Today, Tomorrow, future dates, Past
    const orderedGroups = {};
    if (groups['Today']) orderedGroups['Today'] = groups['Today'];
    if (groups['Tomorrow']) orderedGroups['Tomorrow'] = groups['Tomorrow'];

    Object.keys(groups)
      .filter(k => !['Today', 'Tomorrow', 'Past'].includes(k))
      .sort((a, b) => new Date(a) - new Date(b))
      .forEach(key => {
        orderedGroups[key] = groups[key];
      });

    if (groups['Past']) orderedGroups['Past'] = groups['Past'];

    return orderedGroups;
  }, [bookings]);

  if (!isMobile || mobileView !== 'list') return null;

  return (
    <div className="space-y-4">
      {Object.keys(groupedBookings).length === 0 ? (
        <div className="text-center py-12 bg-surface-raised rounded-lg shadow">
          <Icon name="calendar" size={36} className="mx-auto text-content-on-media/80 mb-3" />
          <p className="text-content-subtle">No bookings found</p>
        </div>
      ) : (
        Object.entries(groupedBookings).map(([dateGroup, groupBookings]) => (
          <div key={dateGroup}>
            <div className="sticky top-0 z-10 bg-surface py-2">
              <h3 className={`text-sm font-semibold ${
                dateGroup === 'Today' ? 'text-brand' :
                dateGroup === 'Tomorrow' ? 'text-success-content' :
                dateGroup === 'Past' ? 'text-content-subtle' : 'text-content-muted'
              }`}>
                {dateGroup}
                <span className="ml-2 text-content-subtle font-normal">({groupBookings.length})</span>
              </h3>
            </div>
            <div>
              {groupBookings.map((booking) => (
                <MobileBookingCard
                  key={booking.id}
                  booking={booking}
                  onView={() => onSelect(booking)}
                  onConfirm={() => onStatusChange(booking.id, 'confirmed')}
                  onCancel={() => onStatusChange(booking.id, 'cancelled')}
                  onCall={() => onCall(booking.phone)}
                  onEmail={() => onEmail(booking.email)}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

BookingTable.propTypes = {
  bookings: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  mobileView: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onCall: PropTypes.func.isRequired,
  onEmail: PropTypes.func.isRequired,
};

export default BookingTable;
