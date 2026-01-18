import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../utils/supabaseClient';
import { FaSave, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * AdvancedSettings - Maintenance mode and advanced configuration
 */
const AdvancedSettings = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    maintenanceEnabled: false,
    maintenanceMessage: 'We are currently performing maintenance. Please check back soon.',
    googleAnalytics: '',
    facebookPixel: '',
    termsUrl: '/terms',
    privacyUrl: '/privacy'
  });

  // Fetch settings
  const { isLoading } = useQuery({
    queryKey: ['settings', 'advanced'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('setting_category', 'advanced');

      if (error) throw error;

      data.forEach(setting => {
        if (setting.setting_key === 'maintenance_mode') {
          setFormData(prev => ({
            ...prev,
            maintenanceEnabled: setting.setting_value.enabled || false,
            maintenanceMessage: setting.setting_value.message || ''
          }));
        } else if (setting.setting_key === 'google_analytics') {
          setFormData(prev => ({
            ...prev,
            googleAnalytics: setting.setting_value.tracking_id || ''
          }));
        } else if (setting.setting_key === 'facebook_pixel') {
          setFormData(prev => ({
            ...prev,
            facebookPixel: setting.setting_value.pixel_id || ''
          }));
        } else if (setting.setting_key === 'terms_url') {
          setFormData(prev => ({
            ...prev,
            termsUrl: setting.setting_value.value || '/terms'
          }));
        } else if (setting.setting_key === 'privacy_url') {
          setFormData(prev => ({
            ...prev,
            privacyUrl: setting.setting_value.value || '/privacy'
          }));
        }
      });

      return data;
    }
  });

  // Update settings
  const updateMutation = useMutation({
    mutationFn: async (settings) => {
      const { error } = await supabase
        .from('admin_settings')
        .upsert([
          {
            setting_key: 'maintenance_mode',
            setting_value: {
              enabled: settings.maintenanceEnabled,
              message: settings.maintenanceMessage
            },
            setting_category: 'advanced'
          },
          {
            setting_key: 'google_analytics',
            setting_value: { tracking_id: settings.googleAnalytics },
            setting_category: 'advanced'
          },
          {
            setting_key: 'facebook_pixel',
            setting_value: { pixel_id: settings.facebookPixel },
            setting_category: 'advanced'
          },
          {
            setting_key: 'terms_url',
            setting_value: { value: settings.termsUrl },
            setting_category: 'advanced'
          },
          {
            setting_key: 'privacy_url',
            setting_value: { value: settings.privacyUrl },
            setting_category: 'advanced'
          }
        ], { onConflict: 'setting_key' });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Advanced settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['settings', 'advanced'] });
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Maintenance Mode */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Mode</h3>
        
        {formData.maintenanceEnabled && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
            <FaExclamationTriangle className="text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Warning: Maintenance mode is active</p>
              <p className="text-xs text-red-700 mt-1">Your website is currently in maintenance mode. Visitors will see the maintenance message.</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer bg-gray-50 p-4 rounded-lg">
            <input
              type="checkbox"
              checked={formData.maintenanceEnabled}
              onChange={(e) => setFormData({ ...formData, maintenanceEnabled: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Enable Maintenance Mode</span>
              <p className="text-sm text-gray-600">Put the website into maintenance mode</p>
            </div>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maintenance Message
            </label>
            <textarea
              value={formData.maintenanceMessage}
              onChange={(e) => setFormData({ ...formData, maintenanceMessage: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Message displayed to visitors during maintenance"
            />
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics & Tracking</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Analytics Tracking ID
            </label>
            <input
              type="text"
              value={formData.googleAnalytics}
              onChange={(e) => setFormData({ ...formData, googleAnalytics: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Add Google Analytics to track website traffic
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facebook Pixel ID
            </label>
            <input
              type="text"
              value={formData.facebookPixel}
              onChange={(e) => setFormData({ ...formData, facebookPixel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1234567890123456"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Add Facebook Pixel for conversion tracking
            </p>
          </div>
        </div>
      </div>

      {/* Legal Pages */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal Pages</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terms of Service URL
            </label>
            <input
              type="text"
              value={formData.termsUrl}
              onChange={(e) => setFormData({ ...formData, termsUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/terms"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Privacy Policy URL
            </label>
            <input
              type="text"
              value={formData.privacyUrl}
              onChange={(e) => setFormData({ ...formData, privacyUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/privacy"
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

export default AdvancedSettings;
