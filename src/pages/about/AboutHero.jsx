import React from 'react';
import { motion } from 'framer-motion';

/**
 * The about page's hero. Moved out of `About.jsx` (Task 27) unchanged.
 */
const AboutHero = () => (
<section className="relative bg-gradient-to-br from-surface-inverse via-brand-hover to-primary py-24 md:py-32 overflow-hidden">
  {/* Background Pattern */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute inset-0" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    }}></div>
  </div>
  
  {/* Animated Background Elements */}
  <div className="absolute top-10 left-10 w-20 h-20 bg-content-on-brand/5 rounded-full blur-xl"></div>
  <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
  
  <div className="container mx-auto px-4 relative z-10 text-center text-content-on-brand">
    <motion.h1 
      className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-surface-raised to-surface-sunken bg-clip-text text-transparent"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      About Raslipwani
    </motion.h1>
    <motion.p 
      className="text-xl md:text-2xl max-w-3xl mx-auto text-content-inverse font-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.7 }}
    >
      Your Trusted Real Estate Partner Across Kenya
    </motion.p>
  </div>
</section>
);

export default AboutHero;
