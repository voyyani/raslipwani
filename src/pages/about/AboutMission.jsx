import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../components/Icon';

/**
 * Mission and vision. Moved out of `About.jsx` (Task 27) unchanged.
 */
const AboutMission = () => (
<section className="py-16 md:py-24 bg-gradient-to-br from-surface to-brand-subtle">
  <div className="container mx-auto px-4">
    <motion.div 
      className="text-center mb-16"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="inline-flex items-center gap-2 bg-surface-raised text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-sm">
        <Icon name="bullseye" size={14} />
        Our Purpose
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-content mb-4">Mission & Vision</h1>
      <p className="text-content-muted max-w-3xl mx-auto text-lg">
        The guiding principles that drive our commitment to excellence in Kenyan real estate
      </p>
    </motion.div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      <motion.div 
        className="bg-surface-raised p-8 rounded-3xl shadow-lg border border-line hover:shadow-xl transition-all duration-500 group"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-brand rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Icon name="rocket" size={20} className="text-content-on-brand" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-content">Our Mission</h2>
        <p className="text-content leading-relaxed">
          To deliver exceptional real estate services that transform property dreams into reality across Kenya. 
          We provide expert guidance, innovative solutions, and personalized service that exceeds expectations 
          at every stage of the property journey.
        </p>
      </motion.div>
      
      <motion.div 
        className="bg-surface-raised p-8 rounded-3xl shadow-lg border border-line hover:shadow-xl transition-all duration-500 group"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-brand to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Icon name="eye" size={20} className="text-content-on-brand" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-content">Our Vision</h2>
        <p className="text-content leading-relaxed">
          To be Kenya's most trusted and innovative real estate partner, recognized for integrity, 
          excellence, and transformative property solutions. We envision a future where every client 
          achieves their property goals with confidence and ease through our nationwide expertise.
        </p>
      </motion.div>
    </div>
  </div>
</section>
);

export default AboutMission;
