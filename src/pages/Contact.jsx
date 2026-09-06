import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { createBooking } from '@/services/bookings';
import { useSettings } from '../hooks/useSettings';
import { notifyBookingReceived } from '../utils/bookingNotifications';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';

import { logger } from '../utils/logger';
import Icon from '../components/Icon';
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

      await createBooking(record);

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
        <main className="flex-grow bg-gradient-to-b from-surface-raised to-surface">
          <section className="bg-gradient-to-r from-brand-hover to-primary py-24 md:py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-surface-inverse opacity-20"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-brand/10"></div>
            <div className="container mx-auto px-4 relative z-10 text-center text-content-on-brand">
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
                <span className="bg-surface-raised/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Nairobi</span>
                <span className="bg-surface-raised/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Mombasa</span>
                <span className="bg-surface-raised/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Kilifi</span>
                <span className="bg-surface-raised/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Malindi</span>
                <span className="bg-surface-raised/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Diani</span>
                <span className="bg-surface-raised/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Countrywide</span>
              </motion.div>
            </div>
          </section>
          
          {/* Quick Stats 
          <section className="py-12 bg-surface-raised">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-content-muted">Properties Listed</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-3xl font-bold text-primary">25+</div>
                  <div className="text-content-muted">Cities & Towns</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-3xl font-bold text-primary">10+</div>
                  <div className="text-content-muted">Years Experience</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="text-3xl font-bold text-primary">98%</div>
                  <div className="text-content-muted">Client Satisfaction</div>
                </motion.div>
              </div>
            </div>
          </section>*/}
          
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <motion.div 
                className="bg-surface-raised rounded-2xl shadow-xl overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Inquiry Type Tabs */}
                <div className="border-b border-line">
                  <div className="flex overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('general')}
                      className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                        activeTab === 'general'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-content-subtle hover:text-content'
                      }`}
                    >
                      <Icon name="envelope" className="mr-2" />
                      General Inquiry
                    </button>
                    <button
                      onClick={() => setActiveTab('buying')}
                      className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                        activeTab === 'buying'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-content-subtle hover:text-content'
                      }`}
                    >
                      <Icon name="home" className="mr-2" />
                      Buying
                    </button>
                    <button
                      onClick={() => setActiveTab('selling')}
                      className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                        activeTab === 'selling'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-content-subtle hover:text-content'
                      }`}
                    >
                      <Icon name="building" className="mr-2" />
                      Selling
                    </button>
                    <button
                      onClick={() => setActiveTab('investment')}
                      className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                        activeTab === 'investment'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-content-subtle hover:text-content'
                      }`}
                    >
                      <Icon name="city" className="mr-2" />
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
                    <p className="text-content-muted mb-6">
                      {activeTab === 'general' && 'Contact our Kenya-wide real estate experts for any inquiries'}
                      {activeTab === 'buying' && 'Tell us what you\'re looking for and we\'ll find the perfect match across Kenya'}
                      {activeTab === 'selling' && 'Get the best value for your property with our nationwide marketing reach'}
                      {activeTab === 'investment' && 'Discover lucrative real estate investment opportunities throughout Kenya'}
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

                      {(activeTab === 'buying' || activeTab === 'investment') && (
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
                        placeholder={
                          activeTab === 'general' ? "How can we help you?" :
                          activeTab === 'buying' ? "What type of property are you looking for?" :
                          activeTab === 'selling' ? "Tell us about your property" :
                          "What type of investment interests you?"
                        }
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
                        placeholder={
                          activeTab === 'general' ? "Tell us about your inquiry..." :
                          activeTab === 'buying' ? "Describe your ideal property and requirements..." :
                          activeTab === 'selling' ? "Provide details about your property..." :
                          "Tell us about your investment goals..."
                        }
                      />

                      <div className="pt-2">
                        <Button
                          type="submit"
                          size="lg"
                          loading={isSubmitting}
                          className="w-full md:w-auto"
                        >
                          {activeTab === 'general' ? 'Send Message' :
                           activeTab === 'buying' ? 'Find My Property' :
                           activeTab === 'selling' ? 'Get Property Valuation' :
                           'Explore Investments'}
                        </Button>
                      </div>
                    </form>
                  </div>
                  
                  <div className="bg-gradient-to-br from-brand-subtle to-surface p-6 md:p-10">
                    <h2 className="text-2xl font-bold text-primary mb-6">Kenya-Wide Real Estate Services</h2>
                    
                    <div className="space-y-6">
                      <motion.div 
                        className="flex bg-surface-raised p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        whileHover={{ x: 5 }}
                      >
                        <div className="bg-primary p-3 rounded-full text-content-on-brand mr-4 flex-shrink-0">
                          <Icon name="map" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-content mb-1">Nationwide Coverage</h3>
                          <p className="text-content-muted">
                            Properties across all major cities and regions in Kenya
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="bg-brand-subtle text-brand-content px-2 py-1 rounded text-xs">Nairobi</span>
                            <span className="bg-brand-subtle text-brand-content px-2 py-1 rounded text-xs">Coast</span>
                            <span className="bg-brand-subtle text-brand-content px-2 py-1 rounded text-xs">Rift Valley</span>
                            <span className="bg-brand-subtle text-brand-content px-2 py-1 rounded text-xs">Central</span>
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex bg-surface-raised p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        whileHover={{ x: 5 }}
                      >
                        <div className="bg-primary p-3 rounded-full text-content-on-brand mr-4 flex-shrink-0">
                          <Icon name="map-marker-alt" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-content mb-1">Head Office Location</h3>
                          <p className="text-content-muted">
                            {address()}<br />
                            <span className="text-sm text-content-subtle">Serving clients nationwide</span>
                          </p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex bg-surface-raised p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        whileHover={{ x: 5 }}
                      >
                        <div className="bg-primary p-3 rounded-full text-content-on-brand mr-4 flex-shrink-0">
                          <Icon name="phone" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-content mb-1">Phone Number</h3>
                          <p className="text-content-muted">
                            {phone()}
                          </p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex bg-surface-raised p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        whileHover={{ x: 5 }}
                      >
                        <div className="bg-primary p-3 rounded-full text-content-on-brand mr-4 flex-shrink-0">
                          <Icon name="envelope" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-content mb-1">Email Address</h3>
                          <p className="text-content-muted">
                            {email()}
                          </p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex bg-surface-raised p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        whileHover={{ x: 5 }}
                      >
                        <div className="bg-primary p-3 rounded-full text-content-on-brand mr-4 flex-shrink-0">
                          <Icon name="clock" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-content mb-1">Working Hours</h3>
                          <p className="text-content-muted">
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
                        <h3 className="font-semibold text-content mb-4">Areas We Serve Across Kenya</h3>
                        <div className="bg-surface-raised p-4 rounded-lg shadow-md">
                          <div className="aspect-w-16 aspect-h-9 bg-surface-sunken rounded-lg flex items-center justify-center">
                            <div className="text-center text-content-subtle">
                              <Icon name="map" size={36} className="mx-auto mb-2 text-primary" />
                              <p className="text-sm">Interactive Kenya Map</p>
                              <p className="text-xs text-content-subtle">Showing our coverage areas nationwide</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                              <span>Nairobi Region</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-brand rounded-full mr-2"></div>
                              <span>Coast Region</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-success-content rounded-full mr-2"></div>
                              <span>Rift Valley</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-warning-content rounded-full mr-2"></div>
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
          <section className="py-16 bg-gradient-to-r from-primary to-brand-hover">
            <div className="container mx-auto px-4 text-center text-content-on-brand">
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
                <button className="bg-surface-raised text-primary px-8 py-4 rounded-lg font-bold hover:bg-surface-sunken transition-colors shadow-lg">
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