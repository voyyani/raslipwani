/**
 * Mock data for bookings used in tests
 */

export const mockBooking = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+254712345678',
  service: 'Property Viewing',
  property_id: 1,
  appointment_at: '2026-01-20T10:00:00Z',
  status: 'pending',
  notes: 'First time buyer',
  is_archived: false,
  created_at: '2026-01-18T08:00:00Z',
  updated_at: '2026-01-18T08:00:00Z',
  booking_notes: 'Client prefers morning viewings',
  assigned_agent_id: 'agent-123',
  priority: 'medium',
  internal_tags: ['first-time-buyer', 'motivated'],
  follow_up_date: '2026-01-21T10:00:00Z',
  cancellation_reason: null,
  cancelled_by: null,
  status_history: [
    {
      status: 'pending',
      changed_by: 'admin-123',
      changed_at: '2026-01-18T08:00:00Z',
      reason: 'Initial booking'
    }
  ],
  last_modified_by: 'admin-123',
  last_modified_at: '2026-01-18T08:00:00Z'
};

export const mockBookings = [
  mockBooking,
  {
    ...mockBooking,
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+254723456789',
    status: 'confirmed',
    appointment_at: '2026-01-21T14:00:00Z'
  },
  {
    ...mockBooking,
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '+254734567890',
    status: 'completed',
    appointment_at: '2026-01-15T09:00:00Z'
  },
  {
    ...mockBooking,
    id: 4,
    name: 'Alice Williams',
    email: 'alice@example.com',
    phone: '+254745678901',
    status: 'cancelled',
    appointment_at: '2026-01-19T16:00:00Z',
    cancellation_reason: 'Client requested reschedule'
  }
];

export const mockBookingNote = {
  id: 1,
  booking_id: 1,
  note_text: 'Client was very interested in the property',
  created_by: 'admin-123',
  created_at: '2026-01-18T10:00:00Z',
  updated_at: '2026-01-18T10:00:00Z',
  is_internal: true
};

export const mockBookingNotes = [
  mockBookingNote,
  {
    ...mockBookingNote,
    id: 2,
    note_text: 'Follow up required next week',
    created_at: '2026-01-18T11:00:00Z'
  }
];
