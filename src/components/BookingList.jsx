import React from 'react';
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
  bookingsPerPage,
  indexOfFirstBooking,
  indexOfLastBooking,
  dateRange,
  selectedDate
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <div className="mx-auto text-gray-400 text-4xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl mb-4 text-gray-600">No appointments found</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
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
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      {groupedBookings ? (
        // Grouped view for week/month
        <div className="divide-y divide-gray-200">
          {groupedBookings.map(({ date, bookings }) => (
            <div key={date} className="py-4 px-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
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
                <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-sm">
                  {bookings.length} {bookings.length === 1 ? 'appointment' : 'appointments'}
                </span>
              </div>
              
              <div className="space-y-3">
                {bookings.map(booking => (
                  <div 
                    key={booking.id} 
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{booking.name}</div>
                        <div className="text-sm text-gray-500">{booking.service || booking.viewing_type}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="mt-3 text-sm">
                      {booking.appointment_at ? (
                        <div className="flex items-center text-gray-600">
                          <FaClock className="mr-2 text-gray-400 flex-shrink-0" />
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
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center"
                            title="Confirm appointment"
                          >
                            <FaCheck className="mr-1" /> Confirm
                          </button>
                        )}
                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'cancelled')}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center"
                            title="Cancel appointment"
                          >
                            <FaTimes className="mr-1" /> Cancel
                          </button>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => openBookingModal(booking)}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
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
                            className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
                          >
                            <FaArchive className="mr-1" /> Archive
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleArchive(booking.id, false)}
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
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
          <table className="min-w-full divide-y divide-gray-200 hidden md:table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{booking.name}</div>
                    <div className="text-sm text-gray-500">{booking.email}</div>
                    <div className="text-sm text-gray-500">{booking.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{booking.type}</div>
                    <div className="text-sm text-gray-500">
                      {booking.service || booking.viewing_type}
                    </div>
                    <div className="text-sm mt-2">
                      {booking.appointment_at ? (
                        <span className="text-gray-900">
                          {formatDate(booking.appointment_at)}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not scheduled</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => openBookingModal(booking)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View details"
                      >
                        <FaEye className="w-5 h-5" />
                      </button>
                      {booking.status !== 'confirmed' && (
                        <button
                          onClick={() => updateStatus(booking.id, 'confirmed')}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Confirm appointment"
                        >
                          <FaCheck className="w-5 h-5" />
                        </button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => updateStatus(booking.id, 'cancelled')}
                          className="text-red-600 hover:text-red-800 transition-colors"
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
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                          title="Archive appointment"
                        >
                          <FaArchive className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleArchive(booking.id, false)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
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
              <div key={booking.id} className="border-b border-gray-200 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{booking.name}</div>
                    <div className="text-sm text-gray-500">{booking.email}</div>
                    <div className="text-sm text-gray-500">{booking.phone}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="mt-3">
                  <div className="font-medium">{booking.type}</div>
                  <div className="text-sm text-gray-500">
                    {booking.service || booking.viewing_type}
                  </div>
                  <div className="text-sm mt-2">
                    {booking.appointment_at ? (
                      <span className="text-gray-900">
                        {formatDate(booking.appointment_at)}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not scheduled</span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => openBookingModal(booking)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Details
                  </button>
                  <div className="flex space-x-3">
                    {booking.status !== 'confirmed' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'confirmed')}
                        className="text-green-600 hover:text-green-800"
                        title="Confirm"
                      >
                        <FaCheck />
                      </button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'cancelled')}
                        className="text-red-600 hover:text-red-800"
                        title="Cancel"
                      >
                        <FaTimes />
                      </button>
                    )}
                    {viewFilter === 'active' ? (
                      <button
                        onClick={() => toggleArchive(booking.id, true)}
                        className="text-gray-600 hover:text-gray-800"
                        title="Archive"
                      >
                        <FaArchive />
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleArchive(booking.id, false)}
                        className="text-blue-600 hover:text-blue-800"
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
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50 border-t gap-4">
        <p className="text-sm text-gray-600">
          Showing {indexOfFirstBooking + 1}-{Math.min(indexOfLastBooking, filteredBookings.length)} of {filteredBookings.length} appointments
        </p>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md text-sm ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
                    className={`px-4 py-2 border-y border-gray-300 text-sm ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } ${index === 0 ? 'border-l rounded-l-md' : ''} ${
                      index === array.length - 1 ? 'border-r rounded-r-md' : ''
                    }`}
                  >
                    {page}
                  </button>
                  {index < array.length - 1 && array[index + 1] - page > 1 && (
                    <span className="px-3 py-2 border-y border-gray-300 text-gray-500">...</span>
                  )}
                </React.Fragment>
              ))}
          </div>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md text-sm ${
              currentPage === totalPages 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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