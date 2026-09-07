import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettingsByKeys, upsertSettingRows } from '@/services/settings';
import { queryKeys } from '@/services/queryKeys';
import { STALE_TIME } from '@/services/cachePolicy';
import toast from 'react-hot-toast';
import Icon from '../../../components/Icon';

// Module-level constant: the `useQuery`'s queryFn reads exactly these two
// keys. A literal array inline would be a fresh identity every render, which
// would defeat query-key memoisation if this were ever spread into a key.
const BUSINESS_HOURS_KEYS = ['business_hours', 'timezone'];

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

  /**
   * Fetch settings — by `setting_key`, with NO category filter. This is a
   * known asymmetry, not a fix-in-passing candidate: the write below stamps
   * `setting_category: 'business'` on both rows, but this read never filters
   * on category at all. That looks like a bug, and it may be one, but this is
   * a mechanical migration and the live `admin_settings` table cannot be
   * inspected from here — silently adding a category filter to "fix" it would
   * risk repointing an admin's saved business hours to a different row if the
   * live rows' actual category ever disagrees with 'business'. Reproduced
   * exactly as the original code read it. Flagged for a human with access to
   * the live table.
   */
  const { isLoading } = useQuery({
    queryKey: queryKeys.settings.keys(BUSINESS_HOURS_KEYS),
    staleTime: STALE_TIME.static,
    queryFn: async () => {
      const data = await getSettingsByKeys(BUSINESS_HOURS_KEYS);

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

  // Update settings — writes `setting_category: 'business'`, asymmetric with
  // the uncategorised read above. See the comment on the read.
  const updateMutation = useMutation({
    mutationFn: async () => {
      await upsertSettingRows([
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
      ]);
    },
    onSuccess: () => {
      toast.success('Business hours saved successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
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
    return <div className="flex justify-center py-8"><Icon name="spinner" size={30} className="animate-spin text-brand" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold text-content mb-4">Operating Hours</h3>
        <div className="space-y-4">
          {days.map(day => (
            <div key={day} className="flex items-center gap-4 bg-surface p-4 rounded-lg">
              <div className="w-28">
                <span className="font-medium text-content capitalize">{day}</span>
              </div>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={businessHours[day].closed}
                  onChange={(e) => handleDayChange(day, 'closed', e.target.checked)}
                  className="w-4 h-4 text-brand rounded focus:ring-2 focus:ring-focus-ring"
                />
                <span className="text-sm text-content-muted">Closed</span>
              </label>

              {!businessHours[day].closed && (
                <>
                  {/*
                    Hand-paired rather than routed through `Field`, which is the
                    default everywhere else in this console. `Field` stacks the
                    label above a full-width control; this is an inline
                    "Open: [time] Close: [time]" row inside a seven-row grid,
                    and stacking would break the alignment that makes the week
                    readable at a glance. The ids come from the loop's `day`
                    key, so they are unique by construction rather than by
                    someone remembering — which is the property `Field` exists
                    to guarantee.
                  */}
                  <div className="flex items-center gap-2">
                    <label htmlFor={`${day}-open`} className="text-sm text-content-muted">
                      Open:
                    </label>
                    <input
                      id={`${day}-open`}
                      type="time"
                      value={businessHours[day].open}
                      onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                      className="px-3 py-1 border border-line-strong rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor={`${day}-close`} className="text-sm text-content-muted">
                      Close:
                    </label>
                    <input
                      id={`${day}-close`}
                      type="time"
                      value={businessHours[day].close}
                      onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                      className="px-3 py-1 border border-line-strong rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-content mb-4">Timezone</h3>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-3 py-2 border border-line-strong rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
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
          className="flex items-center gap-2 px-6 py-2 bg-brand text-content-on-brand rounded-md hover:bg-brand-hover transition disabled:opacity-50"
        >
          {updateMutation.isPending ? <Icon name="spinner" className="animate-spin" /> : <Icon name="save" />}
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default BusinessHoursSettings;
