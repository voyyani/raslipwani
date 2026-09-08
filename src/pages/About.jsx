import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import AboutHero from './about/AboutHero';
import AboutStory from './about/AboutStory';
import AboutMission from './about/AboutMission';
import AboutValues from './about/AboutValues';
import AboutCta from './about/AboutCta';

/**
 * The about page. Its five sections and the values it lists are their own
 * modules (Task 27).
 */
const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>About Kenya's Premier Real Estate Agency | Raslipwani Properties</title>
        <meta name="description" content="Leading Kenyan real estate experts with 8+ years experience in property sales, acquisition, and management across major cities and regions" />
        
        {/* AboutPage Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About Raslipwani Properties",
            "description": "Premier real estate agency serving all major regions of Kenya",
            "publisher": {
              "@type": "Organization",
              "name": "Raslipwani Properties",
              "logo": {
                "@type": "ImageObject",
                "url": "https://raslipwani.com/logo.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://raslipwani.com/about"
            }
          })}
        </script>
      </Helmet>

      <main className="flex-grow">
        <AboutHero />
        <AboutStory />
        <AboutMission />
        <AboutValues />
        <AboutCta />
      </main>
    </>
  );
};

export default About;
