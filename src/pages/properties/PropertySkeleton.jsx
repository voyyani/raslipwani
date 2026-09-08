import React from 'react';

/**
 * The placeholder card shown while the listings load. Moved out of
 * `Properties.jsx` (Task 25).
 */
const PropertySkeleton = () => (
  <div className="bg-surface-raised rounded-2xl overflow-hidden shadow-lg animate-pulse border border-line">
    <div className="pb-[70%] relative bg-gradient-to-br from-surface-sunken to-surface-sunken"></div>
    <div className="p-5">
      <div className="flex justify-between mb-3">
        <div className="h-5 bg-surface-sunken rounded w-3/5"></div>
        <div className="h-5 bg-surface-sunken rounded w-1/4"></div>
      </div>
      <div className="h-4 bg-surface-sunken rounded w-4/5 mb-4"></div>
      <div className="flex justify-between mb-4">
        <div className="h-3 bg-surface-sunken rounded w-16"></div>
        <div className="h-3 bg-surface-sunken rounded w-16"></div>
        <div className="h-3 bg-surface-sunken rounded w-16"></div>
      </div>
      <div className="h-8 bg-surface-sunken rounded"></div>
    </div>
  </div>
);

export default PropertySkeleton;
