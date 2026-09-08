import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/queryKeys';
import { format } from 'date-fns';
import BookingDetailModal from './BookingDetailModal';
import BookingStatsCards from './bookings/BookingStatsCards';
import BookingFiltersPanel from './bookings/BookingFiltersPanel';
import BookingTable from './bookings/BookingTable';
import BookingToolbar from './bookings/BookingToolbar';
import BookingViewToggle from './bookings/BookingViewToggle';
import BookingCalendarView from './bookings/BookingCalendarView';
import { useBookingMutations } from './bookings/useBookingMutations';
import { useBookingReschedule } from './bookings/useBookingReschedule';
import { useBookingListData } from './bookings/useBookingListData';
import { exportToCSV } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

import useConfirm from '../../components/ui/useConfirm';

const EMPTY_FILTERS = {
  search: '',
  status: 'all',
  priority: 'all',
  dateRange: { start: null, end: null },
};

/**
 * AdminBookings - Professional booking management with calendar views.
 *
 * The page itself now only holds screen state, the two queries, and the
 * handlers that wire them together; the stats tiles, filters, grouped mobile
 * list, desktop toolbar and calendars each live in `./bookings/` (Task 23).
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
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedStats, setExpandedStats] = useState(false);

  const { bookings, stats, isLoading, listFilters } = useBookingListData(filters);

  // Every plain booking write goes through the one hook, so the whole bookings
  // domain is invalidated exactly once per write — list, stats and the layout's
  // pending badge all sit under `queryKeys.bookings.all`.
  const { setStatus } = useBookingMutations();
  const { reschedule } = useBookingReschedule(listFilters);

  const handleStatusChange = async (id, status) => {
    try {
      await setStatus({ id, status });
      toast.success(`Booking ${status}`);
    } catch {
      toast.error('Failed to update booking');
    }
  };

  const openBooking = (booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const handleEventClick = (info) => {
    const booking = bookings.find(b => b.id.toString() === info.event.id);
    if (booking) openBooking(booking);
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
      reschedule({ id: bookingId, appointmentAt: newDate });
    } else {
      info.revert();
    }
  };

  // Handle event resize (if we add duration)
  const handleEventResize = (info) => {
    reschedule({
      id: parseInt(info.event.id),
      appointmentAt: info.event.start.toISOString(),
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

  const handleCall = (phone) => {
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email) => {
    if (email) window.location.href = `mailto:${email}`;
  };

  const handleFilterChange = (name, value) => setFilters({ ...filters, [name]: value });
  const handleResetFilters = () => setFilters(EMPTY_FILTERS);
  const toggleFilters = () => setShowFilters(!showFilters);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

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

      <BookingViewToggle
        isMobile={isMobile}
        mobileView={mobileView}
        onChange={setMobileView}
      />

      {/* The mobile search bar and filter sheet. The desktop filter grid is the
          same component mounted a second time inside BookingToolbar, where the
          original page rendered it — mounting it unconditionally here as well
          would draw that grid twice on desktop. */}
      {isMobile && (
        <BookingFiltersPanel
          filters={filters}
          isMobile={isMobile}
          mobileView={mobileView}
          showFilters={showFilters}
          onFilterChange={handleFilterChange}
          onToggleFilters={toggleFilters}
          onReset={handleResetFilters}
        />
      )}

      <BookingTable
        bookings={bookings}
        isMobile={isMobile}
        mobileView={mobileView}
        onSelect={openBooking}
        onStatusChange={handleStatusChange}
        onCall={handleCall}
        onEmail={handleEmail}
      />

      <BookingToolbar
        isMobile={isMobile}
        viewType={viewType}
        onViewTypeChange={setViewType}
        onExport={handleExport}
        filters={filters}
        mobileView={mobileView}
        showFilters={showFilters}
        onFilterChange={handleFilterChange}
        onToggleFilters={toggleFilters}
        onReset={handleResetFilters}
      />

      <BookingCalendarView
        bookings={bookings}
        isMobile={isMobile}
        mobileView={mobileView}
        viewType={viewType}
        onEventClick={handleEventClick}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
      />

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
