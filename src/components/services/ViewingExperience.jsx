// src/pages/services/ViewingExperience.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';

const ViewingExperience = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [viewingType, setViewingType] = useState('physical');
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    bedrooms: '',
    minPrice: 0,
    maxPrice: 100000000,
    droneFootage: false
  });
  
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    notes: '',
    includeDrone: false
  });
  
  const [bookingStep, setBookingStep] = useState(0); // 0: not started, 1: property selected, 2: booking form
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setFilteredProperties(data);
      } catch (err) {
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Apply filters when they change
useEffect(() => {
  let result = [...properties];
  
  if (filters.location) {
    result = result.filter(p => 
      p.location.toLowerCase().includes(filters.location.toLowerCase())
    ); 
  }
  
  if (filters.propertyType) {
    result = result.filter(p => p.type === filters.propertyType);
  }
  
  if (filters.bedrooms) {
    result = result.filter(p => p.bedrooms >= parseInt(filters.bedrooms));
  }
  
  result = result.filter(p => 
    p.price >= filters.minPrice && p.price <= filters.maxPrice
  );
  
  if (filters.droneFootage) {
    result = result.filter(p => p.drone_footage);
  }
  
  setFilteredProperties(result);
}, [filters, properties]);
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleBookViewing = (property) => {
    setSelectedProperty(property);
    setBookingStep(1);
  };

  const handleBookingInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const appointment_at = bookingData.date && bookingData.time 
        ? `${bookingData.date}T${bookingData.time}:00.000Z`
        : null;

      const bookingRecord = {
        ...bookingData,
        property_id: selectedProperty.id,
        property_title: selectedProperty.title,
        viewing_type: viewingType,
        appointment_at,
        created_at: new Date().toISOString(),
        status: 'pending',
        drone_footage: bookingData.includeDrone,
        drone_fee: bookingData.includeDrone ? 15 : 0
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingRecord]);

      if (error) throw error;

      alert("Your viewing has been booked successfully! We'll send confirmation details shortly.");
      
      // Reset booking flow
      setSelectedProperty(null);
      setBookingStep(0);
      setBookingData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        notes: '',
        includeDrone: false
      });
      
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewingOptions = [
    { 
      type: "physical", 
      title: "In-Person Viewing", 
      description: "Personalized tour with our agent",
      duration: "1 hour",
      icon: "fas fa-walking",
      price: "Free",
      features: [
        "On-site property inspection",
        "Neighborhood tour",
        "Q&A with agent",
        "Immediate feedback"
      ]
    },
    { 
      type: "virtual", 
      title: "Virtual Tour", 
      description: "Live video walkthrough",
      duration: "30 minutes",
      icon: "fas fa-video",
      price: "Free",
      features: [
        "Live guided video tour",
        "Screen sharing for documents",
        "Recorded session available",
        "Flexible scheduling"
      ]
    },
    { 
      type: "vr", 
      title: "VR Experience", 
      description: "Immersive 3D walkthrough",
      duration: "45 minutes",
      icon: "fas fa-vr-cardboard",
      price: "$20",
      features: [
        "360° virtual reality experience",
        "Drone footage included",
        "Floor plan visualization",
        "Available after hours"
      ]
    }
  ];

  const getViewingPrice = () => {
    if (viewingType === 'vr') return 20;
    if (bookingData.includeDrone) return 15;
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      
      {/* Viewing Options Section */}
      <section id="viewing-options" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-primary mb-4"
            >
              Choose Your Viewing Experience
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-gray-600 max-w-3xl mx-auto"
            >
              Select the viewing option that best suits your needs and schedule
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {viewingOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 ${
                  viewingType === option.type 
                    ? 'border-primary shadow-lg' 
                    : 'border-transparent'
                } transition-all`}
              >
                <div className={`p-8 ${viewingType === option.type ? 'bg-primary/10' : ''}`}>
                  <div className="flex items-center mb-6">
                    <div className={`p-4 rounded-xl mr-4 ${
                      viewingType === option.type 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-primary'
                    }`}>
                      <i className={`${option.icon} text-2xl`}></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{option.title}</h3>
                      <p className="text-gray-600">{option.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold">Duration:</span>
                      <span>{option.duration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Price:</span>
                      <span className={`text-lg font-bold ${
                        option.price === "Free" ? 'text-green-600' : 'text-primary'
                      }`}>
                        {option.price}
                      </span>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {option.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => setViewingType(option.type)}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      viewingType === option.type
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {viewingType === option.type ? 'Selected' : 'Select Option'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 bg-blue-50 rounded-2xl p-6 border border-blue-200 max-w-3xl mx-auto">
            <div className="flex items-start">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <i className="fas fa-drone text-blue-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Drone Footage Add-On</h3>
                <p className="mb-4">
                  Enhance your viewing experience with professional drone footage showcasing 
                  the property and its surroundings from unique aerial perspectives. 
                </p>
                <div className="flex items-center">
                  <span className="font-bold text-lg text-primary mr-4">$15</span>
                  <div className="flex items-center">
                    <span className="mr-3">Available for all viewing types</span>
                    {viewingType === 'vr' ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                        Included with VR Experience
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Listings Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-primary mb-4"
            >
              Find Your Perfect Property
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-gray-600 max-w-3xl mx-auto"
            >
              Browse our curated selection of premium properties along the Kenyan coast
            </motion.p>
          </div>
          
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
            <h3 className="text-xl font-bold mb-6">Filter Properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Any location"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Property Type</label>
                <select
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="">All Types</option>
                  <option value="villa">Villa</option>
                  <option value="apartment">Apartment</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Bedrooms</label>
                <select
                  name="bedrooms"
                  value={filters.bedrooms}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Drone Footage Only</label>
                <div className="flex items-center mt-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="droneFootage"
                        checked={filters.droneFootage}
                        onChange={(e) => setFilters(prev => ({ ...prev, droneFootage: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {filters.droneFootage ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Property Listings */}
          {filteredProperties.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-xl font-bold mb-2">No properties match your criteria</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or check back later</p>
              <button 
                onClick={() => setFilters({
                  location: '',
                  propertyType: '',
                  bedrooms: '',
                  minPrice: 0,
                  maxPrice: 100000000,
                  droneFootage: false
                })}
                className="bg-primary text-white py-2 px-6 rounded-lg hover:bg-primary-dark"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map(property => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all"
                >
                  <div className="relative">
                    {property.main_image ? (
                      <img 
                        src={property.main_image} 
                        alt={property.title} 
                        className="w-full h-56 object-cover"
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-56 flex items-center justify-center text-gray-500">
                        <i className="fas fa-home text-4xl"></i>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {property.drone_footage && (
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                          <i className="fas fa-drone mr-1"></i> Drone
                        </span>
                      )}
                      {property.vr_available && (
                        <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                          <i className="fas fa-vr-cardboard mr-1"></i> VR
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h3 className="text-white font-bold text-lg">{property.title}</h3>
                      <p className="text-white/90 text-sm">{property.location}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-primary font-bold text-xl">
                        KSh {property.price.toLocaleString()}
                      </span>
                      <div className="flex gap-3 text-gray-600">
                        <span>
                          <i className="fas fa-bed mr-1"></i> {property.bedrooms || '-'}
                        </span>
                        <span>
                          <i className="fas fa-bath mr-1"></i> {property.bathrooms || '-'}
                        </span>
                        <span>
                          <i className="fas fa-ruler-combined mr-1"></i> {property.size || '-'} sqm
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {property.description || 'No description available'}
                    </p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => setSelectedProperty(property)}
                        className="text-primary font-medium hover:underline"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleBookViewing(property)}
                        className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
                      >
                        <i className="fas fa-calendar-check mr-2"></i> Book Viewing
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Flow */}
      {(bookingStep > 0 || selectedProperty) && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {bookingStep === 1 ? 'Confirm Viewing Details' : 'Schedule Your Viewing'}
                </h2>
                <button 
                  onClick={() => {
                    setSelectedProperty(null);
                    setBookingStep(0);
                  }}
                  className="text-gray-500 hover:text-primary"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              {bookingStep === 1 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Property Details</h3>
                    <div className="bg-gray-100 rounded-xl p-4 mb-6">
                      <div className="flex items-start">
                        {selectedProperty.main_image ? (
                          <img 
                            src={selectedProperty.main_image} 
                            alt={selectedProperty.title} 
                            className="w-24 h-24 object-cover rounded-lg mr-4"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 flex items-center justify-center text-gray-500 mr-4">
                            <i className="fas fa-home"></i>
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-lg">{selectedProperty.title}</h4>
                          <p className="text-gray-600 mb-2">{selectedProperty.location}</p>
                          <p className="text-primary font-bold">
                            KSh {selectedProperty.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="font-bold mb-3">Selected Viewing Experience</h4>
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center mb-2">
                          <i className={`${viewingOptions.find(o => o.type === viewingType)?.icon} text-primary text-xl mr-3`}></i>
                          <h5 className="font-bold text-lg">
                            {viewingOptions.find(o => o.type === viewingType)?.title}
                          </h5>
                        </div>
                        <p className="text-gray-600 mb-3">
                          {viewingOptions.find(o => o.type === viewingType)?.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span>Duration:</span>
                          <span>{viewingOptions.find(o => o.type === viewingType)?.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                      <h4 className="font-bold mb-3">Drone Footage</h4>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="mb-1">
                            Professional aerial footage showcasing the property and surroundings
                          </p>
                          <div className="flex items-center">
                            <span className={`font-bold ${
                              viewingType === 'vr' ? 'text-green-600' : 'text-primary'
                            }`}>
                              {viewingType === 'vr' ? 'Included with VR Experience' : '$15'}
                            </span>
                            {viewingType !== 'vr' && (
                              <label className="inline-flex items-center ml-4 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="includeDrone"
                                  checked={bookingData.includeDrone}
                                  onChange={handleBookingInputChange}
                                  className="sr-only peer"
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">Viewing Price:</span>
                        <span className="font-bold">
                          {viewingType === 'vr' ? '$20' : 'Free'}
                        </span>
                      </div>
                      {bookingData.includeDrone && viewingType !== 'vr' && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">Drone Footage:</span>
                          <span className="font-bold">$15</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="font-bold text-lg">Total:</span>
                        <span className="font-bold text-xl text-primary">
                          ${getViewingPrice().toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setBookingStep(2)}
                      className="w-full mt-6 bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors font-bold"
                    >
                      Continue to Schedule
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-4">What to Expect</h3>
                    <div className="space-y-4">
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start">
                          <div className="bg-primary/10 p-2 rounded-lg mr-3">
                            <i className="fas fa-clock text-primary"></i>
                          </div>
                          <div>
                            <h4 className="font-bold mb-1">Preparation</h4>
                            <p className="text-sm text-gray-600">
                              Our agent will prepare the property and gather all necessary information
                              for your viewing.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start">
                          <div className="bg-primary/10 p-2 rounded-lg mr-3">
                            <i className="fas fa-user text-primary"></i>
                          </div>
                          <div>
                            <h4 className="font-bold mb-1">Dedicated Agent</h4>
                            <p className="text-sm text-gray-600">
                              A specialized agent will guide you through the viewing, 
                              answering all your questions.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start">
                          <div className="bg-primary/10 p-2 rounded-lg mr-3">
                            <i className="fas fa-file-alt text-primary"></i>
                          </div>
                          <div>
                            <h4 className="font-bold mb-1">Follow-Up</h4>
                            <p className="text-sm text-gray-600">
                              After the viewing, we'll provide a detailed summary and next steps.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedProperty.drone_footage && (
                      <div className="mt-6">
                        <h4 className="font-bold mb-3">Drone Footage Preview</h4>
                        <div className="bg-gray-800 aspect-video rounded-xl flex items-center justify-center">
                          <div className="text-center text-white">
                            <i className="fas fa-play-circle text-4xl mb-2"></i>
                            <p>Drone Footage Available</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2">Full Name *</label>
                      <input 
                        type="text" 
                        name="name"
                        value={bookingData.name}
                        onChange={handleBookingInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Email *</label>
                      <input 
                        type="email" 
                        name="email"
                        value={bookingData.email}
                        onChange={handleBookingInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2">Phone *</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={bookingData.phone}
                        onChange={handleBookingInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Preferred Date *</label>
                      <input 
                        type="date" 
                        name="date"
                        value={bookingData.date}
                        onChange={handleBookingInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Preferred Time *</label>
                    <input 
                      type="time" 
                      name="time"
                      value={bookingData.time}
                      onChange={handleBookingInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Special Requests</label>
                    <textarea 
                      name="notes"
                      value={bookingData.notes}
                      onChange={handleBookingInputChange}
                      rows="3"
                      placeholder="Any specific requests or questions about the property"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    ></textarea>
                  </div>
                  
                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <i className="fas fa-spinner fa-spin mr-2"></i> Booking...
                        </span>
                      ) : (
                        `Confirm ${viewingOptions.find(o => o.type === viewingType)?.title}`
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default ViewingExperience;