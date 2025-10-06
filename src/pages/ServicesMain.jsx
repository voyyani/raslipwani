import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../utils/supabaseClient';

const ServicesMain = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    notes: '',
    serviceType: 'viewing',
    propertyId: '',
    viewingType: 'physical'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch properties from Supabase
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoadingProperties(false);
      }
    };

    if (activeModal === 'viewing') {
      fetchProperties();
    }
  }, [activeModal]);

  const services = [
    {
      icon: '🏠',
      title: 'Property Sales',
      description: 'Maximize your property value with our comprehensive sales strategy',
      features: ['Professional Marketing', 'Market Analysis', 'Negotiation Support', 'Legal Guidance'],
      price: 'Commission Based'
    },
    {
      icon: '💰',
      title: 'Property Acquisition',
      description: 'Find your perfect property with expert guidance across Kenya',
      features: ['Property Search', 'Due Diligence', 'Price Negotiation', 'Investment Analysis'],
      price: 'Fixed Fee'
    },
    {
      icon: '📊',
      title: 'Property Valuation',
      description: 'Accurate market valuation for informed investment decisions',
      features: ['Market Analysis', 'Comparative Pricing', 'Investment Potential', 'Detailed Report'],
      price: 'From KES 5,000'
    },
    {
      icon: '🏢',
      title: 'Property Management',
      description: 'Complete management solutions for property owners',
      features: ['Tenant Management', 'Rent Collection', 'Maintenance', 'Financial Reporting'],
      price: '8-12% Monthly'
    }
  ];

  const serviceTypes = [
    { value: 'viewing', label: 'Property Viewing', description: 'Schedule a viewing for any property' },
    { value: 'valuation', label: 'Property Valuation', description: 'Get professional property valuation' },
    { value: 'consultation', label: 'Investment Consultation', description: 'Expert investment advice' },
    { value: 'management', label: 'Management Inquiry', description: 'Property management services' }
  ];

  const viewingTypes = [
    { 
      type: "physical", 
      title: "In-Person Viewing", 
      description: "Personalized tour with our agent",
      duration: "1 hour",
      icon: "👥"
    },
    { 
      type: "virtual", 
      title: "Virtual Tour", 
      description: "Live video walkthrough",
      duration: "30 minutes",
      icon: "📱"
    }
  ];

  const faqs = [
    {
      question: "How quickly can I schedule a property viewing?",
      answer: "We can schedule viewings within 24 hours. For urgent viewings, we offer same-day appointments based on agent availability."
    },
    {
      question: "Do you provide virtual tours for all properties?",
      answer: "Yes, we offer virtual tours for all our listed properties. This allows you to get a feel for the property before scheduling an in-person viewing."
    },
    {
      question: "What areas in Kenya do you serve?",
      answer: "We serve the entire Kenyan market with expertise in Nairobi, Mombasa, Coast Region, Central Kenya, and major urban centers."
    },
    {
      question: "Can I get a property valuation without visiting the property?",
      answer: "Yes, we offer remote valuations using market data, comparable properties, and digital tools. For the most accurate valuation, we recommend an in-person assessment."
    },
    {
      question: "What's included in your investment consultation?",
      answer: "Our consultation includes market analysis, investment strategy, property recommendations, ROI projections, and legal considerations for Kenyan real estate."
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save booking to Supabase
      const { error } = await supabase
        .from('bookings')
        .insert([{
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
          service_type: bookingData.serviceType,
          property_id: bookingData.propertyId,
          viewing_type: bookingData.viewingType,
          preferred_date: bookingData.date,
          preferred_time: bookingData.time,
          notes: bookingData.notes,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      alert("Thank you for your booking! Our team will contact you within 2 hours to confirm.");
      
      // Reset form
      setBookingData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        notes: '',
        serviceType: 'viewing',
        propertyId: '',
        viewingType: 'physical'
      });
      setActiveModal(null);
      setCurrentStep(1);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to submit booking. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openBookingModal = (serviceType = 'viewing') => {
    setBookingData(prev => ({ ...prev, serviceType }));
    setActiveModal('booking');
  };

  const closeModal = () => {
    setActiveModal(null);
    setCurrentStep(1);
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Helmet>
        <title>Premium Real Estate Services Across Kenya | Raslipwani Properties</title>
        <meta
          name="description"
          content="Book property viewings, valuations, and consultations across Kenya. Expert real estate services in Nairobi, Mombasa, Coast Region and beyond."
        />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        
        {/* Booking Modal */}
        <AnimatePresence>
          {activeModal === 'booking' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-primary">Book Your Service</h2>
                      <p className="text-gray-600 text-sm mt-1">Step {currentStep} of {bookingData.serviceType === 'viewing' ? 4 : 3}</p>
                    </div>
                    <button 
                      onClick={closeModal}
                      className="text-gray-500 hover:text-primary text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between mb-2">
                      {[1, 2, 3, 4].slice(0, bookingData.serviceType === 'viewing' ? 4 : 3).map(step => (
                        <div key={step} className={`flex-1 h-2 rounded-full mx-1 ${
                          step <= currentStep ? 'bg-primary' : 'bg-gray-200'
                        }`}></div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Service Selection */}
                    {currentStep === 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div>
                          <label className="block text-gray-700 mb-4 font-medium text-lg">What service do you need?</label>
                          <div className="grid gap-4">
                            {serviceTypes.map(service => (
                              <label 
                                key={service.value} 
                                className={`flex items-start p-6 border-2 rounded-xl cursor-pointer transition-all ${
                                  bookingData.serviceType === service.value 
                                    ? 'border-primary bg-blue-50 shadow-md' 
                                    : 'border-gray-200 hover:border-primary hover:shadow-sm'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="serviceType"
                                  value={service.value}
                                  checked={bookingData.serviceType === service.value}
                                  onChange={(e) => setBookingData(prev => ({ ...prev, serviceType: e.target.value }))}
                                  className="mt-1 mr-4 text-primary focus:ring-primary"
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 text-lg">{service.label}</h4>
                                  <p className="text-gray-600 mt-1">{service.description}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={nextStep}
                            className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
                          >
                            Continue
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Property Selection (Only for viewing service) */}
                    {currentStep === 2 && bookingData.serviceType === 'viewing' && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div>
                          <label className="block text-gray-700 mb-4 font-medium text-lg">Select a Property to View</label>
                          
                          {loadingProperties ? (
                            <div className="text-center py-12">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                              <p className="text-gray-600 mt-4">Loading available properties...</p>
                            </div>
                          ) : properties.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl">
                              <p className="text-gray-600">No properties currently available for viewing.</p>
                              <p className="text-sm text-gray-500 mt-2">Please contact us for upcoming listings.</p>
                            </div>
                          ) : (
                            <div className="grid gap-4 max-h-96 overflow-y-auto">
                              {properties.map(property => (
                                <label 
                                  key={property.id}
                                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    bookingData.propertyId === property.id 
                                      ? 'border-primary bg-blue-50' 
                                      : 'border-gray-200 hover:border-primary'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="propertyId"
                                    value={property.id}
                                    checked={bookingData.propertyId === property.id}
                                    onChange={(e) => setBookingData(prev => ({ ...prev, propertyId: e.target.value }))}
                                    className="mt-1 mr-4 text-primary"
                                  />
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-semibold text-gray-800">{property.title}</h4>
                                        <p className="text-gray-600 text-sm">{property.location}</p>
                                      </div>
                                      <span className="font-bold text-primary">
                                        {property.price ? formatCurrency(property.price) : 'Price on request'}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                                      {property.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {property.bedrooms && <span className="text-xs bg-gray-100 px-2 py-1 rounded">🛏 {property.bedrooms} beds</span>}
                                      {property.bathrooms && <span className="text-xs bg-gray-100 px-2 py-1 rounded">🚿 {property.bathrooms} baths</span>}
                                      {property.size && <span className="text-xs bg-gray-100 px-2 py-1 rounded">📐 {property.size} sqft</span>}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between">
                          <button
                            type="button"
                            onClick={prevStep}
                            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={nextStep}
                            disabled={!bookingData.propertyId}
                            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Continue
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2/3: Service Options */}
                    {(currentStep === (bookingData.serviceType === 'viewing' ? 3 : 2)) && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        {bookingData.serviceType === 'viewing' ? (
                          <div>
                            <label className="block text-gray-700 mb-4 font-medium text-lg">Viewing Type</label>
                            <div className="grid gap-4">
                              {viewingTypes.map(option => (
                                <label 
                                  key={option.type} 
                                  className={`flex items-start p-6 border-2 rounded-xl cursor-pointer transition-all ${
                                    bookingData.viewingType === option.type 
                                      ? 'border-primary bg-blue-50' 
                                      : 'border-gray-200 hover:border-primary'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="viewingType"
                                    value={option.type}
                                    checked={bookingData.viewingType === option.type}
                                    onChange={(e) => setBookingData(prev => ({ ...prev, viewingType: e.target.value }))}
                                    className="mt-1 mr-4 text-primary"
                                  />
                                  <div className="flex items-center">
                                    <span className="text-3xl mr-4">{option.icon}</span>
                                    <div>
                                      <h4 className="font-semibold text-gray-800 text-lg">{option.title}</h4>
                                      <p className="text-gray-600">{option.description}</p>
                                      <p className="text-sm text-primary font-medium mt-1">{option.duration}</p>
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-gray-700 mb-4 font-medium text-lg">Service Details</label>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                              <h4 className="font-semibold text-primary text-lg mb-2">
                                {serviceTypes.find(s => s.value === bookingData.serviceType)?.label}
                              </h4>
                              <p className="text-gray-700">
                                {bookingData.serviceType === 'valuation' 
                                  ? 'We will contact you to discuss your valuation needs and schedule an assessment.'
                                  : bookingData.serviceType === 'consultation'
                                  ? 'Our expert will prepare a personalized consultation based on your investment goals.'
                                  : 'We will discuss your property management requirements and create a tailored solution.'
                                }
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <button
                            type="button"
                            onClick={prevStep}
                            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={nextStep}
                            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                          >
                            Continue
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3/4: Personal Details */}
                    {(currentStep === (bookingData.serviceType === 'viewing' ? 4 : 3)) && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 mb-2 text-sm font-medium">Full Name *</label>
                            <input 
                              type="text" 
                              name="name"
                              value={bookingData.name}
                              onChange={(e) => setBookingData(prev => ({ ...prev, name: e.target.value }))}
                              required
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                              placeholder="Your full name"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 mb-2 text-sm font-medium">Email *</label>
                            <input 
                              type="email" 
                              name="email"
                              value={bookingData.email}
                              onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                              required
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                              placeholder="your.email@example.com"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 mb-2 text-sm font-medium">Phone *</label>
                            <input 
                              type="tel" 
                              name="phone"
                              value={bookingData.phone}
                              onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                              required
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                              placeholder="+254 700 000 000"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 mb-2 text-sm font-medium">Preferred Date *</label>
                            <input 
                              type="date" 
                              name="date"
                              value={bookingData.date}
                              onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                              required
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 mb-2 text-sm font-medium">Preferred Time *</label>
                            <input 
                              type="time" 
                              name="time"
                              value={bookingData.time}
                              onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                              required
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                            />
                          </div>
                          <div className="flex items-end">
                            <div className="w-full">
                              <label className="block text-gray-700 mb-2 text-sm font-medium">Service Type</label>
                              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="font-medium text-primary">
                                  {serviceTypes.find(s => s.value === bookingData.serviceType)?.label}
                                </span>
                                {bookingData.serviceType === 'viewing' && bookingData.propertyId && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    Property: {properties.find(p => p.id === bookingData.propertyId)?.title}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 mb-2 text-sm font-medium">
                            {bookingData.serviceType === 'viewing' ? 'Special Requests for Viewing' : 'Additional Information'}
                          </label>
                          <textarea 
                            name="notes"
                            value={bookingData.notes}
                            onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                            rows="3"
                            placeholder={
                              bookingData.serviceType === 'viewing' 
                                ? "Any specific requests or questions about the property..."
                                : "Tell us more about your requirements..."
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                          ></textarea>
                        </div>
                        
                        <div className="flex justify-between pt-4">
                          <button
                            type="button"
                            onClick={prevStep}
                            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                          >
                            Back
                          </button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary text-white font-medium py-3.5 px-8 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-70 transition-all flex items-center"
                          >
                            {isSubmitting ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                                />
                                Processing...
                              </>
                            ) : (
                              "Confirm Booking"
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
          
        <main className="flex-grow">
          {/* Services Hero */}
          <section className="bg-gradient-to-br from-primary via-blue-700 to-blue-800 py-20 md:py-28 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="container mx-auto px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto text-center"
              >
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Kenya Real Estate Services
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-blue-100">
                  Book viewings, valuations, and consultations for properties across Kenya
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openBookingModal('viewing')}
                  className="bg-white text-primary font-bold py-4 px-8 rounded-xl hover:bg-blue-50 transition-all shadow-2xl text-lg mr-4 mb-4"
                >
                  Book a Viewing
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openBookingModal('consultation')}
                  className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-xl hover:bg-white hover:text-primary transition-all shadow-2xl text-lg"
                >
                  Get Consultation
                </motion.button>
              </motion.div>
            </div>
          </section>

          {/* Services Grid */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Our Services</h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                  Comprehensive real estate solutions tailored for the Kenyan market
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100 group cursor-pointer"
                    onClick={() => openBookingModal(service.title.toLowerCase().includes('sale') ? 'consultation' : 
                                             service.title.toLowerCase().includes('valuation') ? 'valuation' :
                                             service.title.toLowerCase().includes('management') ? 'management' : 'viewing')}
                  >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{service.icon}</div>
                    <h3 className="text-xl font-bold text-primary mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-700">
                          <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                      <span className="text-primary font-semibold">{service.price}</span>
                      <span className="text-blue-600 font-medium text-sm">Book Now →</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
          
          {/* FAQ Section */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                  Everything you need to know about our Kenya real estate services
                </p>
              </motion.div>
              
              <div className="max-w-3xl mx-auto">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <button 
                      className="flex justify-between items-center w-full text-left py-6 group"
                      onClick={() => toggleFAQ(index)}
                    >
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors pr-4">
                        {faq.question}
                      </h3>
                      <motion.span
                        animate={{ rotate: activeFAQ === index ? 180 : 0 }}
                        className="text-primary text-lg font-bold min-w-6 flex items-center justify-center"
                      >
                        ➕
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {activeFAQ === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pb-6 text-gray-600 leading-relaxed">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-r from-primary to-blue-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="container mx-auto px-4 relative z-10 text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold text-white mb-4"
              >
                Ready to Find Your Perfect Property?
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-white text-xl mb-8 max-w-2xl mx-auto"
              >
                Book a viewing or consultation with our Kenya real estate experts today
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-center gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openBookingModal('viewing')}
                  className="bg-white text-primary font-bold py-4 px-8 rounded-xl hover:bg-blue-50 transition-all shadow-2xl text-lg"
                >
                  Book a Viewing
                </motion.button>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="tel:+254758066526" 
                  className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-xl hover:bg-white hover:text-primary transition-all shadow-2xl text-lg"
                >
                  📞 +254 758 066 526
                </motion.a>
              </motion.div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ServicesMain;