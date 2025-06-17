import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Properties = () => {
  return (
    <>
      <Helmet>
        <title>Properties | Raslipwani Properties</title>
        <meta name="description" content="Browse our premium properties along the Kenyan coast" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-primary mb-6">Our Properties</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-200 border-2 border-dashed w-full h-48" />
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">Property {item}</h2>
                  <p className="text-gray-600 mb-3">Kikambala, Kilifi County</p>
                  <p className="text-lg font-bold text-primary">KSh 12,500,000</p>
                  <button className="mt-4 w-full bg-primary text-white py-2 rounded-md hover:bg-secondary transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Properties;