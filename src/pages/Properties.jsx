import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch, FiFilter, FiMapPin, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { supabase } from '../../src/utils/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PropertyModal from '../components/PropertyModal';
import RecentlyViewed from '../components/RecentlyViewed';
import OptimizedImage from '../components/OptimizedImage';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

// Pagination constants
const PAGE_SIZE = 12;
const DEFAULT_PAGE = 1;

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [filterOption, setFilterOption] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilters, setActiveFilters] = useState([]);
  const [suggestedProperties, setSuggestedProperties] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  
  // Recently viewed hook
  const { 
    recentlyViewed, 
    addToRecentlyViewed, 
    removeFromRecentlyViewed, 
    clearRecentlyViewed 
  } = useRecentlyViewed();
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(DEFAULT_PAGE);
  }, [filterOption, purposeFilter, debouncedSearch, sortOption]);
  
  // Calculate pagination values
  const totalPages = useMemo(() => Math.ceil(totalCount / PAGE_SIZE), [totalCount]);
  const indexOfFirstItem = (currentPage - 1) * PAGE_SIZE;
  const indexOfLastItem = currentPage * PAGE_SIZE;

  const propertyTypeMap = {
    'house': ['house', 'apartment', 'villa'],
    'land': ['land'],
    'commercial': ['commercial', 'office'],
    'apartment': ['apartment'],
    'villa': ['villa'],
    'office': ['commercial', 'office'],
  };

  // SEO derived values
  const baseUrl = 'https://raslipwani.co.ke/properties';
  const canonicalUrl = baseUrl; // Keep canonical clean without query params to avoid duplicate content
  const listTitle = 'Properties for Sale & Rent Across Kenya | Raslipwani Properties';
  const listDescription = 'Browse premium properties across Kenya. Filter by type, purpose, and location. Find apartments, villas, land, and commercial listings.';

  // Fetch properties from Supabase with server-side pagination and filtering
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Build query with filters
        let query = supabase
          .from('properties')
          .select('*', { count: 'exact' });
        
        // Apply property type filter
        if (filterOption !== 'all') {
          const mappedTypes = propertyTypeMap[filterOption] || [filterOption];
          query = query.in('property_type', mappedTypes);
        }
        
        // Apply purpose filter
        if (purposeFilter !== 'all') {
          query = query.eq('purpose', purposeFilter);
        }
        
        // Apply search filter (on title, location, description)
        if (debouncedSearch) {
          query = query.or(
            `title.ilike.%${debouncedSearch}%,location.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`
          );
        }
        
        // Apply sorting
        switch (sortOption) {
          case 'price-low':
            query = query.order('price', { ascending: true });
            break;
          case 'price-high':
            query = query.order('price', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'newest':
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }
        
        // Apply pagination
        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);
        
        const { data, count, error } = await query;
        
        if (error) throw error;
        
        setProperties(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        setError('Failed to load properties: ' + err.message);
        setProperties([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [currentPage, filterOption, purposeFilter, debouncedSearch, sortOption]);

  // Initialize from URL params
  useEffect(() => {
    const type = searchParams.get('type');
    const purpose = searchParams.get('purpose');
    
    if (type) {
      setFilterOption(type);
      setActiveFilters(prev => [...prev, { 
        type: 'propertyType', 
        value: type, 
        label: `Type: ${type.charAt(0).toUpperCase() + type.slice(1)}` 
      }]);
    }
    
    if (purpose) {
      setPurposeFilter(purpose);
      setActiveFilters(prev => [...prev, { 
        type: 'purpose', 
        value: purpose, 
        label: `For: ${purpose.charAt(0).toUpperCase() + purpose.slice(1)}` 
      }]);
    }
  }, [searchParams]);

  // Build ItemList JSON-LD for listings (up to 20 items)
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Property Listings",
    "itemListElement": properties.slice(0, 20).map((p, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
  "url": `https://raslipwani.co.ke/properties/${p.slug || p.id}`,
      "item": {
        "@type": "RealEstateListing",
        "name": p.title,
        "description": p.description?.slice(0, 160),
        "image": p.images || [],
        "offers": {
          "@type": "Offer",
          "price": p.price,
          "priceCurrency": "KES",
          "availability": p.status === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        },
        "address": p.address ? {
          "@type": "PostalAddress",
          "streetAddress": p.address,
          "addressLocality": p.location,
          "addressCountry": "KE"
        } : undefined
      }
    }))
  };
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
  }, [filterOption, purposeFilter, searchQuery]);

  // Fetch suggested properties when no results
  useEffect(() => {
    const fetchSuggested = async () => {
      if (properties.length === 0 && !loading && totalCount === 0) {
        try {
          const { data } = await supabase
            .from('properties')
            .select('*')
            .eq('featured', true)
            .limit(4);
          setSuggestedProperties(data || []);
        } catch (err) {
          console.error('Error fetching suggested properties:', err);
        }
      } else {
        setSuggestedProperties([]);
      }
    };
    fetchSuggested();
  }, [properties.length, loading, totalCount]);

  // Open modal function and add to recently viewed
  const openModal = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
    addToRecentlyViewed(property); // Track viewed property
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
    setPurposeFilter('all');
    setSortOption('newest');
    setSearchParams({});
  };

  return (
    <>
      <Helmet>
        <title>{listTitle}</title>
        <meta name="description" content={listDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={listTitle} />
        <meta property="og:description" content={listDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://res.cloudinary.com/dzqdxosk2/image/upload/f_auto,q_auto,w_1200/v1718900000/kenya-properties-hero_md_omfqo1.jpg" />
        {/* Structured Data: ItemList */}
        <script type="application/ld+json">
          {JSON.stringify(itemListJsonLd)}
        </script>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        {/* Enhanced Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-primary pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          {/* Animated Background Elements */}
          <div className="absolute top-20 left-10 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent leading-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Discover Your <span className="text-primary">Dream Property</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-200 max-w-3xl mx-auto mb-8 font-light leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Premium real estate portfolio across Kenya's most desirable locations. 
                Find your perfect home, investment, or commercial space.
              </motion.p>
            </motion.div>
            
            {/* Enhanced Search Bar */}
            <motion.div 
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="bg-white rounded-2xl shadow-2xl p-2 border border-gray-100">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 relative">
                    <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="text"
                      placeholder="Search by location, property type, or keyword..."
                      className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-700 placeholder-gray-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-xl transition-colors font-medium"
                    >
                      <FiFilter className="text-lg" />
                      <span className="hidden sm:inline">Filters</span>
                    </button>
                    
                    <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl transition-colors font-medium shadow-lg hover:shadow-xl">
                      <FiSearch className="text-lg" />
                      <span>Search</span>
                    </button>
                  </div>
                </div>
                
                {/* Quick Filter Chips */}
                <div className="flex flex-wrap gap-2 mt-4 px-2 pb-2">
                  {[
                    { label: 'Nairobi', value: 'nairobi' },
                    { label: 'Mombasa', value: 'mombasa' },
                    { label: 'Kilifi', value: 'kilifi' },
                    { label: 'Diani', value: 'diani' },
                    { label: 'Apartments', value: 'apartment' },
                    { label: 'Lands', value: 'land' }
                  ].map((chip, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(chip.value)}
                      className="bg-gray-50 hover:bg-primary hover:text-white text-gray-700 px-3 py-1.5 rounded-full text-sm transition-all duration-300 border border-gray-200 hover:border-primary"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        <main className="flex-grow bg-gray-50">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Enhanced Filters Sidebar */}
              <motion.div 
                className={`lg:w-80 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Filter Properties</h2>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="lg:hidden text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Purpose Filter (Rent/Sale) */}
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-3 font-medium">Purpose</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'all', label: 'All', icon: '🏠' },
                        { value: 'sale', label: 'For Sale', icon: '💰' },
                        { value: 'rent', label: 'For Rent', icon: '📅' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPurposeFilter(option.value)}
                          className={`p-3 rounded-xl border-2 transition-all duration-300 text-center ${
                            purposeFilter === option.value
                              ? 'border-primary bg-primary/10 text-primary font-medium'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <div className="text-lg mb-1">{option.icon}</div>
                          <div className="text-sm">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Property Type */}
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-3 font-medium">Property Type</label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white"
                      value={filterOption}
                      onChange={(e) => setFilterOption(e.target.value)}
                    >
                      <option value="all">All Property Types</option>
                      <option value="house">House</option>
                      <option value="apartment">Apartment</option>
                      <option value="villa">Villa</option>
                      <option value="land">Land</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                  
                  {/* Sort By */}
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-3 font-medium">Sort By</label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white"
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
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-xl transition-colors border-2 border-transparent hover:border-gray-300"
                    onClick={clearAllFilters}
                  >
                    Reset All Filters
                  </motion.button>
                </div>
              </motion.div>
              
              {/* Property Listings */}
              <div className="flex-1">
                <motion.div 
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                      {totalCount} {totalCount === 1 ? 'Property' : 'Properties'} Found
                    </h2>
                    <p className="text-gray-600 mt-2">
                      {totalCount > 0 ? (
                        <>Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalCount)} of {totalCount} premium properties across Kenya</>
                      ) : (
                        'No properties match your current filters'
                      )}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="lg:hidden flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:border-primary transition-colors"
                  >
                    <FiFilter className="text-lg" />
                    <span>Filters</span>
                  </button>
                </motion.div>
                
                {/* Active Filters */}
                {activeFilters.length > 0 && (
                  <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-800">Active Filters</h3>
                      <button 
                        onClick={clearAllFilters}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeFilters.map((filter, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-primary/10 text-primary rounded-full pl-4 pr-3 py-2 flex items-center border border-primary/20"
                        >
                          <span className="text-sm font-medium mr-2">{filter.label}</span>
                          <button 
                            onClick={() => removeFilter(filter.type)}
                            className="text-primary/70 hover:text-primary transition-colors"
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
                    className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <FiX className="text-red-500" />
                      </div>
                      {error}
                    </div>
                  </motion.div>
                )}
                
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <PropertySkeleton key={item} />
                    ))}
                  </div>
                ) : properties.length === 0 ? (
                  <div>
                    <motion.div 
                      className="text-center py-16 bg-white rounded-2xl shadow-lg mb-12 border border-gray-100"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FiSearch className="text-3xl text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">No properties match your criteria</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Try adjusting your filters or search terms to find your perfect property in Kenya
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8 rounded-xl transition-colors shadow-lg hover:shadow-xl"
                        onClick={clearAllFilters}
                      >
                        Reset Filters & Search
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <>
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ staggerChildren: 0.1 }}
                    >
                      {properties.map((property, index) => (
                        <PropertyCard 
                          key={property.id} 
                          property={property} 
                          index={index}
                          openModal={openModal}
                        />
                      ))}
                    </motion.div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <motion.div 
                        className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <p className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages} • Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalCount)} of {totalCount} properties
                        </p>
                        
                        <div className="flex items-center gap-2">
                          {/* Previous Button */}
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                              currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                            }`}
                          >
                            <FiChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Previous</span>
                          </button>
                          
                          {/* Page Numbers */}
                          <div className="flex items-center gap-1">
                            {(() => {
                              const pages = [];
                              const maxVisible = 5;
                              let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                              let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                              
                              if (endPage - startPage < maxVisible - 1) {
                                startPage = Math.max(1, endPage - maxVisible + 1);
                              }
                              
                              if (startPage > 1) {
                                pages.push(
                                  <button
                                    key={1}
                                    onClick={() => setCurrentPage(1)}
                                    className="w-10 h-10 rounded-xl text-sm font-medium bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary transition-all"
                                  >
                                    1
                                  </button>
                                );
                                if (startPage > 2) {
                                  pages.push(
                                    <span key="start-ellipsis" className="px-2 text-gray-400">...</span>
                                  );
                                }
                              }
                              
                              for (let i = startPage; i <= endPage; i++) {
                                pages.push(
                                  <button
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                                      currentPage === i
                                        ? 'bg-primary text-white shadow-lg'
                                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                                    }`}
                                  >
                                    {i}
                                  </button>
                                );
                              }
                              
                              if (endPage < totalPages) {
                                if (endPage < totalPages - 1) {
                                  pages.push(
                                    <span key="end-ellipsis" className="px-2 text-gray-400">...</span>
                                  );
                                }
                                pages.push(
                                  <button
                                    key={totalPages}
                                    onClick={() => setCurrentPage(totalPages)}
                                    className="w-10 h-10 rounded-xl text-sm font-medium bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary transition-all"
                                  >
                                    {totalPages}
                                  </button>
                                );
                              }
                              
                              return pages;
                            })()}
                          </div>
                          
                          {/* Next Button */}
                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                              currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                            }`}
                          >
                            <span className="hidden sm:inline">Next</span>
                            <FiChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
        
        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <RecentlyViewed
            properties={recentlyViewed}
            onClear={clearRecentlyViewed}
            onRemove={removeFromRecentlyViewed}
            title="Recently Viewed"
            maxDisplay={6}
          />
        )}
        
        <Footer />

        {/* Property Modal */}
        <AnimatePresence>
          {isModalOpen && selectedProperty && (
            <PropertyModal 
              property={selectedProperty} 
              closeModal={closeModal}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

// Enhanced Property Card Component
const PropertyCard = ({ property, index, openModal }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getPurposeIcon = (purpose) => {
    switch (purpose) {
      case 'sale': return '💰';
      case 'rent': return '📅';
      default: return '🏠';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-gray-100"
      onClick={() => openModal(property)}
    >
      <div className="relative pb-[70%] overflow-hidden">
        {property.images?.[0] ? (
          <OptimizedImage 
            src={property.images[0]} 
            alt={`${property.title} in ${property.location}`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            containerClassName="absolute inset-0"
            priority={index < 3}
            width={400}
            height={280}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🏠</div>
              <span className="text-gray-500 text-sm">Image Coming Soon</span>
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {property.featured && (
            <div className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              Featured
            </div>
          )}
          <div className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
            {getPurposeIcon(property.purpose)} {property.purpose === 'sale' ? 'For Sale' : 'For Rent'}
          </div>
        </div>
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 z-[5]"></div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {property.title}
          </h2>
          <span className="text-lg font-bold text-primary whitespace-nowrap ml-2">
            {formatPrice(property.price)}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 flex items-center text-sm">
          <FiMapPin className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
          <span className="line-clamp-1">{property.location}</span>
        </p>
        
        <div className="flex justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center">
            <span className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center mr-1.5">
              <span className="text-primary text-xs">🛏️</span>
            </span>
            <span>{property.bedrooms || 0} Beds</span>
          </div>
          <div className="flex items-center">
            <span className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center mr-1.5">
              <span className="text-primary text-xs">🚿</span>
            </span>
            <span>{property.bathrooms || 0} Baths</span>
          </div>
          <div className="flex items-center">
            <span className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center mr-1.5">
              <span className="text-primary text-xs">📐</span>
            </span>
            <span>{property.area_sqft || 'N/A'} sqft</span>
          </div>
        </div>
        
        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 capitalize">
              {property.property_type}
            </span>
            <div className="text-primary font-medium text-sm group-hover:text-primary-dark transition-colors flex items-center">
              View Details
              <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Property Skeleton Loader
const PropertySkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse border border-gray-100">
    <div className="pb-[70%] relative bg-gradient-to-br from-gray-200 to-gray-300"></div>
    <div className="p-5">
      <div className="flex justify-between mb-3">
        <div className="h-5 bg-gray-200 rounded w-3/5"></div>
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-4/5 mb-4"></div>
      <div className="flex justify-between mb-4">
        <div className="h-3 bg-gray-200 rounded w-16"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export default Properties;