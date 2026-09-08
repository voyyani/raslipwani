import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * The wizard's options step — step three for a viewing, step two otherwise. A
 * viewing picks between an in-person and a virtual tour; every other service
 * gets a short description of what happens next instead. Moved out of
 * `ServicesMain.jsx` (Task 24) unchanged.
 */
const ServiceOptionsStep = ({ serviceType, serviceTypes, viewingTypes, viewingType, onViewingTypeChange, onBack, onNext }) => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {serviceType === 'viewing' ? (
        <fieldset className="border-0 p-0 m-0">
          <legend className="block text-content-muted mb-4 font-medium text-lg">Viewing Type</legend>
          <div className="grid gap-4">
            {viewingTypes.map(option => (
              <label 
                key={option.type} 
                htmlFor={`svc-viewing-${option.type}`}
                className={`flex items-start p-6 border-2 rounded-xl cursor-pointer transition-all ${
                  viewingType === option.type 
                    ? 'border-primary bg-brand-subtle' 
                    : 'border-line hover:border-primary'
                }`}
              >
                <input
                  id={`svc-viewing-${option.type}`}
                  type="radio"
                  name="viewingType"
                  value={option.type}
                  checked={viewingType === option.type}
                  onChange={(e) => onViewingTypeChange(e.target.value)}
                  className="mt-1 mr-4 text-primary"
                />
                <div className="flex items-center">
                  <span className="text-3xl mr-4">{option.icon}</span>
                  <div>
                    <h4 className="font-semibold text-content text-lg">{option.title}</h4>
                    <p className="text-content-muted">{option.description}</p>
                    <p className="text-sm text-primary font-medium mt-1">{option.duration}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <div>
          <h3 className="block text-content-muted mb-4 font-medium text-lg">Service Details</h3>
          <div className="bg-brand-subtle border border-brand-subtle rounded-xl p-6">
            <h4 className="font-semibold text-primary text-lg mb-2">
              {serviceTypes.find(s => s.value === serviceType)?.label}
            </h4>
            <p className="text-content-muted">
              {serviceType === 'valuation' 
                ? 'We will contact you to discuss your valuation needs and schedule an assessment.'
                : serviceType === 'consultation'
                ? 'Our expert will prepare a personalized consultation based on your investment goals.'
                : 'We will discuss your property management requirements and create a tailored solution.'
              }
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-line-strong rounded-lg font-medium hover:bg-surface transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="bg-primary text-content-on-brand px-6 py-3 rounded-lg font-medium hover:bg-brand-hover transition-colors"
        >
          Continue
        </button>
      </div>
    </motion.div>
);

ServiceOptionsStep.propTypes = {
  serviceType: PropTypes.string.isRequired,
  serviceTypes: PropTypes.array.isRequired,
  viewingTypes: PropTypes.array.isRequired,
  viewingType: PropTypes.string.isRequired,
  onViewingTypeChange: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};

export default ServiceOptionsStep;
