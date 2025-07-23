import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
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
        <title>Contact Coastal Kenya Real Estate Experts | Raslipwani Properties</title>
        <meta name="description" content="Get in touch with our team in Kilifi for property inquiries, viewings, and investment consultations" />
        
        {/* Local Business Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            "name": "Raslipwani Properties",
            "image": "https://raslipwani.com/logo.png",
            "@id": "https://raslipwani.com",
            "url": "https://raslipwani.com",
            "telephone": "+254758066526",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Kikambala Road",
              "addressLocality": "Kilifi",
              "postalCode": "80108",
              "addressCountry": "KE"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-3.6308",
              "longitude": "39.8499"
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "08:00",
              "closes": "18:00"
            },
            "sameAs": [
              "https://www.facebook.com/raslipwani",
              "https://www.instagram.com/raslipwani",
              "https://twitter.com/raslipwani"
            ]
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
        <Header />
        
        <main className="flex-grow">
          <section className="bg-gradient-to-r from-blue-800 to-primary py-24 md:py-32 relative">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="container mx-auto px-4 relative z-10 text-center text-white">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Contact Coastal Kenya Real Estate Experts
              </motion.h1>
              <motion.p 
                className="text-xl max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Get personalized assistance for property inquiries, viewings, and investment opportunities
              </motion.p>
            </div>
          </section>
          
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <motion.div 
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-6 md:p-10">
                    <h2 className="text-2xl font-bold text-primary mb-6">Send Us a Message</h2>
                    
                    {success && (
                      <motion.div 
                        className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-start">
                          <FaCheck className="mt-1 mr-2 flex-shrink-0 text-green-500" />
                          <div>{success}</div>
                        </div>
                      </motion.div>
                    )}
                    
                    {error && (
                      <motion.div 
                        className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-start">
                          <FaExclamationTriangle className="mt-1 mr-2 flex-shrink-0 text-red-500" />
                          <div>{error}</div>
                        </div>
                      </motion.div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                            placeholder="Your full name"
                          />
                          {formErrors.name && (
                            <p className="mt-2 text-sm text-red-500 flex items-center">
                              <FaExclamationTriangle className="mr-1" /> {formErrors.name}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                            placeholder="your.email@example.com"
                          />
                          {formErrors.email && (
                            <p className="mt-2 text-sm text-red-500 flex items-center">
                              <FaExclamationTriangle className="mr-1" /> {formErrors.email}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="+254 700 000 000"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                            Subject
                          </label>
                          <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="How can we help?"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                          Your Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={5}
                          className={`w-full px-4 py-3 border ${formErrors.message ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                          placeholder="Tell us about your inquiry..."
                        ></textarea>
                        {formErrors.message && (
                          <p className="mt-2 text-sm text-red-500 flex items-center">
                            <FaExclamationTriangle className="mr-1" /> {formErrors.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="pt-2">
                        <motion.button
                          type="submit"
                          className="bg-gradient-to-r from-primary to-blue-700 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-primary transition-all shadow-md hover:shadow-lg w-full md:w-auto flex items-center justify-center font-medium"
                          disabled={isSubmitting}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </>
                          ) : 'Send Message'}
                        </motion.button>
                      </div>
                    </form>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-6 md:p-10">
                    <h2 className="text-2xl font-bold text-primary mb-6">Contact Information</h2>
                    
                    <div className="space-y-6">
                      <motion.div 
                        className="flex bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        whileHover={{ x: 5 }}
                      >
                        <div className="bg-primary p-3 rounded-full text-white mr-4 flex-shrink-0">
                          <FaMapMarkerAlt className="text-xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1">Our Location</h3>
                          <p className="text-gray-600">
                            Kikambala Road, Kilifi, Kenya
                          </p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        whileHover={{ x: 5 }}
                      >
                        <div className="bg-primary p-3 rounded-full text-white mr-4 flex-shrink-0">
                          <FaPhone className="text-xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1">Phone Number</h3>
                          <p className="text-gray-600">
                            +254758066526
                          </p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        whileHover={{ x: 5 }}
                      >
                        <div className="bg-primary p-3 rounded-full text-white mr-4 flex-shrink-0">
                          <FaEnvelope className="text-xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1">Email Address</h3>
                          <p className="text-gray-600">
                            info@raslipwani.co.ke<br />
                            raslipwani@gmail.com
                          </p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        whileHover={{ x: 5 }}
                      >
                        <div className="bg-primary p-3 rounded-full text-white mr-4 flex-shrink-0">
                          <FaClock className="text-xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1">Working Hours</h3>
                          <p className="text-gray-600">
                            Monday - Friday: 8:00 AM - 6:00 PM<br />
                            Saturday: 9:00 AM - 4:00 PM<br />
                            Sunday: Closed
                          </p>
                        </div>
                      </motion.div>
                      
                      {/* Google Map Embed */}
                      <motion.div 
                        className="mt-8 rounded-xl overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h3 className="font-semibold text-gray-800 mb-4">Our Office Location</h3>
                        <iframe 
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15918.21890246001!2d39.8499!3d-3.6308!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM8KwMzcnNTAuOCJTIDM5wrA1MCc1OS4xIkU!5e0!3m2!1sen!2ske!4v1620000000000!5m2!1sen!2ske"
                          width="100%"
                          height="250"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          title="Raslipwani Properties Location"
                          className="rounded-lg shadow-md"
                        ></iframe>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Contact;