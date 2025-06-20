import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { supabase } from '../../src/utils/supabaseClient'
import Header from '../components/Header';
import Footer from '../components/Footer';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch properties from Supabase
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setProperties(data);
      } catch (err) {
        setError('Failed to load properties: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  // Format price as currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      <Helmet>
        <title>Properties | Raslipwani Properties</title>
        <meta name="description" content="Browse our premium properties along the Kenyan coast" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Our Properties</h1>
          <p className="text-gray-600 mb-6">Discover our exclusive coastal real estate portfolio</p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl mb-4">No properties available</h3>
              <p className="text-gray-600">Check back later for new listings</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <div 
                  key={property.id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {property.images?.[0] ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.title} 
                      className="w-full h-60 object-cover"
                    />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed w-full h-60 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-bold text-gray-800">{property.title}</h2>
                      {property.featured && (
                        <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {property.location}
                    </p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm text-gray-600">{property.bedrooms} Beds | {property.bathrooms} Baths</p>
                        <p className="text-sm text-gray-600">{property.area_sqft} sqft</p>
                      </div>
                      <p className="text-lg font-bold text-primary">{formatPrice(property.price)}</p>
                    </div>
                    
                    <Link 
                     to={`/properties/${property.id}`}
                      className="block w-full text-center bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Properties;