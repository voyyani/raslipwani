import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSettings } from '../hooks/useSettings';

/**
 * DynamicSEO - Renders global SEO schemas using settings from admin panel
 * Uses SettingsContext to inject dynamic company info into structured data
 */
const DynamicSEO = () => {
  const { siteName, logo, phone, email, socialMedia, loading } = useSettings();
  
  // Don't render schema until settings are loaded
  if (loading) return null;
  
  const companyName = siteName();
  const companyLogo = logo();
  const companyPhone = phone();
  const companyEmail = email();
  const social = socialMedia();
  
  // Build social media URLs array
  const socialUrls = [
    social?.facebook,
    social?.instagram,
    social?.twitter,
    social?.linkedin,
    social?.tiktok
  ].filter(Boolean);
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": companyName,
    "url": "https://raslipwani.co.ke/",
    "logo": companyLogo,
    "email": companyEmail,
    "sameAs": socialUrls.length > 0 ? socialUrls : [
      "https://www.facebook.com/raslipwani",
      "https://www.instagram.com/raslipwani",
      "https://twitter.com/raslipwani"
    ],
    "contactPoint": [{
      "@type": "ContactPoint",
      "telephone": companyPhone,
      "contactType": "Customer Service",
      "areaServed": "KE"
    }]
  };
  
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": companyName,
    "url": "https://raslipwani.co.ke/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://raslipwani.co.ke/properties?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      <html lang="en" />
      <link rel="canonical" href="https://raslipwani.co.ke" />
      
      {/* Organization Schema */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      
      {/* Website Schema */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </Helmet>
  );
};

export default DynamicSEO;
