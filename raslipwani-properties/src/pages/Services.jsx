import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../utils/supabaseClient';

const Services = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    notes: '',
    viewingType: 'physical'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = [
    {
      title: "Property Sales",
      description: "We help you sell your property at the best market value with our strategic marketing approach and extensive buyer network.",
      icon: "fas fa-home",
      features: [
        "Market analysis & pricing strategy",
        "Professional photography & virtual tours",
        "Targeted digital marketing campaigns",
        "Open house coordination",
        "Negotiation support"
      ]
    },
    {
      title: "Property Acquisition",
      description: "Expert guidance through the entire buying process from property search to closing.",
      icon: "fas fa-search-dollar",
      features: [
        "Personalized property search",
        "Market trend analysis",
        "Property evaluation & due diligence",
        "Offer negotiation strategy",
        "Closing coordination"
      ]
    },
    {
      title: "Property Valuation",
      description: "Get accurate and reliable property assessments to make informed investment decisions.",
      icon: "fas fa-chart-line",
      features: [
        "Comprehensive market analysis",
        "Detailed valuation report",
        "Investment potential assessment",
        "Rental yield calculations",
        "Future value projections"
      ]
    },
    {
      title: "Property Management",
      description: "Comprehensive services ensuring your investment remains profitable and well-maintained.",
      icon: "fas fa-tasks",
      features: [
        "Tenant screening & placement",
        "Rent collection & financial reporting",
        "Maintenance coordination",
        "Property inspections",
        "Legal compliance management"
      ]
    }
  ];

  const viewingOptions = [
    { 
      type: "physical", 
      title: "In-Person Viewing", 
      description: "Personalized tour of the property with our agent",
      duration: "1 hour"
    },
    { 
      type: "virtual", 
      title: "Virtual Tour", 
      description: "Live video walkthrough with our agent",
      duration: "30 minutes"
    },
    { 
      type: "premium", 
      title: "Premium Consultation", 
      description: "In-depth property analysis with senior agent",
      duration: "1.5 hours"
    }
  ];

  const faqs = [
    {
      question: "How long does the property sales process take?",
      answer: "The timeline varies based on market conditions and property type. On average, coastal properties sell within 45-90 days with our marketing approach."
    },
    {
      question: "Do you offer rental management services?",
      answer: "Yes, we provide comprehensive property management services including tenant placement, rent collection, maintenance coordination, and regular property inspections."
    },
    {
      question: "What areas do you serve?",
      answer: "We specialize in properties along the Kenyan coast, including Kilifi, Mombasa, Malindi, Diani, Watamu, and surrounding areas."
    },
    {
      question: "How are your fees structured?",
      answer: "Fees vary by service. Property sales typically have a commission-based fee, while property management is a percentage of rental income. Consultations have fixed fees as shown in our pricing."
    },
    {
      question: "Can I book a viewing outside of business hours?",
      answer: "Yes, we offer flexible viewing times including weekends and evenings to accommodate our clients' schedules."
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Combine date and time into a single timestamp
      const appointment_at = bookingData.date && bookingData.time 
        ? `${bookingData.date}T${bookingData.time}:00.000Z`
        : null;

      // Prepare booking data
      const bookingRecord = {
        ...bookingData,
        appointment_at,
        type: activeModal,
        created_at: new Date().toISOString(),
        status: 'pending',
        viewing_type: bookingData.viewingType
      };

      // Remove unnecessary fields for Supabase
      delete bookingRecord.date;
      delete bookingRecord.time;
      delete bookingRecord.viewingType;

      // Save to Supabase
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingRecord]);

      if (error) throw error;

      // Show success message
      alert("Thank you for your booking! We'll confirm your appointment shortly.");
      
      // Reset form and close modal
      setBookingData({
        name: '',
        email: '',
        phone: '',
        service: '',
        date: '',
        time: '',
        notes: '',
        viewingType: 'physical'
      });
      setActiveModal(null);
      
      // Send email notification
      await sendEmailNotification(bookingRecord);
      
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email notification function
  const sendEmailNotification = async (booking) => {
    try {
      const emailData = {
        to: 'raslipwani@gmail.com',
        subject: `New Booking - ${booking.type}`,
        booking: booking
      };

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });
      
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }
  };

  const openBookingModal = (service) => {
    setBookingData(prev => ({ ...prev, service }));
    setActiveModal('consultation');
  };

  const openViewingModal = () => {
    setActiveModal('viewing');
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <Helmet>
        <title>Premium Real Estate Services | Raslipwani Properties</title>
        <meta name="description" content="Expert property sales, acquisition, valuation and management services along the Kenyan coast" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        {/* Consultation Booking Modal */}
        {activeModal === 'consultation' && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-primary">Book Consultation</h3>
                  <button 
                    onClick={closeModal}
                    className="text-gray-500 hover:text-primary"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Service</label>
                    <input 
                      type="text" 
                      value={bookingData.service}
                      readOnly
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      value={bookingData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Email *</label>
                      <input 
                        type="email" 
                        name="email"
                        value={bookingData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Phone *</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={bookingData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Preferred Date *</label>
                      <input 
                        type="date" 
                        name="date"
                        value={bookingData.date}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Preferred Time *</label>
                      <input 
                        type="time" 
                        name="time"
                        value={bookingData.time}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Notes or Special Requests</label>
                    <textarea 
                      name="notes"
                      value={bookingData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    ></textarea>
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <i className="fas fa-spinner fa-spin mr-2"></i> Submitting...
                        </span>
                      ) : "Confirm Booking"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Viewing Options Modal */}
        {activeModal === 'viewing' && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-primary">Book a Viewing Experience</h3>
                  <button 
                    onClick={closeModal}
                    className="text-gray-500 hover:text-primary"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
                
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-4">Choose Viewing Type</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {viewingOptions.map((option, index) => (
                      <div 
                        key={index}
                        className={`border rounded-xl p-4 cursor-pointer transition-all ${
                          bookingData.viewingType === option.type 
                            ? 'border-primary bg-blue-50' 
                            : 'border-gray-200 hover:border-primary'
                        }`}
                        onClick={() => setBookingData(prev => ({ ...prev, viewingType: option.type }))}
                      >
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-lg">{option.title}</h5>
                        </div>
                        <p className="text-gray-600 my-2">{option.description}</p>
                        <div className="text-sm text-gray-500 flex items-center">
                          <i className="far fa-clock mr-1"></i> {option.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Full Name *</label>
                      <input 
                        type="text" 
                        name="name"
                        value={bookingData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Phone *</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={bookingData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Email *</label>
                    <input 
                      type="email" 
                      name="email"
                      value={bookingData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Preferred Date *</label>
                      <input 
                        type="date" 
                        name="date"
                        value={bookingData.date}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Preferred Time *</label>
                      <input 
                        type="time" 
                        name="time"
                        value={bookingData.time}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Property of Interest (Optional)</label>
                    <input 
                      type="text" 
                      name="notes"
                      value={bookingData.notes}
                      onChange={handleInputChange}
                      placeholder="Property ID, location, or name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <i className="fas fa-spinner fa-spin mr-2"></i> Processing...
                        </span>
                      ) : `Book ${viewingOptions.find(o => o.type === bookingData.viewingType)?.title}`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        <main className="flex-grow">
          {/* Services Section */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-primary mb-4">Our Expert Services</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Tailored solutions for homeowners, investors, and businesses along the Kenyan coast
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {services.map((service, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-xl">
                    <div className="p-8">
                      <div className="flex items-start mb-6">
                        <div className="bg-primary bg-opacity-10 p-4 rounded-xl mr-5">
                          <i className={`${service.icon} text-3xl text-primary`}></i>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">{service.title}</h3>
                          <p className="text-gray-600">{service.description}</p>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-700 mb-3">Key Features:</h4>
                        <ul className="space-y-2">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                              <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <button 
                          onClick={() => openBookingModal(service.title)}
                          className="w-full bg-primary hover:bg-secondary text-white py-2 px-5 rounded-lg transition-colors"
                        >
                          Book Service
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* Viewing Experience Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-primary mb-4">Property Viewing Experiences</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Explore properties with our specialized viewing options tailored to your needs
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {viewingOptions.map((option, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="bg-primary bg-opacity-5 p-4 rounded-lg mb-4 inline-block">
                      {option.type === 'physical' && <i className="fas fa-walking text-2xl text-primary"></i>}
                      {option.type === 'virtual' && <i className="fas fa-video text-2xl text-primary"></i>}
                      {option.type === 'premium' && <i className="fas fa-crown text-2xl text-primary"></i>}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                    <p className="text-gray-600 mb-4">{option.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-500">Duration:</span>
                        <p>{option.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <button 
                  onClick={openViewingModal}
                  className="bg-primary hover:bg-secondary text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors"
                >
                  Book a Viewing Experience
                </button>
              </div>
            </div>
          </section>
          
          {/* Process Section */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-primary mb-4">Our Service Process</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  A streamlined approach to ensure a seamless experience from start to finish
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  {icon: "fas fa-comment-alt", title: "Initial Consultation", desc: "We discuss your needs and objectives"},
                  {icon: "fas fa-search", title: "Property Assessment", desc: "Thorough evaluation of your property or requirements"},
                  {icon: "fas fa-file-contract", title: "Service Agreement", desc: "Clear terms and plan for our services"},
                  {icon: "fas fa-tasks", title: "Execution & Follow-up", desc: "Implementation with regular updates and support"}
                ].map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-primary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className={`${step.icon} text-2xl text-primary`}></i>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* FAQ Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-primary mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Common questions about our services and processes
                </p>
              </div>
              
              <div className="max-w-3xl mx-auto">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 py-6">
                    <button 
                      className="flex justify-between items-center w-full text-left"
                      onClick={(e) => {
                        const content = e.currentTarget.nextElementSibling;
                        content.classList.toggle('hidden');
                        e.currentTarget.querySelector('i').classList.toggle('fa-chevron-down');
                        e.currentTarget.querySelector('i').classList.toggle('fa-chevron-up');
                      }}
                    >
                      <h3 className="text-lg font-semibold text-gray-800">{faq.question}</h3>
                      <i className="fas fa-chevron-down text-primary"></i>
                    </button>
                    <div className="mt-3 text-gray-600 hidden">
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-r from-primary to-secondary">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-white text-xl mb-8 max-w-2xl mx-auto">
                Contact us today to discuss your real estate needs with our coastal property experts
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => openBookingModal('General Consultation')}
                  className="bg-white text-primary font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Book a Consultation
                </button>
                <a 
                  href="tel:+254758066526" 
                  className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-primary transition-colors shadow-lg"
                >
                  Call Now: +254 758 066 526
                </a>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Services;