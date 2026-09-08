import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../../components/Icon';

/**
 * The closing call to action. Moved out of `About.jsx` (Task 27) unchanged.
 */
const AboutCta = () => (
<section className="py-16 bg-gradient-to-r from-primary to-brand">
  <div className="container mx-auto px-4 text-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl md:text-4xl font-bold text-content-on-brand mb-6">
        Ready to Find Your Dream Property?
      </h2>
      <p className="text-content-on-brand/90 text-xl mb-8 max-w-2xl mx-auto">
        Join hundreds of satisfied clients who have found their perfect property with Raslipwani
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          to="/properties" 
          className="inline-flex items-center gap-2 bg-surface-raised text-primary font-semibold py-3 px-8 rounded-full hover:bg-surface-sunken transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Icon name="search" />
          Browse Properties
        </Link>
        <Link 
          to="/contact" 
          className="inline-flex items-center gap-2 bg-transparent border-2 border-content-on-brand text-content-on-brand font-semibold py-3 px-8 rounded-full hover:bg-surface-raised hover:text-primary transition-all duration-300"
        >
          <Icon name="envelope" />
          Get In Touch
        </Link>
      </div>
    </motion.div>
  </div>
</section>
);

export default AboutCta;
