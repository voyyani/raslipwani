import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * OptimizedImage Component
 * Features:
 * - Lazy loading with Intersection Observer
 * - WebP support with auto-detection
 * - Blur placeholder while loading
 * - Error fallback
 * - Progressive image loading
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  width,
  height,
  priority = false,
  objectFit = 'cover',
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  quality = 80,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Generate optimized Cloudinary URL if applicable
  const getOptimizedUrl = useCallback((url, options = {}) => {
    if (!url) return '';
    
    // If it's a Cloudinary URL, add transformations
    if (url.includes('cloudinary.com')) {
      const { w = 800, q = quality, f = 'auto' } = options;
      // Insert transformations before version
      return url.replace(
        '/upload/',
        `/upload/f_${f},q_${q},w_${w},c_fill/`
      );
    }
    
    return url;
  }, [quality]);

  // Generate low-quality placeholder URL
  const getLqipUrl = useCallback((url) => {
    if (!url) return '';
    
    if (url.includes('cloudinary.com')) {
      return url.replace(
        '/upload/',
        '/upload/f_auto,q_10,w_50,e_blur:1000,c_fill/'
      );
    }
    
    return url;
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before entering viewport
        threshold: 0
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // Set current src when in view
  useEffect(() => {
    if (isInView && src) {
      setCurrentSrc(getOptimizedUrl(src, { w: width || 800 }));
    }
  }, [isInView, src, width, getOptimizedUrl]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    setIsLoaded(true);
    onError?.(e);
  };

  const placeholderUrl = blurDataURL || getLqipUrl(src);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gray-200"
          style={{
            backgroundImage: placeholderUrl ? `url(${placeholderUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.1)'
          }}
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skeleton-shine" />
        </div>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">Image unavailable</span>
          </div>
        </div>
      )}

      {/* Main image */}
      <AnimatePresence>
        {isInView && currentSrc && !hasError && (
          <motion.img
            ref={imgRef}
            src={currentSrc}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className={`${className} ${isLoaded ? '' : 'opacity-0'}`}
            style={{
              objectFit,
              width: '100%',
              height: '100%'
            }}
            {...props}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Preload critical images
export const preloadImage = (src) => {
  if (typeof window !== 'undefined' && src) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }
};

// Hook to preload multiple images
export const useImagePreloader = (images = []) => {
  useEffect(() => {
    images.forEach((src) => {
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [images]);
};

export default OptimizedImage;
