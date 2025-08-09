import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const ViewingForm = ({ 
  bookingData, 
  handleInputChange, 
  handleSubmit, 
  closeModal,
  isSubmitting,
  viewingOptions,
  setBookingData
}) => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-2xl font-bold text-primary">Book a Viewing Experience</h3>
      <button 
        onClick={closeModal}
        className="text-gray-500 hover:text-primary transition-colors"
      >
        <i className="fas fa-times text-xl"></i>
      </button>
    </div>
    
    <div className="mb-8">
      <h4 className="text-lg font-semibold mb-4">Choose Viewing Type</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {viewingOptions.map((option, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5 }}
            className={`border rounded-xl p-5 cursor-pointer transition-all shadow-md hover:shadow-lg ${
              bookingData.viewingType === option.type 
                ? 'border-primary bg-blue-50' 
                : 'border-gray-200 hover:border-primary'
            }`}
            onClick={() => setBookingData(prev => ({ ...prev, viewingType: option.type }))}
          >
            <div className="flex justify-between items-start">
              <div className="bg-primary/10 p-3 rounded-lg mb-3">
                <i className={`${option.icon} text-xl text-primary`}></i>
              </div>
            </div>
            <h5 className="font-bold text-lg mb-2">{option.title}</h5>
            <p className="text-gray-600 mb-3">{option.description}</p>
            <div className="text-sm text-gray-500 flex items-center">
              <i className="far fa-clock mr-1"></i> {option.duration}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
    
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields same as original */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-2">Full Name *</label>
          <input 
            type="text" 
            name="name"
            value={bookingData.name}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        {/* ... other fields ... */}
      </div>
      
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
              <i className="fas fa-spinner fa-spin mr-2"></i> Processing...
            </span>
          ) : `Book ${viewingOptions.find(o => o.type === bookingData.viewingType)?.title}`}
        </motion.button>
      </div>
    </form>
  </div>
);

ViewingForm.propTypes = {
  bookingData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  viewingOptions: PropTypes.array.isRequired,
  setBookingData: PropTypes.func.isRequired
};

export default ViewingForm;
