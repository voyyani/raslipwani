import React from 'react';
import { motion } from 'framer-motion';
import { BenefitCard } from './HomeCards';

/**
 * The condensed strip of reasons to choose us. Moved out of `Home.jsx`
 * (Task 26) unchanged.
 */
const WhyChooseUs = () => (
<section className="py-8 md:py-12 bg-surface-raised border-y border-line">
  <div className="container mx-auto px-4">
    <div className="flex flex-col items-center gap-4 md:gap-6">
      <h3 className="text-lg md:text-xl font-bold text-primary">
        Why Raslipwani?
      </h3>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:gap-x-10">
        {[
          { icon: '👨‍💼', text: 'Expert Team' },
          { icon: '🤝', text: 'Client-First' },
          { icon: '✓', text: 'Trusted' },
          { icon: '🇰🇪', text: 'Nationwide' },
          { icon: '💰', text: 'All Budgets' },
          { icon: '🏠', text: 'End-to-End' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-1.5 text-content"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs md:text-sm font-medium">{item.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
</section>
);

export default WhyChooseUs;
