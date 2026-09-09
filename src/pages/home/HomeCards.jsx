import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

import Card from '../../components/ui/Card';
import Icon from '../../components/Icon';
import { enter } from './homeMotion';

/**
 * The card shapes the home page renders: a service, a featured property, and
 * that property's skeleton.
 *
 * All three are on the material layer now. What that changed:
 *
 * - **`Card`, not a hand-assembled `div`.** The property card was a `div` with
 *   an `onClick`, which no keyboard reaches and no screen reader announces as a
 *   control — on the one element of the home page whose entire job is to be
 *   activated. `Card` has no route to a clickable div; passing `onClick` yields
 *   a real `<button>` with a focus ring.
 * - **Tokens, not literals.** `shadow-xl`/`shadow-2xl` were Tailwind's default
 *   black shadows; the elevation stops are brand-tinted, because black shadows
 *   on a warm coastal ground read as dirt (DESIGN.md rule 2).
 * - **`rounded-lg`, not `rounded-2xl`.** The radius scale is the iOS one now, so
 *   `lg` is 20px — the same corner the outgoing `2xl` was reaching for by
 *   accident.
 * - **Drawn icons, not inline SVG paths.** Four hand-pasted heroicons paths were
 *   the only icons on the page not coming from the icon set, at a stroke weight
 *   that matched nothing else.
 * - **One entrance.** See `homeMotion.js`.
 */

const ServiceCard = ({ icon, title, index }) => (
  <motion.div
    {...enter(index)}
    // Not `cursor-pointer`: this is not a control, and a hand cursor on
    // something that does nothing when clicked is a promise the page breaks.
    className="group flex w-24 flex-col items-center text-center md:w-32"
  >
    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-brand text-content-on-brand shadow-raised transition-transform duration-base ease-spring group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 md:h-20 md:w-20">
      {/* Sized by class, not the `size` prop: this is the only icon on the site
          that grows at the `md` breakpoint, and a prop cannot be responsive.
          Tailwind's w/h override the width/height attributes the prop sets. */}
      <Icon name={icon} className="h-5 w-5 md:h-8 md:w-8" />
    </div>
    <h3 className="mt-3 text-xs font-semibold text-content md:text-sm">{title}</h3>
  </motion.div>
);

const formatPrice = (price) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(price);

/** One fact about the property, with its icon. */
const Fact = ({ icon, children }) => (
  <span className="flex items-center gap-1.5 text-sm text-content-muted">
    <Icon name={icon} size={16} className="text-brand-content" aria-hidden="true" />
    {children}
  </span>
);

const PropertyCard = ({ property, index, openModal }) => (
  <motion.div {...enter(index)} className="h-full">
    <Card
      onClick={() => openModal(property)}
      padded={false}
      className="group h-full overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-sunken">
        {property.images?.[0] ? (
          <img
            src={property.images[0]}
            alt={`${property.title} in ${property.location}`}
            className="h-full w-full object-cover transition-transform duration-slow ease-spring group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            loading={index > 1 ? 'lazy' : 'eager'}
            width="400"
            height="300"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-sm text-content-subtle">
            No image available
          </span>
        )}
        {property.featured && (
          <span className="absolute right-3 top-3 rounded-sm bg-surface-raised/95 px-2.5 py-1 text-xs font-semibold text-brand-content shadow-raised">
            Featured
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-lg font-semibold tracking-tight text-content">
            {property.title}
          </h3>
          <span className="whitespace-nowrap font-display text-lg font-semibold tracking-tight text-brand-content">
            {formatPrice(property.price)}
          </span>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-content-muted">
          <Icon name="map-marker-alt" size={16} className="text-brand-content" aria-hidden="true" />
          {property.location}
        </p>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4">
          <Fact icon="bed">{property.bedrooms || 0} beds</Fact>
          <Fact icon="bath">{property.bathrooms || 0} baths</Fact>
          <Fact icon="ruler-combined">{property.area_sqft || 'N/A'} sqft</Fact>
        </div>
      </div>
    </Card>
  </motion.div>
);

const PropertySkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-lg border border-line bg-surface-raised shadow-raised">
    <div className="aspect-[4/3] bg-surface-sunken" />
    <div className="p-6">
      <div className="mb-4 flex justify-between gap-4">
        <div className="h-6 w-3/5 rounded-sm bg-surface-sunken" />
        <div className="h-6 w-1/4 rounded-sm bg-surface-sunken" />
      </div>
      <div className="mb-6 h-4 w-3/4 rounded-sm bg-surface-sunken" />
      <div className="flex justify-between border-t border-line pt-4">
        <div className="h-4 w-16 rounded-sm bg-surface-sunken" />
        <div className="h-4 w-16 rounded-sm bg-surface-sunken" />
        <div className="h-4 w-16 rounded-sm bg-surface-sunken" />
      </div>
    </div>
  </div>
);

ServiceCard.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

Fact.propTypes = {
  icon: PropTypes.string.isRequired,
  children: PropTypes.node,
};

PropertyCard.propTypes = {
  property: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  openModal: PropTypes.func.isRequired,
};

export { ServiceCard, PropertyCard, PropertySkeleton };
