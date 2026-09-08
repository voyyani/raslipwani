import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { createBooking } from '@/services/bookings';
import { useSettings } from '../../hooks/useSettings';
import { notifyBookingReceived } from '../../utils/bookingNotifications';
import { logger } from '../../utils/logger';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Icon from '../../components/Icon';
import { PROPERTY_TYPES, DEFAULT_LOCATIONS, COPY } from './contactContent';

const EMPTY_FORM = {
  name: '', email: '', phone: '', subject: '', message: '',
  propertyType: '', location: '', budget: '',
};

/**
 * The enquiry form on the contact page, with its own state, its own validation
 * and the write behind it. Moved out of `Contact.jsx` (Task 26); the page keeps
 * only which tab is selected, which arrives here as `inquiryType` and picks the
 * copy above.
 */
const ContactForm = ({ inquiryType, onSubmitted }) => {
  const { serviceLocations } = useSettings();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const copy = COPY[inquiryType] ?? COPY.general;
  const propertyTypes = PROPERTY_TYPES;
  // serviceLocations() returns the array directly from settings
  const kenyaLocations = serviceLocations() || DEFAULT_LOCATIONS;

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    if (!formData.message.trim()) errors.message = 'Message is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Save to bookings table
      const record = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        notes: formData.message,
        property_type: formData.propertyType,
        location: formData.location,
        budget: formData.budget,
        type: 'contact',
        inquiry_type: inquiryType,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      await createBooking(record);

      // Best-effort: the enquiry is already saved, so a mail outage must not
      // turn a successful submission into an error for the customer.
      await notifyBookingReceived(record);

      setSuccess('Thank you for your message! Our Kenya real estate experts will contact you within 24 hours.');
      setFormData(EMPTY_FORM);
      onSubmitted();
    } catch (err) {
      setError('Failed to submit your message. Please try again later.');
      logger.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10">
    <h2 className="text-2xl font-bold text-primary mb-2">
      {copy.heading}
    </h2>
    <p className="text-content-muted mb-6">
      {copy.intro}
    </p>

    {success && (
      <motion.div 
        className="mb-6 p-4 rounded-lg bg-success-surface border border-success-border text-success-content"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start">
          <Icon name="check" className="mt-1 mr-2 flex-shrink-0 text-success-content" />
          <div>{success}</div>
        </div>
      </motion.div>
    )}

    {error && (
      <motion.div 
        className="mb-6 p-4 rounded-lg bg-danger-surface border border-danger-border text-danger-content"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start">
          <Icon name="exclamation-triangle" className="mt-1 mr-2 flex-shrink-0 text-danger-content" />
          <div>{error}</div>
        </div>
      </motion.div>
    )}

    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          type="text"
          id="name"
          name="name"
          label="Full Name"
          required
          value={formData.name}
          onChange={handleChange}
          error={formErrors.name}
          placeholder="Your full name"
        />

        <Input
          type="email"
          id="email"
          name="email"
          label="Email Address"
          required
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
          placeholder="your.email@example.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          type="tel"
          id="phone"
          name="phone"
          label="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+254 700 000 000"
        />

        <Select
          id="location"
          name="location"
          label="Preferred Location in Kenya"
          value={formData.location}
          onChange={handleChange}
        >
          <option value="">Select Location</option>
          {kenyaLocations.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </Select>
      </div>

      {copy.showPropertyPreferences && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            id="propertyType"
            name="propertyType"
            label="Property Type"
            value={formData.propertyType}
            onChange={handleChange}
          >
            <option value="">Select Property Type</option>
            {propertyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>

          <Select
            id="budget"
            name="budget"
            label="Budget Range (KES)"
            value={formData.budget}
            onChange={handleChange}
          >
            <option value="">Select Budget</option>
            <option value="0-5M">0 - 5 Million</option>
            <option value="5-10M">5 - 10 Million</option>
            <option value="10-20M">10 - 20 Million</option>
            <option value="20-50M">20 - 50 Million</option>
            <option value="50M+">50 Million+</option>
          </Select>
        </div>
      )}

      <Input
        type="text"
        id="subject"
        name="subject"
        label="Subject"
        value={formData.subject}
        onChange={handleChange}
        placeholder={copy.subjectPlaceholder}
      />

      <Textarea
        id="message"
        name="message"
        label="Your Message"
        required
        rows={5}
        value={formData.message}
        onChange={handleChange}
        error={formErrors.message}
        placeholder={copy.messagePlaceholder}
      />

      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="w-full md:w-auto"
        >
          {copy.submit}
        </Button>
      </div>
    </form>
    </div>
  );
};

ContactForm.propTypes = {
  inquiryType: PropTypes.string.isRequired,
  onSubmitted: PropTypes.func.isRequired,
};

export default ContactForm;
