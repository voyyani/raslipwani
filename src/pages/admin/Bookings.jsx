import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../utils/supabaseClient';
import { 
  FaCheck, 
  FaTimes, 
  FaEnvelope, 
  FaCalendarCheck, 
  FaEye,
  FaUser,
  FaPhone,
  FaInfoCircle,
  FaClock,
  FaStickyNote,
  FaCalendarAlt,
  FaTag,
  FaArchive,
  FaTrashRestore,
  FaCalendarDay,
  FaList,
  FaFileExport
} from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewFilter, setViewFilter] = useState('active'); // 'active' or 'archived'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewType, setViewType] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());
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

        // Apply view filter
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
  }, [viewFilter]);

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
    
    // Apply date filter
    if (selectedDate && viewType === 'list') {
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      
      result = result.filter(booking => {
        if (!booking.appointment_at) return false;
        const appointmentDate = new Date(booking.appointment_at);
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate.getTime() === selected.getTime();
      });
    }
    
    setFilteredBookings(result);
    setCurrentPage(1);
  }, [bookings, statusFilter, searchTerm, selectedDate, viewType]);

  // Date highlighting for calendar
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateString = date.toISOString().split('T')[0];
    const dateBookings = bookings.filter(b => {
      if (!b.appointment_at) return false;
      return new Date(b.appointment_at).toISOString().split('T')[0] === dateString;
    });
    
    if (dateBookings.length === 0) return null;
    
    const statuses = dateBookings.map(b => b.status);
    
    if (statuses.includes('confirmed')) return 'has-confirmed';
    if (statuses.includes('pending')) return 'has-pending';
    return 'has-bookings';
  };

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
      
      setSuccess(`Booking ${archive ? 'archived' : 'restored'} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
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

  // Pagination logic
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  // Status counts
  const statusCounts = {
    all: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <>
      <Helmet>
        <title>Manage Bookings | Raslipwani Properties</title>
      </Helmet>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Viewing Appointments</h1>
          <p className="text-gray-600">{bookings.length} appointments scheduled</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaCalendarCheck />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                viewFilter === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setViewFilter('archived')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                viewFilter === 'archived'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Archived
            </button>
          </div>
        </div>
      </div>
      
      {/* View Toggle */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewType('list')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              viewType === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaList className="mr-2" /> List View
          </button>
          <button
            onClick={() => setViewType('calendar')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              viewType === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaCalendarDay className="mr-2" /> Calendar View
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'confirmed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                statusFilter === status
                  ? status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                    : status === 'confirmed' ? 'bg-green-100 text-green-800'
                    : status === 'cancelled' ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>
      
      {/* Calendar View */}
      {viewType === 'calendar' && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Appointment Calendar</h2>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Today
            </button>
          </div>
          
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={tileClassName}
            className="w-full border-0"
          />
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              <span className="text-sm">Pending</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm">Confirmed</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm">Other Bookings</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      {viewType === 'list' ? (
        <>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <FaCalendarCheck className="mx-auto text-gray-400 text-4xl mb-4" />
              <h3 className="text-xl mb-4 text-gray-600">No appointments found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {statusFilter === 'all' 
                  ? "You don't have any appointments scheduled yet." 
                  : `You don't have any ${statusFilter} appointments.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
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
              
              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
                <p className="text-sm text-gray-600">
                  Showing {indexOfFirstBooking + 1}-{Math.min(indexOfLastBooking, filteredBookings.length)} of {filteredBookings.length} appointments
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded-md text-gray-600 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                  >
                    Previous
                  </button>
                  <button className="px-3 py-1 border rounded-md bg-blue-600 text-white">
                    {currentPage}
                  </button>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 border rounded-md text-gray-600 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Appointments for {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No appointments scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map(booking => (
                <div 
                  key={booking.id} 
                  className={`p-4 rounded-lg border-l-4 ${
                    booking.status === 'confirmed' ? 'border-green-500 bg-green-50' :
                    booking.status === 'cancelled' ? 'border-red-500 bg-red-50' :
                    'border-yellow-500 bg-yellow-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{booking.name}</h3>
                      <p className="text-sm text-gray-600">{booking.service || booking.viewing_type}</p>
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
                    <p className="text-sm text-gray-700">
                      <FaClock className="inline mr-2 text-gray-500" />
                      {formatDate(booking.appointment_at)}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => openBookingModal(booking)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Details
                    </button>
                    <a 
                      href={`mailto:${booking.email}`}
                      className="text-purple-600 hover:text-purple-800 text-sm ml-3"
                    >
                      Send Email
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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