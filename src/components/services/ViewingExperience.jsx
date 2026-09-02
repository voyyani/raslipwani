import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { supabase } from '../../utils/supabaseClient';

import { logger } from '../../utils/logger';
import Icon from '../Icon';
const ViewingExperience = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [viewingType, setViewingType] = useState('physical');
  const [bookingStep, setBookingStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  const [filters, setFilters] = useState({
    purpose: '',
    propertyType: '',
    location: '',
    bedrooms: '',
    minPrice: 0,
    maxPrice: 100000000,
  });

  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    notes: '',
  });

  const viewingOptions = [
  { 
    type: "physical", 
    title: "In-Person Viewing", 
    description: "Personalized tour with our agent",
    duration: "1 hour",
    icon: "walking",
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
    icon: "video",
    price: "Free",
    features: [
      "Live guided video tour",
      "Screen sharing for documents",
      "Recorded session available",
      "Flexible scheduling"
    ]
  },
  { 
    type: "3d", 
    title: "3D Viewing Experience", 
    description: "3D virtual tour of the property, and drone footage",
    duration: "Unlimited access for 7 days",
    icon: "vr-cardboard",
    price: "Ksh 5,000",
    features: [
      "360° property view",
      "Interactive navigation",
      "Compatible with VR headsets",
      "View from any device",
      "Drone footage included"
    ]
  }
];


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
      setShowResults(true);
    } catch (err) {
      logger.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (properties.length === 0) return;
    
    let result = [...properties];
    
    if (filters.purpose) {
      result = result.filter(p => 
        p.purpose?.toLowerCase() === filters.purpose.toLowerCase()
      );
    }
    
    if (filters.propertyType) {
      result = result.filter(p => 
        p.property_type && p.property_type.toLowerCase() === filters.propertyType.toLowerCase()
      );
    }
    
    if (filters.location) {
      result = result.filter(p => 
        p.location && p.location.toLowerCase().includes(filters.location.toLowerCase())
      ); 
    }
    
    if (filters.bedrooms) {
      result = result.filter(p => p.bedrooms >= parseInt(filters.bedrooms));
    }
    
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      result = result.filter(p => 
        p.price >= filters.minPrice && p.price <= filters.maxPrice
      );
    }
    
    setFilteredProperties(result);
  }, [filters, properties]);

  useEffect(() => {
    const newFilters = [];
    
    if (filters.purpose) {
      newFilters.push({ 
        type: 'purpose', 
        value: filters.purpose,
        label: `Purpose: ${filters.purpose}`
      });
    }
    
    if (filters.propertyType) {
      newFilters.push({ 
        type: 'propertyType', 
        value: filters.propertyType,
        label: `Property Type: ${filters.propertyType}`
      });
    }
    
    if (filters.location) {
      newFilters.push({ 
        type: 'location', 
        value: filters.location,
        label: `Location: ${filters.location}`
      });
    }
    
    if (filters.bedrooms) {
      newFilters.push({ 
        type: 'bedrooms', 
        value: filters.bedrooms,
        label: `Bedrooms: ${filters.bedrooms}+`
      });
    }
    
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      newFilters.push({
        type: 'priceRange',
        value: { min: filters.minPrice, max: filters.maxPrice },
        label: `Price: ${formatPrice(filters.minPrice)} - ${formatPrice(filters.maxPrice)}`
      });
    }
    
    setActiveFilters(newFilters);
  }, [filters]);

  const removeFilter = (filterType) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: ''
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      purpose: '',
      propertyType: '',
      location: '',
      bedrooms: '',
      minPrice: 0,
      maxPrice: 100000000,
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Booking submission logic
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
      });
      
    } catch (error) {
      logger.error('Booking error:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    // `flex-grow`, not `min-h-screen`: this page now sits inside the layout
    // route's flex column, which already fills the viewport. Keeping
    // `min-h-screen` here would push the footer a full screen down the page.
    <main className="flex-grow bg-gradient-to-b from-blue-50 to-white">
      {/* Viewing Options Section */}
      <section id="viewing-options" className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {viewingOptions.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`text-left bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${
                  viewingType === option.type 
                    ? 'border-primary ring-2 ring-primary/30' 
                    : 'border-transparent'
                } transition-all hover:shadow-md focus:outline-none`}
                onClick={() => setViewingType(option.type)}
              >
                <div className={`p-6 ${viewingType === option.type ? 'bg-primary/5' : ''}`}>
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-xl mr-3 ${
                      viewingType === option.type 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-primary'
                    }`}>
                      <Icon name={option.icon} size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{option.title}</h3>
                      <p className="text-gray-600 text-sm">{option.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Duration:</span>
                      <span className="text-sm">{option.duration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Price:</span>
                      <span className={`font-medium ${
                        option.price === "Free" ? 'text-green-600' : 'text-primary'
                      }`}>
                        {option.price}
                      </span>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-4 text-sm">
                    {option.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Icon name="check-circle" size={12} className="text-green-500 mt-0.5 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className={`w-full py-2.5 rounded-lg font-medium text-sm text-center ${
                    viewingType === option.type
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {viewingType === option.type ? 'Selected' : 'Select Option'}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-primary mb-3"
            >
              Find Your Perfect Property
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-gray-600 max-w-3xl mx-auto text-sm"
            >
              Browse our curated selection of premium properties
            </motion.p>
          </div>
          
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-5 mb-8">
            <h3 className="text-lg font-bold mb-4">Filter Properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 text-sm">Purpose</label>
                <select
                  name="purpose"
                  value={filters.purpose}
                  onChange={handleFilterChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Purposes</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 text-sm">Property Type</label>
                <select
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleFilterChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Types</option>
                  <option value="villa">Villa</option>
                  <option value="apartment">Apartment</option>
                  <option value="residential">Residential</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 text-sm">Location</label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Enter location"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 text-sm">Bedrooms</label>
                <select
                  name="bedrooms"
                  value={filters.bedrooms}
                  onChange={handleFilterChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
            </div>
            
            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-800">Active Filters</h3>
                  <button 
                    onClick={clearAllFilters}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear All Filters
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-primary/10 text-primary rounded-full pl-2.5 pr-1.5 py-1 flex items-center text-xs"
                    >
                      <span className="mr-1">{filter.label}</span>
                      <button 
                        onClick={() => removeFilter(filter.type)}
                        className="ml-0.5 text-primary/70 hover:text-primary"
                      >
                        <FiX size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-between">
              <button
                onClick={fetchProperties}
                className="bg-primary text-white py-2.5 px-6 rounded-lg hover:bg-primary-dark font-medium text-sm"
              >
                {showResults ? 'Update Results' : 'Find Properties'}
              </button>
              
              <button
                onClick={clearAllFilters}
                className="bg-gray-100 text-gray-800 py-2.5 px-5 rounded-lg hover:bg-gray-200 font-medium text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          {/* Property Listings */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
            </div>
          )}
          
          {showResults && !loading && filteredProperties.length === 0 && (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Icon name="search" size={30} className="text-gray-400 mb-3" />
              <h3 className="text-lg font-bold mb-1">No properties match your criteria</h3>
              <p className="text-gray-600 mb-4 text-sm">Try adjusting your filters or check back later</p>
              <button 
                onClick={clearAllFilters}
                className="bg-primary text-white py-1.5 px-5 rounded-lg hover:bg-primary-dark text-sm"
              >
                Reset Filters
              </button>
            </div>
          )}
          
          {showResults && !loading && filteredProperties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map(property => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="relative pb-[75%] overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-500">
                        <Icon name="home" size={30} />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <h3 className="text-white font-bold text-md">{property.title}</h3>
                      <p className="text-white/90 text-xs">{property.location}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-primary font-bold text-lg">
                        {formatPrice(property.price)}
                      </span>
                      <div className="flex gap-2 text-gray-600 text-xs">
                        <span>
                          <Icon name="bed" className="mr-1" /> {property.bedrooms || '-'}
                        </span>
                        <span>
                          <Icon name="bath" className="mr-1" /> {property.bathrooms || '-'}
                        </span>
                        <span>
                          <Icon name="ruler-combined" className="mr-1" /> {property.area_sqft || '-'} sqft
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                      {property.description || 'No description available'}
                    </p>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setSelectedProperty(property);
                          setBookingStep(1);
                        }}
                        className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors text-sm flex items-center justify-center"
                      >
                        <Icon name="calendar-check" className="mr-1.5" /> Book Viewing
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Flow Modal */}
      <AnimatePresence>
        {(bookingStep > 0 && selectedProperty) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {bookingStep === 1 ? 'Confirm Viewing Details' : 'Schedule Your Viewing'}
                  </h2>
                  <button 
                    onClick={() => {
                      setSelectedProperty(null);
                      setBookingStep(0);
                    }}
                    className="text-gray-500 hover:text-primary"
                  >
                    <Icon name="times" />
                  </button>
                </div>
                
                {bookingStep === 1 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-bold mb-3">Property Details</h3>
                      <div className="bg-gray-100 rounded-lg p-3 mb-4">
                        <div className="flex items-start">
                          {selectedProperty.images && selectedProperty.images.length > 0 ? (
                            <img 
                              src={selectedProperty.images[0]} 
                              alt={selectedProperty.title} 
                              className="w-20 h-20 object-cover rounded-lg mr-3"
                            />
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-20 h-20 flex items-center justify-center text-gray-500 mr-3">
                              <Icon name="home" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-md">{selectedProperty.title}</h4>
                            <p className="text-gray-600 mb-1 text-sm">{selectedProperty.location}</p>
                            <p className="text-primary font-bold text-sm">
                              {formatPrice(selectedProperty.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-bold mb-2 text-md">Selected Viewing Experience</h4>
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center mb-1">
                            <Icon name={viewingOptions.find(o => o.type === viewingType)?.icon} className="text-primary mr-2" />
                            <h5 className="font-bold">
                              {viewingOptions.find(o => o.type === viewingType)?.title}
                            </h5>
                          </div>
                          <p className="text-gray-600 mb-2 text-sm">
                            {viewingOptions.find(o => o.type === viewingType)?.description}
                          </p>
                          <div className="flex justify-between items-center text-sm">
                            <span>Duration:</span>
                            <span>{viewingOptions.find(o => o.type === viewingType)?.duration}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1 text-sm">
                          <span className="font-medium">Viewing Price:</span>
                          <span className="font-bold">
                            {viewingOptions.find(o => o.type === viewingType)?.price}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setBookingStep(2)}
                        className="w-full mt-4 bg-primary text-white py-2.5 px-5 rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm"
                      >
                        Continue to Schedule
                      </button>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold mb-3">What to Expect</h3>
                      <div className="space-y-3">
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start">
                            <div className="bg-primary/10 p-1.5 rounded mr-2">
                              <Icon name="clock" size={14} className="text-primary" />
                            </div>
                            <div>
                              <h4 className="font-bold mb-1 text-sm">Preparation</h4>
                              <p className="text-xs text-gray-600">
                                Our agent will prepare the property for your viewing
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start">
                            <div className="bg-primary/10 p-1.5 rounded mr-2">
                              <Icon name="user" size={14} className="text-primary" />
                            </div>
                            <div>
                              <h4 className="font-bold mb-1 text-sm">Dedicated Agent</h4>
                              <p className="text-xs text-gray-600">
                                A specialized agent will guide you through the viewing
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start">
                            <div className="bg-primary/10 p-1.5 rounded mr-2">
                              <Icon name="file-alt" size={14} className="text-primary" />
                            </div>
                            <div>
                              <h4 className="font-bold mb-1 text-sm">Follow-Up</h4>
                              <p className="text-xs text-gray-600">
                                After the viewing, we'll provide a detailed summary
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-1 text-sm">Full Name *</label>
                        <input 
                          type="text" 
                          name="name"
                          value={bookingData.name}
                          onChange={(e) => setBookingData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1 text-sm">Email *</label>
                        <input 
                          type="email" 
                          name="email"
                          value={bookingData.email}
                          onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-1 text-sm">Phone *</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={bookingData.phone}
                          onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                          required
                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1 text-sm">Preferred Date *</label>
                        <input 
                          type="date" 
                          name="date"
                          value={bookingData.date}
                          onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                          required
                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Preferred Time *</label>
                      <input 
                        type="time" 
                        name="time"
                        value={bookingData.time}
                        onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                        required
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Special Requests</label>
                      <textarea 
                        name="notes"
                        value={bookingData.notes}
                        onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                        rows="3"
                        placeholder="Any specific requests or questions"
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                      ></textarea>
                    </div>
                    
                    <div className="pt-3">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary text-white font-medium py-2.5 px-5 rounded-lg shadow hover:shadow-md disabled:opacity-70 text-sm"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <Icon name="spinner" className="animate-spin mr-2" /> Booking...
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
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default ViewingExperience;