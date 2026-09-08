import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { useQuery } from '@tanstack/react-query';
import { notifyBookingReceived } from '../../utils/bookingNotifications';
import { createBooking } from '@/services/bookings';
import { propertyQueries } from '@/services/properties';

import { logger } from '../../utils/logger';
import ViewingOptionsSection from './ViewingOptionsSection';
import ViewingFilters from './ViewingFilters';
import ViewingResults from './ViewingResults';
import ViewingBookingModal from './ViewingBookingModal';
import { useViewingFilters } from './useViewingFilters';

// A stable reference, so an unresolved query does not hand the render below a
// fresh `[]` identity on every pass (see src/pages/Properties.jsx).
const EMPTY_PROPERTIES = [];

const EMPTY_BOOKING = { name: '', email: '', phone: '', date: '', time: '', notes: '' };

const formatPrice = (price) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(price);

/**
 * The viewing-experience page: pick a viewing format, search the listings, and
 * book one. The filter machinery is in `useViewingFilters`, the three regions
 * and the booking flow are in their own components (Task 24).
 */
const ViewingExperience = () => {
  const { data: properties = EMPTY_PROPERTIES, refetch } = useQuery({
    ...propertyQueries.all(),
    enabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [viewingType, setViewingType] = useState('physical');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [bookingData, setBookingData] = useState(EMPTY_BOOKING);

  const {
    filters,
    activeFilters,
    filteredProperties,
    setFilteredProperties,
    handleFilterChange,
    removeFilter,
    clearAllFilters,
  } = useViewingFilters(properties, formatPrice);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const result = await refetch();

      if (result.error) throw result.error;

      setFilteredProperties(result.data ?? []);
      setShowResults(true);
    } catch (err) {
      logger.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submit a viewing booking.
   *
   * 🔴 This handler previously contained the comment `// Booking submission
   * logic` and nothing else, followed by an `alert()` reading "Your viewing has
   * been booked successfully!". No row was ever written and no notification was
   * ever sent: the customer was told their viewing was confirmed, and it did not
   * exist. Every viewing booked through this component since it shipped was lost
   * at the moment of submission.
   *
   * It now writes the same `bookings` shape `ServicesMain` writes — including
   * `type`, which is NOT NULL with no default — and sends the same notification.
   */
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const record = {
        type: 'viewing',
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        service: 'viewing',
        property_id: selectedProperty?.id ?? null,
        viewing_type: viewingType,
        appointment_at: bookingData.date
          ? new Date(`${bookingData.date}T${bookingData.time || '00:00'}`).toISOString()
          : null,
        notes: bookingData.notes,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      await createBooking(record);

      // Best-effort, exactly as on the services path: the booking is already
      // saved, so a mail outage must not be reported to the customer as failure.
      await notifyBookingReceived(record);

      toast.success('Viewing booked. We will send confirmation details shortly.', {
        duration: 6000,
      });

      setSelectedProperty(null);
      setBookingData(EMPTY_BOOKING);
    } catch (error) {
      logger.error('Booking error:', error);
      toast.error('We could not book that viewing. Please try again, or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // `flex-grow`, not `min-h-screen`: this page now sits inside the layout
    // route's flex column, which already fills the viewport. Keeping
    // `min-h-screen` here would push the footer a full screen down the page.
    <main className="flex-grow bg-gradient-to-b from-brand-subtle to-surface-raised">
      <ViewingOptionsSection value={viewingType} onChange={setViewingType} />

      <section className="py-12 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-primary mb-3"
            >
              Find Your Perfect Property
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-content-muted max-w-3xl mx-auto text-sm"
            >
              Browse our curated selection of premium properties
            </motion.p>
          </div>

          <ViewingFilters
            filters={filters}
            activeFilters={activeFilters}
            showResults={showResults}
            onFilterChange={handleFilterChange}
            onRemoveFilter={removeFilter}
            onClearAll={clearAllFilters}
            onSearch={fetchProperties}
          />

          <ViewingResults
            properties={filteredProperties}
            isLoading={loading}
            showResults={showResults}
            formatPrice={formatPrice}
            onBook={setSelectedProperty}
            onClearFilters={clearAllFilters}
          />
        </div>
      </section>

      {/* Mounted only while a property is selected: JSX evaluates children
          before a component can decide not to render them, and the flow below
          dereferences the property. */}
      {selectedProperty && (
        <ViewingBookingModal
          property={selectedProperty}
          viewingType={viewingType}
          bookingData={bookingData}
          onChange={(name, value) => setBookingData(prev => ({ ...prev, [name]: value }))}
          onSubmit={handleBookingSubmit}
          isSubmitting={isSubmitting}
          formatPrice={formatPrice}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </main>
  );
};

export default ViewingExperience;
