import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../utils/supabaseClient';
import { FaSave, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * BusinessHoursSettings - Business hours configuration
 */
const BusinessHoursSettings = () => {
  const queryClient = useQueryClient();
  const [businessHours, setBusinessHours] = useState({
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '10:00', close: '14:00', closed: false },
    sunday: { open: '00:00', close: '00:00', closed: true }
  });
  const [timezone, setTimezone] = useState('Africa/Nairobi');

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Fetch settings
  const { isLoading } = useQuery({
    queryKey: ['settings', 'business'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .in('setting_key', ['business_hours', 'timezone']);

      if (error) throw error;

      data.forEach(setting => {
        if (setting.setting_key === 'business_hours') {
          setBusinessHours(setting.setting_value);
        } else if (setting.setting_key === 'timezone') {
          setTimezone(setting.setting_value.value);
        }
      });

      return data;
    }
  });

  // Update settings
  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_settings')
        .upsert([
          {
            setting_key: 'business_hours',
            setting_value: businessHours,
            setting_category: 'business'
          },
          {
            setting_key: 'timezone',
            setting_value: { value: timezone },
            setting_category: 'business'
          }
        ], { onConflict: 'setting_key' });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Business hours saved successfully');
      queryClient.invalidateQueries({ queryKey: ['settings', 'business'] });
    },
    onError: () => {
      toast.error('Failed to save settings');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleDayChange = (day, field, value) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h3>
        <div className="space-y-4">
          {days.map(day => (
            <div key={day} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="w-28">
                <span className="font-medium text-gray-900 capitalize">{day}</span>
              </div>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={businessHours[day].closed}
                  onChange={(e) => handleDayChange(day, 'closed', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Closed</span>
              </label>

              {!businessHours[day].closed && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Open:</label>
                    <input
                      type="time"
                      value={businessHours[day].open}
                      onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Close:</label>
                    <input
                      type="time"
                      value={businessHours[day].close}
                      onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Timezone</h3>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New York (EST/EDT)</option>
          <option value="Europe/London">Europe/London (GMT/BST)</option>
          <option value="Asia/Dubai">Asia/Dubai (GST)</option>
        </select>
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

export default BusinessHoursSettings;
