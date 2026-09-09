import React from 'react';
import { motion } from 'framer-motion';

import { ServiceCard } from './HomeCards';
import { services } from './homeContent';
import { enter } from './homeMotion';

/**
 * The four services, as an icon row.
 *
 * It used to forward a ref so the hero's second button could scroll to it. The
 * hero now does the first step of the job in place rather than sending anyone
 * anywhere, so the button and the ref are both gone; the section keeps a stable
 * `id` for anything that wants to link to it.
 */
const ServicesSection = () => (
  <section id="services" className="bg-surface py-12 md:py-20">
    <div className="container mx-auto px-4">
      <motion.h2
        {...enter(0)}
        className="text-center font-display text-xl font-semibold tracking-tight text-content md:text-2xl"
      >
        Our Premium Services
      </motion.h2>

      <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-6 md:mt-10 md:gap-10">
        {services.map((service, index) => (
          <ServiceCard key={service.title} {...service} index={index} />
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
