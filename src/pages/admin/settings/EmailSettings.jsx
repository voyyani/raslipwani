import React, { useState, useEffect } from 'react';
import Icon from '../../../components/Icon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsQueries, upsertSettingRows, updateEmailTemplate } from '@/services/settings';
import { queryKeys } from '@/services/queryKeys';
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
  const { data: rows, isLoading } = useQuery(settingsQueries.category('email'));

  useEffect(() => {
    if (!rows) return;
    rows.forEach(setting => {
      if (setting.setting_key === 'email_notifications') {
        setFormData(prev => ({ ...prev, ...setting.setting_value }));
      } else if (setting.setting_key === 'email_recipients') {
        setFormData(prev => ({ ...prev, recipients: setting.setting_value.value || '' }));
      }
    });
  }, [rows]);

  // Fetch email templates
  const { data: templates = [] } = useQuery(settingsQueries.emailTemplates());

  // Update settings
  const updateMutation = useMutation({
    mutationFn: async (settings) => {
      await upsertSettingRows([
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
      ]);
    },
    onSuccess: () => {
      toast.success('Email settings saved successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
    onError: () => {
      toast.error('Failed to save settings');
    }
  });

  // Update template
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, subject, body }) => {
      await updateEmailTemplate(id, { subject, body });
    },
    onSuccess: () => {
      toast.success('Template updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
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
    return <div className="flex justify-center py-8"><Icon name="spinner" size={30} className="animate-spin text-brand" /></div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Notification Preferences */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-content mb-4">Email Notification Preferences</h3>
          <div className="space-y-3 bg-surface p-4 rounded-lg">
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
                  className="w-5 h-5 text-brand rounded focus:ring-2 focus:ring-focus-ring"
                />
                <span className="text-content-muted">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <Input
          label="Email Recipients (comma-separated)"
          type="text"
          value={formData.recipients}
          onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
          placeholder="admin@raslipwani.com, manager@raslipwani.com"
          hint="Multiple email addresses can be added, separated by commas"
        />

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

      {/* Email Templates */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold text-content mb-4">Email Templates</h3>
        <div className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="bg-surface-raised border border-line rounded-lg p-4 flex justify-between items-center">
              <div>
                <h4 className="font-medium text-content">{template.template_name}</h4>
                <p className="text-sm text-content-muted mt-1">Subject: {template.subject}</p>
                {template.variables && template.variables.length > 0 && (
                  <p className="text-xs text-content-subtle mt-1">
                    Variables: {template.variables.map(v => `{${v}}`).join(', ')}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleEditTemplate(template)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-subtle text-brand rounded-md hover:bg-brand-subtle transition"
              >
                <Icon name="edit" /> Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Guarded at the call site: the body below reads `selectedTemplate`, and
          JSX evaluates children before `Modal` can decline to render them. */}
      {showTemplateEditor && selectedTemplate && (
        <Modal
          isOpen
          onClose={() => setShowTemplateEditor(false)}
          title={`Edit Template: ${selectedTemplate.template_name}`}
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowTemplateEditor(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveTemplate}
                loading={updateTemplateMutation.isPending}
                disabled={updateTemplateMutation.isPending}
              >
                {!updateTemplateMutation.isPending && <Icon name="save" size={16} />}
                Save Template
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Subject"
              value={templateContent.subject}
              onChange={(e) =>
                setTemplateContent({ ...templateContent, subject: e.target.value })
              }
            />

            <div>
              {/* ReactQuill renders its own contenteditable, so it cannot take
                  an id from `Field`; the label is associated by `aria-labelledby`
                  on the editor's container instead of by `htmlFor`. */}
              <p id="template-body-label" className="block mb-1.5 text-sm font-medium text-content">
                Body
              </p>
              <div aria-labelledby="template-body-label">
                <ReactQuill
                  theme="snow"
                  value={templateContent.body}
                  onChange={(value) => setTemplateContent({ ...templateContent, body: value })}
                  modules={modules}
                />
              </div>
            </div>

            {selectedTemplate.variables?.length > 0 && (
              <div className="bg-warning-subtle border border-warning-border rounded-lg p-3">
                <p className="text-sm font-medium text-warning-content mb-2">
                  Available Variables:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variables.map((variable) => (
                    <code
                      key={variable}
                      className="px-2 py-1 bg-warning-subtle text-warning-content rounded text-xs"
                    >
                      {`{${variable}}`}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EmailSettings;