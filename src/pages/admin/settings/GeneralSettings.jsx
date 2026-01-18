import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../utils/supabaseClient';
import { FaSave, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * GeneralSettings - General site configuration
 */
const GeneralSettings = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    site_name: '',
    company_logo: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: ''
  });

  // Fetch settings
  const { isLoading } = useQuery({
    queryKey: ['settings', 'general'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('setting_category', 'general');

      if (error) throw error;

      // Populate form with existing settings
      const settings = {};
      data.forEach(setting => {
        if (setting.setting_key === 'site_name') {
          settings.site_name = setting.setting_value.value || '';
        } else if (setting.setting_key === 'company_logo') {
          settings.company_logo = setting.setting_value.value || '';
        } else if (setting.setting_key === 'contact_email') {
          settings.contact_email = setting.setting_value.value || '';
        } else if (setting.setting_key === 'contact_phone') {
          settings.contact_phone = setting.setting_value.value || '';
        } else if (setting.setting_key === 'contact_address') {
          settings.contact_address = setting.setting_value.value || '';
        } else if (setting.setting_key === 'social_media') {
          settings.facebook = setting.setting_value.facebook || '';
          settings.twitter = setting.setting_value.twitter || '';
          settings.instagram = setting.setting_value.instagram || '';
          settings.linkedin = setting.setting_value.linkedin || '';
        }
      });

      setFormData(prev => ({ ...prev, ...settings }));
      return data;
    }
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (settings) => {
      const updates = [
        {
          setting_key: 'site_name',
          setting_value: { value: settings.site_name },
          setting_category: 'general'
        },
        {
          setting_key: 'company_logo',
          setting_value: { value: settings.company_logo },
          setting_category: 'general'
        },
        {
          setting_key: 'contact_email',
          setting_value: { value: settings.contact_email },
          setting_category: 'general'
        },
        {
          setting_key: 'contact_phone',
          setting_value: { value: settings.contact_phone },
          setting_category: 'general'
        },
        {
          setting_key: 'contact_address',
          setting_value: { value: settings.contact_address },
          setting_category: 'general'
        },
        {
          setting_key: 'social_media',
          setting_value: {
            facebook: settings.facebook,
            twitter: settings.twitter,
            instagram: settings.instagram,
            linkedin: settings.linkedin
          },
          setting_category: 'general'
        }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert(update, { onConflict: 'setting_key' });

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
              Site Name
            </label>
            <input
              type="text"
              value={formData.site_name}
              onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Raslipwani Properties"
            />
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
              Contact Email
            </label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="info@raslipwani.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+254712345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Physical Address
            </label>
            <textarea
              value={formData.contact_address}
              onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nairobi, Kenya"
            />
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
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
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
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
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
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
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
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://linkedin.com/company/raslipwani"
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
