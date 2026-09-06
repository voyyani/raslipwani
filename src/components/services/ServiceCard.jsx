import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

import Icon from '../Icon';
const ServiceCard = ({ service, onBook, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-surface-raised rounded-2xl shadow-xl overflow-hidden border border-line transition-all hover:shadow-2xl"
  >
    <div className="p-8">
      <div className="flex items-start mb-6">
        <div className={`bg-gradient-to-r ${service.color} p-4 rounded-xl mr-5 text-content-on-media`}>
          <Icon name={service.icon} size={30} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-content mb-2">{service.title}</h3>
          <p className="text-content-muted">{service.description}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="font-semibold text-content-muted mb-3">Key Features:</h4>
        <ul className="space-y-2">
          {service.features.map((feature, idx) => (
            <motion.li 
              key={idx} 
              className="flex items-start"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <Icon name="check-circle" className="text-success-content mt-1 mr-2" />
              <span>{feature}</span>
            </motion.li>
          ))}
        </ul>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-line">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onBook(service.title)}
          className="w-full bg-gradient-to-r from-primary to-secondary text-content-on-media py-3 px-5 rounded-xl transition-all shadow-md hover:shadow-lg"
        >
          Book Service
        </motion.button>
      </div>
    </div>
  </motion.div>
);

ServiceCard.propTypes = {
  service: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    features: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  onBook: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired
};

export default ServiceCard;
