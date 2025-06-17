import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will contact you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
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
          <section className="bg-primary py-16">
            <div className="container mx-auto px-4 text-center text-white">
              <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
              <p className="text-xl max-w-3xl mx-auto">
                Get in touch with our team for any inquiries or assistance
              </p>
            </div>
          </section>
          
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-6">Get In Touch</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="phone" className="block text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label htmlFor="subject" className="block text-gray-700 mb-2">Subject</label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="5"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      className="bg-primary text-white px-6 py-3 rounded-md hover:bg-secondary transition-colors"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-6">Contact Information</h2>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="text-primary text-2xl mr-4">
                        <i className="fas fa-map-marker-alt"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Office Location</h3>
                        <p className="text-gray-700">Kikambala, Kilifi County, Kenya</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="text-primary text-2xl mr-4">
                        <i className="fas fa-phone"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Phone</h3>
                        <p className="text-gray-700">+254 758 066 526</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="text-primary text-2xl mr-4">
                        <i className="fas fa-envelope"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Email</h3>
                        <p className="text-gray-700">raslipwani@gmail.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="text-primary text-2xl mr-4">
                        <i className="fas fa-clock"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Working Hours</h3>
                        <p className="text-gray-700">Monday - Friday: 8:00 AM - 5:00 PM</p>
                        <p className="text-gray-700">Saturday: 9:00 AM - 1:00 PM</p>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
                      <div className="flex space-x-4">
                        {['facebook', 'instagram', 'twitter', 'whatsapp', 'tiktok'].map((platform) => (
                          <a 
                            key={platform} 
                            href="#" 
                            className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                          >
                            <i className={`fab fa-${platform}`}></i>
                          </a>
                        ))}
                      </div>
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