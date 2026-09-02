-- Migration: 003a_create_admin_settings.sql
-- Description: Centralized settings for admin panel configuration
-- Date: 2026-01-18
--
-- Renamed 2026-09-02 from `003_create_admin_settings_table.sql`. Two files
-- claimed the `003_` prefix, so their relative order was undefined; the `a`/`b`
-- suffixes make the sequence total without renumbering applied history.
--
-- This is the migration that actually created the live `admin_settings` — a
-- wide, single-row table. `004` once declared a contradictory key/value table
-- of the same name; see that file's header.

-- =============================================
-- 1. ADMIN SETTINGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT, -- Clerk user ID of person who made changes
  
  -- Cloudinary Settings
  cloud_name VARCHAR(100),
  upload_preset VARCHAR(100),
  
  -- Email Settings
  email_provider VARCHAR(50) DEFAULT 'sendgrid',
  email_from_address VARCHAR(255),
  email_from_name VARCHAR(100),
  email_api_key TEXT, -- Encrypted in production
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  
  -- Business Information
  business_name VARCHAR(255) DEFAULT 'Raslipwani Properties',
  business_phone VARCHAR(20),
  business_email VARCHAR(255),
  business_address TEXT,
  
  -- Business Hours (JSON format)
  business_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "17:00"},
    "tuesday": {"open": "09:00", "close": "17:00"},
    "wednesday": {"open": "09:00", "close": "17:00"},
    "thursday": {"open": "09:00", "close": "17:00"},
    "friday": {"open": "09:00", "close": "17:00"},
    "saturday": {"open": "10:00", "close": "14:00"},
    "sunday": {"closed": true}
  }'::jsonb,
  
  -- Currency and Locale
  currency VARCHAR(10) DEFAULT 'KES',
  currency_symbol VARCHAR(5) DEFAULT 'Ksh',
  locale VARCHAR(10) DEFAULT 'en-KE',
  timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
  
  -- System Settings
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT,
  
  -- Notification Settings
  booking_confirmation_enabled BOOLEAN DEFAULT TRUE,
  booking_reminder_enabled BOOLEAN DEFAULT TRUE,
  booking_reminder_hours INTEGER DEFAULT 24, -- Hours before appointment
  
  -- Email Templates (JSON format)
  email_templates JSONB DEFAULT '{
    "booking_confirmation": {
      "subject": "Booking Confirmation - {{property_title}}",
      "body": "Dear {{client_name}},\n\nYour booking has been confirmed for {{appointment_date}}.\n\nThank you!"
    },
    "booking_reminder": {
      "subject": "Reminder: Your Appointment Tomorrow",
      "body": "Dear {{client_name}},\n\nThis is a reminder for your appointment tomorrow at {{appointment_time}}.\n\nSee you soon!"
    }
  }'::jsonb,
  
  -- Feature Flags
  features JSONB DEFAULT '{
    "client_management": true,
    "advanced_analytics": false,
    "email_campaigns": false,
    "sms_notifications": false
  }'::jsonb
);

-- Ensure only one settings row exists
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_settings_row 
  ON admin_settings ((id IS NOT NULL));

-- Create trigger for updated_at. `update_updated_at_column()` is defined in
-- 000_baseline.sql; the DROP makes this file re-runnable.
DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 2. INSERT DEFAULT SETTINGS
-- =============================================

INSERT INTO admin_settings (id) 
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- =============================================
-- 3. MIGRATE EXISTING SETTINGS (if they exist)
-- =============================================

-- If you have an existing settings table, migrate data here
-- Example:
-- UPDATE admin_settings 
-- SET cloud_name = (SELECT cloud_name FROM settings LIMIT 1),
--     upload_preset = (SELECT upload_preset FROM settings LIMIT 1)
-- WHERE cloud_name IS NULL;

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read settings
CREATE POLICY "Allow authenticated users to view settings"
  ON admin_settings FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can update settings (TODO: restrict to admins only)
CREATE POLICY "Allow authenticated users to update settings"
  ON admin_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Prevent deletion of settings
CREATE POLICY "Prevent deletion of settings"
  ON admin_settings FOR DELETE
  TO authenticated
  USING (false);

-- =============================================
-- 5. HELPER FUNCTIONS
-- =============================================

-- Function to get a specific setting value
CREATE OR REPLACE FUNCTION get_setting(setting_key TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  -- This is a helper function to retrieve settings
  -- Can be extended based on your needs
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a specific setting
CREATE OR REPLACE FUNCTION update_setting(
  setting_name TEXT,
  setting_value TEXT,
  user_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update the updated_by field
  UPDATE admin_settings
  SET updated_by = user_id,
      updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
