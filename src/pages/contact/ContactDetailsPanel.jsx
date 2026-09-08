import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../../hooks/useSettings';
import Icon from '../../components/Icon';
import ContactMap from './ContactMap';

/**
 * The column beside the enquiry form: how to reach the office, and where it
 * works. Moved out of `Contact.jsx` (Task 26); it reads the same settings the
 * page used to thread through it.
 */
const ContactDetailsPanel = () => {
  const { phone, email, address } = useSettings();

  return (
<div className="bg-gradient-to-br from-brand-subtle to-surface p-6 md:p-10">
  <h2 className="text-2xl font-bold text-primary mb-6">Kenya-Wide Real Estate Services</h2>
  
  <div className="space-y-6">
    <motion.div 
      className="flex bg-surface-raised p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
      whileHover={{ x: 5 }}
    >
      <div className="bg-primary p-3 rounded-full text-content-on-brand mr-4 flex-shrink-0">
        <Icon name="map" size={20} />
      </div>
      <div>
        <h3 className="font-semibold text-content mb-1">Nationwide Coverage</h3>
        <p className="text-content-muted">
          Properties across all major cities and regions in Kenya
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="bg-brand-subtle text-brand-content px-2 py-1 rounded text-xs">Nairobi</span>
          <span className="bg-brand-subtle text-brand-content px-2 py-1 rounded text-xs">Coast</span>
          <span className="bg-brand-subtle text-brand-content px-2 py-1 rounded text-xs">Rift Valley</span>
          <span className="bg-brand-subtle text-brand-content px-2 py-1 rounded text-xs">Central</span>
        </div>
      </div>
    </motion.div>
    
    <motion.div 
      className="flex bg-surface-raised p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
      whileHover={{ x: 5 }}
    >
      <div className="bg-primary p-3 rounded-full text-content-on-brand mr-4 flex-shrink-0">
        <Icon name="map-marker-alt" size={20} />
      </div>
      <div>
        <h3 className="font-semibold text-content mb-1">Head Office Location</h3>
        <p className="text-content-muted">
          {address()}<br />
          <span className="text-sm text-content-subtle">Serving clients nationwide</span>
        </p>
      </div>
    </motion.div>
    
    <motion.div 
      className="flex bg-surface-raised p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
      whileHover={{ x: 5 }}
    >
      <div className="bg-primary p-3 rounded-full text-content-on-brand mr-4 flex-shrink-0">
        <Icon name="phone" size={20} />
      </div>
      <div>
        <h3 className="font-semibold text-content mb-1">Phone Number</h3>
        <p className="text-content-muted">
          {phone()}
        </p>
      </div>
    </motion.div>
    
    <motion.div 
      className="flex bg-surface-raised p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
      whileHover={{ x: 5 }}
    >
      <div className="bg-primary p-3 rounded-full text-content-on-brand mr-4 flex-shrink-0">
        <Icon name="envelope" size={20} />
      </div>
      <div>
        <h3 className="font-semibold text-content mb-1">Email Address</h3>
        <p className="text-content-muted">
          {email()}
        </p>
      </div>
    </motion.div>
    
    <motion.div 
      className="flex bg-surface-raised p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
      whileHover={{ x: 5 }}
    >
      <div className="bg-primary p-3 rounded-full text-content-on-brand mr-4 flex-shrink-0">
        <Icon name="clock" size={20} />
      </div>
      <div>
        <h3 className="font-semibold text-content mb-1">Working Hours</h3>
        <p className="text-content-muted">
          Monday - Friday: 8:00 AM - 6:00 PM<br />
          Saturday: 9:00 AM - 4:00 PM<br />
          Sunday: Closed
        </p>
      </div>
    </motion.div>

      <ContactMap />
    </div>
  </div>
  );
};

export default ContactDetailsPanel;
