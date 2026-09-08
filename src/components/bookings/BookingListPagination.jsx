import React from 'react';
import PropTypes from 'prop-types';

/**
 * The appointment list's pager, including the elided page window. Moved out of
 * `BookingList.jsx` (Task 27) unchanged.
 */
const BookingListPagination = ({
  filteredBookings, currentPage, totalPages, setCurrentPage, indexOfFirstBooking, indexOfLastBooking,
}) => (
<div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-surface border-t gap-4">
  <p className="text-sm text-content-muted">
    Showing {indexOfFirstBooking + 1}-{Math.min(indexOfLastBooking, filteredBookings.length)} of {filteredBookings.length} appointments
  </p>
  <div className="flex gap-2">
    <button 
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className={`px-4 py-2 rounded-md text-sm ${
        currentPage === 1 
          ? 'bg-surface-sunken text-content-subtle cursor-not-allowed' 
          : 'bg-surface-raised border border-line-strong text-content-muted hover:bg-surface'
      }`}
    >
      Previous
    </button>
    
    <div className="flex">
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(page => 
          page === 1 || 
          page === totalPages || 
          (page >= currentPage - 1 && page <= currentPage + 1)
        )
        .map((page, index, array) => (
          <React.Fragment key={page}>
            <button
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 border-y border-line-strong text-sm ${
                currentPage === page
                  ? 'bg-brand text-content-on-brand border-brand'
                  : 'bg-surface-raised text-content-muted hover:bg-surface'
              } ${index === 0 ? 'border-l rounded-l-md' : ''} ${
                index === array.length - 1 ? 'border-r rounded-r-md' : ''
              }`}
            >
              {page}
            </button>
            {index < array.length - 1 && array[index + 1] - page > 1 && (
              <span className="px-3 py-2 border-y border-line-strong text-content-subtle">...</span>
            )}
          </React.Fragment>
        ))}
    </div>
    
    <button 
      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      className={`px-4 py-2 rounded-md text-sm ${
        currentPage === totalPages 
          ? 'bg-surface-sunken text-content-subtle cursor-not-allowed' 
          : 'bg-surface-raised border border-line-strong text-content-muted hover:bg-surface'
      }`}
    >
      Next
    </button>
  </div>
</div>
);

BookingListPagination.propTypes = {
  filteredBookings: PropTypes.array.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  indexOfFirstBooking: PropTypes.number.isRequired,
  indexOfLastBooking: PropTypes.number.isRequired,
};

export default BookingListPagination;
