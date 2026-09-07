import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingQueries, rescheduleBooking } from '@/services/bookings';
import { queryKeys } from '@/services/queryKeys';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { format } from 'date-fns';
import BookingDetailModal from './BookingDetailModal';
import BookingStatsCards from './bookings/BookingStatsCards';
import BookingFiltersPanel from './bookings/BookingFiltersPanel';
import BookingTable from './bookings/BookingTable';
import { useBookingMutations } from './bookings/useBookingMutations';
import { exportToCSV } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

import useConfirm from '../../components/ui/useConfirm';
import Icon from '../../components/Icon';

// A stable empty array so `data = EMPTY_BOOKINGS` doesn't hand a fresh
// reference to a dependent useMemo on every render before the query resolves.
const EMPTY_BOOKINGS = [];

/**
 * AdminBookings - Professional booking management with calendar views
 * Features: FullCalendar integration, drag-and-drop, status workflow, filters
 */
const AdminBookings = () => {
  const [confirm, confirmDialog] = useConfirm();
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

  // The service's listBookings(filters) only understands `status` and
  // `priority` — it queries the table those two ways and nothing else. The
  // free-text search box and the (currently UI-less) date range have no
  // server-side equivalent in the service layer, so they stay client-side
  // filters applied to the fetched page below, rather than being silently
  // dropped. This keeps the search box working; it trades a narrower SQL
  // query for a wider one filtered in memory, which is the deliberate
  // deviation from the migration brief's literal `bookingQueries.list(filters)`
  // call — see the migration report for the full reasoning.
  const bookingListFilters = { status: filters.status, priority: filters.priority };

  // Fetch bookings
  const { data: rawBookings = EMPTY_BOOKINGS, isLoading } = useQuery(
    bookingQueries.list(bookingListFilters)
  );

  const bookings = useMemo(() => {
    let result = rawBookings;

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(booking =>
        (booking.name || '').toLowerCase().includes(term) ||
        (booking.email || '').toLowerCase().includes(term) ||
        (booking.phone || '').toLowerCase().includes(term)
      );
    }
    if (filters.dateRange.start) {
      result = result.filter(booking => booking.appointment_at >= filters.dateRange.start);
    }
    if (filters.dateRange.end) {
      result = result.filter(booking => booking.appointment_at <= filters.dateRange.end);
    }

    return result;
  }, [rawBookings, filters.search, filters.dateRange.start, filters.dateRange.end]);

  // Fetch booking stats. getBookingStats() returns { total, byStatus,
  // byPriority } — a tally keyed by the exact status/priority value, not the
  // { total, pending, confirmed, ... } shape this screen renders. Remapped
  // here, once, so every tile below reads the same field names it always did.
  const { data: rawStats } = useQuery(bookingQueries.stats());
  const stats = rawStats && {
    total: rawStats.total,
    pending: rawStats.byStatus?.pending ?? 0,
    confirmed: rawStats.byStatus?.confirmed ?? 0,
    completed: rawStats.byStatus?.completed ?? 0,
    cancelled: rawStats.byStatus?.cancelled ?? 0,
    // The old tally counted 'high' and 'urgent' priority together.
    high_priority: (rawStats.byPriority?.high ?? 0) + (rawStats.byPriority?.urgent ?? 0),
  };

  // Status update mutation for swipe actions
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => setBookingStatus(id, status),
    onSuccess: (_, { status }) => {
      toast.success(`Booking ${status}`);
      // One invalidation for the whole domain: list, stats and the pending
      // badge in the layout all sit under this root.
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
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
    mutationFn: ({ id, appointmentAt }) => rescheduleBooking(id, { appointmentAt }),
    onMutate: async ({ id, appointmentAt }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.all });

      // Snapshot previous value. This must be the exact key useQuery reads
      // above (bookingListFilters), and onError below must restore that same
      // key — restoring a different key than was snapshotted silently loses
      // the rollback and leaves the optimistic guess on screen.
      const previousBookings = queryClient.getQueryData(
        queryKeys.bookings.list(bookingListFilters)
      );

      // Optimistically update
      queryClient.setQueryData(queryKeys.bookings.list(bookingListFilters), old =>
        old.map(booking =>
          booking.id === id
            ? { ...booking, appointment_at: appointmentAt }
            : booking
        )
      );

      return { previousBookings };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.bookings.list(bookingListFilters), context.previousBookings);
      toast.error('Failed to reschedule booking');
    },
    onSuccess: () => {
      toast.success('Booking rescheduled successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
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
  const handleEventDrop = async (info) => {
    const bookingId = parseInt(info.event.id);
    const newDate = info.event.start.toISOString();

    // Rescheduling is not destructive, so the dialog is not styled as such —
    // but it still has to be answered before the drag is committed, and a
    // declined drag must be reverted or the calendar shows a move that never
    // happened.
    const ok = await confirm({
      title: 'Reschedule booking',
      message: `${info.event.title || 'This booking'} will move to ${format(
        info.event.start,
        'PPp'
      )}.`,
      confirmLabel: 'Reschedule',
      destructive: false,
    });

    if (ok) {
      rescheduleMutation.mutate({ id: bookingId, appointmentAt: newDate });
    } else {
      info.revert();
    }
  };

  // Handle event resize (if we add duration)
  const handleEventResize = (info) => {
    const bookingId = parseInt(info.event.id);
    const newDate = info.event.start.toISOString();

    rescheduleMutation.mutate({
      id: bookingId,
      appointmentAt: newDate
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
          <div className="text-xs text-danger-content font-bold">⚠</div>
        ) : null}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
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
    <div className="min-h-screen bg-surface p-3 sm:p-4 lg:p-6 pb-20 md:pb-6">
      <Helmet>
        <title>Booking Management - Raslipwani Properties Admin</title>
      </Helmet>

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-content">Bookings</h1>
        <p className="text-sm text-content-muted hidden sm:block">Manage appointments with calendar</p>
      </div>

      <BookingStatsCards
        stats={stats}
        isMobile={isMobile}
        expandedStats={expandedStats}
        onToggleExpand={() => setExpandedStats(!expandedStats)}
      />

      {/* Mobile View Toggle */}
      {isMobile && (
        <div className="flex gap-1 mb-4 bg-surface-sunken p-1 rounded-lg">
          <button
            onClick={() => setMobileView('list')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
              mobileView === 'list'
                ? 'bg-surface-raised text-brand shadow-sm'
                : 'text-content-muted'
            }`}
          >
            <Icon name="list" size={14} />
            List
          </button>
          <button
            onClick={() => setMobileView('calendar')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
              mobileView === 'calendar'
                ? 'bg-surface-raised text-brand shadow-sm'
                : 'text-content-muted'
            }`}
          >
            <Icon name="calendar" size={14} />
            Calendar
          </button>
        </div>
      )}

      <BookingFiltersPanel
        filters={filters}
        isMobile={isMobile}
        mobileView={mobileView}
        showFilters={showFilters}
        onFilterChange={(name, value) => setFilters({ ...filters, [name]: value })}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onReset={() => setFilters({ search: '', status: 'all', priority: 'all', dateRange: { start: null, end: null } })}
      />

      {/* Mobile List View */}
      {isMobile && mobileView === 'list' && (
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
        <div className="bg-surface-raised rounded-lg shadow-md p-2 overflow-hidden">
          <FullCalendar
            /*
              FullCalendar draws its prev/next arrows as
              <span class="fc-icon fc-icon-chevron-left" role="img"> with no
              accessible name, inside a button that already has one. axe
              reports that span as a nameless image (role-img-alt, serious),
              and it is right: role="img" is a promise of alternative text.
              Turning the icons off replaces the span with the button's text,
              which is both accessible and unambiguous in an admin toolbar.
              This is the first of the third-party chrome ROADMAP.md flags as
              never having been audited.
            */
            buttonIcons={false}
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
      <div className="bg-surface-raised rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* View Switcher */}
          <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setViewType('timeGridDay')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition text-xs sm:text-base whitespace-nowrap ${
                viewType === 'timeGridDay'
                  ? 'bg-brand text-content-on-brand'
                  : 'bg-surface-sunken text-content-muted hover:bg-surface-sunken'
              }`}
            >
              <Icon name="calendar-day" />
              <span className="hidden xs:inline">Day</span>
            </button>
            <button
              onClick={() => setViewType('timeGridWeek')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition text-xs sm:text-base whitespace-nowrap ${
                viewType === 'timeGridWeek'
                  ? 'bg-brand text-content-on-brand'
                  : 'bg-surface-sunken text-content-muted hover:bg-surface-sunken'
              }`}
            >
              <Icon name="calendar-week" />
              <span className="hidden xs:inline">Week</span>
            </button>
            <button
              onClick={() => setViewType('dayGridMonth')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition text-xs sm:text-base whitespace-nowrap ${
                viewType === 'dayGridMonth'
                  ? 'bg-brand text-content-on-brand'
                  : 'bg-surface-sunken text-content-muted hover:bg-surface-sunken'
              }`}
            >
              <Icon name="th" />
              <span className="hidden xs:inline">Month</span>
            </button>
            <button
              onClick={() => setViewType('listWeek')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition text-xs sm:text-base whitespace-nowrap ${
                viewType === 'listWeek'
                  ? 'bg-brand text-content-on-brand'
                  : 'bg-surface-sunken text-content-muted hover:bg-surface-sunken'
              }`}
            >
              <Icon name="list" />
              <span className="hidden xs:inline">List</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-surface-sunken text-content-muted rounded-md hover:bg-surface-sunken transition text-xs sm:text-base"
            >
              <Icon name="filter" />
              <span className="hidden xs:inline">Filters</span>
            </button>
            <button
              onClick={handleExport}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-success-content text-content-on-brand rounded-md hover:bg-success-content transition text-xs sm:text-base"
            >
              <Icon name="download" />
              <span className="hidden xs:inline">Export</span>
            </button>
          </div>
        </div>

        <BookingFiltersPanel
          filters={filters}
          isMobile={isMobile}
          mobileView={mobileView}
          showFilters={showFilters}
          onFilterChange={(name, value) => setFilters({ ...filters, [name]: value })}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onReset={() => setFilters({ search: '', status: 'all', priority: 'all', dateRange: { start: null, end: null } })}
        />
      </div>
      )}

      {/* Desktop Calendar */}
      {!isMobile && (
      <div className="bg-surface-raised rounded-lg shadow-md p-3 sm:p-4 lg:p-6 overflow-hidden">
        <FullCalendar
          buttonIcons={false}
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
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
          }}
        />
      )}

      {confirmDialog}
    </div>
  );
};

export default AdminBookings;
