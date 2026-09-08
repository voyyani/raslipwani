import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../components/Icon';
import { useImageViewer } from './useImageViewer';

/**
 * The property gallery: the image, its navigation, the dot indicators and the
 * fullscreen/zoom chrome. Moved out of `PropertyDetail.jsx` (Task 25); the
 * viewer's state and gestures live in `useImageViewer` beside it.
 */
const PropertyGallery = ({ images, alt }) => {
  const {
    currentImageIndex, isFullscreen, isImageLoading, setIsImageLoading,
    zoom, setZoom, position, setPosition, showControls, dragConstraints,
    containerRef, imageRef, handlePrev, handleNext, toggleFullscreen,
    handleContainerClick, handleTouchStart, handleTouchEnd, handleImageLoad,
  } = useImageViewer(images);

  return (
    <div 
    className={`bg-surface-raised rounded-xl shadow-md overflow-hidden mb-8 relative ${
      isFullscreen ? 'fixed inset-0 z-50 bg-surface-inverse' : ''
    }`}
  >
    {images?.length > 0 ? (
      <div 
        ref={containerRef}
        className={`relative ${
          isFullscreen 
            ? 'h-screen w-full bg-surface-inverse cursor-grab' 
            : 'h-[50vh] min-h-[400px] bg-surface-sunken cursor-pointer'
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
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-content-on-brand"></div>
                </div>
              )}
              <motion.img
                ref={imageRef}
                src={images[currentImageIndex]}
                alt={alt}
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
        {showControls && images.length > 1 && (
          <>
            <button
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 ${
                isFullscreen 
                  ? 'bg-surface-inverse/50 hover:bg-surface-inverse/70 text-content-on-brand' 
                  : 'bg-content-on-brand/80 hover:bg-surface-raised text-content'
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
                  ? 'bg-surface-inverse/50 hover:bg-surface-inverse/70 text-content-on-brand' 
                  : 'bg-content-on-brand/80 hover:bg-surface-raised text-content'
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
        {showControls && images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
            {images.map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 mx-1 rounded-full transition-all ${
                  i === currentImageIndex ? 'bg-surface-raised scale-125' : 'bg-content-on-brand/50'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Fullscreen Controls */}
        {isFullscreen && showControls && (
          <button
            className="absolute top-4 right-4 z-20 bg-surface-inverse/50 hover:bg-surface-inverse/70 text-content-on-brand rounded-full p-3 shadow-lg transition-colors backdrop-blur-sm"
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
          <div className="absolute top-4 right-20 z-20 bg-surface-inverse/50 text-content-on-brand text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
            {zoom.toFixed(1)}x
          </div>
        )}
        
        {/* Fullscreen Hint */}
        {!isFullscreen && (
          <div className="absolute top-4 right-4 z-20 bg-surface-inverse/50 text-content-on-brand text-sm font-medium px-3 py-1 rounded-full flex items-center backdrop-blur-sm transition-opacity hover:opacity-100 opacity-90">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Click to view fullscreen
          </div>
        )}
      </div>
    ) : (
      <div className="bg-surface-sunken border-2 border-dashed w-full h-96 rounded-lg flex items-center justify-center">
        <span className="text-content-subtle text-lg">No Image Available</span>
      </div>
    )}
  </div>
  );
};

PropertyGallery.propTypes = {
  images: PropTypes.array.isRequired,
  alt: PropTypes.string.isRequired,
};

export default PropertyGallery;
