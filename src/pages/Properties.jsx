import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { propertyQueries } from '@/services/properties';
import { useFilters } from '@/hooks/useFilters';
import PropertyModal from '../components/PropertyModal';
import PropertySearchHero from './properties/PropertySearchHero';
import PropertyFilterBar from './properties/PropertyFilterBar';
import PropertyGrid from './properties/PropertyGrid';

// A stable reference: `properties` feeds the memos below, and a fresh `[]`
// literal on every render (the natural way to default an unresolved query's
// `data`) would give each of them a new dependency identity every render.
const EMPTY_PROPERTIES = [];

// The filter offers coarse categories; the listings carry finer property types.
const PROPERTY_TYPE_MAP = {
  house: ['house', 'apartment', 'villa'],
  land: ['land'],
  commercial: ['commercial', 'office'],
  apartment: ['apartment'],
  villa: ['villa'],
  office: ['commercial', 'office'],
};

const INITIAL_FILTERS = { search: '', type: 'all', purpose: 'all', sort: 'newest' };

const capitalise = (value) => value.charAt(0).toUpperCase() + value.slice(1);

// SEO derived values
const BASE_URL = 'https://raslipwani.co.ke/properties';
const LIST_TITLE = 'Properties for Sale & Rent Across Kenya | Raslipwani Properties';
const LIST_DESCRIPTION =
  'Browse premium properties across Kenya. Filter by type, purpose, and location. Find apartments, villas, land, and commercial listings.';

const Properties = () => {
  const { data: properties = EMPTY_PROPERTIES, isLoading: loading, error } = useQuery(
    propertyQueries.all()
  );
  const { filters, setFilter, resetFilters } = useFilters(INITIAL_FILTERS);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Routing, not filtering: `?type=` and `?purpose=` are how the rest of the
  // site links into a pre-filtered listing, so the URL seeds the filters here
  // rather than inside the hook six other screens share.
  useEffect(() => {
    const type = searchParams.get('type');
    const purpose = searchParams.get('purpose');

    if (type) setFilter('type', type);
    if (purpose) setFilter('purpose', purpose);
  }, [searchParams, setFilter]);

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(property =>
        property.title.toLowerCase().includes(term) ||
        property.location.toLowerCase().includes(term) ||
        property.description.toLowerCase().includes(term)
      );
    }

    if (filters.type !== 'all') {
      const mappedTypes = PROPERTY_TYPE_MAP[filters.type] || [filters.type];
      result = result.filter(property =>
        property.property_type &&
        mappedTypes.includes(property.property_type.toLowerCase())
      );
    }

    if (filters.purpose !== 'all') {
      result = result.filter(property =>
        property.purpose &&
        property.purpose.toLowerCase() === filters.purpose.toLowerCase()
      );
    }

    if (filters.sort === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (filters.sort === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (filters.sort === 'oldest') {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    return result;
  }, [properties, filters]);

  const activeFilters = useMemo(() => {
    const chips = [];

    if (filters.type !== 'all') {
      chips.push({ type: 'propertyType', value: filters.type, label: `Type: ${capitalise(filters.type)}` });
    }
    if (filters.purpose !== 'all') {
      chips.push({ type: 'purpose', value: filters.purpose, label: `For: ${capitalise(filters.purpose)}` });
    }
    if (filters.search) {
      chips.push({ type: 'search', value: filters.search, label: `Search: "${filters.search}"` });
    }

    return chips;
  }, [filters]);

  // Something to look at when a search comes back empty. Picked once per empty
  // result rather than on every render, so the four suggestions do not reshuffle
  // under the visitor while they read them.
  const suggestedProperties = useMemo(() => {
    if (filteredProperties.length > 0 || properties.length === 0) return EMPTY_PROPERTIES;

    return properties
      .filter(p => p.featured)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }, [filteredProperties, properties]);

  // Build ItemList JSON-LD for listings (up to 20 items)
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Property Listings',
    itemListElement: filteredProperties.slice(0, 20).map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `https://raslipwani.co.ke/properties/${p.slug || p.id}`,
      item: {
        '@type': 'RealEstateListing',
        name: p.title,
        description: p.description?.slice(0, 160),
        image: p.images || [],
        offers: {
          '@type': 'Offer',
          price: p.price,
          priceCurrency: 'KES',
          availability:
            p.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
        address: p.address
          ? {
              '@type': 'PostalAddress',
              streetAddress: p.address,
              addressLocality: p.location,
              addressCountry: 'KE',
            }
          : undefined,
      },
    })),
  };

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

  // Clearing a filter that came in through the URL has to clear the URL too,
  // or the effect above puts it straight back.
  const removeFilter = (filterType) => {
    if (filterType === 'propertyType') {
      setFilter('type', 'all');
      const params = new URLSearchParams(searchParams);
      params.delete('type');
      setSearchParams(params);
    }
    if (filterType === 'purpose') {
      setFilter('purpose', 'all');
      const params = new URLSearchParams(searchParams);
      params.delete('purpose');
      setSearchParams(params);
    }
    if (filterType === 'search') {
      setFilter('search', '');
    }
  };

  const clearAllFilters = () => {
    resetFilters();
    setSearchParams({});
  };

  return (
    <>
      <Helmet>
        <title>{LIST_TITLE}</title>
        <meta name="description" content={LIST_DESCRIPTION} />
        {/* Canonical stays clean of query params, to avoid duplicate content */}
        <link rel="canonical" href={BASE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={LIST_TITLE} />
        <meta property="og:description" content={LIST_DESCRIPTION} />
        <meta property="og:url" content={BASE_URL} />
        <meta property="og:image" content="https://res.cloudinary.com/dzqdxosk2/image/upload/f_auto,q_auto,w_1200/v1718900000/kenya-properties-hero_md_omfqo1.jpg" />
        {/* Structured Data: ItemList */}
        <script type="application/ld+json">
          {JSON.stringify(itemListJsonLd)}
        </script>
      </Helmet>

      <PropertySearchHero
        search={filters.search}
        onSearchChange={(value) => setFilter('search', value)}
        onToggleFilters={() => setIsFilterOpen(!isFilterOpen)}
      />

      <main className="flex-grow bg-surface">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <PropertyFilterBar
              filters={filters}
              isOpen={isFilterOpen}
              onFilterChange={setFilter}
              onReset={clearAllFilters}
              onClose={() => setIsFilterOpen(false)}
            />

            <PropertyGrid
              properties={properties}
              filteredProperties={filteredProperties}
              suggestedProperties={suggestedProperties}
              activeFilters={activeFilters}
              isLoading={loading}
              error={error}
              onSelect={openModal}
              onToggleFilters={() => setIsFilterOpen(!isFilterOpen)}
              onRemoveFilter={removeFilter}
              onReset={clearAllFilters}
            />
          </div>
        </div>
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

export default Properties;
