import React from 'react';
import PropTypes from 'prop-types';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay, isSameMonth } from 'date-fns';

/**
 * The calendar itself — react-calendar for the day and month views, a
 * hand-drawn seven-column grid for the week — and the status legend beneath
 * it. Moved out of `BookingCalendar.jsx` (Task 26) unchanged.
 */
const CalendarSurface = ({
  viewMode, selectedDate, setSelectedDate, appointments, tileClassName,
  getAppointmentsForDate, openBookingModal, formatDate,
}) => (
  <>
  {viewMode === 'day' && (
    <Calendar
      onChange={setSelectedDate}
      value={selectedDate}
      tileClassName={tileClassName}
      className="w-full border-0 custom-calendar"
    />
  )}
  
  {viewMode === 'week' && (
    <div className="grid grid-cols-7 gap-1 mb-4">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="text-center text-sm font-medium text-content-subtle py-2">
          {day}
        </div>
      ))}
      
      {appointments.map(({ date, appointments }) => (
        <div 
          key={date.toString()}
          className={`min-h-32 p-2 border rounded-lg ${
            isSameDay(date, new Date())
              ? 'border-brand bg-brand-subtle'
              : 'border-line'
          } ${
            !isSameMonth(date, selectedDate) ? 'bg-surface opacity-75' : ''
          }`}
        >
          <div className="flex justify-between">
            <span className={`text-sm font-medium ${
              isSameDay(date, new Date())
                ? 'text-brand'
                : 'text-content-muted'
            }`}>
              {format(date, 'd')}
            </span>
            {appointments.length > 0 && (
              <span className="text-xs bg-surface-sunken rounded-full px-2 py-1">
                {appointments.length}
              </span>
            )}
          </div>
          
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {appointments.slice(0, 4).map(app => (
              <div 
                key={app.id}
                className={`text-xs p-1 rounded cursor-pointer truncate ${
                  app.status === 'confirmed' ? 'bg-success-surface text-success-content' :
                  app.status === 'cancelled' ? 'bg-danger-surface text-danger-content' :
                  'bg-warning-surface text-warning-content'
                }`}
                onClick={() => openBookingModal(app)}
                title={`${app.name} - ${formatDate(app.appointment_at)}`}
              >
                <div className="font-medium truncate">{app.name}</div>
                <div className="text-xs text-content-muted truncate">
                  {format(new Date(app.appointment_at), 'h:mm a')}
                </div>
              </div>
            ))}
            {appointments.length > 4 && (
              <div className="text-xs text-content-subtle">
                +{appointments.length - 4} more
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
  
  {viewMode === 'month' && (
    <Calendar
      onChange={setSelectedDate}
      value={selectedDate}
      view="month"
      tileClassName={tileClassName}
      className="w-full border-0 custom-calendar"
      tileContent={({ date, view }) => {
        if (view !== 'month') return null;
        const apps = getAppointmentsForDate(date);
        return apps.length > 0 ? (
          <div className="text-center text-xs mt-1">
            <span className="bg-brand-subtle text-brand-content rounded-full px-1">
              {apps.length}
            </span>
          </div>
        ) : null;
      }}
    />
  )}
  
  <div className="flex flex-wrap gap-4 mt-4">
    <div className="flex items-center">
      <div className="w-3 h-3 bg-accent rounded-full mr-2"></div>
      <span className="text-sm">Pending</span>
    </div>
    <div className="flex items-center">
      <div className="w-3 h-3 bg-success-content rounded-full mr-2"></div>
      <span className="text-sm">Confirmed</span>
    </div>
    <div className="flex items-center">
      <div className="w-3 h-3 bg-brand rounded-full mr-2"></div>
      <span className="text-sm">Other Bookings</span>
    </div>
  </div>
  </>
);

CalendarSurface.propTypes = {
  viewMode: PropTypes.string.isRequired,
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  setSelectedDate: PropTypes.func.isRequired,
  appointments: PropTypes.array.isRequired,
  tileClassName: PropTypes.func.isRequired,
  getAppointmentsForDate: PropTypes.func.isRequired,
  openBookingModal: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
};

export default CalendarSurface;
