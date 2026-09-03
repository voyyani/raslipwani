import React from 'react';

import { statusClasses, statusLabel } from '../design/status';
import { 
  FaCheck, 
  FaTimes, 
  FaEnvelope, 
  FaEye,
  FaArchive,
  FaTrashRestore,
  FaClock
} from 'react-icons/fa';

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
        // Grouped view for week/month
        <div className="divide-y divide-line">
          {groupedBookings.map(({ date, bookings }) => (
            <div key={date} className="py-4 px-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-content">
                  {date === 'unscheduled' 
                    ? 'Unscheduled Appointments' 
                    : new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                  }
                </h3>
                <span className="bg-surface-sunken text-content-muted rounded-full px-3 py-1 text-sm">
                  {bookings.length} {bookings.length === 1 ? 'appointment' : 'appointments'}
                </span>
              </div>
              
              <div className="space-y-3">
                {bookings.map(booking => (
                  <div 
                    key={booking.id} 
                    className="p-4 bg-surface-raised border border-line rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-content">{booking.name}</div>
                        <div className="text-sm text-content-subtle">{booking.service || booking.viewing_type}</div>
                      </div>
                      <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${statusClasses(booking.status)}`}
                    >
                      {statusLabel(booking.status)}
                    </span>
                    </div>
                    
                    <div className="mt-3 text-sm">
                      {booking.appointment_at ? (
                        <div className="flex items-center text-content-muted">
                          <FaClock className="mr-2 text-content-subtle flex-shrink-0" />
                          {formatDate(booking.appointment_at)}
                        </div>
                      ) : null}
                    </div>
                    
                    {/* Status Controls */}
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex gap-2">
                        {booking.status !== 'confirmed' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'confirmed')}
                            className={`px-3 py-1 rounded-full text-xs flex items-center border ${statusClasses('confirmed')}`}
                            title="Confirm appointment"
                          >
                            <FaCheck className="mr-1" /> Confirm
                          </button>
                        )}
                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'cancelled')}
                            className={`px-3 py-1 rounded-full text-xs flex items-center border ${statusClasses('cancelled')}`}
                            title="Cancel appointment"
                          >
                            <FaTimes className="mr-1" /> Cancel
                          </button>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => openBookingModal(booking)}
                          className="text-brand hover:text-brand-content text-sm flex items-center"
                        >
                          <FaEye className="mr-1" /> Details
                        </button>
                        <a 
                          href={`mailto:${booking.email}`}
                          className="text-purple-600 hover:text-purple-800 text-sm flex items-center"
                        >
                          <FaEnvelope className="mr-1" /> Email
                        </a>
                        {viewFilter === 'active' ? (
                          <button
                            onClick={() => toggleArchive(booking.id, true)}
                            className="text-content-muted hover:text-content text-sm flex items-center"
                          >
                            <FaArchive className="mr-1" /> Archive
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleArchive(booking.id, false)}
                            className="text-brand hover:text-brand-content text-sm flex items-center"
                          >
                            <FaTrashRestore className="mr-1" /> Restore
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Default table view
        <>
          <table className="min-w-full divide-y divide-line hidden md:table">
            <thead className="bg-surface">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">Appointment Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface-raised divide-y divide-line">
              {currentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-surface transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-content">{booking.name}</div>
                    <div className="text-sm text-content-subtle">{booking.email}</div>
                    <div className="text-sm text-content-subtle">{booking.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{booking.type}</div>
                    <div className="text-sm text-content-subtle">
                      {booking.service || booking.viewing_type}
                    </div>
                    <div className="text-sm mt-2">
                      {booking.appointment_at ? (
                        <span className="text-content">
                          {formatDate(booking.appointment_at)}
                        </span>
                      ) : (
                        <span className="text-content-subtle">Not scheduled</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClasses(booking.status)}`}
                    >
                      {statusLabel(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => openBookingModal(booking)}
                        className="text-brand hover:text-brand-content transition-colors"
                        title="View details"
                      >
                        <FaEye className="w-5 h-5" />
                      </button>
                      {booking.status !== 'confirmed' && (
                        <button
                          onClick={() => updateStatus(booking.id, 'confirmed')}
                          className="text-success-content hover:text-success-content transition-colors"
                          title="Confirm appointment"
                        >
                          <FaCheck className="w-5 h-5" />
                        </button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => updateStatus(booking.id, 'cancelled')}
                          className="text-danger-content hover:text-danger-content transition-colors"
                          title="Cancel appointment"
                        >
                          <FaTimes className="w-5 h-5" />
                        </button>
                      )}
                      <a 
                        href={`mailto:${booking.email}`}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                        title="Send email"
                      >
                        <FaEnvelope className="w-5 h-5" />
                      </a>
                      {viewFilter === 'active' ? (
                        <button
                          onClick={() => toggleArchive(booking.id, true)}
                          className="text-content-muted hover:text-content transition-colors"
                          title="Archive appointment"
                        >
                          <FaArchive className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleArchive(booking.id, false)}
                          className="text-brand hover:text-brand-content transition-colors"
                          title="Restore appointment"
                        >
                          <FaTrashRestore className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Mobile List */}
          <div className="md:hidden">
            {currentBookings.map(booking => (
              <div key={booking.id} className="border-b border-line p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-content">{booking.name}</div>
                    <div className="text-sm text-content-subtle">{booking.email}</div>
                    <div className="text-sm text-content-subtle">{booking.phone}</div>
                  </div>
                  <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${statusClasses(booking.status)}`}
                    >
                      {statusLabel(booking.status)}
                    </span>
                </div>
                
                <div className="mt-3">
                  <div className="font-medium">{booking.type}</div>
                  <div className="text-sm text-content-subtle">
                    {booking.service || booking.viewing_type}
                  </div>
                  <div className="text-sm mt-2">
                    {booking.appointment_at ? (
                      <span className="text-content">
                        {formatDate(booking.appointment_at)}
                      </span>
                    ) : (
                      <span className="text-content-subtle">Not scheduled</span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => openBookingModal(booking)}
                    className="text-brand hover:text-brand-content"
                  >
                    Details
                  </button>
                  <div className="flex space-x-3">
                    {booking.status !== 'confirmed' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'confirmed')}
                        className="text-success-content hover:text-success-content"
                        title="Confirm"
                      >
                        <FaCheck />
                      </button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'cancelled')}
                        className="text-danger-content hover:text-danger-content"
                        title="Cancel"
                      >
                        <FaTimes />
                      </button>
                    )}
                    {viewFilter === 'active' ? (
                      <button
                        onClick={() => toggleArchive(booking.id, true)}
                        className="text-content-muted hover:text-content"
                        title="Archive"
                      >
                        <FaArchive />
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleArchive(booking.id, false)}
                        className="text-brand hover:text-brand-content"
                        title="Restore"
                      >
                        <FaTrashRestore />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Enhanced Pagination */}
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
                        ? 'bg-brand text-white border-brand'
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
    </div>
  );
};

export default BookingList;