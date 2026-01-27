-- =============================================
-- Phase 3: Extended Settings Enhancement
-- Migration: 005_extend_admin_settings.sql
-- Date: January 27, 2026
-- Description: Add additional columns to admin_settings table (flat structure)
-- =============================================

-- Add new columns to the existing admin_settings table
-- (This table uses flat columns, not key-value pairs)

-- Cloudinary Extended (api_key and api_secret for full integration)
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS cloudinary_api_key TEXT;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS cloudinary_api_secret TEXT;

-- Company/Branding Extended
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS company_tagline TEXT DEFAULT 'Your Premier Real Estate Partner Across Kenya';
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS company_logo TEXT;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);

-- Service Locations (as JSONB array)
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS service_locations JSONB DEFAULT '["Nairobi", "Mombasa", "Kilifi", "Diani", "Naivasha", "Malindi", "Watamu", "Lamu", "Kisumu", "Nakuru"]'::jsonb;

-- Map Coordinates
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS map_lat DECIMAL(10, 6) DEFAULT -3.6308;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS map_lng DECIMAL(10, 6) DEFAULT 39.8499;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS map_zoom INTEGER DEFAULT 10;

-- SEO Settings
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS seo_title_suffix VARCHAR(100) DEFAULT ' | Raslipwani Properties';
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS seo_default_description TEXT DEFAULT 'Find your dream property across Kenya with Raslipwani Properties. From Nairobi to the Coast, we offer premium real estate services nationwide.';
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS seo_keywords TEXT[] DEFAULT ARRAY['real estate kenya', 'property for sale', 'homes in nairobi', 'coastal properties', 'kilifi homes', 'mombasa apartments'];
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS seo_og_image TEXT;

-- Social Media Links
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS social_facebook TEXT;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS social_twitter TEXT;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS social_instagram TEXT;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS social_linkedin TEXT;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS social_tiktok TEXT;

-- Exchange Rates
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS exchange_rates JSONB DEFAULT '{
  "USD_KES": 129.5,
  "EUR_KES": 140.5,
  "GBP_KES": 164.2,
  "last_updated": null,
  "auto_update": false
}'::jsonb;

-- Feature Flags
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS feature_flags JSONB DEFAULT '{
  "show_international_properties": true,
  "enable_booking_calendar": true,
  "show_investment_calculator": true,
  "enable_live_chat": false,
  "show_virtual_tours": false,
  "enable_property_alerts": true,
  "show_mortgage_calculator": false
}'::jsonb;

-- Company Legal Info
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS company_founded_year INTEGER DEFAULT 2020;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS company_registration_number VARCHAR(50);
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS company_vat_number VARCHAR(50);
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS company_license_number VARCHAR(50);

-- Notification Settings
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
  "booking_notification_delay": 0,
  "reminder_hours_before": 24,
  "send_confirmation_sms": false,
  "send_confirmation_email": true,
  "admin_notification_email": true
}'::jsonb;

-- Theme Settings
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS theme_primary_color VARCHAR(20) DEFAULT '#0D4B6E';
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS theme_accent_color VARCHAR(20) DEFAULT '#10B981';
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS dark_mode_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS custom_css TEXT;

-- Insert default row if not exists
INSERT INTO admin_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM admin_settings LIMIT 1);

-- =============================================
-- SET ACTUAL VALUES FOR EXISTING SETTINGS
-- =============================================

-- Cloudinary settings (your actual values)
UPDATE admin_settings SET 
  cloud_name = COALESCE(cloud_name, 'dzqdxosk2'),
  upload_preset = COALESCE(upload_preset, 'raslipwani_unsigned')
WHERE cloud_name IS NULL OR upload_preset IS NULL;

-- Company/Branding settings (your actual values)
UPDATE admin_settings SET
  business_name = COALESCE(business_name, 'Raslipwani Properties'),
  company_tagline = COALESCE(company_tagline, 'Your Premier Real Estate Partner Across Kenya'),
  company_logo = COALESCE(company_logo, 'https://res.cloudinary.com/dzqdxosk2/image/upload/v1751885050/Raslipwani_Logo_qgwaen.jpg'),
  business_email = COALESCE(business_email, 'info@raslipwani.com'),
  business_phone = COALESCE(business_phone, '+254758066526'),
  business_address = COALESCE(business_address, 'Kilifi, Kenya'),
  whatsapp_number = COALESCE(whatsapp_number, '+254758066526')
WHERE business_name IS NULL OR company_logo IS NULL;

-- Social media links
UPDATE admin_settings SET
  social_facebook = COALESCE(social_facebook, 'https://www.facebook.com/raslipwani/'),
  social_twitter = COALESCE(social_twitter, 'https://twitter.com/raslipwani'),
  social_instagram = COALESCE(social_instagram, 'https://www.instagram.com/raslipwani/'),
  social_linkedin = COALESCE(social_linkedin, 'https://linkedin.com/company/raslipwani'),
  social_tiktok = COALESCE(social_tiktok, 'https://www.tiktok.com/@raslipwani0')
WHERE social_facebook IS NULL;

-- Service locations
UPDATE admin_settings SET
  service_locations = COALESCE(service_locations, '["Nairobi", "Mombasa", "Kilifi", "Diani", "Naivasha", "Malindi", "Watamu", "Lamu", "Kisumu", "Nakuru"]'::jsonb)
WHERE service_locations IS NULL;

-- Log migration
DO $$
BEGIN
  RAISE NOTICE 'Phase 3 Extended Settings migration completed at %', NOW();
END $$;
