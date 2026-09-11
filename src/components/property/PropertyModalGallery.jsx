import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

import Icon from '../Icon';
import { slide } from './propertyModalMotion';

/**
 * The property modal's photograph.
 *
 * It is the whole left side of the panel from `md` up and the top of the sheet
 * below it, and everything drawn over it is there to get out of the way: a
 * counter, the arrows, a thumbnail rail on wide screens, and the controls a
 * lightbox needs. All of that chrome is a dark tint with no blur, because the
 * modal's two composited surfaces are already spent on the scrim and the
 * panel — a third here would be the fourth in the viewport.
 *
 * The photograph fills its frame in the panel and is letterboxed only in
 * fullscreen, where the frame is the screen and cropping would lose the edges
 * the viewer opened fullscreen to see. It changes by sliding in from the side
 * the viewer travelled toward; the gestures and state are `usePropertyCarousel`.
 */

/** A control sitting on the photograph. Tint, not glass — see above. */
const ChromeButton = React.forwardRef(function ChromeButton(
  { className = '', size = 'md', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-line-media/25 bg-scrim/55 text-content-on-media shadow-raised transition-[transform,background-color,box-shadow] duration-fast ease-spring hover:bg-scrim/80 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring motion-reduce:transition-none motion-reduce:active:scale-100 ${
        size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
      } ${className}`}
      {...rest}
    />
  );
});

ChromeButton.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['md', 'lg']),
};

const PropertyModalGallery = ({ images, title, carousel, onClose, onGrab }) => {
  const {
    currentImageIndex, direction, goTo, isFullscreen, zoomLevel, position, isDragging,
    isImageLoading, imageRef, handlePrev, handleNext, handleTouchStart, handleTouchEnd,
    handleTouchMove, handleDragStart, handleDrag, handleDragEnd, toggleFullscreen,
    handleImageLoad, handleImageError, handleDoubleTap,
  } = carousel;

  const count = images?.length ?? 0;
  const many = count > 1;
  const name = title || 'Property';

  return (
    <div
      className={`relative shrink-0 select-none overflow-hidden bg-scrim ${
        isFullscreen ? 'h-full w-full' : 'h-[42vh] min-h-60 md:h-full'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {count > 0 ? (
        <>
          {/* The photograph. Each slide is absolute so the incoming and
              outgoing frames can overlap instead of leaving the stage empty. */}
          <div className="absolute inset-0" onDoubleClick={handleDoubleTap} role="presentation">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={`${currentImageIndex}-${isFullscreen}`}
                custom={direction}
                variants={slide}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0"
              >
                {isImageLoading && (
                  <div
                    className="absolute inset-0 animate-pulse bg-content-on-media/5"
                    aria-hidden="true"
                  />
                )}
                <motion.img
                  ref={imageRef}
                  src={images[currentImageIndex]}
                  alt={`${name} — photo ${currentImageIndex + 1} of ${count}`}
                  className={`h-full w-full transition-opacity duration-slow ease-out-soft ${
                    isFullscreen ? 'object-contain' : 'object-cover'
                  } ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                  style={{
                    scale: zoomLevel,
                    x: position.x,
                    y: position.y,
                    cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                  }}
                  drag={zoomLevel > 1}
                  dragMomentum={false}
                  onDragStart={handleDragStart}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  dragConstraints={{
                    left: (-window.innerWidth * (zoomLevel - 1)) / 2,
                    right: (window.innerWidth * (zoomLevel - 1)) / 2,
                    top: (-window.innerHeight * (zoomLevel - 1)) / 2,
                    bottom: (window.innerHeight * (zoomLevel - 1)) / 2,
                  }}
                  loading={currentImageIndex === 0 ? 'eager' : 'lazy'}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* A weighted scrim along the bottom so the rail and the dots read
              over any photograph. Top gets a lighter one for the counter. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-scrim/75 to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-scrim/50 to-transparent"
            aria-hidden="true"
          />

          {/* The sheet's grabber: the one place a pull closes the dialog. */}
          {onGrab && !isFullscreen && (
            <div className="absolute inset-x-0 top-0 z-30 flex justify-center md:hidden">
              <div
                className="flex h-9 w-24 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
                onPointerDown={onGrab}
                aria-hidden="true"
              >
                <span className="h-1.5 w-10 rounded-full bg-content-on-media/80" />
              </div>
            </div>
          )}

          {/* Counter */}
          {many && (
            <div
              className={`absolute left-4 z-20 rounded-full bg-scrim/55 px-3 py-1 text-xs font-semibold tabular-nums text-content-on-media ${
                isFullscreen ? 'top-4' : 'top-10 md:top-4'
              }`}
              aria-live="polite"
            >
              {currentImageIndex + 1} / {count}
            </div>
          )}

          {/* Zoom level, only while zoomed */}
          <AnimatePresence>
            {zoomLevel > 1 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-scrim/55 px-3 py-1 text-xs font-semibold tabular-nums text-content-on-media"
              >
                {zoomLevel.toFixed(1)}×
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top-right controls. Close lives here below `md` and in
              fullscreen; on the wide panel it belongs to the details column. */}
          <div
            className={`absolute right-4 z-20 flex gap-2 ${
              isFullscreen ? 'top-4' : 'top-10 md:top-4'
            }`}
          >
            <ChromeButton
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
            >
              <Icon name={isFullscreen ? 'compress' : 'expand'} size={18} />
            </ChromeButton>
            <ChromeButton
              onClick={isFullscreen ? toggleFullscreen : onClose}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Close'}
              className={isFullscreen ? '' : 'md:hidden'}
            >
              <Icon name="times" size={18} />
            </ChromeButton>
          </div>

          {/* Arrows. Below `md` the photograph swipes; the arrows would only
              cover it. Fullscreen keeps them at every width. */}
          {many && (
            <>
              <ChromeButton
                size="lg"
                onClick={handlePrev}
                aria-label="Previous photo"
                className={`absolute left-4 top-1/2 z-20 -translate-y-1/2 ${isFullscreen ? '' : 'hidden md:inline-flex'}`}
              >
                <Icon name="chevron-left" size={20} />
              </ChromeButton>
              <ChromeButton
                size="lg"
                onClick={handleNext}
                aria-label="Next photo"
                className={`absolute right-4 top-1/2 z-20 -translate-y-1/2 ${isFullscreen ? '' : 'hidden md:inline-flex'}`}
              >
                <Icon name="chevron-right" size={20} />
              </ChromeButton>
            </>
          )}

          {/* Thumbnail rail from `md`; dots below it and in fullscreen. */}
          {many && !isFullscreen && (
            <div className="scrollbar-quiet absolute inset-x-0 bottom-0 z-20 hidden gap-2 overflow-x-auto px-4 pb-4 pt-2 md:flex">
              {images.map((src, i) => {
                const active = i === currentImageIndex;
                return (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Photo ${i + 1} of ${count}`}
                    aria-current={active ? 'true' : undefined}
                    className={`h-11 w-16 shrink-0 overflow-hidden rounded-sm ring-2 transition-all duration-base ease-spring focus:outline-none focus-visible:ring-focus-ring motion-reduce:transition-none ${
                      active
                        ? 'ring-content-on-media opacity-100'
                        : 'ring-transparent opacity-55 hover:opacity-100 hover:-translate-y-0.5'
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {many && (
            <div
              className={`absolute inset-x-0 bottom-3 z-20 flex justify-center gap-1.5 ${
                isFullscreen ? '' : 'md:hidden'
              }`}
              aria-hidden="true"
            >
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-base ease-spring motion-reduce:transition-none ${
                    i === currentImageIndex
                      ? 'w-5 bg-content-on-media'
                      : 'w-1.5 bg-content-on-media/45'
                  }`}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-content-on-media/70">
          <Icon name="home" size={32} aria-hidden="true" />
          <span className="text-sm font-medium">Photos coming soon</span>
          <ChromeButton
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 md:hidden"
          >
            <Icon name="times" size={18} />
          </ChromeButton>
        </div>
      )}
    </div>
  );
};

PropertyModalGallery.propTypes = {
  images: PropTypes.array,
  title: PropTypes.string,
  carousel: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  /** Starts the sheet's drag-to-dismiss. Absent on the wide panel. */
  onGrab: PropTypes.func,
};

export default PropertyModalGallery;
