import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsQueries, saveSettingsRow } from '@/services/settings';
import { queryKeys } from '@/services/queryKeys';
import toast from 'react-hot-toast';
import { useSettings } from '../../../hooks/useSettings';

import { logger } from '../../../utils/logger';
import Icon from '../../../components/Icon';
import Input from '../../../components/ui/Input';
/**
 * CloudinarySettings - Cloudinary configuration for image uploads
 * Works with flat table structure (single row with columns)
 */
const CloudinarySettings = () => {
  const queryClient = useQueryClient();
  const { refreshSettings } = useSettings();
  const [formData, setFormData] = useState({
    cloud_name: 'dzqdxosk2',
    upload_preset: 'raslipwani_unsigned'
  });
  const [testStatus, setTestStatus] = useState(null);

  // Fetch settings — exactly the two Cloudinary columns, no category (see
  // getCloudinaryConfig's doc comment in src/services/settings.js)
  const { data, isLoading } = useQuery(settingsQueries.cloudinary());

  useEffect(() => {
    if (!data) return;
    setFormData({
      cloud_name: data.cloud_name || 'dzqdxosk2',
      upload_preset: data.upload_preset || 'raslipwani_unsigned'
    });
  }, [data]);

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (settings) => {
      logger.debug('[CloudinarySettings] Saving settings:', settings);

      const updateData = {
        cloud_name: settings.cloud_name,
        upload_preset: settings.upload_preset
      };

      await saveSettingsRow(updateData);
    },
    onSuccess: () => {
      toast.success('Cloudinary settings saved successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
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
    return <div className="flex justify-center py-8"><Icon name="spinner" size={30} className="animate-spin text-brand" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-brand-subtle border border-brand-subtle rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Icon name="cloud-upload-alt" size={24} className="text-brand mt-0.5" />
          <div>
            <h4 className="font-medium text-brand-content mb-2">About Cloudinary</h4>
            <p className="text-sm text-brand-content">
              Configure your Cloudinary account for image uploads. Get your credentials from{' '}
              <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                Cloudinary Dashboard
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Input
          label="Cloud Name"
          required
          className="flex-1"
          type="text"
          value={formData.cloud_name}
          onChange={(e) => setFormData({ ...formData, cloud_name: e.target.value })}
          placeholder="your-cloud-name"
          hint={'Found in your Cloudinary Dashboard under "Cloud Name"'}
        />
        {formData.cloud_name && (
          <span className="flex items-center mt-7 text-xs text-success-content bg-success-surface px-2 py-2.5 rounded">
            ✓ Set
          </span>
        )}
      </div>

      <div className="flex items-start gap-2">
        <Input
          label="Upload Preset"
          required
          className="flex-1"
          type="text"
          value={formData.upload_preset}
          onChange={(e) => setFormData({ ...formData, upload_preset: e.target.value })}
          placeholder="unsigned_preset"
          hint="Create an unsigned upload preset in Cloudinary Settings → Upload → Upload Presets"
        />
        {formData.upload_preset && (
          <span className="flex items-center mt-7 text-xs text-success-content bg-success-surface px-2 py-2.5 rounded">
            ✓ Set
          </span>
        )}
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-content-muted mb-1">API credentials</h4>
        <p className="text-xs text-content-subtle">
          The Cloudinary API key and secret are <strong>not</strong> configured here. They are
          server-side credentials, and <code>admin_settings</code> is readable with the public
          anon key &mdash; storing them in it would publish them to every visitor. Set
          <code> CLOUDINARY_API_KEY</code> and <code>CLOUDINARY_API_SECRET</code> in the hosting
          environment instead. Unsigned uploads, which is all this site performs, need only the
          cloud name and upload preset above.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-6 py-2 bg-brand text-content-on-media rounded-md hover:bg-brand-hover transition disabled:opacity-50"
        >
          {updateMutation.isPending ? <Icon name="spinner" className="animate-spin" /> : <Icon name="save" />}
          Save Changes
        </button>

        <button
          type="button"
          onClick={handleTestUpload}
          disabled={testStatus === 'testing'}
          className="flex items-center gap-2 px-4 py-2 bg-success-content text-content-on-media rounded-md hover:bg-success-content transition disabled:opacity-50"
        >
          {testStatus === 'testing' && <Icon name="spinner" className="animate-spin" />}
          {testStatus === 'success' && <Icon name="check-circle" />}
          {testStatus === 'error' && <Icon name="times-circle" />}
          {!testStatus && <Icon name="cloud-upload-alt" />}
          {testStatus === 'testing' ? 'Testing...' : 'Test Upload'}
        </button>
      </div>

      {/* Current config summary */}
      <div className="mt-6 p-4 bg-surface rounded-lg">
        <h4 className="text-sm font-medium text-content-muted mb-2">Current Configuration</h4>
        <div className="text-xs text-content-muted space-y-1 font-mono">
          <p><span className="text-content-subtle">Upload URL:</span> https://api.cloudinary.com/v1_1/<span className="text-blue-600">{formData.cloud_name || '[cloud_name]'}</span>/image/upload</p>
          <p><span className="text-content-subtle">Preset:</span> <span className="text-brand">{formData.upload_preset || '[not set]'}</span></p>
        </div>
      </div>
    </form>
  );
};

export default CloudinarySettings;
