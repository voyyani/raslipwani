import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * The home page's closing call to action. Moved out of `Home.jsx`
 * (Task 26) unchanged.
 */
const HomeCta = () => (
<section className="py-20 bg-gradient-to-r from-primary to-secondary">
  <div className="container mx-auto px-4 text-center">
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl font-bold text-content-on-brand mb-4"
    >
      Ready to Begin Your Journey?
    </motion.h2>
    <motion.p 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-content-on-brand text-xl mb-8 max-w-2xl mx-auto"
    >
      Our experts are ready to guide you to your dream property in Kenya
    </motion.p>
    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <Link 
        to="/contact" 
        className="inline-block bg-surface-raised text-primary font-bold py-3 px-8 rounded-md hover:bg-surface-sunken transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        Get in Touch
      </Link>
      <Link 
        to="/properties" 
        className="inline-block bg-transparent border-2 border-content-on-brand text-content-on-brand font-bold py-3 px-8 rounded-md hover:bg-content-on-brand/10 transition-all duration-300"
      >
        Browse Listings
      </Link>
    </div>
  </div>
</section>
);

export default HomeCta;
