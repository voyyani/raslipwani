import React from 'react';
import PropTypes from 'prop-types';

import Modal from '../ui/Modal';
import ViewingConfirmStep from './ViewingConfirmStep';
import ContactDetailsStep from './ContactDetailsStep';
import { useBookingWizard } from './useBookingWizard';
import { viewingExperiences } from './serviceCatalog';

const STEPS = ['confirm', 'schedule'];

/**
 * The viewing booking flow — confirm what is being booked, then say who and
 * when. Moved out of `ViewingExperience.jsx` (Task 24) and put on the shared
 * `useBookingWizard`, so both booking flows advance and retreat through their
 * steps the same way.
 *
 * The dialog was a hand-rolled overlay before `Modal`: focus stayed behind it,
 * Tab left the form for the page underneath, Escape did nothing and closing
 * returned focus to the top of the document.
 *
 * The wizard is mounted only while a property is selected, so it always opens
 * on step one.
 */
const ViewingBookingModal = ({
  property, viewingType, bookingData, onChange, onSubmit, isSubmitting, formatPrice, onClose,
}) => {
  const wizard = useBookingWizard({ steps: STEPS, validate: () => ({}) });
  const experience = viewingExperiences.find((o) => o.type === viewingType);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={wizard.step === 'confirm' ? 'Confirm Viewing Details' : 'Schedule Your Viewing'}
      size="lg"
    >
      {wizard.step === 'confirm' ? (
        <ViewingConfirmStep
          property={property}
          experience={experience}
          formatPrice={formatPrice}
          onContinue={wizard.next}
        />
      ) : (
        <ContactDetailsStep
          idPrefix="ve"
          density="compact"
          values={bookingData}
          onChange={onChange}
          onSubmit={onSubmit}
          onBack={wizard.back}
          notesLabel="Special Requests"
          notesPlaceholder="Any specific requests or questions"
          submitLabel={`Confirm ${experience?.title ?? 'Viewing'}`}
          busyLabel="Booking..."
          isSubmitting={isSubmitting}
        />
      )}
    </Modal>
  );
};

ViewingBookingModal.propTypes = {
  property: PropTypes.object.isRequired,
  viewingType: PropTypes.string.isRequired,
  bookingData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  formatPrice: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ViewingBookingModal;
