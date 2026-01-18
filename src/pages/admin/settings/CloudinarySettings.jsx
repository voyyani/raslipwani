import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../utils/supabaseClient';
import { FaSave, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * CloudinarySettings - Cloudinary configuration for image uploads
 */
const CloudinarySettings = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    cloud_name: '',
    api_key: '',
    api_secret: '',
    upload_preset: ''
  });
  const [testStatus, setTestStatus] = useState(null);

  // Fetch settings
  const { isLoading } = useQuery({
    queryKey: ['settings', 'cloudinary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('setting_category', 'cloudinary');

      if (error) throw error;

      const settings = {};
      data.forEach(setting => {
        const key = setting.setting_key.replace('cloudinary_', '');
        settings[key] = setting.setting_value.value || '';
      });

      setFormData(prev => ({ ...prev, ...settings }));
      return data;
    }
  });

  // Update settings
  const updateMutation = useMutation({
    mutationFn: async (settings) => {
      const updates = [
        {
          setting_key: 'cloudinary_cloud_name',
          setting_value: { value: settings.cloud_name },
          setting_category: 'cloudinary'
        },
        {
          setting_key: 'cloudinary_api_key',
          setting_value: { value: settings.api_key },
          setting_category: 'cloudinary'
        },
        {
          setting_key: 'cloudinary_api_secret',
          setting_value: { value: settings.api_secret },
          setting_category: 'cloudinary',
          is_encrypted: true
        },
        {
          setting_key: 'cloudinary_upload_preset',
          setting_value: { value: settings.upload_preset },
          setting_category: 'cloudinary'
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
      toast.success('Cloudinary settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['settings', 'cloudinary'] });
    },
    onError: () => {
      toast.error('Failed to save settings');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleTestConnection = async () => {
    if (!formData.cloud_name || !formData.api_key) {
      toast.error('Please fill in cloud name and API key');
      return;
    }

    setTestStatus('testing');
    
    // Simple validation - check if cloud name is reachable
    try {
      const response = await fetch(`https://res.cloudinary.com/${formData.cloud_name}/image/upload/sample.jpg`, {
        method: 'HEAD'
      });
      
      if (response.ok || response.status === 404) {
        setTestStatus('success');
        toast.success('Connection successful!');
      } else {
        setTestStatus('error');
        toast.error('Connection failed');
      }
    } catch (error) {
      setTestStatus('error');
      toast.error('Connection failed');
    }

    setTimeout(() => setTestStatus(null), 3000);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">About Cloudinary</h4>
        <p className="text-sm text-blue-800">
          Configure your Cloudinary account for image uploads. Get your credentials from{' '}
          <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer" className="underline">
            Cloudinary Dashboard
          </a>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cloud Name *
        </label>
        <input
          type="text"
          value={formData.cloud_name}
          onChange={(e) => setFormData({ ...formData, cloud_name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="your-cloud-name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API Key *
        </label>
        <input
          type="text"
          value={formData.api_key}
          onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="123456789012345"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API Secret *
        </label>
        <input
          type="password"
          value={formData.api_secret}
          onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••••••••••••••"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          API secret is encrypted when stored
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload Preset
        </label>
        <input
          type="text"
          value={formData.upload_preset}
          onChange={(e) => setFormData({ ...formData, upload_preset: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="unsigned_preset"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional: Use an upload preset for pre-configured transformations
        </p>
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
        
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testStatus === 'testing'}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
        >
          {testStatus === 'testing' && <FaSpinner className="animate-spin" />}
          {testStatus === 'success' && <FaCheckCircle />}
          {testStatus === 'error' && <FaTimesCircle />}
          {!testStatus && 'Test Connection'}
          {testStatus === 'testing' && 'Testing...'}
          {testStatus === 'success' && 'Success!'}
          {testStatus === 'error' && 'Failed'}
        </button>
      </div>
    </form>
  );
};

export default CloudinarySettings;
