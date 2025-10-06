
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../src/utils/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PropertyModal from '../components/PropertyModal';

const Home = () => {
  const servicesRef = useRef(null);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Open modal function
  const openModal = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Close modal function
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <>
      <Helmet>
        <title>Premium Real Estate in Kenya | Raslipwani Properties</title>
        <meta 
          name="description" 
          content="Discover your dream home, villa, or investment property across Kenya. 100+ luxury listings in Nairobi, Mombasa, Kilifi, and more." 
        />
        <meta property="og:title" content="Kenyan Real Estate Experts | Raslipwani Properties" />
        <meta property="og:description" content="Find your perfect property with Kenya's leading real estate specialists" />
        <meta property="og:image" content="https://res.cloudinary.com/dzqdxosk2/image/upload/f_auto,q_auto,w_1200/v1718900000/kenya-property-hero_md_omfqo1.jpg" />
        <link rel="canonical" href="https://www.raslipwani.com" />
        
        {/* Local Business Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            "name": "Raslipwani Properties",
            "image": "https://raslipwani.com/logo.png",
            "@id": "https://www.raslipwani.com",
            "url": "https://www.raslipwani.com",
            "telephone": "+254758066526",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Kikambala Road",
              "addressLocality": "Kilifi",
              "postalCode": "80108",
              "addressCountry": "KE"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-1.2921",
              "longitude": "36.8219"
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
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
                srcSet="https://res.cloudinary.com/dzqdxosk2/image/upload/f_auto,q_auto,w_800/v1718900000/kenya-property-hero_sm_omfqo1.jpg" 
                media="(max-width: 640px)"
              />
              <source 
                srcSet="https://res.cloudinary.com/dzqdxosk2/image/upload/f_auto,q_auto,w_1200/v1718900000/kenya-property-hero_md_omfqo1.jpg" 
                media="(max-width: 1024px)"
              />
              <img 
                src="https://res.cloudinary.com/dzqdxosk2/image/upload/f_auto,q_auto,w_1920/v1718900000/kenya-property-hero_lg_omfqo1.jpg" 
                alt="Luxury property with city view in Nairobi, Kenya"
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
                  Premium Properties Across Kenya
                </h1>
                <p className="text-xl mb-8 max-w-xl">
                  Discover your dream home, villa, or investment opportunity in Kenya's most desirable locations
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/properties" 
                    className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-md transition-colors duration-300 text-center shadow-lg hover:shadow-xl"
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
                  Comprehensive real estate solutions tailored for the Kenyan market
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
                  Exclusive listings currently available across Kenya
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
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      index={index}
                      openModal={openModal}
                    />
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
                  The trusted choice for real estate in Kenya
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
                Our experts are ready to guide you to your dream property in Kenya
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
                  className="inline-block bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-md hover:bg-white/10 transition-all duration-300"
                >
                  Browse Listings
                </Link>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />

        {/* Property Modal */}
        <AnimatePresence>
          {isModalOpen && selectedProperty && (
            <PropertyModal 
              property={selectedProperty} 
              closeModal={closeModal}
            />
          )}
        </AnimatePresence>
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
const PropertyCard = ({ property, index, openModal }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer"
      onClick={() => openModal(property)}
    >
      <div className="relative pb-[75%] overflow-hidden">
        {property.images?.[0] ? (
          <img 
            src={property.images[0]} 
            alt={`${property.title} in ${property.location}`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading={index > 1 ? "lazy" : "eager"}
            width="400"
            height="300"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
            <span className="text-gray-500">No Image Available</span>
          </div>
        )}
        {property.featured && (
          <div className="absolute top-4 right-4 bg-primary text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
            Featured
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors">
            {property.title}
          </h2>
          <span className="text-xl font-bold text-primary">
            {formatPrice(property.price)}
          </span>
        </div>
        
        <p className="text-gray-600 mb-5 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {property.location}
        </p>
        
        <div className="flex justify-between mb-6">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm">{property.bedrooms || 0} Beds</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">{property.bathrooms || 0} Baths</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
            </svg>
            <span className="text-sm">{property.area_sqft || 'N/A'} sqft</span>
          </div>
        </div>
        
        <div className="mt-4 text-center text-primary font-medium group-hover:text-primary-dark transition-colors">
          View Details
        </div>
      </div>
    </motion.div>
  );
};

// Property Skeleton Loader
const PropertySkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-xl animate-pulse">
    <div className="pb-[75%] relative bg-gradient-to-br from-gray-100 to-gray-200"></div>
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <div className="h-7 bg-gray-200 rounded-xl w-3/5"></div>
        <div className="h-7 bg-gray-200 rounded-xl w-1/4"></div>
      </div>
      <div className="h-5 bg-gray-200 rounded-xl w-3/4 mb-6"></div>
      <div className="flex justify-between mb-6">
        <div className="h-4 bg-gray-200 rounded-xl w-16"></div>
        <div className="h-4 bg-gray-200 rounded-xl w-16"></div>
        <div className="h-4 bg-gray-200 rounded-xl w-16"></div>
      </div>
      <div className="h-12 bg-gray-200 rounded-xl"></div>
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
    description: "Strategic marketing to sell your property at optimal market value across Kenya"
  },
  {
    icon: "fas fa-search-dollar",
    title: "Property Acquisition",
    description: "Expert guidance through the entire buying process nationwide"
  },
  {
    icon: "fas fa-chart-line",
    title: "Property Valuation",
    description: "Accurate assessments to inform your investment decisions"
  },
  {
    icon: "fas fa-tasks",
    title: "Property Management",
    description: "Comprehensive services to maximize your investment returns"
  }
];

// Data for benefits
const benefits = [
  {
    title: "Expert Team",
    description: "Professionals with deep knowledge of Kenyan real estate markets"
  },
  {
    title: "Client-Centric Approach",
    description: "We prioritize your needs and goals throughout Kenya"
  },
  {
    title: "Integrity & Transparency",
    description: "Highest ethical standards in all transactions nationwide"
  },
  {
    title: "Nationwide Coverage",
    description: "Properties available across all major Kenyan regions"
  },
  {
    title: "Strategic Alliances",
    description: "Collaborations for seamless transactions countrywide"
  },
  {
    title: "Affordable Options",
    description: "Solutions for all budget levels throughout Kenya"
  },
  {
    title: "End-to-End Service",
    description: "Support from search to closing and beyond"
  },
  {
    title: "Technology Driven",
    description: "Modern tools for efficient property search across Kenya"
  }
];

export default Home;
