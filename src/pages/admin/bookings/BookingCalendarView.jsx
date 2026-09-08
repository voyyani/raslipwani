import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

// FullCalendar paints event chips through inline style, not classes, so these
// cannot be semantic tokens without re-plumbing the library's theming. They are
// the same four pairs the page has always used, moved here unchanged.
const EVENT_BACKGROUND = {
  pending: '#fef3c7',
  confirmed: '#dbeafe',
  completed: '#d1fae5',
  cancelled: '#fee2e2',
};

const EVENT_BORDER = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
};

/**
 * Every FullCalendar surface on the bookings screen — the compact mobile list
 * and the draggable desktop grid — plus the booking → event mapping the two
 * share. Moved out of `AdminBookings.jsx` (Task 23).
 *
 * `buttonIcons={false}` stays: FullCalendar draws its prev/next arrows as a
 * `role="img"` span with no accessible name inside a button that already has
 * one, which axe reports as a serious `role-img-alt` violation. Turning the
 * icons off replaces the span with the button's own text.
 *
 * Like its siblings, this self-gates on `isMobile`/`mobileView` rather than
 * making the page repeat the condition around it.
 */
const BookingCalendarView = ({
  bookings, isMobile, mobileView, viewType, onEventClick, onEventDrop, onEventResize,
}) => {
  const events = useMemo(
    () =>
      bookings.map((booking) => ({
        id: booking.id.toString(),
        title: `${booking.name} - ${booking.service || 'Booking'}`,
        start: booking.appointment_at,
        end: booking.appointment_at, // Can add duration if available
        backgroundColor: EVENT_BACKGROUND[booking.status] ?? EVENT_BACKGROUND.pending,
        borderColor: EVENT_BORDER[booking.status] ?? EVENT_BORDER.pending,
        extendedProps: { ...booking },
      })),
    [bookings]
  );

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

  if (isMobile) {
    if (mobileView !== 'calendar') return null;

    return (
      <div className="bg-surface-raised rounded-lg shadow-md p-2 overflow-hidden">
        <FullCalendar
          buttonIcons={false}
          plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
          initialView="listWeek"
          headerToolbar={{ left: 'prev,next', center: 'title', right: 'listWeek,dayGridMonth' }}
          events={events}
          eventClick={onEventClick}
          height="auto"
          contentHeight={400}
          dayMaxEvents={2}
          moreLinkText="+"
        />
      </div>
    );
  }

  return (
    <div className="bg-surface-raised rounded-lg shadow-md p-3 sm:p-4 lg:p-6 overflow-hidden">
      <FullCalendar
        buttonIcons={false}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView={viewType}
        headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
        events={events}
        editable={true}
        droppable={true}
        eventDrop={onEventDrop}
        eventResize={onEventResize}
        eventClick={onEventClick}
        eventContent={renderEventContent}
        height="auto"
        contentHeight="auto"
        aspectRatio={1.8}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        nowIndicator={true}
        businessHours={{ daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: '09:00', endTime: '17:00' }}
        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        dayMaxEvents={3}
        moreLinkText="more"
        stickyHeaderDates={false}
      />
    </div>
  );
};

BookingCalendarView.propTypes = {
  bookings: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  mobileView: PropTypes.string.isRequired,
  viewType: PropTypes.string.isRequired,
  onEventClick: PropTypes.func.isRequired,
  onEventDrop: PropTypes.func.isRequired,
  onEventResize: PropTypes.func.isRequired,
};

export default BookingCalendarView;
