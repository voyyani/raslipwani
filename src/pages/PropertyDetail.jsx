import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../src/utils/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0, top: 0, bottom: 0 });
  
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const lastTapRef = useRef(0);
  const touchStartRef = useRef(0);

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

  // Derived SEO fields
  const pageUrl = property ? `https://raslipwani.co.ke/properties/${property.slug || property.id}` : `https://raslipwani.co.ke/properties/${id}`;
  const title = property ? `${property.title} | ${property.location} | Raslipwani Properties` : 'Property Details | Raslipwani Properties';
  const description = property ? (
    `${property.description?.slice(0, 155) || 'Explore this property at Raslipwani Properties.'}`
  ) : 'Explore this property at Raslipwani Properties.';
  const ogImage = property?.images?.[0];

  const jsonLd = property ? {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description,
    "url": pageUrl,
    "image": property.images || [],
    "address": property.address ? {
      "@type": "PostalAddress",
      "streetAddress": property.address,
      "addressLocality": property.location,
      "addressCountry": "KE"
    } : undefined,
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "KES",
      "availability": property.status === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "seller": {
      "@type": "Organization",
      "name": "Raslipwani Properties",
      "url": "https://raslipwani.co.ke"
    }
  } : null;

  // Handle image navigation
  const handlePrev = useCallback(() => {
    if (!property?.images?.length) return;
    setCurrentImageIndex(prev => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
    resetZoom();
    setIsImageLoading(true);
  }, [property?.images?.length]);

  const handleNext = useCallback(() => {
    if (!property?.images?.length) return;
    setCurrentImageIndex(prev => 
      (prev + 1) % property.images.length
    );
    resetZoom();
    setIsImageLoading(true);
  }, [property?.images?.length]);

  // Reset zoom state
  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Enhanced toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    // Check current fullscreen state
    const isFullscreen = document.fullscreenElement || 
                        document.webkitFullscreenElement ||
                        document.mozFullScreenElement;
    
    if (isFullscreen) {
      // Exit fullscreen
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    } else {
      // Enter fullscreen
      const element = containerRef.current;
      if (element.requestFullscreen) element.requestFullscreen();
      else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
      else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
      else if (element.msRequestFullscreen) element.msRequestFullscreen();
    }
    // Always show controls in fullscreen
    setShowControls(true);
  }, []);

  // Handle container click
  const handleContainerClick = useCallback((e) => {
    // Only trigger fullscreen if clicking directly on the image container
    if (e.target === containerRef.current || e.target === imageRef.current) {
      toggleFullscreen();
    }
    // Always show controls in fullscreen
    setShowControls(true);
  }, [toggleFullscreen]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = 
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      
      setIsFullscreen(!!fullscreenElement);
      if (!fullscreenElement) {
        resetZoom();
      }
      // Always show controls in fullscreen
      setShowControls(true);
    };
    
    // Add all browser-specific events
    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange'
    ];
    
    events.forEach(event => {
      document.addEventListener(event, handleFullscreenChange);
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFullscreenChange);
      });
    };
  }, []);

  // Handle keyboard navigation in fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft': 
          handlePrev(); 
          break;
        case 'ArrowRight': 
          handleNext(); 
          break;
        case 'Escape': 
          toggleFullscreen(); 
          break;
        case 'z': 
          setZoom(prev => prev > 1 ? 1 : 2); 
          break;
        case ' ': 
          handleNext();
          break;
        default: 
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, handlePrev, handleNext, toggleFullscreen]);

  // Handle touch gestures
  const handleTouchStart = useCallback((e) => {
    touchStartRef.current = e.touches[0].clientX;
    // Always show controls on touch
    setShowControls(true);
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;
    
    if (zoom === 1 && property?.images?.length > 1) {
      if (diff > 50) handleNext();
      else if (diff < -50) handlePrev();
    }
    
    // Double-tap detection
    const currentTime = new Date().getTime();
    if (currentTime - lastTapRef.current < 300) {
      handleDoubleTap(e);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = currentTime;
    }
  }, [zoom, handleNext, handlePrev, property?.images?.length]);

  // Double-tap zoom functionality
  const handleDoubleTap = useCallback((e) => {
    if (!isFullscreen) return;
    
    const newZoom = zoom > 1 ? 1 : 2;
    setZoom(newZoom);
    
    if (newZoom > 1) {
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const touchX = e.changedTouches[0].clientX - rect.left;
      const touchY = e.changedTouches[0].clientY - rect.top;
      
      // Calculate new position to center on tap point
      const newX = (rect.width/2 - touchX) * newZoom;
      const newY = (rect.height/2 - touchY) * newZoom;
      
      setPosition({ x: newX, y: newY });
    } else {
      setPosition({ x: 0, y: 0 });
    }
    
    // Always show controls on double tap
    setShowControls(true);
  }, [isFullscreen, zoom]);

  // Handle image load
  const handleImageLoad = useCallback((e) => {
    setIsImageLoading(false);
    setImageDimensions({
      width: e.target.naturalWidth,
      height: e.target.naturalHeight
    });
  }, []);

  // Update drag constraints when zoom changes
  useEffect(() => {
    if (!containerRef.current || !imageDimensions.width || !imageDimensions.height) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    const imgAspect = imageDimensions.width / imageDimensions.height;
    const containerAspect = containerWidth / containerHeight;
    
    let displayedWidth, displayedHeight;
    if (imgAspect > containerAspect) {
      displayedWidth = containerWidth;
      displayedHeight = containerWidth / imgAspect;
    } else {
      displayedHeight = containerHeight;
      displayedWidth = containerHeight * imgAspect;
    }
    
    const horizontal = Math.max(0, (displayedWidth * zoom - containerWidth) / 2);
    const vertical = Math.max(0, (displayedHeight * zoom - containerHeight) / 2);
    
    setDragConstraints({
      left: -horizontal,
      right: horizontal,
      top: -vertical,
      bottom: vertical
    });
  }, [zoom, imageDimensions]);

  // Reset zoom when image changes
  useEffect(() => {
    resetZoom();
  }, [currentImageIndex]);

  // Preload next and previous images
  useEffect(() => {
    if (!property?.images || property.images.length < 2) return;
    
    const preloadImage = (index) => {
      const img = new Image();
      img.src = property.images[index];
    };
    
    // Preload next image
    const nextIndex = (currentImageIndex + 1) % property.images.length;
    preloadImage(nextIndex);
    
    // Preload previous image
    const prevIndex = (currentImageIndex - 1 + property.images.length) % property.images.length;
    preloadImage(prevIndex);
  }, [currentImageIndex, property?.images]);

  // Loading state
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

  // Error state
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
      {/* Page-specific SEO */}
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:url" content={pageUrl} />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        {jsonLd && (
          <script type="application/ld+json">
            {JSON.stringify(jsonLd)}
          </script>
        )}
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          {/* Breadcrumbs with schema for SEO */}
          <nav className="text-sm mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2" itemScope itemType="https://schema.org/BreadcrumbList">
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to="/" itemProp="item" className="text-primary hover:underline">
                  <span itemProp="name">Home</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <span className="mx-2">/</span>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to="/properties" itemProp="item" className="text-primary hover:underline">
                  <span itemProp="name">Properties</span>
                </Link>
                <meta itemProp="position" content="2" />
              </li>
              <span className="mx-2">/</span>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="text-gray-600">
                <Link to={pageUrl} itemProp="item" className="text-gray-600">
                  <span itemProp="name">{property.title}</span>
                </Link>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </nav>
          
          <Link to="/properties" className="text-primary hover:underline mb-4 inline-block">
            &larr; Back to Properties
          </Link>
          
          {/* Enhanced Image Viewer */}
          <div 
            className={`bg-white rounded-xl shadow-md overflow-hidden mb-8 relative ${
              isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''
            }`}
          >
            {property.images?.length > 0 ? (
              <div 
                ref={containerRef}
                className={`relative ${
                  isFullscreen 
                    ? 'h-screen w-full bg-black cursor-grab' 
                    : 'h-[50vh] min-h-[400px] bg-gray-100 cursor-pointer'
                }`}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={handleContainerClick}
              >
                <div className="absolute inset-0 overflow-hidden">
                  <AnimatePresence initial={false} mode="wait">
                    <motion.div
                      className="absolute inset-0 w-full h-full"
                      key={currentImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isImageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                        </div>
                      )}
                      <motion.img
                        ref={imageRef}
                        src={property.images[currentImageIndex]}
                        alt={`${property.title} in ${property.location}`}
                        className={`w-full h-full ${
                          isFullscreen ? 'object-contain' : 'object-cover'
                        } ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                        loading="eager"
                        onLoad={handleImageLoad}
                        onError={() => setIsImageLoading(false)}
                        drag={isFullscreen && zoom > 1}
                        dragConstraints={dragConstraints}
                        dragElastic={0}
                        dragMomentum={false}
                        style={{ 
                          x: position.x, 
                          y: position.y,
                          scale: zoom
                        }}
                        animate={{ 
                          x: position.x, 
                          y: position.y,
                          scale: zoom
                        }}
                        transition={{ type: "tween", duration: 0.2 }}
                        onDoubleClick={(e) => {
                          if (isFullscreen) {
                            const container = containerRef.current;
                            if (!container) return;
                            const rect = container.getBoundingClientRect();
                            const clickX = e.clientX - rect.left;
                            const clickY = e.clientY - rect.top;
                            
                            const newZoom = zoom > 1 ? 1 : 2;
                            setZoom(newZoom);
                            
                            if (newZoom > 1) {
                              const newX = (rect.width/2 - clickX) * newZoom;
                              const newY = (rect.height/2 - clickY) * newZoom;
                              setPosition({ x: newX, y: newY });
                            } else {
                              setPosition({ x: 0, y: 0 });
                            }
                          }
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* Navigation Arrows - Conditionally shown */}
                {showControls && property.images.length > 1 && (
                  <>
                    <button
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 ${
                        isFullscreen 
                          ? 'bg-black/50 hover:bg-black/70 text-white' 
                          : 'bg-white/80 hover:bg-white text-gray-800'
                      } rounded-full p-3 shadow-lg transition-colors backdrop-blur-sm`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      aria-label="Previous image"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-20 ${
                        isFullscreen 
                          ? 'bg-black/50 hover:bg-black/70 text-white' 
                          : 'bg-white/80 hover:bg-white text-gray-800'
                      } rounded-full p-3 shadow-lg transition-colors backdrop-blur-sm`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      aria-label="Next image"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                
                {/* Dot Indicators */}
                {showControls && property.images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
                    {property.images.map((_, i) => (
                      <div 
                        key={i}
                        className={`w-2 h-2 mx-1 rounded-full transition-all ${
                          i === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
                
                {/* Fullscreen Controls */}
                {isFullscreen && showControls && (
                  <button
                    className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 shadow-lg transition-colors backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    aria-label="Exit fullscreen"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                
                {/* Zoom Indicator */}
                {isFullscreen && zoom > 1 && (
                  <div className="absolute top-4 right-20 z-20 bg-black/50 text-white text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                    {zoom.toFixed(1)}x
                  </div>
                )}
                
                {/* Fullscreen Hint */}
                {!isFullscreen && (
                  <div className="absolute top-4 right-4 z-20 bg-black/50 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center backdrop-blur-sm transition-opacity hover:opacity-100 opacity-90">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Click to view fullscreen
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-200 border-2 border-dashed w-full h-96 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-lg">No Image Available</span>
              </div>
            )}
          </div>
          
          {/* Property Details */}
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
              
              <h2 className="text-2xl font-semibold mb-3">Property Description</h2>
              <p className="text-gray-700 mb-6 whitespace-pre-line">
                {property.description}
              </p>
              
              <h2 className="text-2xl font-semibold mb-3">Property Features</h2>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {property.amenities?.map((amenity, i) => (
                  <div key={i} className="flex items-center bg-gray-50 px-4 py-2.5 rounded-lg">
                    <span className="text-primary mr-2">✓</span>
                    <span className="capitalize">{amenity.replace('-', ' ')}</span>
                  </div>
                ))}
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">Property Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <h2 className="text-2xl font-semibold mb-3">Location Details</h2>
                <p className="text-gray-700 mb-4">
                  {property.address}, {property.city}, {property.state} {property.zip_code}
                </p>
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="font-medium mb-2">Coastal Kenya Location Highlights:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Proximity to pristine beaches</li>
                    <li>Access to local markets and amenities</li>
                    <li>Growing real estate investment area</li>
                    <li>Tourist-friendly neighborhood</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md h-fit border border-gray-100">
              <h2 className="text-2xl font-semibold mb-4">Schedule a Viewing</h2>
              <p className="mb-4 text-gray-600">Interested in this coastal property? Contact us to arrange a private viewing.</p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-medium">Call Us</span>
                </div>
                <p className="text-gray-700">+254 758 066 526</p>
              </div>
              
              <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors mb-4 font-medium">
                Book Viewing
              </button>
              <button className="w-full border border-primary text-primary py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                Contact Agent
              </button>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold mb-3">Property Status</h3>
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
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold mb-3">Share This Property</h3>
                <div className="flex space-x-4">
                  <button className="text-gray-600 hover:text-blue-600">
                    <i className="fab fa-facebook text-xl"></i>
                  </button>
                  <button className="text-gray-600 hover:text-blue-400">
                    <i className="fab fa-twitter text-xl"></i>
                  </button>
                  <button className="text-gray-600 hover:text-red-600">
                    <i className="fab fa-pinterest text-xl"></i>
                  </button>
                  <button className="text-gray-600 hover:text-blue-400">
                    <i className="fab fa-linkedin text-xl"></i>
                  </button>
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