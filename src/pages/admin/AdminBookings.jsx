import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { format } from 'date-fns';
import { 
  FaCalendar,
  FaList,
  FaFilter,
  FaPlus,
  FaDownload,
  FaSearch,
  FaCalendarDay,
  FaCalendarWeek,
  FaTh
} from 'react-icons/fa';
import BookingStatusBadge from '../../components/BookingStatusBadge';
import BookingDetailModal from './BookingDetailModal';
import { exportToCSV } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

/**
 * AdminBookings - Professional booking management with calendar views
 * Features: FullCalendar integration, drag-and-drop, status workflow, filters
 */
const AdminBookings = () => {
  const queryClient = useQueryClient();
  const [viewType, setViewType] = useState('dayGridMonth');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    dateRange: { start: null, end: null }
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings', filters],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('is_archived', false)
        .order('appointment_at', { ascending: true });

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }
      if (filters.dateRange.start) {
        query = query.gte('appointment_at', filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        query = query.lte('appointment_at', filters.dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch booking stats
  const { data: stats } = useQuery({
    queryKey: ['booking-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('status, priority')
        .eq('is_archived', false);

      if (error) throw error;

      const statusCounts = {
        total: data.length,
        pending: data.filter(b => b.status === 'pending').length,
        confirmed: data.filter(b => b.status === 'confirmed').length,
        completed: data.filter(b => b.status === 'completed').length,
        cancelled: data.filter(b => b.status === 'cancelled').length,
        high_priority: data.filter(b => b.priority === 'high' || b.priority === 'urgent').length
      };

      return statusCounts;
    }
  });

  // Reschedule booking mutation (for drag-and-drop)
  const rescheduleMutation = useMutation({
    mutationFn: async ({ id, newDate, newEndDate }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          appointment_at: newDate,
          last_modified_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, newDate }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['admin-bookings'] });

      // Snapshot previous value
      const previousBookings = queryClient.getQueryData(['admin-bookings', filters]);

      // Optimistically update
      queryClient.setQueryData(['admin-bookings', filters], old =>
        old.map(booking =>
          booking.id === id
            ? { ...booking, appointment_at: newDate }
            : booking
        )
      );

      return { previousBookings };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['admin-bookings', filters], context.previousBookings);
      toast.error('Failed to reschedule booking');
    },
    onSuccess: () => {
      toast.success('Booking rescheduled successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-stats'] });
    }
  });

  // Transform bookings to FullCalendar events
  const events = useMemo(() => {
    return bookings.map(booking => ({
      id: booking.id.toString(),
      title: `${booking.name} - ${booking.service || 'Booking'}`,
      start: booking.appointment_at,
      end: booking.appointment_at, // Can add duration if available
      backgroundColor: getEventColor(booking.status),
      borderColor: getEventBorderColor(booking.status),
      extendedProps: {
        ...booking
      }
    }));
  }, [bookings]);

  // Get event colors based on status
  function getEventColor(status) {
    const colors = {
      pending: '#fef3c7',
      confirmed: '#dbeafe',
      completed: '#d1fae5',
      cancelled: '#fee2e2'
    };
    return colors[status] || colors.pending;
  }

  function getEventBorderColor(status) {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || colors.pending;
  }

  // Handle event click
  const handleEventClick = (info) => {
    const booking = bookings.find(b => b.id.toString() === info.event.id);
    if (booking) {
      setSelectedBooking(booking);
      setIsDetailModalOpen(true);
    }
  };

  // Handle event drag and drop
  const handleEventDrop = (info) => {
    const bookingId = parseInt(info.event.id);
    const newDate = info.event.start.toISOString();

    // Confirm reschedule
    if (window.confirm(`Reschedule booking to ${format(info.event.start, 'PPp')}?`)) {
      rescheduleMutation.mutate({
        id: bookingId,
        newDate: newDate
      });
    } else {
      info.revert(); // Revert if cancelled
    }
  };

  // Handle event resize (if we add duration)
  const handleEventResize = (info) => {
    const bookingId = parseInt(info.event.id);
    const newDate = info.event.start.toISOString();
    const newEndDate = info.event.end?.toISOString();

    rescheduleMutation.mutate({
      id: bookingId,
      newDate: newDate,
      newEndDate: newEndDate
    });
  };

  // Export bookings to CSV
  const handleExport = () => {
    const exportData = bookings.map(booking => ({
      ID: booking.id,
      Name: booking.name,
      Email: booking.email,
      Phone: booking.phone,
      Service: booking.service,
      'Appointment Date': format(new Date(booking.appointment_at), 'yyyy-MM-dd HH:mm'),
      Status: booking.status,
      Priority: booking.priority || 'N/A',
      'Created At': format(new Date(booking.created_at), 'yyyy-MM-dd HH:mm')
    }));

    exportToCSV(exportData, `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    toast.success('Bookings exported successfully');
  };

  // Custom event content renderer
  const renderEventContent = (eventInfo) => {
    const { status, priority } = eventInfo.event.extendedProps;
    
    return (
      <div className="p-1 overflow-hidden">
        <div className="text-xs font-semibold truncate">
          {eventInfo.timeText && <span className="mr-1">{eventInfo.timeText}</span>}
        </div>
        <div className="text-xs truncate">{eventInfo.event.title}</div>
        {priority === 'high' || priority === 'urgent' ? (
          <div className="text-xs text-red-600 font-bold">⚠</div>
        ) : null}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <Helmet>
        <title>Booking Management - Raslipwani Properties Admin</title>
      </Helmet>

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage appointments with drag-and-drop calendar</p>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-3 sm:p-4 border border-yellow-200">
            <div className="text-xl sm:text-2xl font-bold text-yellow-800">{stats.pending}</div>
            <div className="text-xs sm:text-sm text-yellow-700">Pending</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-3 sm:p-4 border border-blue-200">
            <div className="text-xl sm:text-2xl font-bold text-blue-800">{stats.confirmed}</div>
            <div className="text-xs sm:text-sm text-blue-700">Confirmed</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-3 sm:p-4 border border-green-200">
            <div className="text-xl sm:text-2xl font-bold text-green-800">{stats.completed}</div>
            <div className="text-xs sm:text-sm text-green-700">Completed</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-3 sm:p-4 border border-red-200">
            <div className="text-xl sm:text-2xl font-bold text-red-800">{stats.cancelled}</div>
            <div className="text-xs sm:text-sm text-red-700">Cancelled</div>
          </div>
          <div className="bg-orange-50 rounded-lg shadow p-3 sm:p-4 border border-orange-200">
            <div className="text-xl sm:text-2xl font-bold text-orange-800">{stats.high_priority}</div>
            <div className="text-xs sm:text-sm text-orange-700">High Priority</div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* View Switcher */}
          <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setViewType('timeGridDay')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition text-xs sm:text-base whitespace-nowrap ${
                viewType === 'timeGridDay'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaCalendarDay />
              <span className="hidden xs:inline">Day</span>
            </button>
            <button
              onClick={() => setViewType('timeGridWeek')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition text-xs sm:text-base whitespace-nowrap ${
                viewType === 'timeGridWeek'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaCalendarWeek />
              <span className="hidden xs:inline">Week</span>
            </button>
            <button
              onClick={() => setViewType('dayGridMonth')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition text-xs sm:text-base whitespace-nowrap ${
                viewType === 'dayGridMonth'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaTh />
              <span className="hidden xs:inline">Month</span>
            </button>
            <button
              onClick={() => setViewType('listWeek')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition text-xs sm:text-base whitespace-nowrap ${
                viewType === 'listWeek'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaList />
              <span className="hidden xs:inline">List</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition text-xs sm:text-base"
            >
              <FaFilter />
              <span className="hidden xs:inline">Filters</span>
            </button>
            <button
              onClick={handleExport}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-xs sm:text-base"
            >
              <FaDownload />
              <span className="hidden xs:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Name, email, phone..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
              <button
                onClick={() => setFilters({ search: '', status: 'all', priority: 'all', dateRange: { start: null, end: null } })}
                className="w-full px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={viewType}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          events={events}
          editable={true}
          droppable={true}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="auto"
          contentHeight="auto"
          aspectRatio={window.innerWidth < 768 ? 1 : 1.8}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          nowIndicator={true}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5, 6],
            startTime: '09:00',
            endTime: '17:00'
          }}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          dayMaxEvents={window.innerWidth < 768 ? 2 : 3}
          moreLinkText={window.innerWidth < 768 ? '+' : 'more'}
          stickyHeaderDates={window.innerWidth < 768}
        />
      </div>

      {/* Booking Detail Modal */}
      {isDetailModalOpen && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedBooking(null);
          }}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
            queryClient.invalidateQueries({ queryKey: ['booking-stats'] });
          }}
        />
      )}
    </div>
  );
};

export default AdminBookings;
