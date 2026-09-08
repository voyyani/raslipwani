import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../components/Icon';

/**
 * The sidebar beside a listing: how to arrange a viewing, the property's
 * status, and the share row. Moved out of `PropertyDetail.jsx` (Task 25)
 * unchanged.
 */
const PropertyEnquiryPanel = ({ property }) => (
  <div className="bg-surface-raised p-6 rounded-xl shadow-md h-fit border border-line">
    <h2 className="text-2xl font-semibold mb-4">Schedule a Viewing</h2>
    <p className="mb-4 text-content-muted">Interested in this coastal property? Contact us to arrange a private viewing.</p>
    
    <div className="bg-brand-subtle rounded-lg p-4 mb-6">
      <div className="flex items-center mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-content mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <span className="font-medium">Call Us</span>
      </div>
      <p className="text-content">+254 758 066 526</p>
    </div>
    
    <button className="w-full bg-primary text-content-on-brand py-3 rounded-lg hover:bg-primary-dark transition-colors mb-4 font-medium">
      Book Viewing
    </button>
    <button className="w-full border border-primary text-primary py-3 rounded-lg hover:bg-brand-subtle transition-colors font-medium">
      Contact Agent
    </button>
    
    <div className="mt-6 pt-6 border-t border-line">
      <h3 className="font-semibold mb-3">Property Status</h3>
      <div className="flex items-center">
        <div className={`h-3 w-3 rounded-full mr-2 ${
          property.status === 'available' ? 'bg-success-content' : 
          property.status === 'pending' ? 'bg-warning-content' : 
          'bg-content-subtle'
        }`}></div>
        <span className="capitalize">
          {property.status === 'available' ? 'Available' : 
           property.status === 'pending' ? 'Pending Sale' : 
           'Sold'}
        </span>
      </div>
    </div>
    
    <div className="mt-6 pt-6 border-t border-line">
      <h3 className="font-semibold mb-3">Share This Property</h3>
      <div className="flex space-x-4">
        <button className="text-content-muted hover:text-brand-content">
          <Icon name="facebook" size={20} />
        </button>
        <button className="text-content-muted hover:text-brand-content">
          <Icon name="twitter" size={20} />
        </button>
        <button className="text-content-muted hover:text-danger-content">
          <Icon name="pinterest" size={20} />
        </button>
        <button className="text-content-muted hover:text-brand-content">
          <Icon name="linkedin" size={20} />
        </button>
      </div>
    </div>
  </div>
);

PropertyEnquiryPanel.propTypes = {
  property: PropTypes.object.isRequired,
};

export default PropertyEnquiryPanel;
