import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Raslipwani Properties | Your Trusted Real Estate Partner</title>
        <meta 
          name="description" 
          content="Leading real estate company specializing in property sales, purchases, and management along the Kenyan coast." 
        />
        <link rel="canonical" href="https://www.raslipwani.com" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative bg-cover bg-center h-screen" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')" }}>
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="container mx-auto px-4 h-full flex items-center relative z-10">
              <div className="max-w-2xl text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">Find Your Dream Property</h1>
                <p className="text-xl mb-8">Premium real estate services along the stunning Kenyan coast</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/properties" 
                    className="bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-md text-center transition-colors"
                  >
                    Browse Properties
                  </Link>
                  <Link 
                    to="/contact" 
                    className="bg-white hover:bg-gray-100 text-primary font-bold py-3 px-6 rounded-md text-center transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </section>
          
          {/* Services Section */}
          <section className="py-20 bg-light">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-primary mb-4">Our Services</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  We offer a comprehensive range of real estate services tailored to meet your unique needs.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {services.map((service, index) => (
                  <ServiceCard key={index} {...service} />
                ))}
              </div>
            </div>
          </section>
          
          {/* Why Choose Us Section */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-primary mb-4">Why Choose Us</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Discover why Raslipwani Properties is the preferred choice for real estate on the Kenyan coast.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {benefits.map((benefit, index) => (
                  <BenefitCard key={index} {...benefit} />
                ))}
              </div>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="py-20 bg-primary">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Dream Property?</h2>
              <p className="text-white text-xl mb-8 max-w-2xl mx-auto">
                Contact us today and let our experts guide you every step of the way.
              </p>
              <Link 
                to="/contact" 
                className="inline-block bg-white text-primary font-bold py-3 px-8 rounded-md hover:bg-gray-100 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

// Service Card Component
const ServiceCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div className="text-primary text-4xl mb-4">
      <i className={icon}></i>
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// Benefit Card Component
const BenefitCard = ({ title, description }) => (
  <div className="flex items-start">
    <div className="bg-primary rounded-full p-2 mr-4 mt-1">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
      </svg>
    </div>
    <div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

// Data for services
const services = [
  {
    icon: "fas fa-home",
    title: "Property Sales",
    description: "We help you sell your property at the best market value with strategic marketing."
  },
  {
    icon: "fas fa-search-dollar",
    title: "Property Purchases",
    description: "Find your dream home or investment property with our expert guidance."
  },
  {
    icon: "fas fa-chart-line",
    title: "Property Valuation",
    description: "Get accurate and reliable property assessments for informed decisions."
  },
  {
    icon: "fas fa-tasks",
    title: "Property Management",
    description: "Comprehensive management services to keep your investment profitable."
  }
];

// Data for benefits
const benefits = [
  {
    title: "Expert Team",
    description: "Local professionals and expatriates with deep industry knowledge."
  },
  {
    title: "Client-Centric",
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
    title: "Affordable Homes",
    description: "Partnerships to make homeownership seamless and affordable."
  }
];

export default Home;