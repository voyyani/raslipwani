-- =============================================
-- Week 3: Admin Settings/Configuration System
-- Migration: 004_create_admin_settings.sql
-- Date: January 18, 2026
-- =============================================

-- Create admin_settings table for system configuration
CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  setting_category VARCHAR(50) NOT NULL,
  description TEXT,
  is_encrypted BOOLEAN DEFAULT FALSE,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_category CHECK (setting_category IN ('general', 'cloudinary', 'email', 'business', 'localization', 'advanced'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_admin_settings_category ON admin_settings(setting_category);
CREATE INDEX IF NOT EXISTS idx_admin_settings_updated_at ON admin_settings(updated_at DESC);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (admin only access)
CREATE POLICY IF NOT EXISTS "Admin can view all settings"
  ON admin_settings FOR SELECT
  USING (true); -- In production, add proper admin role check

CREATE POLICY IF NOT EXISTS "Admin can insert settings"
  ON admin_settings FOR INSERT
  WITH CHECK (true); -- In production, add proper admin role check

CREATE POLICY IF NOT EXISTS "Admin can update settings"
  ON admin_settings FOR UPDATE
  USING (true); -- In production, add proper admin role check

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

-- Create RLS policies for email_templates
CREATE POLICY IF NOT EXISTS "Admin can view all templates"
  ON email_templates FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Admin can insert templates"
  ON email_templates FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Admin can update templates"
  ON email_templates FOR UPDATE
  USING (true);

CREATE POLICY IF NOT EXISTS "Admin can delete templates"
  ON email_templates FOR DELETE
  USING (true);

-- Insert default settings
INSERT INTO admin_settings (setting_key, setting_value, setting_category, description) VALUES
-- General Settings
('site_name', '{"value": "Raslipwani Properties"}', 'general', 'Website name displayed across the platform'),
('company_logo', '{"value": ""}', 'general', 'Company logo URL'),
('contact_email', '{"value": "info@raslipwani.com"}', 'general', 'Primary contact email'),
('contact_phone', '{"value": "+254712345678"}', 'general', 'Primary contact phone number'),
('contact_address', '{"value": "Nairobi, Kenya"}', 'general', 'Company physical address'),
('social_media', '{"facebook": "", "twitter": "", "instagram": "", "linkedin": ""}', 'general', 'Social media links'),

-- Cloudinary Settings
('cloudinary_cloud_name', '{"value": ""}', 'cloudinary', 'Cloudinary cloud name'),
('cloudinary_api_key', '{"value": ""}', 'cloudinary', 'Cloudinary API key'),
('cloudinary_api_secret', '{"value": ""}', 'cloudinary', 'Cloudinary API secret (encrypted)'),
('cloudinary_upload_preset', '{"value": ""}', 'cloudinary', 'Cloudinary upload preset'),

-- Email Settings
('email_notifications', '{"new_booking": true, "status_change": true, "new_client": true, "property_inquiry": true, "system_alerts": true}', 'email', 'Email notification preferences'),
('email_recipients', '{"value": "admin@raslipwani.com"}', 'email', 'Comma-separated list of admin email recipients'),
('smtp_settings', '{"host": "", "port": 587, "secure": true, "user": "", "password": ""}', 'email', 'SMTP server configuration'),

-- Business Hours
('business_hours', '{
  "monday": {"open": "09:00", "close": "17:00", "closed": false},
  "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
  "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
  "thursday": {"open": "09:00", "close": "17:00", "closed": false},
  "friday": {"open": "09:00", "close": "17:00", "closed": false},
  "saturday": {"open": "10:00", "close": "14:00", "closed": false},
  "sunday": {"open": "00:00", "close": "00:00", "closed": true}
}', 'business', 'Business operating hours for each day'),
('holidays', '{"dates": []}', 'business', 'Special holiday dates when business is closed'),
('timezone', '{"value": "Africa/Nairobi"}', 'business', 'Business timezone'),

-- Localization Settings
('currency', '{"code": "KES", "symbol": "KSh", "position": "before", "decimals": 2}', 'localization', 'Currency settings'),
('locale', '{"code": "en-KE", "dateFormat": "DD/MM/YYYY", "timeFormat": "24h"}', 'localization', 'Locale and format preferences'),
('language', '{"default": "en", "available": ["en", "sw"]}', 'localization', 'Language settings'),

-- Advanced Settings
('maintenance_mode', '{"enabled": false, "message": "We are currently performing maintenance. Please check back soon.", "scheduled_start": null, "scheduled_end": null}', 'advanced', 'Maintenance mode configuration'),
('maintenance_whitelist', '{"ips": ["127.0.0.1", "::1"]}', 'advanced', 'IP addresses that can access during maintenance'),
('google_analytics', '{"tracking_id": ""}', 'advanced', 'Google Analytics tracking ID'),
('facebook_pixel', '{"pixel_id": ""}', 'advanced', 'Facebook Pixel ID'),
('terms_url', '{"value": "/terms"}', 'advanced', 'Terms of service URL'),
('privacy_url', '{"value": "/privacy"}', 'advanced', 'Privacy policy URL')
ON CONFLICT (setting_key) DO NOTHING;

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

-- Create function to automatically update admin_settings timestamp
CREATE OR REPLACE FUNCTION update_admin_setting_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for admin_settings
DROP TRIGGER IF EXISTS trigger_update_admin_setting_timestamp ON admin_settings;
CREATE TRIGGER trigger_update_admin_setting_timestamp
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_setting_timestamp();

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
COMMENT ON TABLE admin_settings IS 'System-wide configuration settings for admin panel';
COMMENT ON COLUMN admin_settings.setting_key IS 'Unique identifier for the setting';
COMMENT ON COLUMN admin_settings.setting_value IS 'JSON value of the setting';
COMMENT ON COLUMN admin_settings.setting_category IS 'Category grouping for organization';
COMMENT ON COLUMN admin_settings.is_encrypted IS 'Whether the value should be encrypted (for sensitive data)';

COMMENT ON TABLE email_templates IS 'Customizable email templates for automated communications';
COMMENT ON COLUMN email_templates.template_key IS 'Unique identifier for the template';
COMMENT ON COLUMN email_templates.variables IS 'Array of variable placeholders used in the template';

-- Verification query
SELECT 
  'Admin settings created successfully' as status,
  (SELECT COUNT(*) FROM admin_settings) as total_settings,
  (SELECT COUNT(*) FROM email_templates) as total_templates;
