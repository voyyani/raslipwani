import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { logger } from '../../utils/logger';
import Icon from '../Icon';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { enter, DUR_BASE, EASE_OUT_SOFT } from './propertyModalMotion';

/** The office number, in one place: it appeared as a literal in three. */
const OFFICE_PHONE = '+254758066526';
const OFFICE_PHONE_DISPLAY = '+254 758 066 526';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(price);

const formatNumber = (n) => new Intl.NumberFormat('en-KE').format(n);

/** One of the three headline facts: the number large, its unit beneath. */
const Fact = ({ icon, value, label }) => (
  <div className="flex flex-col items-start gap-1">
    <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-content-subtle">
      <Icon name={icon} size={14} className="text-brand-content" aria-hidden="true" />
      {label}
    </dt>
    <dd className="text-lg font-semibold tabular-nums text-content">{value}</dd>
  </div>
);

Fact.propTypes = {
  icon: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
};

/** A row of the secondary details table. */
const Detail = ({ label, value, capitalize = false }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-b-0">
    <dt className="text-sm text-content-muted">{label}</dt>
    <dd className={`text-sm font-medium text-content ${capitalize ? 'capitalize' : ''}`}>{value}</dd>
  </div>
);

Detail.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  capitalize: PropTypes.bool,
};

/**
 * The property modal's listing column: title and place, the price, the three
 * facts a buyer scans first, the description, the features, and the dock that
 * holds the two calls to action.
 *
 * The dock sits outside the scroll so it is on screen from the first frame at
 * every height — a visitor on a small phone should never have to scroll a
 * description to find out how to book a viewing. It carries the view's one
 * amber element; the contact action beside it is deliberately not.
 */
const PropertyModalDetails = ({ property, onClose }) => {
  const navigate = useNavigate();
  const [showPhone, setShowPhone] = useState(false);

  /**
   * Copy the office number.
   *
   * `writeText` returns a promise and rejects when the clipboard permission is
   * denied or the page is not in a secure context. The previous version ignored
   * it and announced success unconditionally, so a denied copy still told the
   * visitor the number was on their clipboard when it was not.
   */
  const copyPhoneNumber = async () => {
    try {
      await navigator.clipboard.writeText(OFFICE_PHONE);
      toast.success('Number copied.');
    } catch (error) {
      logger.error('Clipboard write failed:', error);
      toast.error(`Could not copy. Our number is ${OFFICE_PHONE_DISPLAY}.`);
    }
  };

  const handleScheduleTour = () => {
    onClose();
    navigate('/services', { state: { openViewingModal: true } });
  };

  const purpose =
    property.purpose === 'sale' ? 'For sale' : property.purpose === 'rent' ? 'To let' : null;

  const details = [
    property.property_type && { label: 'Type', value: property.property_type, capitalize: true },
    property.year_built && { label: 'Year built', value: property.year_built },
    property.lot_size_sqft && {
      label: 'Lot size',
      value: `${formatNumber(property.lot_size_sqft)} sqft`,
    },
    property.status && { label: 'Status', value: property.status, capitalize: true },
  ].filter(Boolean);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="scrollbar-quiet min-h-0 flex-1 overflow-y-auto p-5 sm:p-6 md:p-8">
        {/* Title, place, and — on the wide panel — the close control */}
        <motion.div {...enter(0)} className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-balance font-display text-2xl font-semibold leading-tight tracking-tight text-content md:text-3xl">
              {property.title}
            </h2>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-content-muted">
              <Icon
                name="map-marker-alt"
                size={15}
                className="shrink-0 text-brand-content"
                aria-hidden="true"
              />
              <span className="truncate">{property.location}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface-raised text-content-muted shadow-raised transition-[transform,background-color,box-shadow] duration-fast ease-spring hover:bg-surface-sunken hover:text-content active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none md:inline-flex"
          >
            <Icon name="times" size={18} />
          </button>
        </motion.div>

        {/* Price */}
        <motion.div {...enter(1)} className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-display text-3xl font-semibold tabular-nums leading-none tracking-tight text-brand-content">
            {formatPrice(property.price)}
          </span>
          {purpose && <Badge intent="info">{purpose}</Badge>}
        </motion.div>

        {/* The three facts */}
        <motion.dl
          {...enter(2)}
          className="mt-6 grid grid-cols-3 gap-4 border-y border-line py-4"
        >
          <Fact icon="bed" label="Beds" value={property.bedrooms ?? 0} />
          <Fact icon="bath" label="Baths" value={property.bathrooms ?? 0} />
          <Fact
            icon="ruler-combined"
            label="Area"
            value={property.area_sqft ? `${formatNumber(property.area_sqft)} sqft` : '—'}
          />
        </motion.dl>

        {/* Description */}
        <motion.section {...enter(3)} className="mt-7">
          <h3 className="text-base font-semibold text-content">About this property</h3>
          <p className="mt-3 max-w-prose whitespace-pre-line text-base leading-relaxed text-content-muted">
            {property.description || 'The agency has not written a description for this listing yet.'}
          </p>
        </motion.section>

        {/* Features */}
        {property.amenities?.length > 0 && (
          <motion.section {...enter(4)} className="mt-7">
            <h3 className="text-base font-semibold text-content">Features</h3>
            <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {property.amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="flex items-center gap-2.5 text-sm capitalize text-content"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-brand-content">
                    <Icon name="check" size={11} aria-hidden="true" />
                  </span>
                  {amenity.replace(/-/g, ' ')}
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* The rest of the record */}
        {details.length > 0 && (
          <motion.section {...enter(5)} className="mt-7">
            <h3 className="text-base font-semibold text-content">Details</h3>
            <dl className="mt-2">
              {details.map((d) => (
                <Detail key={d.label} {...d} />
              ))}
            </dl>
          </motion.section>
        )}

      </div>

      {/* The dock */}
      <div className="shrink-0 border-t border-line bg-surface-raised/80 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 md:px-8">
        <AnimatePresence mode="wait" initial={false}>
          {showPhone ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: DUR_BASE, ease: EASE_OUT_SOFT }}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-content-subtle">
                Raslipwani office
              </p>
              <a
                href={`tel:${OFFICE_PHONE}`}
                className="mt-1 inline-block font-display text-2xl font-semibold tabular-nums tracking-tight text-content underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
              >
                {OFFICE_PHONE_DISPLAY}
              </a>
              <div className="mt-3 flex gap-3">
                <Button variant="accent" href={`tel:${OFFICE_PHONE}`} className="flex-1">
                  <Icon name="phone" size={16} aria-hidden="true" />
                  Call now
                </Button>
                <Button variant="secondary" onClick={copyPhoneNumber} className="flex-1">
                  Copy number
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              className="flex gap-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: DUR_BASE, ease: EASE_OUT_SOFT }}
            >
              <Button variant="accent" onClick={handleScheduleTour} className="flex-1">
                <Icon name="calendar-check" size={16} aria-hidden="true" />
                Book a viewing
              </Button>
              <Button variant="secondary" onClick={() => setShowPhone(true)} className="flex-1">
                <Icon name="phone" size={16} aria-hidden="true" />
                Contact agent
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

PropertyModalDetails.propTypes = {
  property: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PropertyModalDetails;
