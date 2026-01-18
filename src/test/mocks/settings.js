/**
 * Mock data for settings used in tests
 */

export const mockSettings = {
  general: {
    site_name: { value: 'Raslipwani Properties' },
    company_logo: { value: 'https://example.com/logo.png' },
    contact_email: { value: 'info@raslipwani.com' },
    contact_phone: { value: '+254712345678' }
  },
  cloudinary: {
    cloud_name: { value: 'test-cloud' },
    api_key: { value: 'test-api-key' },
    api_secret: { value: 'test-api-secret', encrypted: true },
    upload_preset: { value: 'test-preset' }
  },
  email: {
    notifications: {
      new_booking: true,
      status_change: true,
      new_client: true,
      property_inquiry: true
    },
    recipients: { value: 'admin@raslipwani.com,manager@raslipwani.com' }
  },
  business_hours: {
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '10:00', close: '14:00', closed: false },
    sunday: { open: '00:00', close: '00:00', closed: true }
  },
  localization: {
    currency: { code: 'KES', symbol: 'KSh', position: 'before' },
    locale: { code: 'en-KE', dateFormat: 'DD/MM/YYYY', timeFormat: '24h' },
    timezone: { value: 'Africa/Nairobi' }
  },
  maintenance: {
    enabled: false,
    message: { value: 'We are currently performing maintenance. Please check back soon.' },
    whitelist: { value: ['127.0.0.1', '::1'] }
  }
};

export const mockSetting = {
  id: 1,
  setting_key: 'site_name',
  setting_value: { value: 'Raslipwani Properties' },
  setting_category: 'general',
  description: 'Website name',
  is_encrypted: false,
  updated_by: 'admin-123',
  updated_at: '2026-01-18T08:00:00Z',
  created_at: '2026-01-18T08:00:00Z'
};

export const mockEmailTemplate = {
  id: 1,
  template_key: 'booking_confirmation',
  subject: 'Booking Confirmation - {property_name}',
  body: '<p>Dear {customer_name},</p><p>Your booking for {property_name} on {appointment_date} has been confirmed.</p>',
  variables: ['customer_name', 'property_name', 'appointment_date'],
  created_at: '2026-01-18T08:00:00Z',
  updated_at: '2026-01-18T08:00:00Z'
};
