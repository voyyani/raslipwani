import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import Modal from '../ui/Modal';
import BookingStepper from './BookingStepper';
import ServiceSelectionStep from './ServiceSelectionStep';
import PropertySelectionStep from './PropertySelectionStep';
import ServiceOptionsStep from './ServiceOptionsStep';
import ContactDetailsStep from './ContactDetailsStep';
import { useBookingWizard } from './useBookingWizard';
import { serviceTypes, viewingTypes } from './serviceCatalog';
import { createBooking } from '@/services/bookings';
import { propertyQueries } from '@/services/properties';
import { notifyBookingReceived } from '../../utils/bookingNotifications';
import { logger } from '../../utils/logger';

// A stable reference, so an unresolved query does not hand the render below a
// fresh `[]` identity on every pass (see src/pages/Properties.jsx).
const EMPTY_PROPERTIES = [];

const EMPTY_BOOKING = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  notes: '',
  serviceType: 'viewing',
  propertyId: '',
  viewingType: 'physical',
};

// A viewing takes a fourth step to choose how the property is viewed; every
// other service is done in three. One list, so the progress bar and the
// final-step guard cannot disagree about how many steps the form has.
const stepsFor = (serviceType) =>
  serviceType === 'viewing'
    ? ['service', 'property', 'options', 'contact']
    : ['service', 'options', 'contact'];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * The service booking wizard, lifted whole out of `ServicesMain.jsx`
 * (Task 24). The page opens it with a service pre-selected; everything from
 * there — the step machinery, the four steps, the write and the reset — lives
 * here.
 *
 * It used to be a hand-rolled `fixed inset-0` overlay: focus stayed on the page
 * behind it, Tab walked out of the form into content the dialog was covering,
 * Escape did nothing, and closing dropped focus to the top of the document.
 * This is the point in the journey where a visitor becomes a customer, so it is
 * the worst place on the site to have had those four defects; `Modal` handles
 * all four.
 */
const ServiceBookingModal = ({ isOpen, initialServiceType, onClose }) => {
  const [bookingData, setBookingData] = useState({ ...EMPTY_BOOKING, serviceType: initialServiceType });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = stepsFor(bookingData.serviceType);
  // No step gates on its own answers: steps two and three disable Continue
  // until they have one, and the contact step is a real form with required
  // fields, so there is nothing left for the wizard to refuse.
  const wizard = useBookingWizard({ steps, validate: () => ({}) });

  const {
    data: properties = EMPTY_PROPERTIES,
    isLoading: loadingProperties,
  } = useQuery({
    ...propertyQueries.available(),
    enabled: isOpen && bookingData.serviceType === 'viewing',
  });

  const setField = (name, value) => setBookingData((prev) => ({ ...prev, [name]: value }));

  const close = () => {
    wizard.reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const record = {
        // `type` is NOT NULL with no default, and the form previously omitted it
        // entirely — so every service booking submitted here failed to save.
        // The form offers four service kinds; the bookings table records three.
        type: bookingData.serviceType === 'viewing' ? 'viewing' : 'consultation',
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        // Column is `service`, not `service_type`. Keeps the finer-grained choice
        // (valuation / consultation / management) that `type` collapses.
        service: bookingData.serviceType,
        property_id: bookingData.propertyId || null,
        viewing_type: bookingData.viewingType,
        // There are no preferred_date / preferred_time columns; the schema has a
        // single appointment_at timestamp.
        appointment_at: bookingData.date
          ? new Date(`${bookingData.date}T${bookingData.time || '00:00'}`).toISOString()
          : null,
        notes: bookingData.notes,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      await createBooking(record);

      // Notification is best-effort and never blocks the confirmation: the
      // booking is already saved, so a mail outage must not read as a failure.
      await notifyBookingReceived(record);

      toast.success(
        'Booking received. Our team will contact you within 2 hours to confirm.',
        { duration: 6000 }
      );

      setBookingData({ ...EMPTY_BOOKING });
      close();
    } catch (error) {
      logger.error('Booking error:', error);
      toast.error('We could not submit that booking. Please try again, or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = serviceTypes.find((s) => s.value === bookingData.serviceType);

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Book Your Service"
      description={`Step ${wizard.stepIndex + 1} of ${steps.length}`}
      size="xl"
    >
      <BookingStepper totalSteps={steps.length} currentStep={wizard.stepIndex + 1} />

      {wizard.step === 'service' && (
        <ServiceSelectionStep
          serviceTypes={serviceTypes}
          value={bookingData.serviceType}
          onChange={(value) => setField('serviceType', value)}
          onNext={wizard.next}
        />
      )}

      {wizard.step === 'property' && (
        <PropertySelectionStep
          properties={properties}
          isLoading={loadingProperties}
          value={bookingData.propertyId}
          onChange={(value) => setField('propertyId', value)}
          onBack={wizard.back}
          onNext={wizard.next}
          formatCurrency={formatCurrency}
        />
      )}

      {wizard.step === 'options' && (
        <ServiceOptionsStep
          serviceType={bookingData.serviceType}
          serviceTypes={serviceTypes}
          viewingTypes={viewingTypes}
          viewingType={bookingData.viewingType}
          onViewingTypeChange={(value) => setField('viewingType', value)}
          onBack={wizard.back}
          onNext={wizard.next}
        />
      )}

      {wizard.step === 'contact' && (
        <ContactDetailsStep
          idPrefix="svc"
          density="comfortable"
          values={bookingData}
          onChange={setField}
          onSubmit={handleSubmit}
          onBack={wizard.back}
          minDate={new Date().toISOString().split('T')[0]}
          notesLabel={
            bookingData.serviceType === 'viewing'
              ? 'Special Requests for Viewing'
              : 'Additional Information'
          }
          notesPlaceholder={
            bookingData.serviceType === 'viewing'
              ? 'Any specific requests or questions about the property...'
              : 'Tell us more about your requirements...'
          }
          aside={
            <div className="w-full">
              <h4 className="block text-content-muted mb-2 text-sm font-medium">Service Type</h4>
              <div className="p-3 bg-surface rounded-lg border border-line">
                <span className="font-medium text-primary">{selectedService?.label}</span>
                {bookingData.serviceType === 'viewing' && bookingData.propertyId && (
                  <p className="text-sm text-content-muted mt-1">
                    Property: {properties.find((p) => p.id === bookingData.propertyId)?.title}
                  </p>
                )}
              </div>
            </div>
          }
          submitLabel="Confirm Booking"
          busyLabel="Processing..."
          isSubmitting={isSubmitting}
        />
      )}
    </Modal>
  );
};

ServiceBookingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  initialServiceType: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ServiceBookingModal;
