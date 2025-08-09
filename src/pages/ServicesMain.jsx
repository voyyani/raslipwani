import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServiceCard from '../components/services/ServiceCard';
import ViewingExperience from '../components/services/ViewingExperience';
import ServiceForm from '../components/services/ServiceForm';
import ViewingForm from '../components/services/ViewingForm';
import { supabase } from '../utils/supabaseClient';

const ServicesMain = () => {
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
  const servicesRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openViewingModal) {
      openViewingModal();
    }
  }, [location.state]);

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
      ],
      color: "from-blue-500 to-blue-600"
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
      ],
      color: "from-green-500 to-green-600"
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
      ],
      color: "from-purple-500 to-purple-600"
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
      ],
      color: "from-amber-500 to-amber-600"
    }
  ];

  const viewingOptions = [
    { 
      type: "physical", 
      title: "In-Person Viewing", 
      description: "Personalized tour of the property with our agent",
      duration: "1 hour",
      icon: "fas fa-walking"
    },
    { 
      type: "virtual", 
      title: "Virtual Tour", 
      description: "Live video walkthrough with our agent",
      duration: "30 minutes",
      icon: "fas fa-video"
    },
    { 
      type: "premium", 
      title: "Premium Consultation", 
      description: "In-depth property analysis with senior agent",
      duration: "1.5 hours",
      icon: "fas fa-crown"
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
      const appointment_at = bookingData.date && bookingData.time 
        ? `${bookingData.date}T${bookingData.time}:00.000Z`
        : null;

      const bookingRecord = {
        ...bookingData,
        appointment_at,
        type: activeModal,
        created_at: new Date().toISOString(),
        status: 'pending',
        viewing_type: bookingData.viewingType
      };

      delete bookingRecord.date;
      delete bookingRecord.time;
      delete bookingRecord.viewingType;

      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingRecord]);

      if (error) throw error;

      alert("Thank you for your booking! We'll confirm your appointment shortly.");
      
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
      
      await sendEmailNotification(bookingRecord);
      
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <title>Premium Real Estate Services in Coastal Kenya | Raslipwani</title>
        <meta name="description" content="Property sales, acquisition, valuation & management services for coastal Kenya real estate. Serving Kilifi, Mombasa & Diani." />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Real estate services",
            "provider": {
              "@type": "RealEstateAgent",
              "name": "Raslipwani Properties"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Real Estate Services",
              "itemListElement": services.map(service => ({
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": service.title,
                  "description": service.description
                }
              }))
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        {/* Consultation Booking Modal */}
        {activeModal === 'consultation' && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <ServiceForm 
                bookingData={bookingData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                closeModal={closeModal}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          </div>
        )}
        
        {/* Viewing Options Modal */}
        {activeModal === 'viewing' && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <ViewingForm 
                bookingData={bookingData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                closeModal={closeModal}
                isSubmitting={isSubmitting}
                viewingOptions={viewingOptions}
                setBookingData={setBookingData}
              />
            </motion.div>
          </div>
        )}
          
        <main className="flex-grow">
          {/* Services Section */}
          <section ref={servicesRef} className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold text-primary mb-4"
                >
                  Our Expert Services
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-gray-600 max-w-2xl mx-auto"
                >
                  Tailored solutions for homeowners, investors, and businesses along the Kenyan coast
                </motion.p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {services.map((service, index) => (
                  <ServiceCard 
                    key={index} 
                    service={service} 
                    onBook={openBookingModal}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </section>
          
          {/* Viewing Experience Section */}
          <ViewingExperience 
            viewingOptions={viewingOptions} 
            onBookViewing={openViewingModal}
          />
          
          {/* Process Section */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold text-primary mb-4"
                >
                  Our Service Process
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-gray-600 max-w-2xl mx-auto"
                >
                  A streamlined approach to ensure a seamless experience from start to finish
                </motion.p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {icon: "fas fa-comment-alt", title: "Initial Consultation", desc: "We discuss your needs and objectives"},
                  {icon: "fas fa-search", title: "Property Assessment", desc: "Thorough evaluation of your property or requirements"},
                  {icon: "fas fa-file-contract", title: "Service Agreement", desc: "Clear terms and plan for our services"},
                  {icon: "fas fa-tasks", title: "Execution & Follow-up", desc: "Implementation with regular updates and support"}
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center bg-white p-8 rounded-2xl shadow-lg"
                  >
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className={`${step.icon} text-2xl text-primary`}></i>
                    </div>
                    <div className="text-2xl font-bold text-primary mb-3">{index + 1}</div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
          
          {/* FAQ Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold text-primary mb-4"
                >
                  Frequently Asked Questions
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-gray-600 max-w-2xl mx-auto"
                >
                  Common questions about our services and processes
                </motion.p>
              </div>
              
              <div className="max-w-3xl mx-auto">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-200 py-6"
                  >
                    <button 
                      className="flex justify-between items-center w-full text-left group"
                      onClick={(e) => {
                        const content = e.currentTarget.nextElementSibling;
                        content.classList.toggle('hidden');
                        e.currentTarget.querySelector('i').classList.toggle('fa-chevron-down');
                        e.currentTarget.querySelector('i').classList.toggle('fa-chevron-up');
                      }}
                    >
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors">
                        {faq.question}
                      </h3>
                      <i className="fas fa-chevron-down text-primary text-sm"></i>
                    </button>
                    <div className="mt-3 text-gray-600 hidden pl-2 border-l-2 border-primary">
                      {faq.answer}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-r from-primary to-secondary">
            <div className="container mx-auto px-4 text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-white mb-4"
              >
                Ready to Get Started?
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-white text-xl mb-8 max-w-2xl mx-auto"
              >
                Contact us today to discuss your real estate needs with our coastal property experts
              </motion.p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openBookingModal('General Consultation')}
                  className="bg-white text-primary font-bold py-3.5 px-8 rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl"
                >
                  Book a Consultation
                </motion.button>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="tel:+254758066526" 
                  className="bg-transparent border-2 border-white text-white font-bold py-3.5 px-8 rounded-xl hover:bg-white hover:text-primary transition-all shadow-xl hover:shadow-2xl"
                >
                  Call Now: +254 758 066 526
                </motion.a>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ServicesMain;