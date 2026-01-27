import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

// Default fallback values for settings (used while loading or on error)
const DEFAULT_SETTINGS = {
  // Branding
  business_name: 'Raslipwani Properties',
  company_logo: 'https://res.cloudinary.com/dzqdxosk2/image/upload/v1751885050/Raslipwani_Logo_qgwaen.jpg',
  company_tagline: 'Your Premier Real Estate Partner Across Kenya',
  
  // Contact
  business_email: 'info@raslipwani.com',
  business_phone: '+254758066526',
  business_address: 'Kilifi, Kenya',
  whatsapp_number: '+254758066526',
  
  // Social Media
  social_facebook: 'https://www.facebook.com/raslipwani/',
  social_twitter: 'https://twitter.com/raslipwani',
  social_instagram: 'https://www.instagram.com/raslipwani/',
  social_linkedin: 'https://linkedin.com/company/raslipwani',
  social_tiktok: 'https://www.tiktok.com/@raslipwani0',
  
  // Locations
  service_locations: ['Nairobi', 'Mombasa', 'Kilifi', 'Diani', 'Naivasha', 'Malindi'],
  
  // Currency/Locale
  currency: 'KES',
  currency_symbol: 'KSh',
  locale: 'en-KE',
  timezone: 'Africa/Nairobi',
  
  // Business Hours
  business_hours: {
    monday: { open: '09:00', close: '17:00' },
    tuesday: { open: '09:00', close: '17:00' },
    wednesday: { open: '09:00', close: '17:00' },
    thursday: { open: '09:00', close: '17:00' },
    friday: { open: '09:00', close: '17:00' },
    saturday: { open: '10:00', close: '14:00' },
    sunday: { closed: true },
  },
  
  // System
  maintenance_mode: false,
  maintenance_message: '',
  
  // Feature flags
  features: {
    client_management: true,
    advanced_analytics: false,
  },
};

// Create the context
const SettingsContext = createContext(null);

