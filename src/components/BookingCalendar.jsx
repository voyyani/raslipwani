import React, { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
  FaClock, 
  FaEnvelope,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

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
  const [calendarView, setCalendarView] = useState('month');
  
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
      console.error("Error getting appointments:", error);
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
      <div className="bg-white rounded-xl shadow-md p-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigatePeriod(-1)}
              className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100"
            >
              <FaChevronLeft />
            </button>
            
            <h2 className="text-xl font-semibold">
              {viewMode === 'day' && format(selectedDate, 'MMMM d, yyyy')}
              {viewMode === 'week' && (
                `${format(startOfWeek(selectedDate, { weekStartsOn: 0 }), 'MMM d')} - 
                ${format(endOfWeek(selectedDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}`
              )}
              {viewMode === 'month' && format(selectedDate, 'MMMM yyyy')}
            </h2>
            
            <button 
              onClick={() => navigatePeriod(1)}
              className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100"
            >
              <FaChevronRight />
            </button>
          </div>
          
          <button
            onClick={() => setSelectedDate(new Date())}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            Today
          </button>
        </div>
        
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
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            
            {appointments.map(({ date, appointments }) => (
              <div 
                key={date.toString()}
                className={`min-h-32 p-2 border rounded-lg ${
                  isSameDay(date, new Date())
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                } ${
                  !isSameMonth(date, selectedDate) ? 'bg-gray-50 opacity-75' : ''
                }`}
              >
                <div className="flex justify-between">
                  <span className={`text-sm font-medium ${
                    isSameDay(date, new Date())
                      ? 'text-blue-600'
                      : 'text-gray-700'
                  }`}>
                    {format(date, 'd')}
                  </span>
                  {appointments.length > 0 && (
                    <span className="text-xs bg-gray-100 rounded-full px-2 py-1">
                      {appointments.length}
                    </span>
                  )}
                </div>
                
                <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                  {appointments.slice(0, 4).map(app => (
                    <div 
                      key={app.id}
                      className={`text-xs p-1 rounded cursor-pointer truncate ${
                        app.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        app.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                      onClick={() => openBookingModal(app)}
                      title={`${app.name} - ${formatDate(app.appointment_at)}`}
                    >
                      <div className="font-medium truncate">{app.name}</div>
                      <div className="text-xs text-gray-600 truncate">
                        {format(new Date(app.appointment_at), 'h:mm a')}
                      </div>
                    </div>
                  ))}
                  {appointments.length > 4 && (
                    <div className="text-xs text-gray-500">
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
                  <span className="bg-blue-100 text-blue-800 rounded-full px-1">
                    {apps.length}
                  </span>
                </div>
              ) : null;
            }}
          />
        )}
        
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
      
      <div className="bg-white rounded-xl shadow-md p-6">
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
            <div className="mx-auto text-gray-300 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-gray-500">No appointments scheduled for this {viewMode === 'day' ? 'date' : viewMode}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {viewMode === 'day' && appointments.map(booking => (
              <div 
                key={booking.id} 
                className={`p-4 rounded-lg border-l-4 shadow-sm ${
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
                  <p className="text-sm text-gray-700 flex items-center">
                    <FaClock className="mr-2 text-gray-500 flex-shrink-0" />
                    <span>{formatDate(booking.appointment_at)}</span>
                  </p>
                </div>
                
                {/* Status Controls */}
                <div className="flex justify-between mt-4">
                  <div className="flex gap-2">
                    {booking.status !== 'confirmed' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'confirmed')}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center"
                        title="Confirm appointment"
                      >
                        <FaCheck className="mr-1" /> Confirm
                      </button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'cancelled')}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center"
                        title="Cancel appointment"
                      >
                        <FaTimes className="mr-1" /> Cancel
                      </button>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openBookingModal(booking)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <FaEye className="mr-1" /> View Details
                    </button>
                    <a 
                      href={`mailto:${booking.email}`}
                      className="text-purple-600 hover:text-purple-800 text-sm flex items-center"
                    >
                      <FaEnvelope className="mr-1" /> Email
                    </a>
                  </div>
                </div>
              </div>
            ))}
            
            {viewMode === 'week' && appointments.map(day => (
              day.appointments.length > 0 && (
                <div key={day.date.toString()} className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    {format(day.date, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <div className="space-y-3">
                    {day.appointments.map(booking => (
                      <div 
                        key={booking.id} 
                        className={`p-4 rounded-lg border-l-4 shadow-sm ${
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
                          <p className="text-sm text-gray-700 flex items-center">
                            <FaClock className="mr-2 text-gray-500 flex-shrink-0" />
                            <span>{formatDate(booking.appointment_at)}</span>
                          </p>
                        </div>
                        
                        {/* Status Controls */}
                        <div className="flex justify-between mt-4">
                          <div className="flex gap-2">
                            {booking.status !== 'confirmed' && (
                              <button
                                onClick={() => updateStatus(booking.id, 'confirmed')}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center"
                                title="Confirm appointment"
                              >
                                <FaCheck className="mr-1" /> Confirm
                              </button>
                            )}
                            {booking.status !== 'cancelled' && (
                              <button
                                onClick={() => updateStatus(booking.id, 'cancelled')}
                                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center"
                                title="Cancel appointment"
                              >
                                <FaTimes className="mr-1" /> Cancel
                              </button>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openBookingModal(booking)}
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                            >
                              <FaEye className="mr-1" /> Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
            
            {viewMode === 'month' && appointments.map(booking => (
              <div 
                key={booking.id} 
                className={`p-4 rounded-lg border-l-4 shadow-sm ${
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
                  <p className="text-sm text-gray-700 flex items-center">
                    <FaClock className="mr-2 text-gray-500 flex-shrink-0" />
                    <span>{formatDate(booking.appointment_at)}</span>
                  </p>
                </div>
                
                {/* Status Controls */}
                <div className="flex justify-between mt-4">
                  <div className="flex gap-2">
                    {booking.status !== 'confirmed' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'confirmed')}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center"
                        title="Confirm appointment"
                      >
                        <FaCheck className="mr-1" /> Confirm
                      </button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'cancelled')}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center"
                        title="Cancel appointment"
                      >
                        <FaTimes className="mr-1" /> Cancel
                      </button>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openBookingModal(booking)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <FaEye className="mr-1" /> Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default BookingCalendar;