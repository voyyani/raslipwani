import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Services = () => {
  const services = [
    {
      title: "Property Sales",
      description: "We help you sell your property at the best market value with our strategic marketing approach.",
      icon: "fas fa-home"
    },
    {
      title: "Property Purchases",
      description: "Find your dream home or investment property with our expert guidance through the entire buying process.",
      icon: "fas fa-search-dollar"
    },
    {
      title: "Property Valuation",
      description: "Get accurate and reliable property assessments to make informed investment decisions.",
      icon: "fas fa-chart-line"
    },
    {
      title: "Property Management",
      description: "Comprehensive management services to ensure your investment remains profitable and well-maintained.",
      icon: "fas fa-tasks"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Services | Raslipwani Properties</title>
        <meta name="description" content="Our comprehensive real estate services on the Kenyan coast" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow">
          <section className="bg-primary py-16">
            <div className="container mx-auto px-4 text-center text-white">
              <h1 className="text-4xl font-bold mb-4">Our Services</h1>
              <p className="text-xl max-w-3xl mx-auto">
                Comprehensive real estate solutions tailored to meet your needs on the Kenyan coast
              </p>
            </div>
          </section>
          
          <section className="py-16 bg-light">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {services.map((service, index) => (
                  <div key={index} className="bg-white p-8 rounded-lg shadow-md">
                    <div className="text-primary text-4xl mb-5">
                      <i className={service.icon}></i>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-primary mb-4">Why Choose Our Services</h2>
              <p className="text-gray-600 max-w-3xl mx-auto mb-12">
                With years of experience and deep local knowledge, we provide unmatched real estate services
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  "Local market expertise",
                  "Client-focused approach",
                  "Ethical business practices",
                  "Professional team",
                  "Streamlined transactions",
                  "Affordable options"
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-primary rounded-full p-2 mr-4 mt-1">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <p className="text-lg text-left">{item}</p>
                  </div>
                ))}
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