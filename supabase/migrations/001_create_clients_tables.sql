-- Migration: Create clients table and related tables
-- Description: Set up comprehensive client management system
-- Date: 2026-01-18

-- =============================================
-- 1. CLIENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic Info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  secondary_phone VARCHAR(20),
  
  -- Address
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Kenya',
  
  -- Classification
  client_type VARCHAR(20) DEFAULT 'individual' CHECK (client_type IN ('individual', 'corporate', 'investor', 'other')),
  status VARCHAR(20) DEFAULT 'lead' CHECK (status IN ('lead', 'prospect', 'active', 'inactive')),
  source VARCHAR(50), -- website, referral, phone, walk-in, etc.
  company VARCHAR(255),
  preferred_contact_method VARCHAR(20) DEFAULT 'any' CHECK (preferred_contact_method IN ('email', 'phone', 'whatsapp', 'any')),
  preferred_locations TEXT,
  property_preferences TEXT,
  
  -- Preferences
  budget_min DECIMAL(15, 2),
  budget_max DECIMAL(15, 2),
  
  -- Business
  assigned_agent_id TEXT, -- Reference to Clerk user ID (using TEXT since Clerk uses string IDs)
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Notes
  notes TEXT,
  tags TEXT[], -- Array of tag strings
  
  -- Metadata
  last_contact_date TIMESTAMP WITH TIME ZONE,
  next_follow_up_date TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_client_type ON clients(client_type);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_agent ON clients(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_is_archived ON clients(is_archived);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 2. CLIENT PROPERTY INTERESTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS client_property_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  
  interest_level VARCHAR(20) DEFAULT 'medium' 
    CHECK (interest_level IN ('low', 'medium', 'high')),
  notes TEXT,
  viewed_date TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(client_id, property_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_client_interests_client ON client_property_interests(client_id);
CREATE INDEX IF NOT EXISTS idx_client_interests_property ON client_property_interests(property_id);
CREATE INDEX IF NOT EXISTS idx_client_interests_level ON client_property_interests(interest_level);

-- Add trigger for updated_at
CREATE TRIGGER update_client_interests_updated_at BEFORE UPDATE ON client_property_interests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 3. CLIENT COMMUNICATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS client_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  type VARCHAR(20) CHECK (type IN ('call', 'email', 'meeting', 'viewing', 'note')),
  subject VARCHAR(255),
  notes TEXT,
  communication_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- For calls/meetings
  duration_minutes INTEGER,
  
  -- Metadata
  created_by_agent_id TEXT, -- Clerk user ID
  is_important BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_communications_client ON client_communications(client_id);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON client_communications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communications_type ON client_communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_important ON client_communications(is_important);

-- Add trigger for updated_at
CREATE TRIGGER update_client_communications_updated_at BEFORE UPDATE ON client_communications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_property_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_communications ENABLE ROW LEVEL SECURITY;

-- For now, allow authenticated users full access
-- TODO: Implement role-based policies later

CREATE POLICY "Allow authenticated users to view clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (true);

-- Similar policies for client_property_interests
CREATE POLICY "Allow authenticated users to view interests"
  ON client_property_interests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert interests"
  ON client_property_interests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update interests"
  ON client_property_interests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete interests"
  ON client_property_interests FOR DELETE
  TO authenticated
  USING (true);

-- Similar policies for client_communications
CREATE POLICY "Allow authenticated users to view communications"
  ON client_communications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert communications"
  ON client_communications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update communications"
  ON client_communications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete communications"
  ON client_communications FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- 5. SAMPLE DATA (Optional - for testing)
-- =============================================

-- Uncomment below to insert sample clients for testing
/*
INSERT INTO clients (first_name, last_name, email, phone, client_type, status, budget_min, budget_max)
VALUES 
  ('John', 'Doe', 'john.doe@example.com', '+254712345678', 'buyer', 'lead', 5000000, 8000000),
  ('Jane', 'Smith', 'jane.smith@example.com', '+254723456789', 'seller', 'active', NULL, NULL),
  ('Bob', 'Johnson', 'bob.johnson@example.com', '+254734567890', 'renter', 'prospect', 30000, 50000);
*/

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
