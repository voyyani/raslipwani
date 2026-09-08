import React from 'react';
import { motion } from 'framer-motion';

/**
 * The closing call to action on the contact page. Moved out of `Contact.jsx`
 * (Task 26) unchanged.
 */
const ContactCta = () => (
<section className="py-16 bg-gradient-to-r from-primary to-brand-hover">
  <div className="container mx-auto px-4 text-center text-content-on-brand">
    <motion.h2 
      className="text-3xl md:text-4xl font-bold mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      Ready to Find Your Perfect Property in Kenya?
    </motion.h2>
    <motion.p 
      className="text-xl mb-8 max-w-2xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      From urban apartments in Nairobi to beach homes at the Coast, we have properties across Kenya to match your dreams.
    </motion.p>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <button className="bg-surface-raised text-primary px-8 py-4 rounded-lg font-bold hover:bg-surface-sunken transition-colors shadow-lg">
        Browse Kenya Properties
      </button>
    </motion.div>
  </div>
</section>
);

export default ContactCta;
