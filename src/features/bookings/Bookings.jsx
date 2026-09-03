import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../utils/supabaseClient';
import BookingFilters from '../../components/BookingFilters';
import BookingList from '../../components/BookingList';
import BookingCalendar from '../../components/BookingCalendar';
import BookingModal from '../../components/BookingModal';

import { logger } from '../../utils/logger';
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
        logger.error('Error fetching bookings:', error);
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
      logger.error('Update error:', error);
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
      logger.error('Archive error:', error);
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

      {/*
        This surface used to inline its own copy of the booking dialog: the same
        fields, the same layout, and by the time it was found the two copies had
        already drifted — the duplicate rendered its status pill from a local
        ternary rather than the shared one. It renders the component now.
      */}
      <BookingModal
        isOpen={isModalOpen}
        booking={selectedBooking}
        viewFilter={viewFilter}
        onClose={closeModal}
        onArchive={toggleArchive}
        onExport={() => window.print()}
      />
    </>
  );
};

export default Bookings;