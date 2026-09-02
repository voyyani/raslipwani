import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendar,
  FaList,
  FaFilter,
  FaPlus,
  FaDownload,
  FaSearch,
  FaCalendarDay,
  FaCalendarWeek,
  FaTh,
  FaPhone,
  FaEnvelope,
  FaTimes,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import BookingStatusBadge from '../../components/BookingStatusBadge';
import { statusClasses } from '../../design/status';
import BookingDetailModal from './BookingDetailModal';
import MobileBookingCard from '../../components/admin/MobileBookingCard';
import { exportToCSV } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

/**
 * AdminBookings - Professional booking management with calendar views
 * Features: FullCalendar integration, drag-and-drop, status workflow, filters
 */
const AdminBookings = () => {
  const queryClient = useQueryClient();
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'calendar'
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
  const [expandedStats, setExpandedStats] = useState(false);

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

  // Status update mutation for swipe actions
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          status, 
          last_modified_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { status }) => {
      toast.success(`Booking ${status}`);
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-stats'] });
    },
    onError: () => toast.error('Failed to update booking')
  });

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

  // Reschedule booking mutation (for drag-and-drop)
  const rescheduleMutation = useMutation({
    mutationFn: async ({ id, newDate }) => {
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
    const { priority } = eventInfo.event.extendedProps;
    
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

  // Mobile booking action handlers
  const handleCall = (phone) => {
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email) => {
    if (email) window.location.href = `mailto:${email}`;
  };

  const handleConfirmBooking = (id) => {
    statusMutation.mutate({ id, status: 'confirmed' });
  };

  const handleCancelBooking = (id) => {
    statusMutation.mutate({ id, status: 'cancelled' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6 pb-20 md:pb-6">
      <Helmet>
        <title>Booking Management - Raslipwani Properties Admin</title>
      </Helmet>

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-600 hidden sm:block">Manage appointments with calendar</p>
      </div>

      {/* Mobile Stats - Collapsible */}
      {stats && isMobile && (
        <div className="mb-4">
          <button 
            onClick={() => setExpandedStats(!expandedStats)}
            className="w-full flex items-center justify-between bg-white rounded-lg shadow p-3"
          >
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-gray-900">{stats.total}</span>
              <span className="text-sm text-gray-600">Total Bookings</span>
              {stats.pending > 0 && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusClasses('pending')}`}>
                  {stats.pending} pending
                </span>
              )}
            </div>
            {expandedStats ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
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
                  <div className="bg-yellow-50 rounded-lg p-2 text-center border border-yellow-200">
                    <div className="text-lg font-bold text-yellow-800">{stats.pending}</div>
                    <div className="text-xs text-yellow-700">Pending</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-200">
                    <div className="text-lg font-bold text-blue-800">{stats.confirmed}</div>
                    <div className="text-xs text-blue-700">Confirmed</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
                    <div className="text-lg font-bold text-green-800">{stats.completed}</div>
                    <div className="text-xs text-green-700">Completed</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Desktop Stats Dashboard */}
      {stats && !isMobile && (
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

      {/* Mobile View Toggle */}
      {isMobile && (
        <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setMobileView('list')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
              mobileView === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <FaList className="text-sm" />
            List
          </button>
          <button
            onClick={() => setMobileView('calendar')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
              mobileView === 'calendar'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <FaCalendar className="text-sm" />
            Calendar
          </button>
        </div>
      )}

      {/* Mobile Search & Filter Bar */}
      {isMobile && mobileView === 'list' && (
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2.5 rounded-lg border transition-all ${
              showFilters || filters.status !== 'all' || filters.priority !== 'all'
                ? 'bg-blue-50 border-blue-300 text-blue-600'
                : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <FaFilter />
          </button>
        </div>
      )}

      {/* Mobile Filters Dropdown */}
      <AnimatePresence>
        {isMobile && showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-white rounded-lg shadow p-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilters({ ...filters, status })}
                      className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                        filters.status === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'low', 'normal', 'high', 'urgent'].map(priority => (
                    <button
                      key={priority}
                      onClick={() => setFilters({ ...filters, priority })}
                      className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                        filters.priority === priority
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {(filters.status !== 'all' || filters.priority !== 'all') && (
                <button
                  onClick={() => setFilters({ ...filters, status: 'all', priority: 'all' })}
                  className="w-full py-2 text-sm text-red-600 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile List View */}
      {isMobile && mobileView === 'list' && (
        <div className="space-y-4">
          {Object.keys(groupedBookings).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <FaCalendar className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="text-gray-500">No bookings found</p>
            </div>
          ) : (
            Object.entries(groupedBookings).map(([dateGroup, groupBookings]) => (
              <div key={dateGroup}>
                <div className="sticky top-0 z-10 bg-gray-50 py-2">
                  <h3 className={`text-sm font-semibold ${
                    dateGroup === 'Today' ? 'text-blue-600' :
                    dateGroup === 'Tomorrow' ? 'text-green-600' :
                    dateGroup === 'Past' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    {dateGroup}
                    <span className="ml-2 text-gray-400 font-normal">({groupBookings.length})</span>
                  </h3>
                </div>
                <div>
                  {groupBookings.map((booking) => (
                    <MobileBookingCard
                      key={booking.id}
                      booking={booking}
                      onView={() => {
                        setSelectedBooking(booking);
                        setIsDetailModalOpen(true);
                      }}
                      onConfirm={() => handleConfirmBooking(booking.id)}
                      onCancel={() => handleCancelBooking(booking.id)}
                      onCall={() => handleCall(booking.phone)}
                      onEmail={() => handleEmail(booking.email)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Mobile Calendar View */}
      {isMobile && mobileView === 'calendar' && (
        <div className="bg-white rounded-lg shadow-md p-2 overflow-hidden">
          <FullCalendar
            plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
            initialView="listWeek"
            headerToolbar={{
              left: 'prev,next',
              center: 'title',
              right: 'listWeek,dayGridMonth'
            }}
            events={events}
            eventClick={handleEventClick}
            height="auto"
            contentHeight={400}
            dayMaxEvents={2}
            moreLinkText="+"
          />
        </div>
      )}

      {/* Desktop Toolbar */}
      {!isMobile && (
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
      )}

      {/* Desktop Calendar */}
      {!isMobile && (
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
          aspectRatio={1.8}
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
          dayMaxEvents={3}
          moreLinkText="more"
          stickyHeaderDates={false}
        />
      </div>
      )}

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
