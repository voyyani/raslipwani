-- =============================================
-- Phase 3: Extended Settings Enhancement
-- Migration: 005_extend_admin_settings.sql
-- Date: January 27, 2026
-- Description: Add additional columns to admin_settings table (flat structure)
-- =============================================

-- Add new columns to the existing admin_settings table
-- (This table uses flat columns, not key-value pairs)

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

-- Log migration
DO $$
BEGIN
  RAISE NOTICE 'Phase 3 Extended Settings migration completed at %', NOW();
END $$;
