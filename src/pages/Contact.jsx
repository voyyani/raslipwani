import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

import ContactHero from './contact/ContactHero';
import ContactTabs from './contact/ContactTabs';
import ContactForm from './contact/ContactForm';
import ContactDetailsPanel from './contact/ContactDetailsPanel';
import ContactCta from './contact/ContactCta';

/**
 * The contact page. Everything below the fold is its own component (Task 26);
 * what stays here is the page's SEO and which kind of enquiry is selected —
 * the one piece of state the tabs and the form both read.
 */
const Contact = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <>
      <Helmet>
        <title>Contact Kenya Real Estate Experts | Nationwide Property Solutions</title>
        <meta name="description" content="Connect with Raslipwani Properties for real estate opportunities across Kenya. From Nairobi to Coast, find your perfect property with our expert team." />
        
        {/* Local Business Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            "name": "Raslipwani Properties",
            "image": "https://raslipwani.co.ke/logo.png",
            "@id": "https://raslipwani.co.ke",
            "url": "https://raslipwani.co.ke",
            "telephone": "+254758066526",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Kikambala Road",
              "addressLocality": "Kilifi",
              "postalCode": "80108",
              "addressCountry": "KE"
            },
            "areaServed": "Kenya",
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-3.6308",
              "longitude": "39.8499"
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
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

      <main className="flex-grow bg-gradient-to-b from-surface-raised to-surface">
        <ContactHero />

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              className="bg-surface-raised rounded-2xl shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ContactTabs activeTab={activeTab} onChange={setActiveTab} />

              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Remounted per tab: each kind of enquiry asks for different
                    things, and carrying a half-filled buying enquiry into the
                    selling form was never the intent. */}
                <ContactForm
                  key={activeTab}
                  inquiryType={activeTab}
                  onSubmitted={() => {}}
                />

                <ContactDetailsPanel />
              </div>
            </motion.div>
          </div>
        </section>

        <ContactCta />
      </main>
    </>
  );
};

export default Contact;
