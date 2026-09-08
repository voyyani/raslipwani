import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The property gallery's viewer: which image is showing, the fullscreen
 * lifecycle across four vendor-prefixed APIs, pan-and-zoom with its drag
 * constraints, keyboard navigation while fullscreen, swipe and double-tap on
 * touch, and the neighbour preloads. Moved out of `PropertyDetail.jsx`
 * (Task 25) unchanged — nine pieces of state and six handlers that only ever
 * described the image viewer, in a page that also had a listing to render.
 */
export function useImageViewer(images) {
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

  // Handle image navigation
  const handlePrev = useCallback(() => {
    if (!images.length) return;
    setCurrentImageIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    );
    resetZoom();
    setIsImageLoading(true);
  }, [images.length]);

  const handleNext = useCallback(() => {
    if (!images.length) return;
    setCurrentImageIndex(prev => 
      (prev + 1) % images.length
    );
    resetZoom();
    setIsImageLoading(true);
  }, [images.length]);

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
    
    if (zoom === 1 && images.length > 1) {
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
  }, [zoom, handleNext, handlePrev, images.length]);

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
    setCurrentImageIndex,
    isFullscreen,
    isImageLoading,
    setIsImageLoading,
    zoom,
    setZoom,
    position,
    setPosition,
    showControls,
    dragConstraints,
    containerRef,
    imageRef,
    handlePrev,
    handleNext,
    resetZoom,
    toggleFullscreen,
    handleContainerClick,
    handleTouchStart,
    handleTouchEnd,
    handleImageLoad,
  };
}
