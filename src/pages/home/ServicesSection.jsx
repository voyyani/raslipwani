import React from 'react';
import { motion } from 'framer-motion';
import { ServiceCard } from './HomeCards';
import { services } from './homeContent';

/**
 * The four services, as an icon grid. It is also the target the hero's
 * second button scrolls to, which is why it forwards a ref. Moved out of
 * `Home.jsx` (Task 26).
 */
const ServicesSection = React.forwardRef((props, ref) => (
<section ref={ref} className="py-8 md:py-16 bg-surface">
  <div className="container mx-auto px-4">
    <div className="text-center mb-6 md:mb-10">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-xl md:text-2xl font-bold text-primary"
      >
        Our Premium Services
      </motion.h2>
    </div>
    
    <div className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-3xl mx-auto">
      {services.map((service, index) => (
        <ServiceCard key={index} {...service} index={index} />
      ))}
    </div>
  </div>
</section>
));

ServicesSection.displayName = 'ServicesSection';

export default ServicesSection;
