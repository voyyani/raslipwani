import React from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

import { logger } from '../utils/logger';
import Icon from './Icon';
import CalendarToolbar from './calendar/CalendarToolbar';
import CalendarSurface from './calendar/CalendarSurface';
import CalendarEventCard from './calendar/CalendarEventCard';

/**
 * The bookings calendar: a month/week/day surface, and the appointments in
 * whichever period is showing. The period header and the appointment card are
 * their own components (Task 26) — the card because this file carried three
 * copies of it, one per view.
 */
const BookingCalendar = ({
  bookings,
  selectedDate,
  setSelectedDate,
  filteredBookings,
  openBookingModal,
  formatDate,
  viewMode,
  updateStatus
}) => {
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

  // Get appointments for selected date
  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    
    return filteredBookings.filter(booking => {
      if (!booking.appointment_at) return false;
      const appointmentDate = new Date(booking.appointment_at);
      appointmentDate.setHours(0, 0, 0, 0);
      return isSameDay(appointmentDate, selected);
    });
  };

  // Get appointments for the current view mode
  const getAppointmentsForView = () => {
    try {
      if (viewMode === 'day') {
        return getAppointmentsForDate(selectedDate);
      }
      
      if (viewMode === 'week') {
        const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
        const weekDays = eachDayOfInterval({ start, end });
        
        return weekDays.map(day => ({
          date: day,
          appointments: getAppointmentsForDate(day)
        }));
      }
      
      if (viewMode === 'month') {
        const start = startOfMonth(selectedDate);
        const end = endOfMonth(selectedDate);
        
        // Get all appointments in the month
        const monthAppointments = filteredBookings.filter(booking => {
          if (!booking.appointment_at) return false;
          const appointmentDate = new Date(booking.appointment_at);
          return isWithinInterval(appointmentDate, { start, end });
        });
        
        return monthAppointments;
      }
      
      return [];
    } catch (error) {
      logger.error("Error getting appointments:", error);
      return [];
    }
  };
  
  const appointments = getAppointmentsForView();

  // Handle navigation
  const navigatePeriod = (direction) => {
    const newDate = new Date(selectedDate);
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (7 * direction));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    
    setSelectedDate(newDate);
  };

  return (
    <>
      <div className="bg-surface-raised rounded-xl shadow-md p-4 mb-8">
        <CalendarToolbar
          selectedDate={selectedDate}
          viewMode={viewMode}
          onNavigate={navigatePeriod}
          onToday={() => setSelectedDate(new Date())}
        />

        
        <CalendarSurface
          viewMode={viewMode}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          appointments={appointments}
          tileClassName={tileClassName}
          getAppointmentsForDate={getAppointmentsForDate}
          openBookingModal={openBookingModal}
          formatDate={formatDate}
        />
      </div>

      <div className="bg-surface-raised rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {viewMode === 'day' && `Appointments for ${selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}`}
          {viewMode === 'week' && `Appointments for Week of ${startOfWeek(selectedDate, { weekStartsOn: 0 }).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric' 
          })}`}
          {viewMode === 'month' && `Appointments for ${selectedDate.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}`}
        </h2>
        
        {(viewMode === 'day' && appointments.length === 0) || 
         (viewMode === 'week' && appointments.every(day => day.appointments.length === 0)) ||
         (viewMode === 'month' && appointments.length === 0) ? (
          <div className="text-center py-8">
            <div className="mx-auto text-content-on-media/80 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-content-subtle">No appointments scheduled for this {viewMode === 'day' ? 'date' : viewMode}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {viewMode === 'day' && appointments.map(booking => (
              <CalendarEventCard
                key={booking.id}
                booking={booking}
                formatDate={formatDate}
                onSelect={openBookingModal}
                onStatusChange={updateStatus}
                detailsLabel="View Details"
                showEmail
              />
            ))}

            {viewMode === 'week' && appointments.map(day => (
              day.appointments.length > 0 && (
                <div key={day.date.toString()} className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    {format(day.date, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <div className="space-y-3">
                    {day.appointments.map(booking => (
                      <CalendarEventCard
                        key={booking.id}
                        booking={booking}
                        formatDate={formatDate}
                        onSelect={openBookingModal}
                        onStatusChange={updateStatus}
                      />
                    ))}
                  </div>
                </div>
              )
            ))}

            {viewMode === 'month' && appointments.map(booking => (
              <CalendarEventCard
                key={booking.id}
                booking={booking}
                formatDate={formatDate}
                onSelect={openBookingModal}
                onStatusChange={updateStatus}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default BookingCalendar;
