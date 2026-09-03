import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { useSettings } from '../hooks/useSettings';
import { notifyBookingReceived } from '../utils/bookingNotifications';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCheck, FaExclamationTriangle, FaBuilding, FaCity, FaHome, FaMap } from 'react-icons/fa';

import { logger } from '../utils/logger';
const Contact = () => {
  // Get settings
  const { phone, email, address, serviceLocations } = useSettings();
  // serviceLocations() returns array directly from settings
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    propertyType: '',
    location: '',
    budget: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState('general');
  
  const propertyTypes = [
    'Residential Homes',
    'Apartments & Condos',
    'Commercial Properties',
    'Land & Plots',
    'Luxury Villas',
    'Beach Properties',
    'Investment Properties'
  ];
  
  // serviceLocations() returns array directly
  const kenyaLocations = serviceLocations() || [
    'Nairobi',
    'Mombasa',
    'Kilifi',
    'Malindi',
    'Diani',
    'Watamu',
    'Lamu',
    'Naivasha',
    'Kisumu',
    'Nakuru',
    'Thika',
    'Countrywide'
  ];
  
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
        inquiry_type: activeTab,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('bookings').insert([record]);

      if (error) throw error;

      // Best-effort: the enquiry is already saved, so a mail outage must not
      // turn a successful submission into an error for the customer.
      await notifyBookingReceived(record);

      setSuccess('Thank you for your message! Our Kenya real estate experts will contact you within 24 hours.');
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        subject: '', 
        message: '',
        propertyType: '',
        location: '',
        budget: ''
      });
      
    } catch (err) {
      setError('Failed to submit your message. Please try again later.');
      logger.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Kenya Real Estate Experts | Nationwide Property Solutions</title>
        <meta name="description" content="Connect with Raslipwani Properties for real estate opportunities across Kenya. From Nairobi to Coast, find your perfect property with our expert team." />
        
        {/* Local Business Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            "name": "Raslipwani Properties",
            "image": "https://raslipwani.co.ke/logo.png",
            "@id": "https://raslipwani.co.ke",
            "url": "https://raslipwani.co.ke",
            "telephone": "+254758066526",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Kikambala Road",
              "addressLocality": "Kilifi",
              "postalCode": "80108",
              "addressCountry": "KE"
            },
            "areaServed": "Kenya",
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-3.6308",
              "longitude": "39.8499"
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
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
      
      <>
        <main className="flex-grow bg-gradient-to-b from-white to-gray-50">
          <section className="bg-gradient-to-r from-blue-800 to-primary py-24 md:py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-blue-600/10"></div>
            <div className="container mx-auto px-4 relative z-10 text-center text-white">
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Kenya Real Estate Experts
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl max-w-4xl mx-auto mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Your Gateway to Properties Across Kenya - From Nairobi to the Coast
              </motion.p>
              <motion.div 
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Nairobi</span>
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Mombasa</span>
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Kilifi</span>
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Malindi</span>
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Diani</span>
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Countrywide</span>
              </motion.div>
            </div>
          </section>
          
          {/* Quick Stats 
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-gray-600">Properties Listed</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-3xl font-bold text-primary">25+</div>
                  <div className="text-gray-600">Cities & Towns</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-3xl font-bold text-primary">10+</div>
                  <div className="text-gray-600">Years Experience</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="text-3xl font-bold text-primary">98%</div>
                  <div className="text-gray-600">Client Satisfaction</div>
                </motion.div>
              </div>
            </div>
          </section>*/}
          
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <motion.div 
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Inquiry Type Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('general')}
                      className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                        activeTab === 'general'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <FaEnvelope className="mr-2" />
                      General Inquiry
                    </button>
                    <button
                      onClick={() => setActiveTab('buying')}
                      className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                        activeTab === 'buying'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <FaHome className="mr-2" />
                      Buying
                    </button>
                    <button
                      onClick={() => setActiveTab('selling')}
                      className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                        activeTab === 'selling'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <FaBuilding className="mr-2" />
                      Selling
                    </button>
                    <button
                      onClick={() => setActiveTab('investment')}
                      className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                        activeTab === 'investment'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <FaCity className="mr-2" />
                      Investment
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-6 md:p-10">
                    <h2 className="text-2xl font-bold text-primary mb-2">
                      {activeTab === 'general' && 'Get in Touch'}
                      {activeTab === 'buying' && 'Find Your Dream Property'}
                      {activeTab === 'selling' && 'Sell Your Property'}
                      {activeTab === 'investment' && 'Investment Opportunities'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                      {activeTab === 'general' && 'Contact our Kenya-wide real estate experts for any inquiries'}
                      {activeTab === 'buying' && 'Tell us what you\'re looking for and we\'ll find the perfect match across Kenya'}
                      {activeTab === 'selling' && 'Get the best value for your property with our nationwide marketing reach'}
                      {activeTab === 'investment' && 'Discover lucrative real estate investment opportunities throughout Kenya'}
                    </p>
                    
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
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred Location in Kenya
                          </label>
                          <select
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="">Select Location</option>
                            {kenyaLocations.map(location => (
                              <option key={location} value={location}>{location}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      {(activeTab === 'buying' || activeTab === 'investment') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                              Property Type
                            </label>
                            <select
                              id="propertyType"
                              name="propertyType"
                              value={formData.propertyType}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              <option value="">Select Property Type</option>
                              {propertyTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                              Budget Range (KES)
                            </label>
                            <select
                              id="budget"
                              name="budget"
                              value={formData.budget}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              <option value="">Select Budget</option>
                              <option value="0-5M">0 - 5 Million</option>
                              <option value="5-10M">5 - 10 Million</option>
                              <option value="10-20M">10 - 20 Million</option>
                              <option value="20-50M">20 - 50 Million</option>
                              <option value="50M+">50 Million+</option>
                            </select>
                          </div>
                        </div>
                      )}
                      
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
                          placeholder={
                            activeTab === 'general' ? "How can we help you?" :
                            activeTab === 'buying' ? "What type of property are you looking for?" :
                            activeTab === 'selling' ? "Tell us about your property" :
                            "What type of investment interests you?"
                          }
                        />
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
                          placeholder={
                            activeTab === 'general' ? "Tell us about your inquiry..." :
                            activeTab === 'buying' ? "Describe your ideal property and requirements..." :
                            activeTab === 'selling' ? "Provide details about your property..." :
                            "Tell us about your investment goals..."
                          }
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
                          ) : (
                            activeTab === 'general' ? 'Send Message' :
                            activeTab === 'buying' ? 'Find My Property' :
                            activeTab === 'selling' ? 'Get Property Valuation' :
                            'Explore Investments'
                          )}
                        </motion.button>
                      </div>
                    </form>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-6 md:p-10">
                    <h2 className="text-2xl font-bold text-primary mb-6">Kenya-Wide Real Estate Services</h2>
                    
                    <div className="space-y-6">
                      <motion.div 
                        className="flex bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        whileHover={{ x: 5 }}
                      >
                        <div className="bg-primary p-3 rounded-full text-white mr-4 flex-shrink-0">
                          <FaMap className="text-xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1">Nationwide Coverage</h3>
                          <p className="text-gray-600">
                            Properties across all major cities and regions in Kenya
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Nairobi</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Coast</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Rift Valley</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Central</span>
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        whileHover={{ x: 5 }}
                      >
                        <div className="bg-primary p-3 rounded-full text-white mr-4 flex-shrink-0">
                          <FaMapMarkerAlt className="text-xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1">Head Office Location</h3>
                          <p className="text-gray-600">
                            {address()}<br />
                            <span className="text-sm text-gray-500">Serving clients nationwide</span>
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
                            {phone()}
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
                            {email()}
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
                      
                      {/* Kenya Map Embed */}
                      <motion.div 
                        className="mt-8 rounded-xl overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h3 className="font-semibold text-gray-800 mb-4">Areas We Serve Across Kenya</h3>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                          <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <FaMap className="text-4xl mx-auto mb-2 text-primary" />
                              <p className="text-sm">Interactive Kenya Map</p>
                              <p className="text-xs text-gray-400">Showing our coverage areas nationwide</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                              <span>Nairobi Region</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                              <span>Coast Region</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              <span>Rift Valley</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                              <span>Central Region</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="py-16 bg-gradient-to-r from-primary to-blue-800">
            <div className="container mx-auto px-4 text-center text-white">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Ready to Find Your Perfect Property in Kenya?
              </motion.h2>
              <motion.p 
                className="text-xl mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                From urban apartments in Nairobi to beach homes at the Coast, we have properties across Kenya to match your dreams.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button className="bg-white text-primary px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg">
                  Browse Kenya Properties
                </button>
              </motion.div>
            </div>
          </section>
        </main>
        
      </>
    </>
  );
};

export default Contact;