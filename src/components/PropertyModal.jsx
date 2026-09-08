import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

import useDialog from './ui/useDialog';
import PropertyModalGallery from './property/PropertyModalGallery';
import PropertyModalDetails from './property/PropertyModalDetails';
import { usePropertyCarousel } from './property/usePropertyCarousel';

/**
 * A property, full screen, from a card. The carousel and the details column
 * are their own components (Task 26); what stays here is the dialog shell and
 * the one piece of state both halves read — whether the gallery has gone
 * fullscreen, which hides the details.
 */
const PropertyModal = ({ property, closeModal }) => {
  const panelRef = useRef(null);
  const carousel = usePropertyCarousel(property?.images);

  /**
   * The gallery is a lightbox, not a titled panel: `Modal`'s header bar would
   * sit on top of the photograph it exists to show. So it takes the behaviour
   * without the chrome — see `useDialog`. Focus enters the panel and is
   * trapped, and closing returns it to the card that opened the gallery.
   *
   * Escape is handled here rather than only by the hook, because this dialog
   * has two layers to leave: fullscreen first, then the dialog itself. The
   * hook's handler runs on the capture phase, so this one has to stop it
   * before it closes the gallery out from under a viewer who only wanted to
   * leave fullscreen.
   */
  useDialog({ isOpen: true, onClose: closeModal, panelRef });

  const { isFullscreen, exitFullscreen } = carousel;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        e.stopPropagation();
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isFullscreen, exitFullscreen]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={closeModal}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={property?.title ? `${property.title} — photos and details` : 'Property details'}
        tabIndex={-1}
        className={`relative bg-surface-raised ${isFullscreen ? 'fixed inset-0 !m-0' : 'max-w-6xl w-full max-h-[90vh] rounded-2xl'}`}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <PropertyModalGallery
          images={property?.images}
          carousel={carousel}
          onClose={closeModal}
        />

        {/* Hidden while the gallery is fullscreen, which is the whole screen */}
        {!isFullscreen && <PropertyModalDetails property={property} onClose={closeModal} />}
      </motion.div>
    </motion.div>
  );
};

PropertyModal.propTypes = {
  property: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default PropertyModal;