/**
 * SettingsProvider - Wraps the app and provides settings throughout
 */
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null); // Start with null to force fetch
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Fetch settings from Supabase (flat table structure - single row with columns)
   */
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('admin_settings')
        .select('*')
        .limit(1)
        .single();

      if (fetchError) {
        // If no rows exist, that's okay - use defaults
        if (fetchError.code === 'PGRST116') {
          console.warn('[SettingsContext] No settings row found, using defaults');
          setLoading(false);
          return;
        }
        console.error('[SettingsContext] Fetch error:', fetchError);
        setError(fetchError.message);
        return;
      }

      if (!data) {
        console.warn('[SettingsContext] No settings found, using defaults');
        return;
      }

      console.log('[SettingsContext] Raw data from DB:', data);

      // Merge fetched settings with defaults (fetched values take precedence)
      const mergedSettings = {
        ...DEFAULT_SETTINGS,
        ...data,
        // Ensure JSONB fields are properly parsed
        business_hours: data.business_hours || DEFAULT_SETTINGS.business_hours,
        service_locations: data.service_locations || DEFAULT_SETTINGS.service_locations,
        features: data.features || DEFAULT_SETTINGS.features,
        exchange_rates: data.exchange_rates || null,
        feature_flags: data.feature_flags || null,
        notification_settings: data.notification_settings || null,
      };

      console.log('[SettingsContext] Merged settings:', mergedSettings);
      setSettings(mergedSettings);
      setLastUpdated(new Date());
      console.log('[SettingsContext] Settings loaded successfully');
    } catch (err) {
      console.error('[SettingsContext] Unexpected error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh settings - can be called after admin makes changes
   */
  const refreshSettings = useCallback(async () => {
    console.log('[SettingsContext] Refreshing settings...');
    await fetchSettings();
  }, [fetchSettings]);

  /**
   * Get a specific setting value with fallback
   */
  const getSetting = useCallback((key, fallback = null) => {
    try {
      if (!settings) return fallback;
      const value = settings[key];
      if (value === undefined || value === null) return fallback;
      return value;
    } catch {
      return fallback;
    }
  }, [settings]);

  /**
   * Convenience getters for common settings
   * Use optional chaining since settings might be null initially
   */
  const getters = {
    // Branding
    siteName: () => settings?.business_name || DEFAULT_SETTINGS.business_name,
    logo: () => settings?.company_logo || DEFAULT_SETTINGS.company_logo,
    tagline: () => settings?.company_tagline || DEFAULT_SETTINGS.company_tagline,
    
    // Contact
    email: () => settings?.business_email || DEFAULT_SETTINGS.business_email,
    phone: () => settings?.business_phone || DEFAULT_SETTINGS.business_phone,
    address: () => settings?.business_address || DEFAULT_SETTINGS.business_address,
    whatsapp: () => settings?.whatsapp_number || settings?.business_phone || DEFAULT_SETTINGS.whatsapp_number,
    
    // Social Media
    socialMedia: () => ({
      facebook: settings?.social_facebook || DEFAULT_SETTINGS.social_facebook,
      twitter: settings?.social_twitter || DEFAULT_SETTINGS.social_twitter,
      instagram: settings?.social_instagram || DEFAULT_SETTINGS.social_instagram,
      linkedin: settings?.social_linkedin || DEFAULT_SETTINGS.social_linkedin,
      tiktok: settings?.social_tiktok || DEFAULT_SETTINGS.social_tiktok,
    }),
    
    // Locations
    serviceLocations: () => {
      const locs = settings?.service_locations;
      if (Array.isArray(locs)) return locs;
      if (typeof locs === 'object' && locs !== null) return locs;
      return DEFAULT_SETTINGS.service_locations;
    },
    
    // Localization
    currency: () => ({
      code: settings?.currency || DEFAULT_SETTINGS.currency,
      symbol: settings?.currency_symbol || DEFAULT_SETTINGS.currency_symbol,
    }),
    locale: () => settings?.locale || DEFAULT_SETTINGS.locale,
    timezone: () => settings?.timezone || DEFAULT_SETTINGS.timezone,
    
    // Business
    businessHours: () => settings?.business_hours || DEFAULT_SETTINGS.business_hours,
    
    // System
    isMaintenanceMode: () => settings?.maintenance_mode || false,
    maintenanceMessage: () => settings?.maintenance_message || '',
    
    // Features
    features: () => settings?.features || DEFAULT_SETTINGS.features,
    featureFlags: () => settings?.feature_flags || {},
  };

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Subscribe to realtime updates (optional - for admin panel live sync)
  useEffect(() => {
    const channel = supabase
      .channel('admin_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_settings' },
        (payload) => {
          console.log('[SettingsContext] Realtime update detected:', payload);
          refreshSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshSettings]);

  const contextValue = {
    // Raw settings (flat object with all columns)
    settings,
    
    // State
    loading,
    error,
    lastUpdated,
    
    // Methods
    refreshSettings,
    getSetting,
    
    // Convenience getters
    ...getters,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * useSettings hook - Access settings anywhere in the app
 * 
 * @returns Settings context value with all settings and convenience getters
 * 
 * @example
 * // Get everything
 * const { settings, loading, siteName, logo, phone, email } = useSettings();
 * 
 * @example
 * // Use convenience getters (they are functions)
 * const { siteName, phone, socialMedia } = useSettings();
 * console.log(siteName()); // "Raslipwani Properties"
 * console.log(phone()); // "+254758066526"
 * console.log(socialMedia().facebook); // "https://facebook.com/..."
 * 
 * @example
 * // Access raw setting by key
 * const { getSetting } = useSettings();
 * const logo = getSetting('company_logo', 'default-logo.png');
 */
export const useSettings = () => {
  const context = useContext(SettingsContext);
  
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  
  return context;
};

export default SettingsContext;
