import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../components/Icon';

/**
 * The coverage map placeholder under the contact details. Moved out of
 * `Contact.jsx` (Task 26) unchanged — still a placeholder, still labelled as
 * one rather than pretending to be a live map.
 */
const ContactMap = () => (
<motion.div 
  className="mt-8 rounded-xl overflow-hidden"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.3 }}
>
  <h3 className="font-semibold text-content mb-4">Areas We Serve Across Kenya</h3>
  <div className="bg-surface-raised p-4 rounded-lg shadow-md">
    <div className="aspect-w-16 aspect-h-9 bg-surface-sunken rounded-lg flex items-center justify-center">
      <div className="text-center text-content-subtle">
        <Icon name="map" size={36} className="mx-auto mb-2 text-primary" />
        <p className="text-sm">Interactive Kenya Map</p>
        <p className="text-xs text-content-subtle">Showing our coverage areas nationwide</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
      <div className="flex items-center">
        <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
        <span>Nairobi Region</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-brand rounded-full mr-2"></div>
        <span>Coast Region</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-success-content rounded-full mr-2"></div>
        <span>Rift Valley</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-warning-content rounded-full mr-2"></div>
        <span>Central Region</span>
      </div>
    </div>
  </div>
</motion.div>
);

export default ContactMap;
