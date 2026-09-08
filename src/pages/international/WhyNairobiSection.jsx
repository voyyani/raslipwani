import React from 'react';
import { motion } from 'framer-motion';
import { whyNairobi } from './internationalContent';

/**
 * The case for Nairobi, in four cards. Moved out of `International.jsx`
 * (Task 25) unchanged.
 */
const WhyNairobiSection = React.forwardRef((props, ref) => (
  <section ref={ref} className="py-20 bg-gradient-to-b from-surface to-surface-raised">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-content mb-4">
          Why Nairobi? Why Now?
        </h2>
        <p className="text-xl text-content-muted max-w-3xl mx-auto">
          East Africa's hub for international business, diplomacy, and investment - creating unprecedented real estate opportunities
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-8 mb-16">
        {whyNairobi.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="text-center p-8 bg-surface-raised rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <div className="text-6xl font-bold bg-gradient-to-r from-brand to-purple-600 bg-clip-text text-transparent mb-2">
              {item.stat}
            </div>
            <div className="text-lg font-semibold text-content mb-2">{item.label}</div>
            <div className="text-sm text-content-muted">{item.detail}</div>
          </motion.div>
        ))}
      </div>

    </div>
  </section>
));

WhyNairobiSection.displayName = 'WhyNairobiSection';

export default WhyNairobiSection;
