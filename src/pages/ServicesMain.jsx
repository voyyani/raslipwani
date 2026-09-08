import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

import ServiceBookingModal from '../components/services/ServiceBookingModal';
import ServicesHero from '../components/services/ServicesHero';
import ServicesGrid from '../components/services/ServicesGrid';
import ServicesFaq from '../components/services/ServicesFaq';
import ServicesCta from '../components/services/ServicesCta';

/**
 * The services page: hero, the four service cards, the FAQ accordion, and the
 * closing call to action — each of which opens the booking wizard on a chosen
 * service.
 *
 * The wizard is mounted only while it is open (Task 24), so every visit starts
 * on step one with the service the visitor actually clicked, rather than
 * inheriting the state of the last one they abandoned.
 */
const ServicesMain = () => {
  const [bookingServiceType, setBookingServiceType] = useState(null);

  const openBooking = (serviceType = 'viewing') => setBookingServiceType(serviceType);
  const closeBooking = () => setBookingServiceType(null);

  return (
    <>
      <Helmet>
        <title>Premium Real Estate Services Across Kenya | Raslipwani Properties</title>
        <meta
          name="description"
          content="Book property viewings, valuations, and consultations across Kenya. Expert real estate services in Nairobi, Mombasa, Coast Region and beyond."
        />
      </Helmet>

      {bookingServiceType && (
        <ServiceBookingModal
          isOpen
          initialServiceType={bookingServiceType}
          onClose={closeBooking}
        />
      )}

      <main className="flex-grow bg-surface">
        <ServicesHero onBook={openBooking} />
        <ServicesGrid onSelectService={openBooking} />
        <ServicesFaq />
        <ServicesCta onBook={openBooking} />
      </main>
    </>
  );
};

export default ServicesMain;
