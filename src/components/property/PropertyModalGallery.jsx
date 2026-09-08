import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../Icon';

/**
 * The property modal's image carousel, with its dots, arrows, fullscreen and
 * zoom chrome. Moved out of `PropertyModal.jsx` (Task 26); the gestures and
 * state behind it are in `usePropertyCarousel`, which the modal owns so its
 * details column can know whether the gallery is fullscreen.
 */
const PropertyModalGallery = ({ images, carousel, onClose }) => {
  const {
    currentImageIndex, isFullscreen, zoomLevel, position, isDragging, isImageLoading,
    showControls, imageRef, handlePrev, handleNext, handleTouchStart, handleTouchEnd,
    handleTouchMove, handleDragStart, handleDrag, handleDragEnd, toggleFullscreen,
    handleImageLoad, handleImageError, handleTap, handleDoubleTap,
  } = carousel;

  return (
  <div 
    className={`relative ${isFullscreen ? 'h-screen w-screen' : 'h-[50vh] min-h-[300px]'} bg-scrim`}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
  >
    {images?.length > 0 ? (
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
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-line-media"></div>
                </div>
              )}
              <motion.img
                ref={imageRef}
                src={images[currentImageIndex]}
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
          {images.map((_, i) => (
            <div 
              key={i}
              className={`w-2 h-2 mx-1 rounded-full transition-all ${
                i === currentImageIndex ? 'bg-surface-raised scale-125' : 'bg-surface-raised/50'
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
                  isFullscreen ? 'bg-scrim/50 hover:bg-scrim/70 text-content-on-media' : 'bg-surface-raised/80 hover:bg-surface-raised text-content'
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
                  isFullscreen ? 'bg-scrim/50 hover:bg-scrim/70 text-content-on-media' : 'bg-surface-raised/80 hover:bg-surface-raised text-content'
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
                  isFullscreen ? 'bg-scrim/50 hover:bg-scrim/70 text-content-on-media' : 'bg-surface-raised/80 hover:bg-surface-raised text-content'
                } rounded-full p-2 shadow-lg transition-colors`}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Icon name="compress" size={24} /> : <Icon name="expand" size={24} />}
              </motion.button>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={isFullscreen ? toggleFullscreen : onClose}
                className={`${
                  isFullscreen ? 'bg-scrim/50 hover:bg-scrim/70 text-content-on-media' : 'bg-surface-raised/80 hover:bg-surface-raised text-content'
                } rounded-full p-2 shadow-lg transition-colors`}
                aria-label={isFullscreen ? "Exit fullscreen" : "Close modal"}
              >
                <Icon name="times" size={24} />
              </motion.button>
            </div>
          )}
        </AnimatePresence>
        
        {/* Zoom Indicator */}
        {zoomLevel > 1 && (
          <motion.div 
            className="absolute top-4 left-4 z-20 bg-scrim/50 text-content-on-media text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {zoomLevel.toFixed(1)}x
          </motion.div>
        )}
      </>
    ) : (
      <div className="absolute inset-0 flex items-center justify-center text-content-subtle">
        <span className="text-xl">No images available</span>
      </div>
    )}
  </div>
  );
};

PropertyModalGallery.propTypes = {
  images: PropTypes.array,
  carousel: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PropertyModalGallery;
