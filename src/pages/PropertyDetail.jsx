import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { propertyQueries } from '@/services/properties';

import PropertyGallery from './property-detail/PropertyGallery';
import PropertySpecs from './property-detail/PropertySpecs';
import PropertyEnquiryPanel from './property-detail/PropertyEnquiryPanel';

/**
 * One property's page: its gallery, its details, and the panel that invites an
 * enquiry. The image viewer's state and gestures are in `useImageViewer`, and
 * the three regions are their own components (Task 25); what is left here is
 * the query, the SEO the page emits, and the two states that precede a
 * listing.
 */
const PropertyDetail = () => {
  const { id } = useParams();
  const { data: property, isLoading: loading, error } = useQuery(propertyQueries.detail(id));

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Derived SEO fields
  const pageUrl = property ? `https://raslipwani.co.ke/properties/${property.slug || property.id}` : `https://raslipwani.co.ke/properties/${id}`;
  const title = property ? `${property.title} | ${property.location} | Raslipwani Properties` : 'Property Details | Raslipwani Properties';
  const description = property ? (
    `${property.description?.slice(0, 155) || 'Explore this property at Raslipwani Properties.'}`
  ) : 'Explore this property at Raslipwani Properties.';
  const ogImage = property?.images?.[0];

  const jsonLd = property ? {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description,
    "url": pageUrl,
    "image": property.images || [],
    "address": property.address ? {
      "@type": "PostalAddress",
      "streetAddress": property.address,
      "addressLocality": property.location,
      "addressCountry": "KE"
    } : undefined,
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "KES",
      "availability": property.status === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "seller": {
      "@type": "Organization",
      "name": "Raslipwani Properties",
      "url": "https://raslipwani.co.ke"
    }
  } : null;


  if (loading) {
    return (
      <>
        <main className="flex-grow container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
      </>
    );
  }

  // Error state
  if (!property) {
    return (
      <>
        <main className="flex-grow container mx-auto px-4 py-8">
          {error ? (
            <div className="bg-danger-surface border border-danger-border text-danger-content px-4 py-3 rounded mb-6">
              {`Failed to load property details: ${error.message}`}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
              <p>The property you're looking for doesn't exist or has been removed.</p>
            </div>
          )}
          <Link to="/properties" className="mt-6 inline-block text-primary hover:underline">
            &larr; Back to Properties
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      {/* Page-specific SEO */}
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:url" content={pageUrl} />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        {jsonLd && (
          <script type="application/ld+json">
            {JSON.stringify(jsonLd)}
          </script>
        )}
      </Helmet>
      

      <main className="flex-grow container mx-auto px-4 py-8">
          {/* Breadcrumbs with schema for SEO */}
          <nav className="text-sm mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2" itemScope itemType="https://schema.org/BreadcrumbList">
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to="/" itemProp="item" className="text-primary hover:underline">
                  <span itemProp="name">Home</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <span className="mx-2">/</span>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to="/properties" itemProp="item" className="text-primary hover:underline">
                  <span itemProp="name">Properties</span>
                </Link>
                <meta itemProp="position" content="2" />
              </li>
              <span className="mx-2">/</span>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="text-content-muted">
                <Link to={pageUrl} itemProp="item" className="text-content-muted">
                  <span itemProp="name">{property.title}</span>
                </Link>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </nav>
          
        <Link to="/properties" className="text-primary hover:underline mb-4 inline-block">
          &larr; Back to Properties
        </Link>

        <PropertyGallery
          images={property.images ?? []}
          alt={`${property.title} in ${property.location}`}
        />

        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <PropertySpecs property={property} formatPrice={formatPrice} />
          <PropertyEnquiryPanel property={property} />
        </div>
      </main>
    </>
  );
};

export default PropertyDetail;
