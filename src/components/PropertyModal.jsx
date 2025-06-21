import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const PropertyModal = ({ property, closeModal }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

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
            <FiX size={24} />
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

export default PropertyModal;