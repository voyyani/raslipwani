-- =============================================================================
-- Migration: 004_create_email_templates.sql
-- Date:      January 18, 2026 · rewritten 2026-09-02
-- =============================================================================
--
-- Renamed and reduced from `004_create_admin_settings.sql`, which never applied
-- and could never have applied. It contained two independent problems:
--
--   1. It declared a *second, contradictory* `admin_settings` — a key/value EAV
--      table with `id SERIAL` and a `setting_key` unique constraint — while
--      003a had already created `admin_settings` as a wide, single-row table
--      with `id UUID`. `CREATE TABLE IF NOT EXISTS` silently no-ops against the
--      existing table, so the following `INSERT ... (setting_key, ...)` would
--      abort against columns that do not exist. Two files, one table name, two
--      incompatible shapes.
--   2. Every policy used `CREATE POLICY IF NOT EXISTS`, which is not valid
--      PostgreSQL in any version. The file was a syntax error seven statements
--      in. That `006_fix_admin_settings_rls.sql` exists at all — hand-repairing
--      RLS this file claimed to set — is the proof it never ran.
--
-- The `admin_settings` half is therefore deleted, not repaired: the live shape
-- is 003a's, extended by 005. What survives here is `email_templates`, which is
-- genuinely missing from production and which `EmailSettings` queries.
--
-- =============================================================================

-- Create email_templates table for customizable email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  template_key VARCHAR(100) UNIQUE NOT NULL,
  template_name VARCHAR(200) NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for email_templates
CREATE INDEX IF NOT EXISTS idx_email_templates_key ON email_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

-- Enable RLS on email_templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- RLS for email_templates: enabled, with no permissive policy.
--
-- The four policies that stood here were `CREATE POLICY IF NOT EXISTS ...
-- USING (true)` — invalid syntax granting universal access. RLS on with no
-- policy denies every non-superuser row while leaving `service_role` free, so
-- the seed INSERTs below still run. The admin-only policies land in 010, once
-- 008 has defined `is_admin()`.

-- Insert default email templates
INSERT INTO email_templates (template_key, template_name, subject, body, variables) VALUES
('booking_confirmation', 'Booking Confirmation', 
 'Booking Confirmation - {property_name}',
 '<p>Dear <strong>{customer_name}</strong>,</p>
  <p>Your booking has been <strong>confirmed</strong>!</p>
  <h3>Booking Details:</h3>
  <ul>
    <li><strong>Property:</strong> {property_name}</li>
    <li><strong>Date:</strong> {appointment_date}</li>
    <li><strong>Time:</strong> {appointment_time}</li>
    <li><strong>Service:</strong> {service_type}</li>
  </ul>
  <p>We look forward to meeting you!</p>
  <p>Best regards,<br>Raslipwani Properties Team</p>',
 ARRAY['customer_name', 'property_name', 'appointment_date', 'appointment_time', 'service_type']),

('booking_cancellation', 'Booking Cancellation',
 'Booking Cancelled - {property_name}',
 '<p>Dear <strong>{customer_name}</strong>,</p>
  <p>Your booking has been <strong>cancelled</strong>.</p>
  <h3>Cancelled Booking Details:</h3>
  <ul>
    <li><strong>Property:</strong> {property_name}</li>
    <li><strong>Date:</strong> {appointment_date}</li>
    <li><strong>Reason:</strong> {cancellation_reason}</li>
  </ul>
  <p>If you would like to reschedule, please contact us.</p>
  <p>Best regards,<br>Raslipwani Properties Team</p>',
 ARRAY['customer_name', 'property_name', 'appointment_date', 'cancellation_reason']),

('booking_reminder', 'Booking Reminder',
 'Reminder: Upcoming Appointment - {property_name}',
 '<p>Dear <strong>{customer_name}</strong>,</p>
  <p>This is a reminder of your upcoming appointment:</p>
  <h3>Appointment Details:</h3>
  <ul>
    <li><strong>Property:</strong> {property_name}</li>
    <li><strong>Date:</strong> {appointment_date}</li>
    <li><strong>Time:</strong> {appointment_time}</li>
    <li><strong>Location:</strong> {property_location}</li>
  </ul>
  <p>Looking forward to seeing you!</p>
  <p>Best regards,<br>Raslipwani Properties Team</p>',
 ARRAY['customer_name', 'property_name', 'appointment_date', 'appointment_time', 'property_location']),

('new_client_welcome', 'Welcome New Client',
 'Welcome to Raslipwani Properties',
 '<p>Dear <strong>{client_name}</strong>,</p>
  <p>Welcome to Raslipwani Properties! We are excited to help you find your dream property.</p>
  <p>Your client account has been created successfully.</p>
  <h3>Next Steps:</h3>
  <ul>
    <li>Browse our property listings</li>
    <li>Schedule viewings</li>
    <li>Contact us with any questions</li>
  </ul>
  <p>Best regards,<br>Raslipwani Properties Team</p>',
 ARRAY['client_name']),

('property_inquiry_response', 'Property Inquiry Response',
 'Thank you for your inquiry - {property_name}',
 '<p>Dear <strong>{customer_name}</strong>,</p>
  <p>Thank you for your inquiry about <strong>{property_name}</strong>.</p>
  <p>One of our agents will contact you within 24 hours to discuss this property and answer your questions.</p>
  <h3>Property Details:</h3>
  <ul>
    <li><strong>Property:</strong> {property_name}</li>
    <li><strong>Location:</strong> {property_location}</li>
    <li><strong>Price:</strong> {property_price}</li>
  </ul>
  <p>Best regards,<br>Raslipwani Properties Team</p>',
 ARRAY['customer_name', 'property_name', 'property_location', 'property_price'])
ON CONFLICT (template_key) DO NOTHING;

-- (The admin_settings timestamp trigger belongs to 003a and is not redefined here.)

-- Create function for email_templates timestamp
CREATE OR REPLACE FUNCTION update_email_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email_templates
DROP TRIGGER IF EXISTS trigger_update_email_template_timestamp ON email_templates;
CREATE TRIGGER trigger_update_email_template_timestamp
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_template_timestamp();

-- Add helpful comments

COMMENT ON TABLE email_templates IS 'Customizable email templates for automated communications';
COMMENT ON COLUMN email_templates.template_key IS 'Unique identifier for the template';
COMMENT ON COLUMN email_templates.variables IS 'Array of variable placeholders used in the template';

-- Verification query
SELECT
  'Email templates created successfully' AS status,
  (SELECT COUNT(*) FROM email_templates) AS total_templates;
