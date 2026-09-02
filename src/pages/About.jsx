import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import Icon from '../components/Icon';
const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  //const stats = [
   // { number: '100+', label: 'Properties Listed' },
   // { number: '50+', label: 'Happy Clients' },
   // { number: '8+', label: 'Years Experience' },
   // { number: '15+', label: 'Cities Covered' }
  //];

  const values = [
    {
      icon: 'shield-alt',
      title: 'Integrity',
      description: 'Honest and transparent dealings in all our transactions'
    },
    {
      icon: 'users',
      title: 'Client-First',
      description: 'Your goals and satisfaction are our top priority'
    },
    {
      icon: 'chart-line',
      title: 'Expertise',
      description: 'Deep market knowledge and professional guidance'
    },
    {
      icon: 'bolt',
      title: 'Innovation',
      description: 'Leveraging technology for better real estate solutions'
    }
  ];

  return (
    <>
      <Helmet>
        <title>About Kenya's Premier Real Estate Agency | Raslipwani Properties</title>
        <meta name="description" content="Leading Kenyan real estate experts with 8+ years experience in property sales, acquisition, and management across major cities and regions" />
        
        {/* AboutPage Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About Raslipwani Properties",
            "description": "Premier real estate agency serving all major regions of Kenya",
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
      
      <>
        <main className="flex-grow bg-gradient-to-b from-white to-gray-50">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-primary py-24 md:py-32 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
            
            {/* Animated Background Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
            
            <div className="container mx-auto px-4 relative z-10 text-center text-white">
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                About Raslipwani
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-200 font-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                Your Trusted Real Estate Partner Across Kenya
              </motion.p>
            </div>
          </section>
          
          {/* Stats Section 
          <section className="py-16 bg-white border-b border-gray-100">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                    <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>*/}
          
          {/* Story Section */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                >
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                    <Icon name="history" size={14} />
                    Our Journey
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Building Dreams Across Kenya</h1>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      Founded with a vision to transform real estate in Kenya, Raslipwani Properties has grown from 
                      a coastal specialist to a nationwide leader in property solutions. Our journey began in Kilifi 
                      County and has expanded to serve clients across all major Kenyan regions.
                    </p>
                    <p>
                      We combine deep local market knowledge with international standards of professionalism, 
                      creating a unique approach that serves both local and international clients seeking 
                      premium properties in Kenya.
                    </p>
                    <p>
                      Our team of seasoned experts brings together decades of collective experience in real 
                      estate development, property management, and investment consulting, ensuring our clients 
                      receive unparalleled service and results.
                    </p>
                  </div>
                  
                  <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl border border-primary/10">
                    <h2 className="text-xl font-semibold text-primary mb-3">Why Invest in Kenya?</h2>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center gap-3">
                        <Icon name="chart-line" size={14} className="text-primary" />
                        <span>Consistent property value appreciation averaging 8-12% annually</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Icon name="gem" size={14} className="text-primary" />
                        <span>Growing middle class driving real estate demand</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Icon name="city" size={14} className="text-primary" />
                        <span>Urban development and infrastructure expansion</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Icon name="globe-africa" size={14} className="text-primary" />
                        <span>Strategic location as East Africa's economic hub</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <div className="aspect-w-4 aspect-h-5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-100 flex items-center justify-center p-8">
                        <div className="text-center w-full">
                          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mx-auto max-w-md">
                            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                              <Icon name="home" size={30} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Nationwide Coverage</h3>
                            <p className="text-gray-600 mb-6">
                              Serving clients in Nairobi, Mombasa, Kilifi, Diani, Naivasha, Malindi, and beyond
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {['Nairobi', 'Mombasa', 'Kilifi', 'Diani', 'Naivasha', 'Malindi'].map((city, index) => (
                                <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                  {city}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-2xl blur-xl"></div>
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-100 rounded-2xl blur-xl"></div>
                </motion.div>
              </div>
            </div>
          </section>
          
          {/* Mission & Vision Section */}
          <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto px-4">
              <motion.div 
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-sm">
                  <Icon name="bullseye" size={14} />
                  Our Purpose
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Mission & Vision</h1>
                <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                  The guiding principles that drive our commitment to excellence in Kenyan real estate
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <motion.div 
                  className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon name="rocket" size={20} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Our Mission</h2>
                  <p className="text-gray-700 leading-relaxed">
                    To deliver exceptional real estate services that transform property dreams into reality across Kenya. 
                    We provide expert guidance, innovative solutions, and personalized service that exceeds expectations 
                    at every stage of the property journey.
                  </p>
                </motion.div>
                
                <motion.div 
                  className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon name="eye" size={20} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Our Vision</h2>
                  <p className="text-gray-700 leading-relaxed">
                    To be Kenya's most trusted and innovative real estate partner, recognized for integrity, 
                    excellence, and transformative property solutions. We envision a future where every client 
                    achieves their property goals with confidence and ease through our nationwide expertise.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4">
              <motion.div 
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Icon name="star" size={14} />
                  Our Values
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What We Stand For</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  The core principles that guide every decision and interaction
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all duration-300 group hover:shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <Icon name={value.icon} size={18} className="text-primary group-hover:text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 bg-gradient-to-r from-primary to-blue-600">
            <div className="container mx-auto px-4 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Find Your Dream Property?
                </h2>
                <p className="text-blue-100 text-xl mb-8 max-w-2xl mx-auto">
                  Join hundreds of satisfied clients who have found their perfect property with Raslipwani
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    to="/properties" 
                    className="inline-flex items-center gap-2 bg-white text-primary font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Icon name="search" />
                    Browse Properties
                  </Link>
                  <Link 
                    to="/contact" 
                    className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-primary transition-all duration-300"
                  >
                    <Icon name="envelope" />
                    Get In Touch
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        </main>
        
      </>
    </>
  );
};

export default About;