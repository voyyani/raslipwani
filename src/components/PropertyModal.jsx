import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { motion, MotionConfig, useDragControls, useReducedMotion } from 'framer-motion';

import useDialog from './ui/useDialog';
import GlassPanel from './ui/GlassPanel';
import useMediaQuery from '../hooks/useMediaQuery';
import PropertyModalGallery from './property/PropertyModalGallery';
import PropertyModalDetails from './property/PropertyModalDetails';
import { usePropertyCarousel } from './property/usePropertyCarousel';
import { panel as panelMotion, scrim as scrimMotion } from './property/propertyModalMotion';

/**
 * A property, from a card.
 *
 * Two geometries, one dialog. From `md` up it is a wide panel with the
 * photograph on the left and the listing beside it, presented the way DESIGN.md
 * says a modal presents: scale from 0.96, fade, on the spring curve. Below `md`
 * it is a sheet that rises from the bottom edge and can be pulled back down by
 * its grabber, because that is the gesture a thumb already knows.
 *
 * The panel is glass — the one surface unambiguously *over* the page rather
 * than part of it — and the scrim behind it blurs. Those are the modal's two
 * composited surfaces; nothing inside the panel adds a third, which is why the
 * gallery's chrome is plain dark tint rather than more glass.
 *
 * The gallery is a lightbox, not a titled panel, so it takes `useDialog`'s
 * behaviour without `Modal`'s chrome: focus enters and is trapped, Escape
 * closes, and closing returns focus to the card that opened it. Escape is
 * handled here as well as by the hook because this dialog has two layers to
 * leave — fullscreen first, then the dialog — and the hook's capture-phase
 * handler has to be stopped before it closes the gallery out from under a
 * viewer who only wanted to leave fullscreen.
 */
const PropertyModal = ({ property, closeModal }) => {
  const panelRef = useRef(null);
  const carousel = usePropertyCarousel(property?.images);
  const dragControls = useDragControls();
  const reduced = useReducedMotion();
  // Tailwind's `md`. The sheet geometry is below it.
  const sheet = !useMediaQuery('(min-width: 768px)');

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

  /** A decisive pull closes the sheet; anything less springs it back. */
  const handleDragEnd = (_, info) => {
    if (info.offset.y > 120 || info.velocity.y > 600) closeModal();
  };

  const label = property?.title ? `${property.title} — photos and details` : 'Property details';

  return createPortal(
    // `reducedMotion="user"` turns every transform animation inside the dialog
    // into a plain fade for a visitor who has asked the OS to stop moving
    // things; the panel's own variants read the same preference explicitly.
    <MotionConfig reducedMotion="user">
      <motion.div
        {...scrimMotion}
        className="fixed inset-0 z-50 bg-scrim/60 backdrop-blur-sm"
        onClick={closeModal}
        // A convenience for pointer users; Escape and the close button are the
        // real affordances, so it stays out of the a11y tree.
        aria-hidden="true"
      />

      <div
        className={`pointer-events-none fixed inset-0 z-50 flex justify-center ${
          isFullscreen ? 'items-stretch' : 'items-end md:items-center md:p-6'
        }`}
      >
        <GlassPanel
          as={motion.div}
          tone="strong"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          custom={{ sheet, reduced }}
          variants={panelMotion}
          initial="initial"
          animate="animate"
          exit="exit"
          drag={sheet && !isFullscreen ? 'y' : false}
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          dragSnapToOrigin
          onDragEnd={handleDragEnd}
          className={`pointer-events-auto flex w-full flex-col overflow-hidden focus:outline-none ${
            isFullscreen
              ? 'h-[100dvh] max-w-none !rounded-none border-0'
              : 'h-[calc(100dvh-2.5rem)] rounded-b-none md:h-[min(86vh,820px)] md:max-w-6xl md:rounded-b-xl ' +
                'md:grid md:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.9fr)]'
          }`}
        >
          <PropertyModalGallery
            images={property?.images}
            title={property?.title}
            carousel={carousel}
            onClose={closeModal}
            onGrab={sheet ? (e) => dragControls.start(e) : undefined}
          />

          {/* Hidden while the gallery is fullscreen, which is the whole screen */}
          {!isFullscreen && <PropertyModalDetails property={property} onClose={closeModal} />}
        </GlassPanel>
      </div>
    </MotionConfig>,
    document.body
  );
};

PropertyModal.propTypes = {
  property: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default PropertyModal;
