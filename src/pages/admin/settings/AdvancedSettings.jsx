import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabaseClient';
import toast from 'react-hot-toast';
import Icon from '../../../components/Icon';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import Checkbox from '../../../components/ui/Checkbox';

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
    return <div className="flex justify-center py-8"><Icon name="spinner" size={30} className="animate-spin text-brand" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Maintenance Mode */}
      <div>
        <h3 className="text-lg font-semibold text-content mb-4">Maintenance Mode</h3>
        
        {formData.maintenanceEnabled && (
          <div className="bg-danger-surface border border-danger-border rounded-lg p-4 mb-4 flex items-start gap-3">
            <Icon name="exclamation-triangle" className="text-danger-content mt-0.5" />
            <div>
              <p className="text-sm font-medium text-danger-content">Warning: Maintenance mode is active</p>
              <p className="text-xs text-danger-content mt-1">Your website is currently in maintenance mode. Visitors will see the maintenance message.</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer bg-surface p-4 rounded-lg">
            <input
              type="checkbox"
              checked={formData.maintenanceEnabled}
              onChange={(e) => setFormData({ ...formData, maintenanceEnabled: e.target.checked })}
              className="w-5 h-5 text-brand rounded focus:ring-2 focus:ring-focus-ring"
            />
            <div>
              <span className="font-medium text-content">Enable Maintenance Mode</span>
              <p className="text-sm text-content-muted">Put the website into maintenance mode</p>
            </div>
          </label>

          <Textarea
            label="Maintenance Message"
            value={formData.maintenanceMessage}
            onChange={(e) => setFormData({ ...formData, maintenanceMessage: e.target.value })}
            rows={3}
            placeholder="Message displayed to visitors during maintenance"
          />
        </div>
      </div>

      {/* Analytics */}
      <div>
        <h3 className="text-lg font-semibold text-content mb-4">Analytics & Tracking</h3>
        <div className="space-y-4">
          <Input
            label="Google Analytics Tracking ID"
            type="text"
            value={formData.googleAnalytics}
            onChange={(e) => setFormData({ ...formData, googleAnalytics: e.target.value })}
            placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
            hint="Optional: Add Google Analytics to track website traffic"
          />

          <Input
            label="Facebook Pixel ID"
            type="text"
            value={formData.facebookPixel}
            onChange={(e) => setFormData({ ...formData, facebookPixel: e.target.value })}
            placeholder="1234567890123456"
            hint="Optional: Add Facebook Pixel for conversion tracking"
          />
        </div>
      </div>

      {/* Legal Pages */}
      <div>
        <h3 className="text-lg font-semibold text-content mb-4">Legal Pages</h3>
        <div className="space-y-4">
          <Input
            label="Terms of Service URL"
            type="text"
            value={formData.termsUrl}
            onChange={(e) => setFormData({ ...formData, termsUrl: e.target.value })}
            placeholder="/terms"
          />

          <Input
            label="Privacy Policy URL"
            type="text"
            value={formData.privacyUrl}
            onChange={(e) => setFormData({ ...formData, privacyUrl: e.target.value })}
            placeholder="/privacy"
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

export default AdvancedSettings;
