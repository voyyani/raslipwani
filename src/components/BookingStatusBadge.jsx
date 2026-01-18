import React from 'react';
import { 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaCheck 
} from 'react-icons/fa';

/**
 * BookingStatusBadge - Reusable status badge component
 * Displays booking status with appropriate color and icon
 */
const BookingStatusBadge = ({ status, className = '' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: FaClock
      },
      confirmed: {
        label: 'Confirmed',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: FaCheckCircle
      },
      completed: {
        label: 'Completed',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: FaCheck
      },
      cancelled: {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: FaTimesCircle
      }
    };

    return configs[status] || configs.pending;
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color} ${className}`}
    >
      <Icon className="text-sm" />
      {config.label}
    </span>
  );
};

export default BookingStatusBadge;
