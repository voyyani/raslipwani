import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

import Icon from '../Icon';
// NOTE: this component is not rendered by any route and its field list is
// still a placeholder. See ROADMAP.md Release 3 (dead-code sweep).
const ServiceForm = ({ 
  bookingData, 
  handleSubmit, 
  closeModal,
  isSubmitting
}) => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-2xl font-bold text-primary">Book Consultation</h3>
      <button 
        onClick={closeModal}
        className="text-gray-500 hover:text-primary transition-colors"
      >
        <Icon name="times" size={20} />
      </button>
    </div>
    
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields same as original */}
      <div>
        <label className="block text-gray-700 mb-2">Service</label>
        <input 
          type="text" 
          value={bookingData.service}
          readOnly
          className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50"
        />
      </div>
      
      {/* ... other fields ... */}
      
      <div className="pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Icon name="spinner" className="animate-spin mr-2" /> Submitting...
            </span>
          ) : "Confirm Booking"}
        </motion.button>
      </div>
    </form>
  </div>
);

ServiceForm.propTypes = {
  bookingData: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
};

export default ServiceForm;