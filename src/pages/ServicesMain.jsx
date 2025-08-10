import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ViewingExperience from '../components/services/ViewingExperience';

const ServicesMain = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    notes: '',
    viewingType: 'physical'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Booking submission logic
      alert("Thank you for your booking! We'll confirm your appointment shortly.");
      
      setBookingData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        notes: '',
        viewingType: 'physical'
      });
      setActiveModal(null);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
        <meta
          name="description"
          content="Property sales, acquisition, valuation & management services for coastal Kenya real estate. Serving Kilifi, Mombasa & Diani."
        />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        {/* Viewing Options Modal */}
        {activeModal === 'viewing' && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary">Schedule Your Viewing</h2>
                  <button 
                    onClick={closeModal}
                    className="text-gray-500 hover:text-primary text-xl"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2 text-sm">Full Name *</label>
                      <input 
                        type="text" 
                        name="name"
                        value={bookingData.name}
                        onChange={(e) => setBookingData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 text-sm">Email *</label>
                      <input 
                        type="email" 
                        name="email"
                        value={bookingData.email}
                        onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2 text-sm">Phone *</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={bookingData.phone}
                        onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 text-sm">Preferred Date *</label>
                      <input 
                        type="date" 
                        name="date"
                        value={bookingData.date}
                        onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2 text-sm">Preferred Time *</label>
                      <input 
                        type="time" 
                        name="time"
                        value={bookingData.time}
                        onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 text-sm">Viewing Type *</label>
                      <select
                        name="viewingType"
                        value={bookingData.viewingType}
                        onChange={(e) => setBookingData(prev => ({ ...prev, viewingType: e.target.value }))}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        {viewingOptions.map(option => (
                          <option key={option.type} value={option.type}>
                            {option.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2 text-sm">Special Requests</label>
                    <textarea 
                      name="notes"
                      value={bookingData.notes}
                      onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                      rows="3"
                      placeholder="Any specific requests or questions"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    ></textarea>
                  </div>
                  
                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-white font-medium py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <i className="fas fa-spinner fa-spin mr-2"></i> Booking...
                        </span>
                      ) : (
                        "Confirm Booking"
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
          
        <main className="flex-grow">
          {/* Viewing Experience Section */}
          <ViewingExperience onBookViewing={openViewingModal} />
          
{/* FAQ Section */}
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
                  onClick={openViewingModal}
                  className="bg-white text-primary font-bold py-3.5 px-8 rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl"
                >
                  Book a Viewing
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