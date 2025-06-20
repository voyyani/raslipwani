import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../utils/supabaseClient';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
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
      const { error } = await supabase
        .from('bookings')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          notes: formData.message,
          type: 'contact',
          status: 'pending',
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      setSuccess('Thank you for your message! We will contact you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      
    } catch (err) {
      setError('Failed to submit your message. Please try again later.');
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Raslipwani Properties</title>
        <meta name="description" content="Get in touch with our team" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow">
          <section className="bg-gradient-to-r from-blue-700 to-primary py-16">
            <div className="container mx-auto px-4 text-center text-white">
              <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
              <p className="text-xl max-w-3xl mx-auto">
                Get in touch with our team for any inquiries or assistance
              </p>
            </div>
          </section>
          
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-primary mb-6">Send Us a Message</h2>
                    
                    {success && (
                      <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
                        <div className="flex items-start">
                          <FaCheck className="mt-1 mr-2 flex-shrink-0 text-green-500" />
                          <div>{success}</div>
                        </div>
                      </div>
                    )}
                    
                    {error && (
                      <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                        <div className="flex items-start">
                          <FaExclamationTriangle className="mt-1 mr-2 flex-shrink-0 text-red-500" />
                          <div>{error}</div>
                        </div>
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            required
                          />
                          {formErrors.name && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <FaExclamationTriangle className="mr-1" /> {formErrors.name}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            required
                          />
                          {formErrors.email && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <FaExclamationTriangle className="mr-1" /> {formErrors.email}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                            Subject
                          </label>
                          <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                          Your Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={5}
                          className={`w-full px-4 py-2 border ${formErrors.message ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          required
                        ></textarea>
                        {formErrors.message && (
                          <p className="mt-1 text-sm text-red-500 flex items-center">
                            <FaExclamationTriangle className="mr-1" /> {formErrors.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-primary to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-primary transition-all shadow-md hover:shadow-lg w-full md:w-auto flex items-center justify-center"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                              Sending...
                            </>
                          ) : 'Send Message'}
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-primary mb-6">Contact Information</h2>
                    
                    <div className="space-y-6">
                      <div className="flex">
                        <div className="bg-primary p-3 rounded-full text-white mr-4 flex-shrink-0">
                          <FaMapMarkerAlt className="text-xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Our Location</h3>
                          <p className="text-gray-600 mt-1">
                            123 Real Estate Avenue<br />
                            Nairobi, Kenya
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="bg-primary p-3 rounded-full text-white mr-4 flex-shrink-0">
                          <FaPhone className="text-xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Phone Number</h3>
                          <p className="text-gray-600 mt-1">
                            +254 712 345 678<br />
                            +254 734 567 890
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="bg-primary p-3 rounded-full text-white mr-4 flex-shrink-0">
                          <FaEnvelope className="text-xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Email Address</h3>
                          <p className="text-gray-600 mt-1">
                            info@raslipwani.com<br />
                            support@raslipwani.com
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="bg-primary p-3 rounded-full text-white mr-4 flex-shrink-0">
                          <FaClock className="text-xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Working Hours</h3>
                          <p className="text-gray-600 mt-1">
                            Monday - Friday: 8:00 AM - 6:00 PM<br />
                            Saturday: 9:00 AM - 4:00 PM<br />
                            Sunday: Closed
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-10">
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Contact;