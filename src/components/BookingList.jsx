import React from 'react';

import BookingGroupedList from './bookings/BookingGroupedList';
import BookingTableView from './bookings/BookingTableView';
import BookingListPagination from './bookings/BookingListPagination';

// Helper function to group bookings by date
const groupBookingsByDate = (bookings) => {
  const grouped = {};
  
  bookings.forEach(booking => {
    if (!booking.appointment_at) {
      // Handle bookings without date
      if (!grouped['unscheduled']) {
        grouped['unscheduled'] = [];
      }
      grouped['unscheduled'].push(booking);
      return;
    }
    
    const date = new Date(booking.appointment_at);
    const dateStr = date.toISOString().split('T')[0];
    
    if (!grouped[dateStr]) {
      grouped[dateStr] = [];
    }
    grouped[dateStr].push(booking);
  });
  
  // Sort dates in descending order
  return Object.entries(grouped)
    .map(([date, bookings]) => ({
      date,
      bookings: bookings.sort((a, b) => 
        new Date(a.appointment_at) - new Date(b.appointment_at)
      )
    }))
    .sort((a, b) => {
      if (a.date === 'unscheduled') return 1;
      if (b.date === 'unscheduled') return -1;
      return new Date(b.date) - new Date(a.date);
    });
};

/**
 * The appointments list: grouped by day in the week and month views, a table
 * (or cards, on small screens) in the day view, with a pager under both. The
 * three surfaces are their own components (Task 27).
 */
const BookingList = ({
  loading,
  filteredBookings,
  statusFilter,
  viewFilter,
  currentBookings,
  totalPages,
  currentPage,
  setCurrentPage,
  updateStatus,
  toggleArchive,
  openBookingModal,
  formatDate,
  indexOfFirstBooking,
  indexOfLastBooking,
  dateRange
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <div className="text-center py-12 bg-surface rounded-lg border border-line">
        <div className="mx-auto text-content-subtle text-4xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl mb-4 text-content-muted">No appointments found</h3>
        <p className="text-content-subtle max-w-md mx-auto mb-6">
          {statusFilter === 'all'
            ? "You don't have any appointments scheduled yet."
            : `You don't have any ${statusFilter} appointments.`}
        </p>
      </div>
    );
  }

  // Group bookings for weekly/monthly view
  const groupedBookings = (dateRange === 'week' || dateRange === 'month')
    ? groupBookingsByDate(filteredBookings)
    : null;

  return (
    <div className="overflow-x-auto rounded-lg border border-line shadow-sm">
      {groupedBookings ? (
        <BookingGroupedList
          groupedBookings={groupedBookings}
          viewFilter={viewFilter}
          formatDate={formatDate}
          updateStatus={updateStatus}
          toggleArchive={toggleArchive}
          openBookingModal={openBookingModal}
        />
      ) : (
        <BookingTableView
          currentBookings={currentBookings}
          viewFilter={viewFilter}
          formatDate={formatDate}
          updateStatus={updateStatus}
          toggleArchive={toggleArchive}
          openBookingModal={openBookingModal}
        />
      )}

      <BookingListPagination
        filteredBookings={filteredBookings}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        indexOfFirstBooking={indexOfFirstBooking}
        indexOfLastBooking={indexOfLastBooking}
      />
    </div>
  );
};

export default BookingList;
