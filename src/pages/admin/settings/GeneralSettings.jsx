import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabaseClient';
import toast from 'react-hot-toast';
import { useSettings } from '../../../hooks/useSettings';

import { logger } from '../../../utils/logger';
import Icon from '../../../components/Icon';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
/**
 * GeneralSettings - General site configuration
 * Works with flat table structure (single row with columns)
 */
const GeneralSettings = () => {
  const queryClient = useQueryClient();
  const { refreshSettings } = useSettings(); // Get refreshSettings to update global context
  const [formData, setFormData] = useState({
    business_name: 'Raslipwani Properties',
    company_logo: '',
    company_tagline: 'Your Premier Real Estate Partner Across Kenya',
    business_email: 'info@raslipwani.com',
    business_phone: '+254712345678',
    business_address: 'Kilifi, Kenya',
    whatsapp_number: '+254712345678',
    service_locations: 'Nairobi, Mombasa, Kilifi, Diani, Naivasha, Malindi, Watamu, Lamu',
    social_facebook: 'https://facebook.com/raslipwani',
    social_twitter: 'https://twitter.com/raslipwani',
    social_instagram: 'https://instagram.com/raslipwani',
    social_linkedin: 'https://linkedin.com/company/raslipwani',
    social_tiktok: ''
  });

  // Fetch settings (single row with all columns)
  const { isLoading } = useQuery({
    queryKey: ['settings', 'general'],
    staleTime: 0, // Always consider data stale
    refetchOnMount: 'always', // Always refetch when component mounts
    queryFn: async () => {
      logger.debug('[GeneralSettings] Fetching settings from database...');
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .limit(1)
        .single();

      logger.debug('[GeneralSettings] Fetch result:', { data, error });
      
      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // Parse service_locations if it's an array
        let locationsStr = 'Nairobi, Mombasa, Kilifi, Diani, Naivasha, Malindi, Watamu, Lamu';
        if (Array.isArray(data.service_locations) && data.service_locations.length > 0) {
          locationsStr = data.service_locations.join(', ');
        } else if (typeof data.service_locations === 'string' && data.service_locations) {
          locationsStr = data.service_locations;
        }

        const newFormData = {
          business_name: data.business_name || 'Raslipwani Properties',
          company_logo: data.company_logo || '',
          company_tagline: data.company_tagline || 'Your Premier Real Estate Partner Across Kenya',
          business_email: data.business_email || 'info@raslipwani.com',
          business_phone: data.business_phone || '+254712345678',
          business_address: data.business_address || 'Kilifi, Kenya',
          whatsapp_number: data.whatsapp_number || '+254712345678',
          service_locations: locationsStr,
          social_facebook: data.social_facebook || 'https://facebook.com/raslipwani',
          social_twitter: data.social_twitter || 'https://twitter.com/raslipwani',
          social_instagram: data.social_instagram || 'https://instagram.com/raslipwani',
          social_linkedin: data.social_linkedin || 'https://linkedin.com/company/raslipwani',
          social_tiktok: data.social_tiktok || ''
        };
        logger.debug('[GeneralSettings] Setting form data:', newFormData);
        setFormData(newFormData);
      }
      return data;
    }
  });

  // Update settings mutation (updates the single row)
  const updateMutation = useMutation({
    mutationFn: async (settings) => {
      logger.debug('[GeneralSettings] Saving settings:', settings);
      
      // Parse service locations from comma-separated string to array
      const locationsArray = settings.service_locations
        ? settings.service_locations.split(',').map(l => l.trim()).filter(Boolean)
        : [];

      const updateData = {
        business_name: settings.business_name,
        company_logo: settings.company_logo,
        company_tagline: settings.company_tagline,
        business_email: settings.business_email,
        business_phone: settings.business_phone,
        business_address: settings.business_address,
        whatsapp_number: settings.whatsapp_number,
        service_locations: locationsArray,
        social_facebook: settings.social_facebook,
        social_twitter: settings.social_twitter,
        social_instagram: settings.social_instagram,
        social_linkedin: settings.social_linkedin,
        social_tiktok: settings.social_tiktok,
        updated_at: new Date().toISOString()
      };

      logger.debug('[GeneralSettings] Update payload:', updateData);

      // Try to update existing row, or insert if none exists
      const { data: existing, error: selectError } = await supabase
        .from('admin_settings')
        .select('id')
        .limit(1)
        .single();

      logger.debug('[GeneralSettings] Existing row:', { existing, selectError });

      if (existing) {
        const { data, error } = await supabase
          .from('admin_settings')
          .update(updateData)
          .eq('id', existing.id)
          .select();
        logger.debug('[GeneralSettings] Update result:', { data, error });
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('admin_settings')
          .insert(updateData)
          .select();
        logger.debug('[GeneralSettings] Insert result:', { data, error });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('General settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['settings', 'general'] });
      // Refresh global SettingsContext so all components get updated
      refreshSettings();
    },
    onError: (error) => {
      logger.error('Settings save error:', error);
      toast.error('Failed to save settings');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Icon name="spinner" size={30} className="animate-spin text-brand" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold text-content mb-4">Basic Information</h3>
        <p className="text-sm text-content-subtle mb-4">These settings appear in the Header, Footer, and throughout the site.</p>
        <div className="space-y-4">
          <Input
            label={
              <>
                Business Name <span className="text-xs text-brand">(Header &amp; Footer)</span>
              </>
            }
            type="text"
            value={formData.business_name}
            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
            placeholder="Raslipwani Properties"
          />

          <Input
            label={
              <>
                Company Tagline <span className="text-xs text-brand">(Header subtitle)</span>
              </>
            }
            type="text"
            value={formData.company_tagline}
            onChange={(e) => setFormData({ ...formData, company_tagline: e.target.value })}
            placeholder="Your Premier Real Estate Partner"
            hint="A short slogan that appears under your logo in the header"
          />

          <div className="flex items-end gap-2">
            <Input
              label={
                <>
                  Company Logo URL <span className="text-xs text-brand">(Header &amp; Footer)</span>
                </>
              }
              className="flex-1"
              type="url"
              value={formData.company_logo}
              onChange={(e) => setFormData({ ...formData, company_logo: e.target.value })}
              placeholder="https://example.com/logo.png"
              hint={formData.company_logo ? '✓ Custom logo set' : 'Using default logo — paste a URL above to change'}
            />
            <div className="flex-shrink-0 w-12 h-12 mb-6 border-2 border-line rounded-lg overflow-hidden bg-surface">
              <img
                src={formData.company_logo || 'https://res.cloudinary.com/dzqdxosk2/image/upload/v1751885050/Raslipwani_Logo_qgwaen.jpg'}
                alt="Logo preview"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://res.cloudinary.com/dzqdxosk2/image/upload/v1751885050/Raslipwani_Logo_qgwaen.jpg'; }}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-content mb-4">Contact Information</h3>
        <div className="space-y-4">
          <Input
            label="Business Email"
            type="email"
            value={formData.business_email}
            onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
            placeholder="info@raslipwani.com"
          />

          <Input
            label="Business Phone"
            type="tel"
            value={formData.business_phone}
            onChange={(e) => setFormData({ ...formData, business_phone: e.target.value })}
            placeholder="+254712345678"
          />

          <Input
            label="WhatsApp Number"
            type="tel"
            value={formData.whatsapp_number}
            onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
            placeholder="+254712345678"
            hint="Used for the WhatsApp chat button"
          />

          <Textarea
            label="Business Address"
            value={formData.business_address}
            onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
            rows={3}
            placeholder="Kilifi, Kenya"
          />

          <Textarea
            label="Service Locations"
            value={formData.service_locations}
            onChange={(e) => setFormData({ ...formData, service_locations: e.target.value })}
            rows={2}
            placeholder="Nairobi, Mombasa, Kilifi, Diani, Naivasha, Malindi"
            hint="Comma-separated list of locations you serve"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-content mb-4">Social Media</h3>
        <div className="space-y-4">
          <Input
            label="Facebook URL"
            type="url"
            value={formData.social_facebook}
            onChange={(e) => setFormData({ ...formData, social_facebook: e.target.value })}
            placeholder="https://facebook.com/raslipwani"
          />

          <Input
            label="Twitter URL"
            type="url"
            value={formData.social_twitter}
            onChange={(e) => setFormData({ ...formData, social_twitter: e.target.value })}
            placeholder="https://twitter.com/raslipwani"
          />

          <Input
            label="Instagram URL"
            type="url"
            value={formData.social_instagram}
            onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
            placeholder="https://instagram.com/raslipwani"
          />

          <Input
            label="LinkedIn URL"
            type="url"
            value={formData.social_linkedin}
            onChange={(e) => setFormData({ ...formData, social_linkedin: e.target.value })}
            placeholder="https://linkedin.com/company/raslipwani"
          />

          <Input
            label="TikTok URL"
            type="url"
            value={formData.social_tiktok}
            onChange={(e) => setFormData({ ...formData, social_tiktok: e.target.value })}
            placeholder="https://tiktok.com/@raslipwani"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-6 py-2 bg-brand text-content-on-brand rounded-md hover:bg-brand-hover transition disabled:opacity-50"
        >
          {updateMutation.isPending ? <Icon name="spinner" className="animate-spin" /> : <Icon name="save" />}
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default GeneralSettings;
