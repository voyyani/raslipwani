import React from 'react';
import { motion } from 'framer-motion';

import { internationalServices } from './internationalContent';

/**
 * The services offered to someone moving to or investing from abroad. Moved
 * out of `International.jsx` (Task 25) unchanged.
 */
const RelocationServices = React.forwardRef((props, ref) => (
  <section ref={ref} className="py-20 bg-surface-raised">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-content mb-4">
          International Services
        </h2>
        <p className="text-xl text-content-muted max-w-3xl mx-auto">
          Everything you need to invest, buy, or relocate - no matter where you are
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {internationalServices.map((service, index) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="p-8 border-2 border-line rounded-2xl hover:border-brand hover:shadow-xl transition-all bg-gradient-to-br from-surface-raised to-surface group"
            >
              <div className="bg-gradient-to-br from-brand-subtle to-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icon className="w-7 h-7 text-brand-content" />
              </div>
              <h3 className="text-xl font-bold text-content mb-3">{service.title}</h3>
              <p className="text-content-muted leading-relaxed">{service.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
));

RelocationServices.displayName = 'RelocationServices';

export default RelocationServices;
