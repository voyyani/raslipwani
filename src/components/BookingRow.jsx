import React from 'react';
import { 
  FaCheck, 
  FaTimes, 
  FaEnvelope, 
  FaEye,
  FaArchive,
  FaTrashRestore
} from 'react-icons/fa';

const BookingRow = ({
  booking,
  viewFilter,
  onViewDetails,
  onUpdateStatus,
  onArchive,
  formatDate
}) => {
  return (
    <>
      {/* Desktop Row */}
      <tr className="hover:bg-gray-50 transition-colors hidden md:table-row">
        <td className="px-6 py-4">
          <div className="font-medium text-gray-900">{booking.name}</div>
          <div className="text-sm text-gray-500">{booking.email}</div>
          <div className="text-sm text-gray-500">{booking.phone}</div>
        </td>
        <td className="px-6 py-4">
          <div className="font-medium">{booking.type}</div>
          <div className="text-sm text-gray-500">
            {booking.service || booking.viewing_type}
          </div>
          <div className="text-sm mt-2">
            {booking.appointment_at ? (
              <span className="text-gray-900">
                {formatDate(booking.appointment_at)}
              </span>
            ) : (
              <span className="text-gray-400">Not scheduled</span>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {booking.status}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex space-x-3">
            <button
              onClick={() => onViewDetails(booking)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="View details"
            >
              <FaEye className="w-5 h-5" />
            </button>
            {booking.status !== 'confirmed' && (
              <button
                onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                className="text-green-600 hover:text-green-800 transition-colors"
                title="Confirm appointment"
              >
                <FaCheck className="w-5 h-5" />
              </button>
            )}
            {booking.status !== 'cancelled' && (
              <button
                onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Cancel appointment"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            )}
            <a 
              href={`mailto:${booking.email}`}
              className="text-purple-600 hover:text-purple-800 transition-colors"
              title="Send email"
            >
              <FaEnvelope className="w-5 h-5" />
            </a>
            {viewFilter === 'active' ? (
              <button
                onClick={() => onArchive(booking.id, true)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
                title="Archive appointment"
              >
                <FaArchive className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => onArchive(booking.id, false)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Restore appointment"
              >
                <FaTrashRestore className="w-5 h-5" />
              </button>
            )}
          </div>
        </td>
      </tr>
      
      {/* Mobile Row */}
      <div className="border-b border-gray-200 p-4 md:hidden">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium text-gray-900">{booking.name}</div>
            <div className="text-sm text-gray-500">{booking.email}</div>
            <div className="text-sm text-gray-500">{booking.phone}</div>
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
          <div className="font-medium">{booking.type}</div>
          <div className="text-sm text-gray-500">
            {booking.service || booking.viewing_type}
          </div>
          <div className="text-sm mt-2">
            {booking.appointment_at ? (
              <span className="text-gray-900">
                {formatDate(booking.appointment_at)}
              </span>
            ) : (
              <span className="text-gray-400">Not scheduled</span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <button
            onClick={() => onViewDetails(booking)}
            className="text-blue-600 hover:text-blue-800"
          >
            Details
          </button>
          <div className="flex space-x-3">
            {booking.status !== 'confirmed' && (
              <button
                onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                className="text-green-600 hover:text-green-800"
                title="Confirm"
              >
                <FaCheck />
              </button>
            )}
            {booking.status !== 'cancelled' && (
              <button
                onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                className="text-red-600 hover:text-red-800"
                title="Cancel"
              >
                <FaTimes />
              </button>
            )}
            {viewFilter === 'active' ? (
              <button
                onClick={() => onArchive(booking.id, true)}
                className="text-gray-600 hover:text-gray-800"
                title="Archive"
              >
                <FaArchive />
              </button>
            ) : (
              <button
                onClick={() => onArchive(booking.id, false)}
                className="text-blue-600 hover:text-blue-800"
                title="Restore"
              >
                <FaTrashRestore />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingRow;