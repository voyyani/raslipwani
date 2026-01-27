-- =============================================
-- Fix RLS Policies for Admin Settings
-- Migration: 006_fix_admin_settings_rls.sql
-- Date: January 27, 2026
-- Description: Allow public read and anon write for admin_settings
--              (Clerk auth is not integrated with Supabase RLS)
-- =============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated users to view settings" ON admin_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON admin_settings;
DROP POLICY IF EXISTS "Prevent deletion of settings" ON admin_settings;

-- Allow anyone to read settings (not sensitive data)
CREATE POLICY "Allow public to read settings"
  ON admin_settings FOR SELECT
  USING (true);

-- Allow inserts (for initial setup)
CREATE POLICY "Allow insert settings"
  ON admin_settings FOR INSERT
  WITH CHECK (true);

-- Allow updates (admin panel needs this)
CREATE POLICY "Allow update settings"
  ON admin_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Still prevent deletion
CREATE POLICY "Prevent deletion of settings"
  ON admin_settings FOR DELETE
  USING (false);

-- Note: In production, you should integrate Clerk JWT with Supabase
-- and restrict write access to admin users only.
-- See: https://clerk.com/docs/integrations/databases/supabase

DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated for admin_settings at %', NOW();
END $$;
