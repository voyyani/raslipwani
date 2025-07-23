import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>About Our Coastal Real Estate Agency | Raslipwani Properties</title>
        <meta name="description" content="Kenyan coastal property experts with 10+ years experience in Kilifi, Mombasa and Diani real estate markets" />
        
        {/* AboutPage Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About Raslipwani Properties",
            "description": "Leading real estate agency specializing in coastal Kenyan properties",
            "publisher": {
              "@type": "Organization",
              "name": "Raslipwani Properties",
              "logo": {
                "@type": "ImageObject",
                "url": "https://raslipwani.com/logo.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://raslipwani.com/about"
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
        <Header />
        
        <main className="flex-grow">
          <section className="relative bg-gradient-to-r from-blue-800 to-primary py-24 md:py-32">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="container mx-auto px-4 relative z-10 text-center text-white">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                About Raslipwani Properties
              </motion.h1>
              <motion.p 
                className="text-xl max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Your trusted partner in coastal Kenyan real estate
              </motion.p>
            </div>
          </section>
          
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="text-3xl font-bold text-primary mb-6">Our Story</h1>
                  <p className="text-gray-700 mb-4">
                    Founded in Kilifi County, Raslipwani Properties has grown to become a leading real estate agency specializing in property sales, purchases, and management along the stunning Kenyan coast.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Our team of local experts and expatriates brings together decades of experience in the real estate industry, combining international standards with deep local market knowledge.

                  </p>
                  <p className="text-gray-700 mb-4">We pride ourselves on delivering exceptional service with integrity, transparency, and professionalism, ensuring our clients have a seamless and rewarding property transaction experience.
                  </p>
              
              
                <h2 className="text-2xl font-semibold text-primary mt-8 mb-4">Why Coastal Kenya?</h2>
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    <li>Fastest growing real estate market in East Africa</li>
                    <li>Average property value appreciation of 12% annually</li>
                    <li>Tax incentives for foreign investors</li>
                    <li>Growing tourism industry with high rental yields</li>
                  </ul>
                </motion.div>
                
                <motion.div 
                  className="relative rounded-2xl overflow-hidden shadow-xl"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 mx-auto" />
                        <p className="mt-4 text-gray-500 italic">Our team at work in Kilifi County</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
          
          <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-gray-50">
            <div className="container mx-auto px-4">
              <motion.div 
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold text-primary mb-4">Our Mission & Vision</h1>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Guiding principles that drive our business forward
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <motion.div 
                  className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="bg-primary bg-opacity-10 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-primary">Our Mission</h2>
                  <p className="text-gray-700">
                    To deliver exceptional real estate services that exceed client expectations, ensuring 
                    a seamless and rewarding property transaction experience. We specialize in coastal properties 
                    along Kenya's beautiful shoreline, providing expert guidance through every step of the process.
                  </p>
                </motion.div>
                
                <motion.div 
                  className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="bg-primary bg-opacity-10 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-primary">Our Vision</h2>
                  <p className="text-gray-700">
                    To be the most trusted and recognized real estate company on the Kenyan coast, 
                    known for integrity, professionalism, and excellence. We aim to transform coastal 
                    property ownership by connecting international buyers with prime investment opportunities 
                    in Kilifi, Mombasa, and Diani.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>
          
          
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default About;