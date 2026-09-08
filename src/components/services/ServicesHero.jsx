import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * The services page's hero, with the two buttons that open the booking wizard
 * on a viewing or a consultation. Moved out of `ServicesMain.jsx` (Task 24).
 */
const ServicesHero = ({ onBook }) => (
    <section className="bg-gradient-to-br from-primary via-brand-hover to-brand-hover py-20 md:py-28 text-content-on-media relative overflow-hidden">
    <div className="absolute inset-0 bg-scrim/20"></div>
    <div className="container mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Kenya Real Estate Services
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-content-on-media/90">
          Book viewings, valuations, and consultations for properties across Kenya
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onBook('viewing')}
          className="bg-surface-raised text-primary font-bold py-4 px-8 rounded-xl hover:bg-brand-subtle transition-all shadow-2xl text-lg mr-4 mb-4"
        >
          Book a Viewing
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onBook('consultation')}
          className="bg-transparent border-2 border-line-media text-content-on-media font-bold py-4 px-8 rounded-xl hover:bg-surface-raised hover:text-primary transition-all shadow-2xl text-lg"
        >
          Get Consultation
        </motion.button>
      </motion.div>
    </div>
  </section>
);

ServicesHero.propTypes = {
  onBook: PropTypes.func.isRequired,
};

export default ServicesHero;
