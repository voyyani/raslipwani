import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { services } from './serviceCatalog';

// Which bookable service type each card opens the wizard on. The cards are
// titled for the visitor, the wizard is keyed by service type, and this is the
// title-to-type mapping the cards' onClick expressed inline.
const bookingTypeFor = (title) => {
  const name = title.toLowerCase();
  if (name.includes('sale')) return 'consultation';
  if (name.includes('valuation')) return 'valuation';
  if (name.includes('management')) return 'management';
  return 'viewing';
};

/**
 * The four service cards on the services page. Moved out of
 * `ServicesMain.jsx` (Task 24) unchanged.
 */
const ServicesGrid = ({ onSelectService }) => (
  <section className="py-16 bg-surface-raised">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Our Services</h2>
        <p className="text-content-muted max-w-2xl mx-auto text-lg">
          Comprehensive real estate solutions tailored for the Kenyan market
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-surface-raised rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-line group cursor-pointer"
        onClick={() => onSelectService(bookingTypeFor(service.title))}
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{service.icon}</div>
            <h3 className="text-xl font-bold text-primary mb-3">{service.title}</h3>
            <p className="text-content-muted mb-4">{service.description}</p>
            <ul className="space-y-2 mb-6">
              {service.features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-sm text-content-muted">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="border-t border-line pt-4 flex justify-between items-center">
              <span className="text-primary font-semibold">{service.price}</span>
              <span className="text-brand font-medium text-sm">Book Now →</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

ServicesGrid.propTypes = {
  onSelectService: PropTypes.func.isRequired,
};

export default ServicesGrid;
