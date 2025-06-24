import React from 'react';
import { 
  FaUser,
  FaPhone,
  FaStickyNote,
  FaCalendarAlt,
  FaArchive,
  FaTrashRestore,
  FaFileExport,
  FaTimes
} from 'react-icons/fa';

const BookingModal = ({ 
  isOpen, 
  booking, 
  viewFilter,
  onClose,
  onArchive,
  onExport
}) => {
  if (!isOpen || !booking) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Booking Details</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Client Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-4 flex items-center">
                <FaUser className="mr-2 text-blue-500" />
                Client Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{booking.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{booking.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{booking.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-medium text-sm">{booking.id || '-'}</p>
                </div>
              </div>
            </div>
            
            {/* Booking Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-4 flex items-center">
                <FaCalendarAlt className="mr-2 text-blue-500" />
                Booking Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Booking Type</p>
                  <p className="font-medium">{booking.type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status || '-'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service/Viewing Type</p>
                  <p className="font-medium">
                    {booking.service || booking.viewing_type || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Appointment Date</p>
                  <p className="font-medium">
                    {formatDate(booking.appointment_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">
                    {formatDate(booking.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="font-medium">{booking.subject || '-'}</p>
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-4 flex items-center">
                <FaStickyNote className="mr-2 text-blue-500" />
                Messages & Notes
              </h4>
              <div className="space-y-4">
                {booking.message && (
                  <div>
                    <p className="text-sm text-gray-500">Client Message</p>
                    <p className="mt-1 p-3 bg-white border rounded-lg">
                      {booking.message}
                    </p>
                  </div>
                )}
                {booking.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Internal Notes</p>
                    <p className="mt-1 p-3 bg-white border rounded-lg">
                      {booking.notes}
                    </p>
                  </div>
                )}
                {!booking.message && !booking.notes && (
                  <p className="text-gray-500 italic">No messages or notes available</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            
            {viewFilter === 'active' ? (
              <button
                onClick={() => onArchive(booking.id, true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <FaArchive className="inline mr-2" /> Archive Booking
              </button>
            ) : (
              <button
                onClick={() => onArchive(booking.id, false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FaTrashRestore className="inline mr-2" /> Restore Booking
              </button>
            )}
            
            <button
              onClick={onExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FaFileExport className="inline mr-2" /> Export Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;