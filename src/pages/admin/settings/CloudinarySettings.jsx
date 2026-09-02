import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../utils/supabaseClient';
import { FaSave, FaSpinner, FaCheckCircle, FaTimesCircle, FaCloudUploadAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useSettings } from '../../../hooks/useSettings';

import { logger } from '../../../utils/logger';
/**
 * CloudinarySettings - Cloudinary configuration for image uploads
 * Works with flat table structure (single row with columns)
 */
const CloudinarySettings = () => {
  const queryClient = useQueryClient();
  const { refreshSettings } = useSettings();
  const [formData, setFormData] = useState({
    cloud_name: 'dzqdxosk2',
    upload_preset: 'raslipwani_unsigned',
    cloudinary_api_key: '',
    cloudinary_api_secret: ''
  });
  const [testStatus, setTestStatus] = useState(null);

  // Fetch settings (single row with all columns)
  const { isLoading } = useQuery({
    queryKey: ['settings', 'cloudinary'],
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: async () => {
      logger.debug('[CloudinarySettings] Fetching settings...');
      const { data, error } = await supabase
        .from('admin_settings')
        .select('cloud_name, upload_preset, cloudinary_api_key, cloudinary_api_secret')
        .limit(1)
        .single();

      logger.debug('[CloudinarySettings] Fetch result:', { data, error });

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFormData({
          cloud_name: data.cloud_name || 'dzqdxosk2',
          upload_preset: data.upload_preset || 'raslipwani_unsigned',
          cloudinary_api_key: data.cloudinary_api_key || '',
          cloudinary_api_secret: data.cloudinary_api_secret || ''
        });
      }
      return data;
    }
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (settings) => {
      logger.debug('[CloudinarySettings] Saving settings:', settings);

      const updateData = {
        cloud_name: settings.cloud_name,
        upload_preset: settings.upload_preset,
        cloudinary_api_key: settings.cloudinary_api_key,
        cloudinary_api_secret: settings.cloudinary_api_secret,
        updated_at: new Date().toISOString()
      };

      const { data: existing, error: selectError } = await supabase
        .from('admin_settings')
        .select('id')
        .limit(1)
        .single();

      logger.debug('[CloudinarySettings] Existing row:', { existing, selectError });

      if (existing) {
        const { data, error } = await supabase
          .from('admin_settings')
          .update(updateData)
          .eq('id', existing.id)
          .select();
        logger.debug('[CloudinarySettings] Update result:', { data, error });
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('admin_settings')
          .insert(updateData)
          .select();
        logger.debug('[CloudinarySettings] Insert result:', { data, error });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Cloudinary settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['settings', 'cloudinary'] });
      refreshSettings();
    },
    onError: (error) => {
      logger.error('[CloudinarySettings] Save error:', error);
      toast.error('Failed to save settings: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleTestUpload = async () => {
    if (!formData.cloud_name || !formData.upload_preset) {
      toast.error('Please fill in cloud name and upload preset');
      return;
    }

    setTestStatus('testing');
    
    try {
      // Create a small test image (1x1 transparent PNG)
      const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      const formDataUpload = new FormData();
      formDataUpload.append('file', testImageBase64);
      formDataUpload.append('upload_preset', formData.upload_preset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${formData.cloud_name}/image/upload`,
        {
          method: 'POST',
          body: formDataUpload
        }
      );

      const result = await response.json();
      logger.debug('[CloudinarySettings] Test upload result:', result);

      if (result.secure_url) {
        setTestStatus('success');
        toast.success('Upload test successful! Cloudinary is configured correctly.');
      } else if (result.error) {
        setTestStatus('error');
        toast.error(`Upload failed: ${result.error.message}`);
      }
    } catch (error) {
      logger.error('Upload test failed:', error);
      setTestStatus('error');
      toast.error('Upload test failed - check your settings');
    }

    setTimeout(() => setTestStatus(null), 4000);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FaCloudUploadAlt className="text-blue-600 text-2xl mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">About Cloudinary</h4>
            <p className="text-sm text-blue-800">
              Configure your Cloudinary account for image uploads. Get your credentials from{' '}
              <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                Cloudinary Dashboard
              </a>
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cloud Name <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.cloud_name}
            onChange={(e) => setFormData({ ...formData, cloud_name: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your-cloud-name"
            required
          />
          {formData.cloud_name && (
            <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 rounded">
              ✓ Set
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Found in your Cloudinary Dashboard under "Cloud Name"
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload Preset <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.upload_preset}
            onChange={(e) => setFormData({ ...formData, upload_preset: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="unsigned_preset"
            required
          />
          {formData.upload_preset && (
            <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 rounded">
              ✓ Set
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Create an unsigned upload preset in Cloudinary Settings → Upload → Upload Presets
        </p>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Optional: API Credentials (for advanced features)</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="text"
              value={formData.cloudinary_api_key}
              onChange={(e) => setFormData({ ...formData, cloudinary_api_key: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123456789012345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Secret
            </label>
            <input
              type="password"
              value={formData.cloudinary_api_secret}
              onChange={(e) => setFormData({ ...formData, cloudinary_api_secret: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••••••••••••••"
            />
            <p className="text-xs text-gray-500 mt-1">
              Only needed for signed uploads and admin API features
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-4 border-t">
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
          onClick={handleTestUpload}
          disabled={testStatus === 'testing'}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
        >
          {testStatus === 'testing' && <FaSpinner className="animate-spin" />}
          {testStatus === 'success' && <FaCheckCircle />}
          {testStatus === 'error' && <FaTimesCircle />}
          {!testStatus && <FaCloudUploadAlt />}
          {testStatus === 'testing' ? 'Testing...' : 'Test Upload'}
        </button>
      </div>

      {/* Current config summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Configuration</h4>
        <div className="text-xs text-gray-600 space-y-1 font-mono">
          <p><span className="text-gray-500">Upload URL:</span> https://api.cloudinary.com/v1_1/<span className="text-blue-600">{formData.cloud_name || '[cloud_name]'}</span>/image/upload</p>
          <p><span className="text-gray-500">Preset:</span> <span className="text-blue-600">{formData.upload_preset || '[not set]'}</span></p>
          <p><span className="text-gray-500">API Key:</span> {formData.cloudinary_api_key ? '••••' + formData.cloudinary_api_key.slice(-4) : <span className="text-gray-400">[not set]</span>}</p>
        </div>
      </div>
    </form>
  );
};

export default CloudinarySettings;
