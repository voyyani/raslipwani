import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import { 
  FaPhone, 
  FaEnvelope, 
  FaCheck, 
  FaTimes, 
  FaClock,
  FaExclamationTriangle,
  FaCalendarCheck,
  FaEye,
  FaMapMarkerAlt
} from 'react-icons/fa';
import BookingStatusBadge from '../BookingStatusBadge';

/**
 * MobileBookingCard - Touch-optimized booking card with swipe gestures
 * Features: Swipe-to-reveal actions, haptic feedback, time-relative display
 */
const MobileBookingCard = ({ 
  booking, 
  onView, 
  onConfirm, 
  onCancel, 
  onCall,
  onEmail 
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const constraintsRef = useRef(null);
  
  const x = useMotionValue(0);
  const rightActionOpacity = useTransform(x, [-120, -60], [1, 0]);
  const leftActionOpacity = useTransform(x, [60, 120], [0, 1]);
  const scale = useTransform(x, [-120, 0, 120], [0.98, 1, 0.98]);

  // Get appointment date info
  const appointmentDate = new Date(booking.appointment_at);
  const isPastAppointment = isPast(appointmentDate);
  const isAppointmentToday = isToday(appointmentDate);
  const isAppointmentTomorrow = isTomorrow(appointmentDate);

  // Priority colors
  const priorityColors = {
    urgent: 'border-l-4 border-l-red-500',
    high: 'border-l-4 border-l-orange-500',
    normal: 'border-l-4 border-l-blue-500',
    low: 'border-l-4 border-l-gray-400'
  };

  // Format relative time
  const getRelativeTime = () => {
    if (isAppointmentToday) {
      return `Today at ${format(appointmentDate, 'h:mm a')}`;
    }
    if (isAppointmentTomorrow) {
      return `Tomorrow at ${format(appointmentDate, 'h:mm a')}`;
    }
    if (isPastAppointment) {
      return formatDistanceToNow(appointmentDate, { addSuffix: true });
    }
    return format(appointmentDate, 'MMM d') + ' at ' + format(appointmentDate, 'h:mm a');
  };

  // Haptic feedback
  const haptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleDragEnd = (event, info) => {
    const threshold = 80;
    
    if (info.offset.x < -threshold) {
      // Swiped left - reveal right actions (Cancel)
      haptic();
      setIsRevealed('right');
    } else if (info.offset.x > threshold) {
      // Swiped right - reveal left actions (Confirm)
      haptic();
      setIsRevealed('left');
    } else {
      setIsRevealed(false);
    }
  };

  const handleAction = (action) => {
    haptic();
    setIsRevealed(false);
    action();
  };

  return (
    <div 
      ref={constraintsRef}
      className="relative overflow-hidden rounded-xl mb-3"
    >
      {/* Left action (Confirm) */}
      <motion.div 
        className="absolute inset-y-0 left-0 w-24 bg-success-content flex items-center justify-center"
        style={{ opacity: leftActionOpacity }}
      >
        <button
          onClick={() => handleAction(onConfirm)}
          className="flex flex-col items-center text-content-on-media"
        >
          <FaCalendarCheck className="text-2xl mb-1" />
          <span className="text-xs font-medium">Confirm</span>
        </button>
      </motion.div>

      {/* Right action (Cancel) */}
      <motion.div 
        className="absolute inset-y-0 right-0 w-24 bg-danger-content flex items-center justify-center"
        style={{ opacity: rightActionOpacity }}
      >
        <button
          onClick={() => handleAction(onCancel)}
          className="flex flex-col items-center text-content-on-media"
        >
          <FaTimes className="text-2xl mb-1" />
          <span className="text-xs font-medium">Cancel</span>
        </button>
      </motion.div>

      {/* Main Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x, scale }}
        animate={{
          x: isRevealed === 'left' ? 100 : isRevealed === 'right' ? -100 : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`
          relative bg-surface-raised rounded-xl shadow-sm 
          ${priorityColors[booking.priority] || priorityColors.normal}
          active:shadow-md transition-shadow
        `}
        onClick={() => !isRevealed && onView()}
      >
        <div className="p-4">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-content truncate text-base">
                {booking.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <BookingStatusBadge status={booking.status} size="sm" />
                {booking.priority === 'urgent' && (
                  <span className="flex items-center text-xs text-danger-content font-medium">
                    <FaExclamationTriangle className="mr-1" />
                    Urgent
                  </span>
                )}
                {booking.priority === 'high' && (
                  <span className="flex items-center text-xs text-warning-content font-medium">
                    <FaExclamationTriangle className="mr-1" />
                    High
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="p-2 text-content-subtle hover:text-brand hover:bg-brand-subtle rounded-lg transition-colors"
            >
              <FaEye className="text-lg" />
            </button>
          </div>

          {/* Appointment Time */}
          <div className={`
            flex items-center gap-2 p-2 rounded-lg mb-3
            ${isAppointmentToday ? 'bg-brand-subtle text-brand' : 
              isAppointmentTomorrow ? 'bg-warning-surface text-warning-content' :
              isPastAppointment ? 'bg-surface-sunken text-content-subtle' : 'bg-surface text-content-muted'}
          `}>
            <FaClock className="text-sm flex-shrink-0" />
            <span className="text-sm font-medium">{getRelativeTime()}</span>
          </div>

          {/* Property/Service Info */}
          {booking.property_interest && (
            <div className="flex items-center gap-2 text-content-muted mb-3">
              <FaMapMarkerAlt className="text-sm text-content-subtle" />
              <span className="text-sm truncate">{booking.property_interest}</span>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-line">
            <button
              onClick={(e) => {
                e.stopPropagation();
                haptic();
                onCall();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 
                bg-success-surface text-success-content rounded-lg text-sm font-medium
                active:bg-success-surface transition-colors"
            >
              <FaPhone className="text-xs" />
              Call
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                haptic();
                onEmail();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 
                bg-brand-subtle text-brand rounded-lg text-sm font-medium
                active:bg-brand-subtle transition-colors"
            >
              <FaEnvelope className="text-xs" />
              Email
            </button>
          </div>
        </div>

        {/* Swipe Hint */}
        <AnimatePresence>
          {!isRevealed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-1 left-1/2 -translate-x-1/2"
            >
              <div className="w-10 h-1 bg-surface-sunken rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Reset overlay when revealed */}
      {isRevealed && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsRevealed(false)}
        />
      )}
    </div>
  );
};

export default MobileBookingCard;
