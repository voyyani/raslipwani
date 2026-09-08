import React from 'react';
import { motion } from 'framer-motion';

/**
 * The contact page's hero. Moved out of `Contact.jsx` (Task 26) unchanged.
 */
const ContactHero = () => (
<section className="bg-gradient-to-r from-brand-hover to-primary py-24 md:py-32 relative overflow-hidden">
  <div className="absolute inset-0 bg-surface-inverse opacity-20"></div>
  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-brand/10"></div>
  <div className="container mx-auto px-4 relative z-10 text-center text-content-on-brand">
    <motion.h1 
      className="text-4xl md:text-6xl font-bold mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Kenya Real Estate Experts
    </motion.h1>
    <motion.p 
      className="text-xl md:text-2xl max-w-4xl mx-auto mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      Your Gateway to Properties Across Kenya - From Nairobi to the Coast
    </motion.p>
    <motion.div 
      className="flex flex-wrap justify-center gap-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <span className="bg-surface-raised/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Nairobi</span>
      <span className="bg-surface-raised/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Mombasa</span>
      <span className="bg-surface-raised/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Kilifi</span>
      <span className="bg-surface-raised/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Malindi</span>
      <span className="bg-surface-raised/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Diani</span>
      <span className="bg-surface-raised/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Countrywide</span>
    </motion.div>
  </div>
</section>
);

export default ContactHero;
