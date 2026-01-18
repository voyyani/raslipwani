import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../utils/supabaseClient';
import { FaSave, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * LocalizationSettings - Currency and locale configuration
 */
const LocalizationSettings = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    currencyCode: 'KES',
    currencySymbol: 'KSh',
    currencyPosition: 'before',
    decimals: 2,
    localeCode: 'en-KE',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  });

  // Fetch settings
  const { isLoading } = useQuery({
    queryKey: ['settings', 'localization'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('setting_category', 'localization');

      if (error) throw error;

      data.forEach(setting => {
        if (setting.setting_key === 'currency') {
          setFormData(prev => ({
            ...prev,
            currencyCode: setting.setting_value.code || 'KES',
            currencySymbol: setting.setting_value.symbol || 'KSh',
            currencyPosition: setting.setting_value.position || 'before',
            decimals: setting.setting_value.decimals || 2
          }));
        } else if (setting.setting_key === 'locale') {
          setFormData(prev => ({
            ...prev,
            localeCode: setting.setting_value.code || 'en-KE',
            dateFormat: setting.setting_value.dateFormat || 'DD/MM/YYYY',
            timeFormat: setting.setting_value.timeFormat || '24h'
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
            setting_key: 'currency',
            setting_value: {
              code: settings.currencyCode,
              symbol: settings.currencySymbol,
              position: settings.currencyPosition,
              decimals: parseInt(settings.decimals)
            },
            setting_category: 'localization'
          },
          {
            setting_key: 'locale',
            setting_value: {
              code: settings.localeCode,
              dateFormat: settings.dateFormat,
              timeFormat: settings.timeFormat
            },
            setting_category: 'localization'
          }
        ], { onConflict: 'setting_key' });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Localization settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['settings', 'localization'] });
    },
    onError: () => {
      toast.error('Failed to save settings');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  // Currency preview
  const currencyPreview = () => {
    const amount = 1234567.89;
    const formatted = amount.toFixed(formData.decimals);
    return formData.currencyPosition === 'before'
      ? `${formData.currencySymbol} ${formatted}`
      : `${formatted} ${formData.currencySymbol}`;
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency Settings</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency Code
              </label>
              <select
                value={formData.currencyCode}
                onChange={(e) => {
                  const code = e.target.value;
                  const symbols = { USD: '$', KES: 'KSh', GBP: '£', EUR: '€', AED: 'AED' };
                  setFormData({ ...formData, currencyCode: code, currencySymbol: symbols[code] || code });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="EUR">EUR - Euro</option>
                <option value="AED">AED - UAE Dirham</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="KSh"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Symbol Position
              </label>
              <select
                value={formData.currencyPosition}
                onChange={(e) => setFormData({ ...formData, currencyPosition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="before">Before amount ($ 100)</option>
                <option value="after">After amount (100 $)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Places
              </label>
              <select
                value={formData.decimals}
                onChange={(e) => setFormData({ ...formData, decimals: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">0 (1234)</option>
                <option value="2">2 (1234.56)</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-1">Preview:</p>
            <p className="text-xl font-bold text-blue-900">{currencyPreview()}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Locale & Format Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Locale
            </label>
            <select
              value={formData.localeCode}
              onChange={(e) => setFormData({ ...formData, localeCode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en-KE">English (Kenya)</option>
              <option value="en-US">English (United States)</option>
              <option value="en-GB">English (United Kingdom)</option>
              <option value="sw-KE">Swahili (Kenya)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Format
              </label>
              <select
                value={formData.dateFormat}
                onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (18/01/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (01/18/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-01-18)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Format
              </label>
              <select
                value={formData.timeFormat}
                onChange={(e) => setFormData({ ...formData, timeFormat: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="24h">24-hour (14:30)</option>
                <option value="12h">12-hour (2:30 PM)</option>
              </select>
            </div>
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

export default LocalizationSettings;
