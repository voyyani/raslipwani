import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../utils/supabaseClient';
import BookingFilters from '../../components/BookingFilters';
import BookingList from '../../components/BookingList';
import BookingCalendar from '../../components/BookingCalendar';
import { 
  FaUser,
  FaPhone,
  FaStickyNote,
  FaCalendarAlt,
  FaArchive,
  FaTrashRestore,
  FaFileExport,
  FaTimes
} from 'react-icons/fa';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewFilter, setViewFilter] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewType, setViewType] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [successMessage, setSuccessMessage] = useState('');
  const [dateRange, setDateRange] = useState('week');
  const [calendarViewMode, setCalendarViewMode] = useState('day');
  const bookingsPerPage = 10;

  // Fetch bookings from Supabase
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('bookings')
          .select('*')
          .order('appointment_at', { ascending: false });

        if (viewFilter === 'active') {
          query = query.eq('is_archived', false);
        } else {
          query = query.eq('is_archived', true);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [viewFilter, successMessage]);

  // Filter and sort bookings
  useEffect(() => {
    let result = [...bookings];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(booking => booking.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(booking => 
        (booking.name && booking.name.toLowerCase().includes(term)) ||
        (booking.email && booking.email.toLowerCase().includes(term)) ||
        (booking.phone && booking.phone.toLowerCase().includes(term)) ||
        (booking.service && booking.service.toLowerCase().includes(term))
      );
    }
    
    // Apply date filtering based on view type and range
    if (viewType === 'list' && selectedDate) {
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      
      if (dateRange === 'today') {
        // Filter for today only
        result = result.filter(booking => {
          if (!booking.appointment_at) return false;
          const appointmentDate = new Date(booking.appointment_at);
          appointmentDate.setHours(0, 0, 0, 0);
          return appointmentDate.getTime() === selected.getTime();
        });
      } else if (dateRange === 'week') {
        // Get start and end of week
        const startOfWeek = new Date(selected);
        startOfWeek.setDate(selected.getDate() - selected.getDay());
        const endOfWeek = new Date(selected);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        result = result.filter(booking => {
          if (!booking.appointment_at) return false;
          const appointmentDate = new Date(booking.appointment_at);
          return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
        });
      } else if (dateRange === 'month') {
        // Get start and end of month
        const startOfMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
        const endOfMonth = new Date(selected.getFullYear(), selected.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        result = result.filter(booking => {
          if (!booking.appointment_at) return false;
          const appointmentDate = new Date(booking.appointment_at);
          return appointmentDate >= startOfMonth && appointmentDate <= endOfMonth;
        });
      }
    }
    
    setFilteredBookings(result);
    setCurrentPage(1);
  }, [bookings, statusFilter, searchTerm, selectedDate, viewType, dateRange]);

  // Update booking status
  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      setBookings(prev => prev.map(b => 
        b.id === id ? { ...b, status } : b
      ));
      
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status });
      }
      
      setSuccessMessage(`Status updated to ${status}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  // Archive/restore booking
  const toggleArchive = async (id, archive) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          is_archived: archive,
          archived_at: archive ? new Date().toISOString() : null 
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setBookings(prev => prev.filter(b => b.id !== id));
      
      if (selectedBooking && selectedBooking.id === id) {
        closeModal();
      }
      
      setSuccessMessage(`Booking ${archive ? 'archived' : 'restored'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Archive error:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Open modal with booking details
  const openBookingModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  // Status counts
  const statusCounts = {
    all: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  // Pagination logic
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  return (
    <>
      <Helmet>
        <title>Manage Bookings | Raslipwani Properties</title>
      </Helmet>
      
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
          <p>{successMessage}</p>
        </div>
      )}
      
      <BookingFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewFilter={viewFilter}
        setViewFilter={setViewFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusCounts={statusCounts}
        viewType={viewType}
        setViewType={setViewType}
        setCurrentPage={setCurrentPage}
        dateRange={dateRange}
        setDateRange={setDateRange}
        calendarViewMode={calendarViewMode}
        setCalendarViewMode={setCalendarViewMode}
      />
      
      {viewType === 'calendar' ? (
        <BookingCalendar 
          bookings={bookings}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          filteredBookings={filteredBookings}
          openBookingModal={openBookingModal}
          formatDate={formatDate}
          viewMode={calendarViewMode}
          updateStatus={updateStatus}
        />
      ) : (
        <BookingList 
          loading={loading}
          filteredBookings={filteredBookings}
          statusFilter={statusFilter}
          viewFilter={viewFilter}
          currentBookings={currentBookings}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          updateStatus={updateStatus}
          toggleArchive={toggleArchive}
          openBookingModal={openBookingModal}
          formatDate={formatDate}
          bookingsPerPage={bookingsPerPage}
          indexOfFirstBooking={indexOfFirstBooking}
          indexOfLastBooking={indexOfLastBooking}
          dateRange={dateRange}
          selectedDate={selectedDate}
        />
      )}

      {/* Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Booking Details</h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Client Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-4 flex items-center">
                    <FaUser className="mr-2 text-blue-500" />
                    Client Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{selectedBooking.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedBooking.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedBooking.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Booking ID</p>
                      <p className="font-medium text-sm">{selectedBooking.id || '-'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Booking Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-4 flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-500" />
                    Booking Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Booking Type</p>
                      <p className="font-medium">{selectedBooking.type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium capitalize">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          selectedBooking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedBooking.status || '-'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Service/Viewing Type</p>
                      <p className="font-medium">
                        {selectedBooking.service || selectedBooking.viewing_type || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Appointment Date</p>
                      <p className="font-medium">
                        {formatDate(selectedBooking.appointment_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="font-medium">
                        {formatDate(selectedBooking.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Subject</p>
                      <p className="font-medium">{selectedBooking.subject || '-'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-4 flex items-center">
                    <FaStickyNote className="mr-2 text-blue-500" />
                    Messages & Notes
                  </h4>
                  <div className="space-y-4">
                    {selectedBooking.message && (
                      <div>
                        <p className="text-sm text-gray-500">Client Message</p>
                        <p className="mt-1 p-3 bg-white border rounded-lg">
                          {selectedBooking.message}
                        </p>
                      </div>
                    )}
                    {selectedBooking.notes && (
                      <div>
                        <p className="text-sm text-gray-500">Internal Notes</p>
                        <p className="mt-1 p-3 bg-white border rounded-lg">
                          {selectedBooking.notes}
                        </p>
                      </div>
                    )}
                    {!selectedBooking.message && !selectedBooking.notes && (
                      <p className="text-gray-500 italic">No messages or notes available</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                
                {viewFilter === 'active' ? (
                  <button
                    onClick={() => toggleArchive(selectedBooking.id, true)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <FaArchive className="inline mr-2" /> Archive Booking
                  </button>
                ) : (
                  <button
                    onClick={() => toggleArchive(selectedBooking.id, false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FaTrashRestore className="inline mr-2" /> Restore Booking
                  </button>
                )}
                
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FaFileExport className="inline mr-2" /> Export Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Bookings;