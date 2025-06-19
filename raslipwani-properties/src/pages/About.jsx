import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Raslipwani Properties</title>
        <meta name="description" content="Learn about our company and team" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow">
          
          
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-primary mb-6">Our Story</h2>
                  <p className="text-gray-700 mb-4">
                    Founded in Kilifi County, Raslipwani Properties has grown to become a leading real estate agency 
                    specializing in property sales, purchases, and management along the stunning Kenyan coast.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Our team of local experts and expatriates brings together decades of experience in the real estate 
                    industry, combining international standards with deep local market knowledge.
                  </p>
                  <p className="text-gray-700">
                    We pride ourselves on delivering exceptional service with integrity, transparency, and professionalism, 
                    ensuring our clients have a seamless and rewarding property transaction experience.
                  </p>
                </div>
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96" />
              </div>
            </div>
          </section>
          
          <section className="py-16 bg-light">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-primary mb-4">Our Mission & Vision</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Guiding principles that drive our business forward
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-2xl font-bold mb-4 text-primary">Mission</h3>
                  <p className="text-gray-700">
                    To deliver exceptional real estate services that exceed client expectations, ensuring 
                    a seamless and rewarding property transaction experience.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-2xl font-bold mb-4 text-primary">Vision</h3>
                  <p className="text-gray-700">
                    To be the most trusted and recognized real estate company on the Kenyan coast, 
                    known for integrity, professionalism, and excellence.
                  </p>
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

export default About;