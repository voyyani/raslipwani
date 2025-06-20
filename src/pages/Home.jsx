import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
  // State for mobile menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Close mobile menu when window resizes above mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && !e.target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <>
      <Helmet>
        <title>Raslipwani Properties | Your Trusted Real Estate Partner</title>
        <meta 
          name="description" 
          content="A Leading real estate company specializing in property sales, purchases, and management along the Kenyan coast." 
        />
        <link rel="canonical" href="https://www.raslipwani.com" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-40 md:hidden" 
               onClick={() => setIsMenuOpen(false)}></div>
        )}
        
        {/* Mobile Menu */}
        <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden mobile-menu-container ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                <h1 className="text-xl font-bold text-primary">Raslipwani</h1>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-500 hover:text-primary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="space-y-4">
              <Link 
                to="/" 
                className="block py-2 px-4 rounded-md hover:bg-blue-50 text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/properties" 
                className="block py-2 px-4 rounded-md hover:bg-blue-50 text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Properties
              </Link>
              <Link 
                to="/services" 
                className="block py-2 px-4 rounded-md hover:bg-blue-50 text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/about" 
                className="block py-2 px-4 rounded-md hover:bg-blue-50 text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className="block py-2 px-4 rounded-md hover:bg-blue-50 text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-4 border-t border-gray-200 mt-4">
                <Link 
                  to="/admin" 
                  className="block w-full bg-primary text-white py-2 px-4 rounded-md text-center hover:bg-secondary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Login
                </Link>
              </div>
            </nav>
          </div>
        </div>
        
        <Header toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative bg-cover bg-center h-screen" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')" }}>
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="container mx-auto px-4 h-full flex items-center relative z-10">
              <div className="max-w-2xl text-white">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                  Discover Your Coastal <span className="text-primary">Paradise</span>
                </h1>
                <p className="text-xl mb-8 max-w-xl">
                  Premium real estate services along Kenya's stunning coastline. Find your dream property with our expert team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/properties" 
                    className="bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-md text-center transition-colors shadow-lg hover:shadow-xl"
                  >
                    Browse Properties
                  </Link>
                  
                </div>
              </div>
            </div>
            
            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </section>
          
          {/* Stats Section 
          <section className="py-12 bg-primary text-white">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <p className="text-3xl md:text-4xl font-bold">200+</p>
                  <p className="text-sm md:text-base mt-2">Properties Sold</p>
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-bold">15+</p>
                  <p className="text-sm md:text-base mt-2">Years Experience</p>
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-bold">98%</p>
                  <p className="text-sm md:text-base mt-2">Client Satisfaction</p>
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-bold">50M+</p>
                  <p className="text-sm md:text-base mt-2">Value Managed</p>
                </div>
              </div>
            </div>
          </section>*/}
          
          {/* Services Section */}
          <section className="py-20 bg-light">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-primary mb-4">Our Premium Services</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Comprehensive real estate solutions tailored to meet your unique needs on the Kenyan coast
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {services.map((service, index) => (
                  <ServiceCard key={index} {...service} />
                ))}
              </div>
            </div>
          </section>
          
          {/* Testimonial Section 
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-primary mb-4">Client Success Stories</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Hear what our satisfied clients have to say about their experience
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <TestimonialCard key={index} {...testimonial} />
                ))}
              </div>
            </div>
          </section>*/}
          
          {/* Why Choose Us Section */}
          <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-primary mb-4">Why Choose Raslipwani</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  The trusted choice for discerning clients on the Kenyan coast
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {benefits.slice(0, 4).map((benefit, index) => (
                      <BenefitCard key={index} {...benefit} />
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-8 rounded-xl shadow-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {benefits.slice(4).map((benefit, index) => (
                      <BenefitCard key={index} {...benefit} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* CTA Section 
          <section className="py-20 bg-gradient-to-r from-primary to-secondary">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Begin Your Journey?</h2>
              <p className="text-white text-xl mb-8 max-w-2xl mx-auto">
                Our experts are ready to guide you every step of the way to your coastal dream property
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  to="/contact" 
                  className="inline-block bg-white text-primary font-bold py-3 px-8 rounded-md hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Get in Touch
                </Link>
                <Link 
                  to="/properties" 
                  className="inline-block bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-md hover:bg-white hover:text-primary transition-colors shadow-lg"
                >
                  View Properties
                </Link>
              </div>
            </div>
          </section>*/}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

// Service Card Component
const ServiceCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
    <div className="text-primary text-4xl mb-4">
      <i className={icon}></i>
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-600 flex-grow">{description}</p>
    <div className="mt-4">
      
    </div>
  </div>
);

// Testimonial Card Component
const TestimonialCard = ({ content, author, role }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
    <div className="flex items-center mb-4">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    <p className="text-gray-700 italic mb-6">"{content}"</p>
    <div className="flex items-center">
      <div className="bg-gray-200 border-2 border-dashed rounded-full w-12 h-12 mr-3" />
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-gray-600 text-sm">{role}</p>
      </div>
    </div>
  </div>
);

// Benefit Card Component
const BenefitCard = ({ title, description }) => (
  <div className="flex items-start">
    <div className="bg-primary rounded-full p-2 mr-4 mt-1 flex-shrink-0">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <div>
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

// Data for services
const services = [
  {
    icon: "fas fa-home",
    title: "Property Sales",
    description: "Strategic marketing and extensive buyer network to sell your property at optimal market value."
  },
  {
    icon: "fas fa-search-dollar",
    title: "Property Acquisition",
    description: "Expert guidance through the entire buying process from search to final purchase."
  },
  {
    icon: "fas fa-chart-line",
    title: "Property Valuation",
    description: "Accurate assessments by our expert team to inform your investment decisions."
  },
  {
    icon: "fas fa-tasks",
    title: "Property Management",
    description: "Comprehensive services ensuring your investment remains profitable and well-maintained."
  }
];

// Data for testimonials
const testimonials = [
  {
    content: "Raslipwani Properties helped us find our dream beachfront villa. Their local expertise made the process seamless and stress-free.",
    author: "James Kariuki",
    role: "Property Investor"
  },
  {
    content: "Professional, transparent, and truly client-focused. They exceeded our expectations at every step of our property purchase.",
    author: "Sarah Johnson",
    role: "Homeowner"
  },
  {
    content: "As an international investor, I was impressed by their market knowledge and professional approach. Highly recommended!",
    author: "Thomas Müller",
    role: "International Investor"
  }
];

// Data for benefits
const benefits = [
  {
    title: "Expert Team",
    description: "Local professionals and expatriates with deep industry knowledge."
  },
  {
    title: "Client-Centric Approach",
    description: "We prioritize your needs and work tirelessly to achieve your goals."
  },
  {
    title: "Integrity & Transparency",
    description: "Highest ethical standards in all transactions."
  },
  {
    title: "Local Market Expertise",
    description: "In-depth knowledge of the Kenyan coast for tailored solutions."
  },
  {
    title: "Strategic Alliances",
    description: "Collaborations with key industry players for streamlined transactions."
  },
  {
    title: "Affordable Options",
    description: "Partnerships to make homeownership seamless and accessible."
  },
  {
    title: "End-to-End Service",
    description: "Comprehensive support from search to closing and beyond."
  },
  {
    title: "Technology Driven",
    description: "Modern tools for efficient property search and transactions."
  }
];

export default Home;