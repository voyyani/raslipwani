import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../utils/supabaseClient';
import { FaSave, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * GeneralSettings - General site configuration
 * Works with flat table structure (single row with columns)
 */
const GeneralSettings = () => {
  const queryClient = useQueryClient();
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
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // Parse service_locations if it's an array
        let locationsStr = 'Nairobi, Mombasa, Kilifi, Diani, Naivasha, Malindi, Watamu, Lamu';
        if (Array.isArray(data.service_locations) && data.service_locations.length > 0) {
          locationsStr = data.service_locations.join(', ');
        } else if (typeof data.service_locations === 'string' && data.service_locations) {
          locationsStr = data.service_locations;
        }

        setFormData({
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
        });
      }
      return data;
    }
  });

  // Update settings mutation (updates the single row)
  const updateMutation = useMutation({
    mutationFn: async (settings) => {
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

      // Try to update existing row, or insert if none exists
      const { data: existing } = await supabase
        .from('admin_settings')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('admin_settings')
          .update(updateData)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_settings')
          .insert(updateData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('General settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['settings', 'general'] });
    },
    onError: () => {
      toast.error('Failed to save settings');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Raslipwani Properties"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Tagline
            </label>
            <input
              type="text"
              value={formData.company_tagline}
              onChange={(e) => setFormData({ ...formData, company_tagline: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Premier Real Estate Partner"
            />
            <p className="text-xs text-gray-500 mt-1">A short slogan that appears under your logo</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Logo URL
            </label>
            <input
              type="url"
              value={formData.company_logo}
              onChange={(e) => setFormData({ ...formData, company_logo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/logo.png"
            />
            {formData.company_logo && (
              <img src={formData.company_logo} alt="Logo preview" className="mt-2 h-16 object-contain" />
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Email
            </label>
            <input
              type="email"
              value={formData.business_email}
              onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="info@raslipwani.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Phone
            </label>
            <input
              type="tel"
              value={formData.business_phone}
              onChange={(e) => setFormData({ ...formData, business_phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+254712345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+254712345678"
            />
            <p className="text-xs text-gray-500 mt-1">Used for the WhatsApp chat button</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Address
            </label>
            <textarea
              value={formData.business_address}
              onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kilifi, Kenya"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Locations
            </label>
            <textarea
              value={formData.service_locations}
              onChange={(e) => setFormData({ ...formData, service_locations: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nairobi, Mombasa, Kilifi, Diani, Naivasha, Malindi"
            />
            <p className="text-xs text-gray-500 mt-1">Comma-separated list of locations you serve</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facebook URL
            </label>
            <input
              type="url"
              value={formData.social_facebook}
              onChange={(e) => setFormData({ ...formData, social_facebook: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://facebook.com/raslipwani"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Twitter URL
            </label>
            <input
              type="url"
              value={formData.social_twitter}
              onChange={(e) => setFormData({ ...formData, social_twitter: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://twitter.com/raslipwani"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instagram URL
            </label>
            <input
              type="url"
              value={formData.social_instagram}
              onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://instagram.com/raslipwani"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={formData.social_linkedin}
              onChange={(e) => setFormData({ ...formData, social_linkedin: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://linkedin.com/company/raslipwani"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TikTok URL
            </label>
            <input
              type="url"
              value={formData.social_tiktok}
              onChange={(e) => setFormData({ ...formData, social_tiktok: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://tiktok.com/@raslipwani"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {updateMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default GeneralSettings;
