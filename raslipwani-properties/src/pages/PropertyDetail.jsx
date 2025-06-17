import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PropertyDetail = () => {
  const { id } = useParams();
  
  return (
    <>
      <Helmet>
        <title>Property Details | Raslipwani Properties</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <Link to="/properties" className="text-primary hover:underline mb-4 inline-block">
            &larr; Back to Properties
          </Link>
          
          <h1 className="text-3xl font-bold text-primary mb-6">Property {id}</h1>
          
          <div className="bg-gray-200 border-2 border-dashed w-full h-96 rounded-lg mb-6" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-4">Luxury Beachfront Villa</h2>
              <p className="text-gray-700 mb-6">
                Stunning beachfront property with panoramic ocean views. Located in the exclusive 
                Kikambala area of Kilifi County, this villa features modern amenities and spacious 
                living areas perfect for families or investors.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <p className="text-sm text-gray-600">Bedrooms</p>
                  <p className="text-xl font-bold">4</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <p className="text-sm text-gray-600">Bathrooms</p>
                  <p className="text-xl font-bold">3</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <p className="text-sm text-gray-600">Area</p>
                  <p className="text-xl font-bold">2500 sqft</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-xl font-bold text-primary">KSh 25M</p>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">Description</h3>
              <p className="text-gray-700 mb-6">
                This exquisite property features an open-plan living area, modern kitchen, 
                master suite with ocean view balcony, and a private swimming pool. The property 
                is fully gated with 24/7 security and comes with title deed.
              </p>
              
              <h3 className="text-xl font-semibold mb-3">Features</h3>
              <ul className="grid grid-cols-2 gap-3 mb-8">
                {['Swimming Pool', 'Ocean View', 'Gated Community', '24/7 Security', 
                  'Parking', 'Garden', 'Balcony', 'Fully Furnished'].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md h-fit">
              <h3 className="text-xl font-semibold mb-4">Schedule a Viewing</h3>
              <p className="mb-4">Interested in this property? Contact us to arrange a viewing.</p>
              <button className="w-full bg-primary text-white py-3 rounded-md hover:bg-secondary transition-colors mb-4">
                Book Viewing
              </button>
              <button className="w-full border border-primary text-primary py-3 rounded-md hover:bg-blue-50 transition-colors">
                Contact Agent
              </button>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default PropertyDetail;