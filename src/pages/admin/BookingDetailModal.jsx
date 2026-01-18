import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import { format } from 'date-fns';
import {
  FaTimes,
  FaCheck,
  FaBan,
  FaClock,
  FaTrash,
  FaEdit,
  FaPlus,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaMapMarkerAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import BookingStatusBadge from '../../components/BookingStatusBadge';
import toast from 'react-hot-toast';

/**
 * BookingDetailModal - Comprehensive booking detail and management modal
 * Features: Status workflow, internal notes, quick actions, activity log
 */
const BookingDetailModal = ({ booking, onClose, onUpdate }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(booking.status);
  const [cancellationReason, setCancellationReason] = useState('');

  // Fetch booking notes
  const { data: notes = [] } = useQuery({
    queryKey: ['booking-notes', booking.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_notes')
        .select('*')
        .eq('booking_id', booking.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, reason }) => {
      const updates = {
        status,
        last_modified_at: new Date().toISOString()
      };

      if (status === 'cancelled') {
        updates.cancellation_reason = reason;
        updates.cancelled_by = 'admin-user-id'; // Replace with actual user ID
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', booking.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
      setIsEditingStatus(false);
      setCancellationReason('');
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-stats'] });
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (noteText) => {
      const { data, error } = await supabase
        .from('booking_notes')
        .insert({
          booking_id: booking.id,
          note_text: noteText,
          created_by: 'admin-user-id', // Replace with actual user ID
          is_internal: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Note added successfully');
      setNewNote('');
      queryClient.invalidateQueries({ queryKey: ['booking-notes', booking.id] });
    },
    onError: () => {
      toast.error('Failed to add note');
    }
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId) => {
      const { error } = await supabase
        .from('booking_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Note deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['booking-notes', booking.id] });
    },
    onError: () => {
      toast.error('Failed to delete note');
    }
  });

  // Update booking priority
  const updatePriorityMutation = useMutation({
    mutationFn: async (priority) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ priority, last_modified_at: new Date().toISOString() })
        .eq('id', booking.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Priority updated successfully');
      onUpdate();
    },
    onError: () => {
      toast.error('Failed to update priority');
    }
  });

  // Quick action handlers
  const handleConfirm = () => {
    if (booking.status === 'pending') {
      updateStatusMutation.mutate({ status: 'confirmed', reason: null });
    }
  };

  const handleComplete = () => {
    if (booking.status === 'confirmed') {
      updateStatusMutation.mutate({ status: 'completed', reason: null });
    }
  };

  const handleCancel = () => {
    const reason = prompt('Please provide a cancellation reason:');
    if (reason) {
      updateStatusMutation.mutate({ status: 'cancelled', reason });
    }
  };

  const handleStatusChange = () => {
    if (newStatus === 'cancelled' && !cancellationReason) {
      toast.error('Please provide a cancellation reason');
      return;
    }
    updateStatusMutation.mutate({ status: newStatus, reason: cancellationReason });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }
    addNoteMutation.mutate(newNote);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white sm:rounded-lg shadow-xl w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold mb-2">Booking Details</h2>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <BookingStatusBadge status={booking.status} className="bg-white bg-opacity-20 border-white border-opacity-30 text-xs sm:text-sm" />
              {booking.priority && (
                <span className={`text-xs sm:text-sm font-semibold ${getPriorityColor(booking.priority)}`}>
                  {booking.priority.toUpperCase()} Priority
                </span>
              )}
              <span className="text-xs sm:text-sm opacity-90">#{booking.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition p-2 flex-shrink-0"
          >
            <FaTimes className="text-lg sm:text-2xl" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b bg-gray-50 overflow-x-auto">
          <div className="flex gap-1 px-3 sm:px-6 min-w-max">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 sm:px-4 py-2 sm:py-3 font-medium transition text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 sm:px-4 py-2 sm:py-3 font-medium transition text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Notes ({notes.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 sm:px-4 py-2 sm:py-3 font-medium transition text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Activity Log
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaUser className="text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Name</div>
                      <div className="font-medium text-gray-900">{booking.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium text-gray-900">{booking.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="font-medium text-gray-900">{booking.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCalendar className="text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Appointment</div>
                      <div className="font-medium text-gray-900">
                        {format(new Date(booking.appointment_at), 'PPp')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service</span>
                    <span className="font-medium text-gray-900">{booking.service || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property ID</span>
                    <span className="font-medium text-gray-900">{booking.property_id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium text-gray-900">
                      {format(new Date(booking.created_at), 'PPp')}
                    </span>
                  </div>
                  {booking.last_modified_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Modified</span>
                      <span className="font-medium text-gray-900">
                        {format(new Date(booking.last_modified_at), 'PPp')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Management */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h3>
                {!isEditingStatus ? (
                  <div className="flex items-center gap-3">
                    <BookingStatusBadge status={booking.status} />
                    <button
                      onClick={() => setIsEditingStatus(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2"
                    >
                      <FaEdit /> Change Status
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    {newStatus === 'cancelled' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cancellation Reason *
                        </label>
                        <textarea
                          value={cancellationReason}
                          onChange={(e) => setCancellationReason(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Please provide a reason for cancellation..."
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleStatusChange}
                        disabled={updateStatusMutation.isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        Save Status
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingStatus(false);
                          setNewStatus(booking.status);
                          setCancellationReason('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Priority Management */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Level</h3>
                <div className="flex gap-2">
                  {['low', 'medium', 'high', 'urgent'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => updatePriorityMutation.mutate(priority)}
                      disabled={updatePriorityMutation.isPending}
                      className={`px-4 py-2 rounded-md font-medium transition ${
                        booking.priority === priority
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Notes */}
              {booking.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Notes</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-700">{booking.notes}</p>
                  </div>
                </div>
              )}

              {/* Cancellation Info */}
              {booking.status === 'cancelled' && booking.cancellation_reason && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaExclamationTriangle className="text-red-600" />
                    Cancellation Information
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-gray-700">{booking.cancellation_reason}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add Note Form */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Add Internal Note</h3>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  placeholder="Add a note visible only to admins..."
                />
                <button
                  onClick={handleAddNote}
                  disabled={addNoteMutation.isPending || !newNote.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <FaPlus /> Add Note
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {notes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No internal notes yet. Add one above to get started.
                  </div>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm text-gray-600">
                          {format(new Date(note.created_at), 'PPp')}
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this note?')) {
                              deleteNoteMutation.mutate(note.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <p className="text-gray-700">{note.note_text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {booking.status_history && Array.isArray(booking.status_history) && booking.status_history.length > 0 ? (
                booking.status_history.map((entry, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <BookingStatusBadge status={entry.status} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        Status changed to {entry.status}
                      </div>
                      <div className="text-sm text-gray-600">
                        {entry.changed_at && format(new Date(entry.changed_at), 'PPp')}
                      </div>
                      {entry.reason && (
                        <div className="text-sm text-gray-700 mt-1">
                          Reason: {entry.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No activity history available
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Quick Actions */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex flex-wrap gap-3 justify-end">
            {booking.status === 'pending' && (
              <button
                onClick={handleConfirm}
                disabled={updateStatusMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                <FaCheck /> Confirm Booking
              </button>
            )}
            {booking.status === 'confirmed' && (
              <button
                onClick={handleComplete}
                disabled={updateStatusMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
              >
                <FaCheck /> Mark Completed
              </button>
            )}
            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <button
                onClick={handleCancel}
                disabled={updateStatusMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
              >
                <FaBan /> Cancel Booking
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;
