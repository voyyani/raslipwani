import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { propertyQueries } from '@/services/properties';
import PropertyModal from '../components/PropertyModal';
import HeroSection from './home/HeroSection';
import ServicesSection from './home/ServicesSection';
import FeaturedProperties from './home/FeaturedProperties';
import WhyChooseUs from './home/WhyChooseUs';
import HomeCta from './home/HomeCta';

/**
 * The home page. Its five sections and three card shapes are their own
 * components; the page keeps the featured-listings query and the modal a card
 * opens.
 *
 * The hero used to hand back a ref so its second button could scroll to the
 * services strip. It now runs a search instead of moving the visitor somewhere
 * else to start over, so neither the ref nor the button survives.
 */
const Home = () => {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch featured properties with React Query for automatic cache invalidation
  const {
    data: featuredProperties = [],
    isLoading: loading,
    error,
  } = useQuery({
    ...propertyQueries.featured(),
    // The home page is the one screen where a returning visitor should see a new
    // listing immediately, so it opts into a refetch on focus. The lifetime
    // itself comes from cachePolicy — this file no longer sets its own.
    refetchOnWindowFocus: true,
  });

  const openModal = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <>
      <Helmet>
        <title>Premium Real Estate in Kenya | Raslipwani Properties</title>
        <meta
          name="description"
          content="Discover your dream home, villa, or investment property across Kenya. 100+ luxury listings in Nairobi, Mombasa, Kilifi, and more."
        />
        <meta property="og:title" content="Kenyan Real Estate Experts | Raslipwani Properties" />
        <meta property="og:description" content="Find your perfect property with Kenya's leading real estate specialists" />
        <meta property="og:image" content="https://res.cloudinary.com/dzqdxosk2/image/upload/f_auto,q_auto,w_1200/v1718900000/kenya-property-hero_md_omfqo1.jpg" />
        {/* Local Business Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            "name": "Raslipwani Properties",
            "image": "https://raslipwani.com/logo.png",
            "@id": "https://www.raslipwani.com",
            "url": "https://www.raslipwani.com",
            "telephone": "+254758066526",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Kikambala Road",
              "addressLocality": "Kilifi",
              "postalCode": "80108",
              "addressCountry": "KE"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-3.8667",
              "longitude": "39.7833"
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "08:00",
              "closes": "18:00"
            },
            "sameAs": [
              "https://www.facebook.com/raslipwani",
              "https://www.instagram.com/raslipwani",
              "https://twitter.com/raslipwani"
            ]
          })}
        </script>
      </Helmet>

      <main className="flex-grow">
        <HeroSection heroLoaded={heroLoaded} onHeroLoad={() => setHeroLoaded(true)} />

        <ServicesSection />

        <FeaturedProperties
          properties={featuredProperties}
          isLoading={loading}
          error={error}
          onSelect={openModal}
        />

        <WhyChooseUs />
        <HomeCta />
      </main>

      {/* Property Modal */}
      <AnimatePresence>
        {isModalOpen && selectedProperty && (
          <PropertyModal
            property={selectedProperty}
            closeModal={closeModal}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Home;
