import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../utils/supabaseClient';
import { FaSave, FaSpinner, FaEnvelope, FaEdit, FaTimes } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';

/**
 * EmailSettings - Email notifications and template customization
 */
const EmailSettings = () => {
  const queryClient = useQueryClient();
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateContent, setTemplateContent] = useState({ subject: '', body: '' });
  const [formData, setFormData] = useState({
    new_booking: true,
    status_change: true,
    new_client: true,
    property_inquiry: true,
    system_alerts: true,
    recipients: ''
  });

  // Fetch settings
  const { isLoading } = useQuery({
    queryKey: ['settings', 'email'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('setting_category', 'email');

      if (error) throw error;

      data.forEach(setting => {
        if (setting.setting_key === 'email_notifications') {
          setFormData(prev => ({ ...prev, ...setting.setting_value }));
        } else if (setting.setting_key === 'email_recipients') {
          setFormData(prev => ({ ...prev, recipients: setting.setting_value.value || '' }));
        }
      });

      return data;
    }
  });

  // Fetch email templates
  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
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
            setting_key: 'email_notifications',
            setting_value: {
              new_booking: settings.new_booking,
              status_change: settings.status_change,
              new_client: settings.new_client,
              property_inquiry: settings.property_inquiry,
              system_alerts: settings.system_alerts
            },
            setting_category: 'email'
          },
          {
            setting_key: 'email_recipients',
            setting_value: { value: settings.recipients },
            setting_category: 'email'
          }
        ], { onConflict: 'setting_key' });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Email settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['settings', 'email'] });
    },
    onError: () => {
      toast.error('Failed to save settings');
    }
  });

  // Update template
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, subject, body }) => {
      const { error } = await supabase
        .from('email_templates')
        .update({ subject, body })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Template updated successfully');
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setShowTemplateEditor(false);
      setSelectedTemplate(null);
    },
    onError: () => {
      toast.error('Failed to update template');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setTemplateContent({ subject: template.subject, body: template.body });
    setShowTemplateEditor(true);
  };

  const handleSaveTemplate = () => {
    updateTemplateMutation.mutate({
      id: selectedTemplate.id,
      subject: templateContent.subject,
      body: templateContent.body
    });
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean']
    ]
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Notification Preferences */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notification Preferences</h3>
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            {[
              { key: 'new_booking', label: 'New Booking Notifications' },
              { key: 'status_change', label: 'Booking Status Changes' },
              { key: 'new_client', label: 'New Client Registrations' },
              { key: 'property_inquiry', label: 'Property Inquiries' },
              { key: 'system_alerts', label: 'System Alerts' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[key]}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Recipients (comma-separated)
          </label>
          <input
            type="text"
            value={formData.recipients}
            onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="admin@raslipwani.com, manager@raslipwani.com"
          />
          <p className="text-xs text-gray-500 mt-1">
            Multiple email addresses can be added, separated by commas
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
        </div>
      </form>

      {/* Email Templates */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Templates</h3>
        <div className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">{template.template_name}</h4>
                <p className="text-sm text-gray-600 mt-1">Subject: {template.subject}</p>
                {template.variables && template.variables.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Variables: {template.variables.map(v => `{${v}}`).join(', ')}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleEditTemplate(template)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition"
              >
                <FaEdit /> Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Template Editor Modal */}
      {showTemplateEditor && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Edit Template: {selectedTemplate.template_name}</h3>
              <button onClick={() => setShowTemplateEditor(false)} className="text-white hover:text-gray-200">
                <FaTimes size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={templateContent.subject}
                  onChange={(e) => setTemplateContent({ ...templateContent, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                <ReactQuill
                  theme="snow"
                  value={templateContent.body}
                  onChange={(value) => setTemplateContent({ ...templateContent, body: value })}
                  modules={modules}
                  className="bg-white"
                />
              </div>

              {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-900 mb-2">Available Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.variables.map(variable => (
                      <code key={variable} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                        {`{${variable}}`}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t bg-gray-50 p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowTemplateEditor(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={updateTemplateMutation.isPending}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {updateTemplateMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailSettings;