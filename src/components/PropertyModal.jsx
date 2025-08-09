import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPhone, FiMaximize, FiMinimize } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const PropertyModal = ({ property, closeModal }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const navigate = useNavigate();
  const [showPhone, setShowPhone] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const imageRef = useRef(null);
  const lastTouchDistance = useRef(0);

  // Reset states when image changes or fullscreen toggles
  useEffect(() => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
    setIsImageLoading(true);
    // Always show controls in fullscreen
    setShowControls(true);
  }, [currentImageIndex, isFullscreen]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(price);
  };

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
    if (e.touches.length === 1) {
      setTouchStart(e.touches[0].clientX);
      // Always show controls on touch
      setShowControls(true);
    } else if (e.touches.length === 2 && zoomLevel > 1) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      lastTouchDistance.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    }
  };

  const handleTouchEnd = (e) => {
    if (zoomLevel <= 1) {
      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchStart - touchEnd;
      
      if (diff > 50) handleNext();
      if (diff < -50) handlePrev();
    }
    // Always show controls on touch end
    setShowControls(true);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && zoomLevel > 1) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (lastTouchDistance.current > 0) {
        const zoomChange = currentDistance / lastTouchDistance.current;
        const newZoom = Math.min(Math.max(zoomLevel * zoomChange, 1), 3);
        setZoomLevel(newZoom);
      }
      lastTouchDistance.current = currentDistance;
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          closeModal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Handle Contact Agent button click
  const handleContactAgent = () => {
    setShowPhone(true);
  };

  // Copy phone number to clipboard
  const copyPhoneNumber = () => {
    navigator.clipboard.writeText('+254758066526');
    alert('Phone number copied to clipboard!');
  };

  // Handle Schedule Tour button click
  const handleScheduleTour = () => {
    closeModal();
    navigate('/services', { state: { openViewingModal: true } });
  };

  // Zoom functionality
  const handleZoom = (direction) => {
    const zoomStep = 0.5;
    let newZoom;
    
    if (direction === 'in') {
      newZoom = Math.min(zoomLevel + zoomStep, 3);
    } else {
      newZoom = Math.max(zoomLevel - zoomStep, 1);
    }
    
    setZoomLevel(newZoom);
    
    if (newZoom <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  // Handle double tap for zoom on mobile
  const handleDoubleTap = () => {
    if (zoomLevel === 1) {
      setZoomLevel(2);
    } else {
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }
    // Always show controls on double tap
    setShowControls(true);
  };

  // Handle drag start for panning
  const handleDragStart = (e, info) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setStartPosition(position);
    }
  };

  // Handle dragging for panning
  const handleDrag = (e, info) => {
    if (zoomLevel > 1 && isDragging) {
      setPosition({
        x: startPosition.x + info.offset.x,
        y: startPosition.y + info.offset.y
      });
    }
  };

  // Handle drag end for panning
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
    // Always show controls in fullscreen
    setShowControls(true);
  };

  // Handle image load
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  // Handle image error
  const handleImageError = () => {
    setIsImageLoading(false);
    console.error('Error loading image:', property.images[currentImageIndex]);
  };

  // Tap gestures
  const handleTap = (e) => {
    if (e.touches && e.touches.length > 1) return;
    // Always show controls on tap
    setShowControls(true);
  };

  // Preload images
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

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={closeModal}
    >
      <motion.div
        className={`relative bg-white ${isFullscreen ? 'fixed inset-0 !m-0' : 'max-w-6xl w-full max-h-[90vh] rounded-2xl'}`}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Carousel */}
        <div 
          className={`relative ${isFullscreen ? 'h-screen w-screen' : 'h-[50vh] min-h-[300px]'} bg-black`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {property.images?.length > 0 ? (
            <>
              {/* Main Image */}
              <div 
                className="absolute inset-0 overflow-hidden flex items-center justify-center"
                onTap={handleTap}
              >
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={`${currentImageIndex}-${isFullscreen}`}
                    className="w-full h-full flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isImageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                      </div>
                    )}
                    <motion.img
                      ref={imageRef}
                      src={property.images[currentImageIndex]}
                      alt={`Property image ${currentImageIndex + 1}`}
                      className={`max-w-full max-h-full object-contain ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                      style={{
                        scale: zoomLevel,
                        x: position.x,
                        y: position.y,
                        cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                      }}
                      drag={zoomLevel > 1}
                      dragMomentum={false}
                      onDragStart={handleDragStart}
                      onDrag={handleDrag}
                      onDragEnd={handleDragEnd}
                      dragConstraints={{
                        left: -window.innerWidth * (zoomLevel - 1) / 2,
                        right: window.innerWidth * (zoomLevel - 1) / 2,
                        top: -window.innerHeight * (zoomLevel - 1) / 2,
                        bottom: window.innerHeight * (zoomLevel - 1) / 2
                      }}
                      onDoubleTap={handleDoubleTap}
                      loading={currentImageIndex === 0 ? "eager" : "lazy"}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: zoomLevel, opacity: 1 }}
                      transition={{ 
                        scale: { type: "spring", damping: 20 },
                        opacity: { duration: 0.3 }
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Dot Indicators */}
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
              
              {/* Navigation Arrows - Always visible in fullscreen */}
              <AnimatePresence>
                {(showControls || !isFullscreen) && (
                  <>
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-10 ${
                        isFullscreen ? 'bg-black/50 hover:bg-black/70 text-white' : 'bg-white/80 hover:bg-white text-gray-800'
                      } rounded-full p-3 shadow-lg transition-colors`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      aria-label="Previous image"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-10 ${
                        isFullscreen ? 'bg-black/50 hover:bg-black/70 text-white' : 'bg-white/80 hover:bg-white text-gray-800'
                      } rounded-full p-3 shadow-lg transition-colors`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      aria-label="Next image"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  </>
                )}
              </AnimatePresence>
              
              {/* Header Controls - Always visible in fullscreen */}
              <AnimatePresence>
                {(showControls || !isFullscreen) && (
                  <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={toggleFullscreen}
                      className={`${
                        isFullscreen ? 'bg-black/50 hover:bg-black/70 text-white' : 'bg-white/80 hover:bg-white text-gray-800'
                      } rounded-full p-2 shadow-lg transition-colors`}
                      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                      {isFullscreen ? <FiMinimize size={24} /> : <FiMaximize size={24} />}
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={isFullscreen ? toggleFullscreen : closeModal}
                      className={`${
                        isFullscreen ? 'bg-black/50 hover:bg-black/70 text-white' : 'bg-white/80 hover:bg-white text-gray-800'
                      } rounded-full p-2 shadow-lg transition-colors`}
                      aria-label={isFullscreen ? "Exit fullscreen" : "Close modal"}
                    >
                      <FiX size={24} />
                    </motion.button>
                  </div>
                )}
              </AnimatePresence>
              
              {/* Zoom Indicator */}
              {zoomLevel > 1 && (
                <motion.div 
                  className="absolute top-4 left-4 z-20 bg-black/50 text-white text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {zoomLevel.toFixed(1)}x
                </motion.div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <span className="text-xl">No images available</span>
            </div>
          )}
        </div>

        {/* Property Details - Always visible when not in fullscreen */}
        {!isFullscreen && (
          <motion.div 
            className="p-6 md:p-8 overflow-y-auto flex-grow"
            style={{ maxHeight: 'calc(90vh - 50vh)' }}
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3 }}
          >
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
            
            {/* Property Features */}
            {property.amenities?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Property Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  {property.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center bg-gray-50 px-4 py-2.5 rounded-lg">
                      <span className="text-primary mr-2">✓</span>
                      <span className="capitalize">{amenity.replace('-', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              {showPhone ? (
                <div className="bg-blue-50 rounded-xl p-4 w-full flex flex-col items-center">
                  <div className="flex items-center mb-3">
                    <FiPhone className="text-blue-600 text-xl mr-2" />
                    <h4 className="text-lg font-semibold">Contact Agent</h4>
                  </div>
                  <a 
                    href="tel:+254758066526" 
                    className="text-2xl font-bold text-primary mb-3 hover:underline"
                  >
                    +254 758 066 526
                  </a>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyPhoneNumber}
                      className="bg-white border border-primary text-primary font-medium py-2 px-4 rounded-lg shadow-md"
                    >
                      Copy Number
                    </motion.button>
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href="tel:+254758066526"
                      className="bg-gradient-to-r from-primary to-secondary text-white font-medium py-2 px-4 rounded-lg shadow-md"
                    >
                      Call Now
                    </motion.a>
                  </div>
                </div>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleContactAgent}
                    className="bg-gradient-to-r from-primary to-secondary text-white font-medium py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                  >
                    Contact Agent
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleScheduleTour}
                    className="bg-white border border-primary text-primary font-medium py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                  >
                    Schedule Tour
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PropertyModal;