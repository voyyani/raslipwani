import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../src/utils/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
  const servicesRef = useRef(null);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch featured properties from Supabase
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        setFeaturedProperties(data);
      } catch (err) {
        setError('Failed to load featured properties: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedProperties();
  }, []);

  // Handle scroll to services section
  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <>
      <Helmet>
        <title>Raslipwani Properties | Premium Coastal Real Estate</title>
        <meta 
          name="description" 
          content="Discover luxury coastal properties in Kenya with Raslipwani - your trusted partner for beachfront homes, villas, and investment opportunities" 
        />
        <link rel="canonical" href="https://www.raslipwani.com" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative bg-cover bg-center min-h-screen flex items-center">
            {/* Background overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 z-0"></div>
            
            {/* Optimized responsive background */}
            <picture className="absolute inset-0 z-[-1]">
              <source 
                srcSet="https://res.cloudinary.com/dzqdxosk2/image/upload/f_auto,q_auto,w_800/v1718900000/coastal-property-hero_sm_omfqo1.jpg" 
                media="(max-width: 640px)"
              />
              <source 
                srcSet="https://res.cloudinary.com/dzqdxosk2/image/upload/f_auto,q_auto,w_1200/v1718900000/coastal-property-hero_md_omfqo1.jpg" 
                media="(max-width: 1024px)"
              />
              <img 
                src="https://res.cloudinary.com/dzqdxosk2/image/upload/f_auto,q_auto,w_1920/v1718900000/coastal-property-hero_lg_omfqo1.jpg" 
                alt="Luxury coastal property in Kenya"
                className="w-full h-full object-cover"
                loading="eager"
                onLoad={() => setHeroLoaded(true)}
              />
            </picture>
            
            {/* Loading overlay */}
            {!heroLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse z-10"></div>
            )}
            
            <div className="container mx-auto px-4 relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl text-white"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                  Discover Your Coastal <span className="text-primary">Paradise</span>
                </h1>
                <p className="text-xl mb-8 max-w-xl">
                  Premium real estate along Kenya's stunning coastline. Find your dream property with our expert team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/properties" 
                    className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-md text-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Browse Properties
                  </Link>
                  <button 
                    onClick={scrollToServices}
                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold py-3 px-6 rounded-md transition-all duration-300 border border-white/30"
                  >
                    Our Services
                  </button>
                </div>
              </motion.div>
            </div>
            
            {/* Scroll indicator */}
            <button 
              onClick={scrollToServices}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10"
              aria-label="Scroll to services"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </section>
          
          
          
          {/* Services Section */}
          <section ref={servicesRef} className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl font-bold text-primary mb-4"
                >
                  Our Premium Services
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-gray-600 max-w-2xl mx-auto"
                >
                  Comprehensive real estate solutions tailored for the Kenyan coast
                </motion.p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {services.map((service, index) => (
                  <ServiceCard key={index} {...service} index={index} />
                ))}
              </div>
            </div>
          </section>
          
          {/* Featured Properties */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl font-bold text-primary mb-4"
                >
                  Featured Properties
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-gray-600 max-w-2xl mx-auto"
                >
                  Exclusive coastal listings currently available
                </motion.p>
              </div>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
                  {error}
                </div>
              )}
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[1, 2, 3].map((item) => (
                    <PropertySkeleton key={item} />
                  ))}
                </div>
              ) : featuredProperties.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl mb-4">No featured properties available</h3>
                  <p className="text-gray-600">Check back later for new listings</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {featuredProperties.map((property, index) => (
                    <PropertyCard key={property.id} property={property} index={index} />
                  ))}
                </div>
              )}
              
              <div className="text-center mt-12">
                <Link 
                  to="/properties" 
                  className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-md transition-colors duration-300 shadow-lg hover:shadow-xl"
                >
                  View All Properties
                </Link>
              </div>
            </div>
          </section>
          
          {/* Why Choose Us Section */}
          <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl font-bold text-primary mb-4"
                >
                  Why Choose Raslipwani
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-gray-600 max-w-2xl mx-auto"
                >
                  The trusted choice for coastal real estate in Kenya
                </motion.p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {benefits.slice(0, 4).map((benefit, index) => (
                      <BenefitCard key={index} {...benefit} index={index} />
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-8 rounded-xl shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {benefits.slice(4).map((benefit, index) => (
                      <BenefitCard key={index} {...benefit} index={index} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-r from-primary to-secondary">
            <div className="container mx-auto px-4 text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl font-bold text-white mb-4"
              >
                Ready to Begin Your Journey?
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-white text-xl mb-8 max-w-2xl mx-auto"
              >
                Our experts are ready to guide you to your coastal dream property
              </motion.p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  to="/contact" 
                  className="inline-block bg-white text-primary font-bold py-3 px-8 rounded-md hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get in Touch
                </Link>
                <Link 
                  to="/properties" 
                  className="inline-block bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-md hover:bg-white hover:text-primary transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  View Properties
                </Link>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

// Service Card Component
const ServiceCard = ({ icon, title, description, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col border border-gray-100"
  >
    <div className="text-primary text-4xl mb-4">
      <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
        <i className={icon}></i>
      </div>
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-600 flex-grow">{description}</p>
    <div className="mt-6">
      <div className="w-10 h-1 bg-primary rounded-full"></div>
    </div>
  </motion.div>
);

// Property Card Component
const PropertyCard = ({ property, index }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
    >
      <div className="relative pb-[75%] overflow-hidden">
        {property.images?.[0] ? (
          <img 
            src={property.images[0]} 
            alt={property.title} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No Image Available</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">
          Featured
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{property.title}</h3>
        <p className="text-gray-600 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {property.location}
        </p>
        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-sm text-gray-600">{property.bedrooms || 0} Beds | {property.bathrooms || 0} Baths</p>
            <p className="text-sm text-gray-600">{property.area_sqft || 'N/A'} sqft</p>
          </div>
          <span className="text-xl font-bold text-primary">
            {formatPrice(property.price)}
          </span>
        </div>
        <Link 
          to={`/properties/${property.id}`}
          className="block mt-6 text-center bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg transition-colors duration-300"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

// Property Skeleton Loader
const PropertySkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
    <div className="pb-[75%] relative bg-gray-200"></div>
    <div className="p-6">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
      <div className="flex justify-between mb-4">
        <div>
          <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Benefit Card Component
const BenefitCard = ({ title, description, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="flex items-start"
  >
    <div className="bg-primary rounded-full p-2 mr-4 mt-1 flex-shrink-0">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <div>
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </motion.div>
);

// Data for services
const services = [
  {
    icon: "fas fa-home",
    title: "Property Sales",
    description: "Strategic marketing to sell your property at optimal market value."
  },
  {
    icon: "fas fa-search-dollar",
    title: "Property Acquisition",
    description: "Expert guidance through the entire buying process."
  },
  {
    icon: "fas fa-chart-line",
    title: "Property Valuation",
    description: "Accurate assessments to inform your investment decisions."
  },
  {
    icon: "fas fa-tasks",
    title: "Property Management",
    description: "Comprehensive services to maximize your investment."
  }
];

// Data for benefits
const benefits = [
  {
    title: "Expert Team",
    description: "Professionals with deep coastal market knowledge"
  },
  {
    title: "Client-Centric Approach",
    description: "We prioritize your needs and goals"
  },
  {
    title: "Integrity & Transparency",
    description: "Highest ethical standards in all transactions"
  },
  {
    title: "Local Market Expertise",
    description: "Specialized knowledge of Kenyan coast properties"
  },
  {
    title: "Strategic Alliances",
    description: "Collaborations for seamless transactions"
  },
  {
    title: "Affordable Options",
    description: "Solutions for all budget levels"
  },
  {
    title: "End-to-End Service",
    description: "Support from search to closing and beyond"
  },
  {
    title: "Technology Driven",
    description: "Modern tools for efficient property search"
  }
];

export default Home;