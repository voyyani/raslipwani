import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { supabase } from '../../src/utils/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [filterOption, setFilterOption] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all'); // NEW: Rent/Sale filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilters, setActiveFilters] = useState([]);
  const [suggestedProperties, setSuggestedProperties] = useState([]);

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
        setError('Failed to load properties: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  // Initialize from URL params
  useEffect(() => {
    const type = searchParams.get('type');
    const purpose = searchParams.get('purpose'); // NEW: Get purpose from URL
    
    if (type) {
      setFilterOption(type);
      setActiveFilters(prev => [...prev, { 
        type: 'propertyType', 
        value: type, 
        label: `Type: ${type.charAt(0).toUpperCase() + type.slice(1)}` 
      }]);
    }
    
    // NEW: Set purpose filter if exists in URL
    if (purpose) {
      setPurposeFilter(purpose);
      setActiveFilters(prev => [...prev, { 
        type: 'purpose', 
        value: purpose, 
        label: `For: ${purpose.charAt(0).toUpperCase() + purpose.slice(1)}` 
      }]);
    }
  }, [searchParams]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...properties];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(property => 
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply property type filter
    if (filterOption !== 'all') {
      result = result.filter(property => 
        property.type === filterOption
      );
    }
    
    // NEW: Apply purpose filter (rent/sale)
    if (purposeFilter !== 'all') {
      result = result.filter(property => 
        property.purpose === purposeFilter
      );
    }
    
    // Apply sorting
    if (sortOption === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortOption === 'oldest') {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    
    setFilteredProperties(result);
  }, [properties, sortOption, filterOption, purposeFilter, searchQuery]); // NEW: Added purposeFilter

  // Update active filters
  useEffect(() => {
    const filters = [];
    
    if (filterOption !== 'all') {
      filters.push({
        type: 'propertyType',
        value: filterOption,
        label: `Type: ${filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}`
      });
    }
    
    // NEW: Add purpose filter if active
    if (purposeFilter !== 'all') {
      filters.push({
        type: 'purpose',
        value: purposeFilter,
        label: `For: ${purposeFilter.charAt(0).toUpperCase() + purposeFilter.slice(1)}`
      });
    }
    
    if (searchQuery) {
      filters.push({
        type: 'search',
        value: searchQuery,
        label: `Search: "${searchQuery}"`
      });
    }
    
    setActiveFilters(filters);
  }, [filterOption, purposeFilter, searchQuery]); // NEW: Added purposeFilter

  // Fetch suggested properties when no results
  useEffect(() => {
    if (filteredProperties.length === 0 && properties.length > 0) {
      const featured = properties
        .filter(p => p.featured)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      setSuggestedProperties(featured);
    }
  }, [filteredProperties, properties]);

  // Format price as currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Open modal function
  const openModal = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Close modal function
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
    document.body.style.overflow = 'auto';
  };

  // Remove a specific filter
  const removeFilter = (filterType) => {
    if (filterType === 'propertyType') {
      setFilterOption('all');
      const params = new URLSearchParams(searchParams);
      params.delete('type');
      setSearchParams(params);
    }
    // NEW: Handle purpose filter removal
    if (filterType === 'purpose') {
      setPurposeFilter('all');
      const params = new URLSearchParams(searchParams);
      params.delete('purpose');
      setSearchParams(params);
    }
    if (filterType === 'search') {
      setSearchQuery('');
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterOption('all');
    setPurposeFilter('all'); // NEW: Reset purpose filter
    setSortOption('newest');
    setSearchParams({});
  };

  return (
    <>
      <Helmet>
        <title>Properties | Raslipwani Properties</title>
        <meta name="description" content="Browse our premium properties along the Kenyan coast" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-gradient-to-b from-primary/30 to-secondary/20 z-0"
          />
          
          <div 
            className="relative bg-cover bg-center h-[70vh] min-h-[500px] flex items-center"
            style={{ 
              backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://res.cloudinary.com/dzqdxosk2/image/upload/f_auto,q_auto,w_1920/v1718900000/properties-hero_lg_omfqo1.jpg')",
              backgroundAttachment: 'fixed'
            }}
          >
            <div className="absolute inset-0">
              <motion.div 
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80"
              />
            </div>
            
            <div className="container mx-auto px-4 relative z-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <motion.h1 
                  className="text-4xl md:text-6xl font-bold text-white mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Discover Your <span className="text-primary">Dream Property</span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-white max-w-3xl mx-auto mb-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  Premium coastal real estate portfolio along Kenya's stunning coastline
                </motion.p>
                
                <motion.div 
                  className="flex justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="relative w-full max-w-2xl">
                    <input
                      type="text"
                      placeholder="Search by location, property type, or keyword..."
                      className="w-full px-6 py-4 rounded-full bg-white/90 backdrop-blur-sm shadow-xl focus:ring-2 focus:ring-primary focus:outline-none pr-16"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary text-white p-3 rounded-full hover:bg-primary-dark transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </div>
            
            <motion.div 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </div>
        </div>
        
        <main className="flex-grow container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Filters Sidebar */}
            <motion.div 
              className="lg:w-1/4"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Filter Properties</h2>
                
                {/* Search */}
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Enter location or keyword"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* NEW: Purpose Filter (Rent/Sale) */}
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Purpose</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={purposeFilter}
                    onChange={(e) => setPurposeFilter(e.target.value)}
                  >
                    <option value="all">All Purposes</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
                
                {/* Property Type */}
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Property Type</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={filterOption}
                    onChange={(e) => setFilterOption(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                
                {/* Sort By */}
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Sort By</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
                
                {/* Reset Filters */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-xl transition-colors"
                  onClick={clearAllFilters}
                >
                  Reset Filters
                </motion.button>
              </div>
            </motion.div>
            
            {/* Property Listings */}
            <div className="lg:w-3/4">
              <motion.div 
                className="flex justify-between items-center mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {filteredProperties.length} Properties Found
                </h2>
                <div className="text-gray-600">
                  Showing {filteredProperties.length} of {properties.length} properties
                </div>
              </motion.div>
              
              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <motion.div 
                  className="mb-8"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-800">Active Filters</h3>
                    <button 
                      onClick={clearAllFilters}
                      className="text-sm text-primary hover:underline"
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
                        className="bg-primary/10 text-primary rounded-full pl-3 pr-2 py-1.5 flex items-center"
                      >
                        <span className="text-sm mr-1">{filter.label}</span>
                        <button 
                          onClick={() => removeFilter(filter.type)}
                          className="ml-1 text-primary/70 hover:text-primary"
                        >
                          <FiX size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {error && (
                <motion.div 
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.div>
              )}
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                  {[1, 2, 3, 4].map((item) => (
                    <PropertySkeleton key={item} />
                  ))}
                </div>
              ) : filteredProperties.length === 0 ? (
                <div>
                  <motion.div 
                    className="text-center py-16 bg-white rounded-2xl shadow-xl mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-5xl text-primary mb-6">🏝️</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">No properties match your criteria</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Try adjusting your filters or search terms to find your perfect coastal property
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8 rounded-xl transition-colors"
                      onClick={clearAllFilters}
                    >
                      Reset Filters
                    </motion.button>
                  </motion.div>
                  
                  {/* Suggested Properties */}
                  {suggestedProperties.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-12"
                    >
                      <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                        Featured Properties You Might Like
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {suggestedProperties.map((property, index) => (
                          <PropertyCard 
                            key={property.id} 
                            property={property} 
                            index={index}
                            openModal={openModal}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  {filteredProperties.map((property, index) => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      index={index}
                      openModal={openModal}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </main>
        
        <Footer />

        {/* Property Modal */}
        <AnimatePresence>
          {isModalOpen && selectedProperty && (
            <PropertyModal 
              property={selectedProperty} 
              closeModal={closeModal}
              formatPrice={formatPrice}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

// Property Card Component
const PropertyCard = ({ property, index, openModal }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group"
    >
      <div className="relative pb-[75%] overflow-hidden">
        {property.images?.[0] ? (
          <img 
            src={property.images[0]} 
            alt={property.title} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
            <span className="text-gray-500">No Image Available</span>
          </div>
        )}
        {property.featured && (
          <div className="absolute top-4 right-4 bg-primary text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
            Featured
          </div>
        )}
        <button className="absolute top-4 left-4 bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <motion.h2 
            className="text-xl font-bold text-gray-800"
            whileHover={{ color: '#3b82f6' }}
          >
            {property.title}
          </motion.h2>
          <span className="text-xl font-bold text-primary">
            {formatPrice(property.price)}
          </span>
        </div>
        
        <p className="text-gray-600 mb-5 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {property.location}
        </p>
        
        <div className="flex justify-between mb-6">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm">{property.bedrooms || 0} Beds</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">{property.bathrooms || 0} Baths</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
            </svg>
            <span className="text-sm">{property.area_sqft || 'N/A'} sqft</span>
          </div>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <button 
            onClick={() => openModal(property)}
            className="block w-full text-center bg-gradient-to-r from-primary to-secondary text-white py-3.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
          >
            View Details
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Property Modal Component
const PropertyModal = ({ property, closeModal, formatPrice }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

  const handlePrev = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex(prev => 
      (prev + 1) % property.images.length
    );
  };

  // Touch handling for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (diff > 50) handleNext(); // Swipe left
    if (diff < -50) handlePrev(); // Swipe right
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') closeModal();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={closeModal}
    >
      <motion.div
        className="relative bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={closeModal}
            className="bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Carousel */}
        <div 
          className="relative h-[50vh] min-h-[300px] bg-gray-100"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {property.images?.length > 0 ? (
            <>
              {/* Main Image */}
              <div className="absolute inset-0 overflow-hidden">
                <AnimatePresence initial={false} mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={property.images[currentImageIndex]}
                    alt={`Property image ${currentImageIndex + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    loading="eager"
                  />
                </AnimatePresence>
              </div>
              
              {/* Navigation Arrows */}
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-colors"
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-colors"
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Thumbnail Strip */}
              <div className="absolute bottom-4 left-0 right-0 px-4 z-10">
                <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                  {property.images.map((img, index) => (
                    <button
                      key={index}
                      className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-primary scale-105' 
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Image Counter */}
              <div className="absolute top-4 left-4 z-10 bg-black/50 text-white text-sm font-medium px-3 py-1 rounded-full">
                {currentImageIndex + 1} / {property.images.length}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <span className="text-xl">No images available</span>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="p-6 md:p-8 overflow-y-auto flex-grow">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {property.title}
              </h2>
              <p className="text-gray-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {property.location}
              </p>
            </div>
            <span className="text-2xl md:text-3xl font-bold text-primary">
              {formatPrice(property.price)}
            </span>
          </div>
          
          {/* Property Features */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm font-medium">{property.bedrooms || 0} Beds</span>
            </div>
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">{property.bathrooms || 0} Baths</span>
            </div>
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
              </svg>
              <span className="text-sm font-medium">{property.area_sqft || 'N/A'} sqft</span>
            </div>
          </div>
          
          {/* Property Description */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {property.description || 'No description available.'}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-primary to-secondary text-white font-medium py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              Contact Agent
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white border border-primary text-primary font-medium py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              Schedule Tour
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Property Skeleton Loader
const PropertySkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-xl animate-pulse">
    <div className="pb-[75%] relative bg-gradient-to-br from-gray-100 to-gray-200"></div>
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <div className="h-7 bg-gray-200 rounded-xl w-3/5"></div>
        <div className="h-7 bg-gray-200 rounded-xl w-1/4"></div>
      </div>
      <div className="h-5 bg-gray-200 rounded-xl w-3/4 mb-6"></div>
      <div className="flex justify-between mb-6">
        <div className="h-4 bg-gray-200 rounded-xl w-16"></div>
        <div className="h-4 bg-gray-200 rounded-xl w-16"></div>
        <div className="h-4 bg-gray-200 rounded-xl w-16"></div>
      </div>
      <div className="h-12 bg-gray-200 rounded-xl"></div>
    </div>
  </div>
);

export default Properties;