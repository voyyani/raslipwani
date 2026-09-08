import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Icon from '../Icon';
import { viewingExperiences } from './serviceCatalog';

/**
 * The three viewing formats, as selectable cards. Moved out of
 * `ViewingExperience.jsx` (Task 24) unchanged.
 */
const ViewingOptionsSection = ({ value, onChange }) => (
  <section id="viewing-options" className="py-12">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-primary mb-4"
        >
          Choose Your Viewing Experience
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-content-muted max-w-3xl mx-auto"
        >
          Select the viewing option that best suits your needs and schedule
        </motion.p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {viewingExperiences.map((option, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`text-left bg-surface-raised rounded-2xl shadow-lg overflow-hidden border-2 ${
              value === option.type 
                ? 'border-primary ring-2 ring-primary/30' 
                : 'border-transparent'
            } transition-all hover:shadow-md focus:outline-none`}
            onClick={() => onChange(option.type)}
          >
            <div className={`p-6 ${value === option.type ? 'bg-primary/5' : ''}`}>
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-xl mr-3 ${
                  value === option.type 
                    ? 'bg-primary text-content-on-brand' 
                    : 'bg-surface-sunken text-primary'
                }`}>
                  <Icon name={option.icon} size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{option.title}</h3>
                  <p className="text-content-muted text-sm">{option.description}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Duration:</span>
                  <span className="text-sm">{option.duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Price:</span>
                  <span className={`font-medium ${
                    option.price === "Free" ? 'text-success-content' : 'text-primary'
                  }`}>
                    {option.price}
                  </span>
                </div>
              </div>
              
              <ul className="space-y-2 mb-4 text-sm">
                {option.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Icon name="check-circle" size={12} className="text-success-content mt-0.5 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className={`w-full py-2.5 rounded-lg font-medium text-sm text-center ${
                value === option.type
                  ? 'bg-primary text-content-on-brand'
                  : 'bg-surface-sunken text-content-muted'
              }`}>
                {value === option.type ? 'Selected' : 'Select Option'}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  </section>
);

ViewingOptionsSection.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ViewingOptionsSection;
