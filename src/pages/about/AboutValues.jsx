import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../components/Icon';
import { values } from './aboutContent';

/**
 * The four values, from `aboutContent`. Moved out of `About.jsx`
 * (Task 27) unchanged.
 */
const AboutValues = () => (
<section className="py-16 md:py-24 bg-surface-raised">
  <div className="container mx-auto px-4">
    <motion.div 
      className="text-center mb-16"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
        <Icon name="star" size={14} />
        Our Values
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-content mb-4">What We Stand For</h1>
      <p className="text-content-muted max-w-2xl mx-auto">
        The core principles that guide every decision and interaction
      </p>
    </motion.div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {values.map((value, index) => (
        <motion.div
          key={index}
          className="bg-gradient-to-br from-surface-raised to-surface p-6 rounded-2xl border border-line hover:border-primary/20 transition-all duration-300 group hover:shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
            <Icon name={value.icon} size={18} className="text-primary group-hover:text-content-on-brand" />
          </div>
          <h3 className="text-lg font-semibold text-content mb-3">{value.title}</h3>
          <p className="text-content-muted text-sm leading-relaxed">{value.description}</p>
        </motion.div>
      ))}
    </div>
  </div>
</section>
);

export default AboutValues;
