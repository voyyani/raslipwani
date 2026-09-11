import { useEffect, useRef, useState } from 'react';
import { logger } from '../../utils/logger';

/**
 * The property modal's carousel: which image is showing, pinch and
 * double-tap zoom, panning while zoomed, swipe between images, and the
 * fullscreen toggle. Moved out of `PropertyModal.jsx` (Task 26) unchanged.
 *
 * This is deliberately *not* `src/pages/property-detail/useImageViewer.js`.
 * They solve the same problem in two different ways — this one hand-rolls
 * pinch and pan from touch events, that one delegates dragging to
 * framer-motion — and reconciling them is a behaviour change, not a move.
 */
export function usePropertyCarousel(images) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  // Which way the last change of image travelled: +1 forward, -1 back. The
  // gallery slides the incoming photograph in from that side, so a swipe left
  // brings the next one in from the right the way the finger implied.
  const [direction, setDirection] = useState(1);
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

  const handlePrev = () => {
    setDirection(-1);
    setCurrentImageIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentImageIndex(prev => 
      (prev + 1) % images.length
    );
  };

  /** Jump straight to an image — the thumbnail rail's move. */
  const goTo = (index) => {
    if (index === currentImageIndex) return;
    setDirection(index > currentImageIndex ? 1 : -1);
    setCurrentImageIndex(index);
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

  // Arrow keys page through the images wherever the gallery is open. Escape is
  // the modal's to handle: it has two layers to leave, and only the shell knows
  // that leaving fullscreen must not also close the dialog.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [handlePrev, handleNext]);

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
  const handleDragStart = () => {
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
    logger.error('Error loading image:', images[currentImageIndex]);
  };

  // Tap gestures
  const handleTap = (e) => {
    if (e.touches && e.touches.length > 1) return;
    // Always show controls on tap
    setShowControls(true);
  };

  // Preload images
  useEffect(() => {
    if (!images || images.length < 2) return;
    
    const preloadImage = (index) => {
      const img = new Image();
      img.src = images[index];
    };
    
    // Preload next image
    const nextIndex = (currentImageIndex + 1) % images.length;
    preloadImage(nextIndex);
    
    // Preload previous image
    const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
    preloadImage(prevIndex);
  }, [currentImageIndex, images]);

  return {
    currentImageIndex,
    direction,
    goTo,
    isFullscreen,
    zoomLevel,
    position,
    isDragging,
    isImageLoading,
    showControls,
    imageRef,
    handlePrev,
    handleNext,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    toggleFullscreen,
    handleImageLoad,
    handleImageError,
    handleTap,
    handleDoubleTap,
    setCurrentImageIndex,
    exitFullscreen: () => setIsFullscreen(false),
  };
}
