import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const ServiceCard = ({ service, onBook, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all hover:shadow-2xl"
  >
    <div className="p-8">
      <div className="flex items-start mb-6">
        <div className={`bg-gradient-to-r ${service.color} p-4 rounded-xl mr-5 text-white`}>
          <i className={`${service.icon} text-3xl`}></i>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{service.title}</h3>
          <p className="text-gray-600">{service.description}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Key Features:</h4>
        <ul className="space-y-2">
          {service.features.map((feature, idx) => (
            <motion.li 
              key={idx} 
              className="flex items-start"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
              <span>{feature}</span>
            </motion.li>
          ))}
        </ul>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onBook(service.title)}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 px-5 rounded-xl transition-all shadow-md hover:shadow-lg"
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
