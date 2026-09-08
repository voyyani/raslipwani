import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logger } from '../../utils/logger';
import Icon from '../Icon';

/** The office number, in one place: it appeared as a literal in three. */
const OFFICE_PHONE = '+254758066526';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(price);

/**
 * The property modal's details column: price, specs, description, amenities
 * and the two calls to action. Moved out of `PropertyModal.jsx` (Task 26)
 * along with the reveal-the-number state, which nothing else used.
 */
const PropertyModalDetails = ({ property, onClose }) => {
  const navigate = useNavigate();
  const [showPhone, setShowPhone] = useState(false);

  const handleContactAgent = () => setShowPhone(true);

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
      toast.success('Phone number copied.');
    } catch (error) {
      logger.error('Clipboard write failed:', error);
      toast.error(`Could not copy. Our number is ${OFFICE_PHONE}.`);
    }
  };

  const handleScheduleTour = () => {
    onClose();
    navigate('/services', { state: { openViewingModal: true } });
  };

  return (
  <motion.div 
    className="p-6 md:p-8 overflow-y-auto flex-grow"
    style={{ maxHeight: 'calc(90vh - 50vh)' }}
    initial={{ y: 20 }}
    animate={{ y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-content mb-2">
          {property.title}
        </h2>
        <p className="text-content-muted flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {property.location}
        </p>
      </div>
      <span className="text-2xl md:text-3xl font-bold text-primary">
        {formatPrice(property.price)}
      </span>
    </div>
    
    {/* Property Features */}
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex items-center bg-surface-sunken rounded-full px-4 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="text-sm font-medium">{property.bedrooms || 0} Beds</span>
      </div>
      <div className="flex items-center bg-surface-sunken rounded-full px-4 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium">{property.bathrooms || 0} Baths</span>
      </div>
      <div className="flex items-center bg-surface-sunken rounded-full px-4 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
        </svg>
        <span className="text-sm font-medium">{property.area_sqft || 'N/A'} sqft</span>
      </div>
    </div>
    
    {/* Property Description */}
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Description</h3>
      <p className="text-content-muted leading-relaxed whitespace-pre-line">
        {property.description || 'No description available.'}
      </p>
    </div>
    
    {/* Property Features */}
    {property.amenities?.length > 0 && (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Property Features</h3>
        <div className="grid grid-cols-2 gap-3">
          {property.amenities.map((amenity, i) => (
            <div key={i} className="flex items-center bg-surface px-4 py-2.5 rounded-lg">
              <span className="text-primary mr-2">✓</span>
              <span className="capitalize">{amenity.replace('-', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    )}
    
    {/* Action Buttons */}
    <div className="flex flex-wrap gap-4">
      {showPhone ? (
        <div className="bg-brand-subtle rounded-xl p-4 w-full flex flex-col items-center">
          <div className="flex items-center mb-3">
            <Icon name="phone" size={20} className="text-brand mr-2" />
            <h4 className="text-lg font-semibold">Contact Agent</h4>
          </div>
          <a 
            href={`tel:${OFFICE_PHONE}`} 
            className="text-2xl font-bold text-primary mb-3 hover:underline"
          >
            +254 758 066 526
          </a>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyPhoneNumber}
              className="bg-surface-raised border border-primary text-primary font-medium py-2 px-4 rounded-lg shadow-md"
            >
              Copy Number
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={`tel:${OFFICE_PHONE}`}
              className="bg-gradient-to-r from-primary to-secondary text-content-on-media font-medium py-2 px-4 rounded-lg shadow-md"
            >
              Call Now
            </motion.a>
          </div>
        </div>
      ) : (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContactAgent}
            className="bg-gradient-to-r from-primary to-secondary text-content-on-media font-medium py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            Contact Agent
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleScheduleTour}
            className="bg-surface-raised border border-primary text-primary font-medium py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            Schedule Tour
          </motion.button>
        </>
      )}
    </div>
  </motion.div>
  );
};

PropertyModalDetails.propTypes = {
  property: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PropertyModalDetails;
