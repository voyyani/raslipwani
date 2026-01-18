-- Migration: Enhance bookings table for admin management
-- Description: Add admin-specific fields to bookings table
-- Date: 2026-01-18

-- =============================================
-- 1. ADD NEW COLUMNS TO BOOKINGS TABLE
-- =============================================

-- Add status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='bookings' AND column_name='status') THEN
    ALTER TABLE bookings ADD COLUMN status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show'));
  END IF;
END $$;

-- Add admin notes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='bookings' AND column_name='admin_notes') THEN
    ALTER TABLE bookings ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

-- Add internal notes (not visible to clients)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='bookings' AND column_name='internal_notes') THEN
    ALTER TABLE bookings ADD COLUMN internal_notes TEXT;
  END IF;
END $$;

-- Add confirmation tracking
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='bookings' AND column_name='confirmed_at') THEN
    ALTER TABLE bookings ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='bookings' AND column_name='confirmed_by') THEN
    ALTER TABLE bookings ADD COLUMN confirmed_by TEXT; -- Clerk user ID
  END IF;
END $$;

-- Add cancellation tracking
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='bookings' AND column_name='cancelled_at') THEN
    ALTER TABLE bookings ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='bookings' AND column_name='cancellation_reason') THEN
    ALTER TABLE bookings ADD COLUMN cancellation_reason TEXT;
  END IF;
END $$;

-- Add priority
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='bookings' AND column_name='priority') THEN
    ALTER TABLE bookings ADD COLUMN priority VARCHAR(10) DEFAULT 'medium' 
      CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
  END IF;
END $$;

-- Add agent assignment
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='bookings' AND column_name='assigned_agent_id') THEN
    ALTER TABLE bookings ADD COLUMN assigned_agent_id TEXT; -- Clerk user ID
  END IF;
END $$;

-- Add client reference
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='bookings' AND column_name='client_id') THEN
    ALTER TABLE bookings ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add property reference if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='bookings' AND column_name='property_id') THEN
    ALTER TABLE bookings ADD COLUMN property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_agent ON bookings(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_appointment_at ON bookings(appointment_at);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_priority ON bookings(priority);
CREATE INDEX IF NOT EXISTS idx_bookings_confirmed_at ON bookings(confirmed_at);

-- =============================================
-- 3. UPDATE EXISTING BOOKINGS
-- =============================================

-- Set default status for existing bookings without status
UPDATE bookings 
SET status = 'pending' 
WHERE status IS NULL;

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS) UPDATES
-- =============================================

-- RLS should already be enabled on bookings table
-- Add policy for authenticated users if not exists

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bookings' 
    AND policyname = 'Allow authenticated users full access to bookings'
  ) THEN
    CREATE POLICY "Allow authenticated users full access to bookings"
      ON bookings
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
