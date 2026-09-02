-- =============================================
-- Week 2: Admin Booking Management Enhancements
-- Migration: 003_enhance_bookings_admin.sql
-- Date: January 18, 2026
-- =============================================

-- Add new admin-specific columns to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS booking_notes TEXT,
ADD COLUMN IF NOT EXISTS assigned_agent_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS internal_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for assigned agent
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_agent ON bookings(assigned_agent_id);

-- Create index for priority
CREATE INDEX IF NOT EXISTS idx_bookings_priority ON bookings(priority);

-- Create index for follow up date
CREATE INDEX IF NOT EXISTS idx_bookings_follow_up_date ON bookings(follow_up_date);

-- Create index for last modified date
CREATE INDEX IF NOT EXISTS idx_bookings_last_modified_at ON bookings(last_modified_at DESC);

-- Create booking_notes table for internal admin notes
CREATE TABLE IF NOT EXISTS booking_notes (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL,
  note_text TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_internal BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Create indexes for booking_notes
CREATE INDEX IF NOT EXISTS idx_booking_notes_booking_id ON booking_notes(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_notes_created_at ON booking_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_notes_created_by ON booking_notes(created_by);

-- Enable RLS on booking_notes
ALTER TABLE booking_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for booking_notes.
--
-- This block previously read `CREATE POLICY IF NOT EXISTS ... USING (true)`,
-- four times over. Two separate defects:
--
--   1. PostgreSQL has never supported IF NOT EXISTS on CREATE POLICY, in any
--      version through 17. The statement is a syntax error, so this migration
--      aborted here and rolled back — which is why `booking_notes` does not
--      exist in production and why BookingDetailModal queries a missing table.
--   2. `USING (true)` is not "admin only". It is the same everyone-can-do-
--      everything policy that Phase 0 was written to remove.
--
-- Both are fixed by leaving RLS enabled with no permissive policy: with RLS on
-- and no policy, PostgreSQL denies every non-superuser row, and `service_role`
-- still bypasses it. The real admin-only policies, which need the `is_admin()`
-- helper that 008 introduces, are attached in 010.
--
-- Deny-by-default until then. A table waiting for its policy is safe; a table
-- with USING (true) is not.

-- Update existing bookings to have default status_history
UPDATE bookings 
SET status_history = jsonb_build_array(
  jsonb_build_object(
    'status', status,
    'changed_at', created_at,
    'reason', 'Initial booking'
  )
)
WHERE status_history = '[]'::jsonb OR status_history IS NULL;

-- Create function to automatically update last_modified_at
CREATE OR REPLACE FUNCTION update_booking_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for bookings last_modified_at
DROP TRIGGER IF EXISTS trigger_update_booking_modified_timestamp ON bookings;
CREATE TRIGGER trigger_update_booking_modified_timestamp
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_modified_timestamp();

-- Create function to update status_history when status changes
CREATE OR REPLACE FUNCTION append_booking_status_history()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    NEW.status_history = OLD.status_history || jsonb_build_object(
      'status', NEW.status,
      'changed_by', NEW.last_modified_by,
      'changed_at', NOW(),
      'reason', COALESCE(NEW.cancellation_reason, 'Status updated')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status history
DROP TRIGGER IF EXISTS trigger_append_booking_status_history ON bookings;
CREATE TRIGGER trigger_append_booking_status_history
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION append_booking_status_history();

-- Create function to update booking_notes timestamp
CREATE OR REPLACE FUNCTION update_booking_note_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking_notes updated_at
DROP TRIGGER IF EXISTS trigger_update_booking_note_timestamp ON booking_notes;
CREATE TRIGGER trigger_update_booking_note_timestamp
  BEFORE UPDATE ON booking_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_note_timestamp();

-- Add helpful comments
COMMENT ON COLUMN bookings.booking_notes IS 'Admin internal notes about the booking';
COMMENT ON COLUMN bookings.assigned_agent_id IS 'Agent/staff member assigned to handle this booking';
COMMENT ON COLUMN bookings.priority IS 'Booking priority level for admin workflow';
COMMENT ON COLUMN bookings.internal_tags IS 'Admin tags for categorization and filtering';
COMMENT ON COLUMN bookings.follow_up_date IS 'When to follow up with this booking';
COMMENT ON COLUMN bookings.cancellation_reason IS 'Reason provided when booking was cancelled';
COMMENT ON COLUMN bookings.cancelled_by IS 'User who cancelled the booking';
COMMENT ON COLUMN bookings.status_history IS 'JSON array tracking all status changes with timestamps';
COMMENT ON COLUMN bookings.last_modified_by IS 'Last user who modified this booking';
COMMENT ON COLUMN bookings.last_modified_at IS 'Timestamp of last modification';

COMMENT ON TABLE booking_notes IS 'Internal admin notes and comments for bookings';
COMMENT ON COLUMN booking_notes.is_internal IS 'Whether note is internal (admin only) or visible to client';

-- Verification query
SELECT 
  'Bookings enhancements applied successfully' as status,
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN status_history != '[]'::jsonb THEN 1 END) as bookings_with_history
FROM bookings;
