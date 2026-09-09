import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

import Button from '../../components/ui/Button';
import { PropertyCard, PropertySkeleton } from './HomeCards';
import { enter } from './homeMotion';

/**
 * The featured listings, their skeletons, and the failure state.
 *
 * This section sits on flat ground, so its cards are `Card`s and not glass —
 * DESIGN.md rule 1. Its call to action is `primary`: the page's one amber
 * element is the hero's search button, and a second one halves the value of the
 * first.
 */
const FeaturedProperties = ({ properties, isLoading, error, onSelect }) => (
  <section className="bg-surface-raised py-20">
    <div className="container mx-auto px-4">
      <div className="mb-14 text-center">
        <motion.h2
          {...enter(0)}
          className="font-display text-3xl font-semibold tracking-tight text-content"
        >
          Featured Properties
        </motion.h2>
        <motion.p {...enter(1)} className="mx-auto mt-3 max-w-2xl text-content-muted">
          Exclusive listings currently available across Kenya
        </motion.p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-danger-border bg-danger-surface px-4 py-3 text-center text-danger-content"
        >
          {error?.message || 'Failed to load featured properties. Please try again.'}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <PropertySkeleton key={item} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="py-12 text-center">
          <h3 className="font-display text-xl font-semibold tracking-tight text-content">
            No featured properties available
          </h3>
          <p className="mt-2 text-content-muted">Check back later for new listings</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {properties.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              index={index}
              openModal={onSelect}
            />
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <Button to="/properties" variant="primary" size="lg">
          View All Properties
        </Button>
      </div>
    </div>
  </section>
);

FeaturedProperties.propTypes = {
  properties: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
};

export default FeaturedProperties;
