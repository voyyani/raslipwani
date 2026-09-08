import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Step one of the service booking wizard: which of the four services the
 * visitor wants. Moved out of `ServicesMain.jsx` (Task 24) unchanged.
 */
const ServiceSelectionStep = ({ serviceTypes, value, onChange, onNext }) => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <fieldset className="border-0 p-0 m-0">
        <legend className="block text-content-muted mb-4 font-medium text-lg">What service do you need?</legend>
        <div className="grid gap-4">
          {serviceTypes.map(service => (
            <label 
              key={service.value} 
              htmlFor={`svc-service-${service.value}`}
              className={`flex items-start p-6 border-2 rounded-xl cursor-pointer transition-all ${
                value === service.value 
                  ? 'border-primary bg-brand-subtle shadow-md' 
                  : 'border-line hover:border-primary hover:shadow-sm'
              }`}
            >
              <input
                id={`svc-service-${service.value}`}
                type="radio"
                name="serviceType"
                value={service.value}
                checked={value === service.value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 mr-4 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-content text-lg">{service.label}</h4>
                <p className="text-content-muted mt-1">{service.description}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="bg-primary text-content-on-brand px-8 py-3 rounded-lg font-medium hover:bg-brand-hover transition-colors shadow-lg"
        >
          Continue
        </button>
      </div>
    </motion.div>
);

ServiceSelectionStep.propTypes = {
  serviceTypes: PropTypes.array.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};

export default ServiceSelectionStep;
