import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../src/utils/supabaseClient'
import Header from '../components/Header';
import Footer from '../components/Footer';

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Format price as currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setProperty(data);
      } catch (err) {
        setError('Failed to load property details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
              <p>The property you're looking for doesn't exist or has been removed.</p>
            </div>
          )}
          <Link to="/properties" className="mt-6 inline-block text-primary hover:underline">
            &larr; Back to Properties
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{property.title} | Raslipwani Properties</title>
        <meta name="description" content={property.description.substring(0, 160)} />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <Link to="/properties" className="text-primary hover:underline mb-4 inline-block">
            &larr; Back to Properties
          </Link>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            {property.images?.[0] ? (
              <img 
                src={property.images[0]} 
                alt={property.title} 
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed w-full h-96 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-lg">No Image Available</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-800">{property.title}</h1>
                {property.featured && (
                  <span className="bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded-full">
                    Featured Property
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {property.location}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
                  <p className="text-sm text-gray-600">Bedrooms</p>
                  <p className="text-xl font-bold">{property.bedrooms}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
                  <p className="text-sm text-gray-600">Bathrooms</p>
                  <p className="text-xl font-bold">{property.bathrooms}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
                  <p className="text-sm text-gray-600">Area</p>
                  <p className="text-xl font-bold">{property.area_sqft} sqft</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-xl font-bold text-primary">{formatPrice(property.price)}</p>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">Description</h3>
              <p className="text-gray-700 mb-6 whitespace-pre-line">
                {property.description}
              </p>
              
              <h3 className="text-xl font-semibold mb-3">Property Features</h3>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {property.amenities?.map((amenity, i) => (
                  <div key={i} className="flex items-center bg-gray-50 px-4 py-2.5 rounded-lg">
                    <span className="text-primary mr-2">✓</span>
                    <span className="capitalize">{amenity.replace('-', ' ')}</span>
                  </div>
                ))}
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Additional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Property Type</p>
                    <p className="font-medium capitalize">{property.property_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Year Built</p>
                    <p className="font-medium">{property.year_built || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Lot Size</p>
                    <p className="font-medium">{property.lot_size_sqft ? `${property.lot_size_sqft} sqft` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-medium capitalize">{property.status}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Location</h3>
                <p className="text-gray-700">
                  {property.address}, {property.city}, {property.state} {property.zip_code}
                </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md h-fit border border-gray-100">
              <h3 className="text-xl font-semibold mb-4">Schedule a Viewing</h3>
              <p className="mb-4 text-gray-600">Interested in this property? Contact us to arrange a private viewing.</p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-medium">Call Us</span>
                </div>
                <p className="text-gray-700">+254 712 345 678</p>
              </div>
              
              <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors mb-4 font-medium">
                Book Viewing
              </button>
              <button className="w-full border border-primary text-primary py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                Contact Agent
              </button>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold mb-3">Property Status</h4>
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full mr-2 ${
                    property.status === 'available' ? 'bg-green-500' : 
                    property.status === 'pending' ? 'bg-yellow-500' : 
                    'bg-gray-500'
                  }`}></div>
                  <span className="capitalize">
                    {property.status === 'available' ? 'Available' : 
                     property.status === 'pending' ? 'Pending Sale' : 
                     'Sold'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default PropertyDetail;