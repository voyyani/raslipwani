import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * The closing call to action on the services page — book a viewing, or call.
 * Moved out of `ServicesMain.jsx` (Task 24).
 */
const ServicesCta = ({ onBook }) => (
    <section className="py-20 bg-gradient-to-r from-primary to-brand-hover relative overflow-hidden">
    <div className="absolute inset-0 bg-scrim/10"></div>
    <div className="container mx-auto px-4 relative z-10 text-center">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold text-content-on-media mb-4"
      >
        Ready to Find Your Perfect Property?
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-content-on-media text-xl mb-8 max-w-2xl mx-auto"
      >
        Book a viewing or consultation with our Kenya real estate experts today
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-center gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onBook('viewing')}
          className="bg-surface-raised text-primary font-bold py-4 px-8 rounded-xl hover:bg-brand-subtle transition-all shadow-2xl text-lg"
        >
          Book a Viewing
        </motion.button>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="tel:+254758066526" 
          className="bg-transparent border-2 border-line-media text-content-on-media font-bold py-4 px-8 rounded-xl hover:bg-surface-raised hover:text-primary transition-all shadow-2xl text-lg"
        >
          📞 +254 758 066 526
        </motion.a>
      </motion.div>
    </div>
  </section>
);

ServicesCta.propTypes = {
  onBook: PropTypes.func.isRequired,
};

export default ServicesCta;
