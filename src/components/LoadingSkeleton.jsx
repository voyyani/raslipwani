import React from 'react';

/**
 * Reusable loading skeleton component
 */
export const LoadingSkeleton = ({ rows = 3, type = 'table' }) => {
  if (type === 'table') {
    return (
      <div className="animate-pulse">
        {/* Table header */}
        <div className="bg-gray-200 h-12 rounded-t-lg mb-2"></div>
        
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="bg-gray-100 h-20 rounded-lg mb-2"></div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="bg-gray-100 rounded-lg h-64"></div>
        ))}
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-gray-100 rounded-lg h-24"></div>
        ))}
      </div>
    );
  }

  // Default: simple lines
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="bg-gray-200 h-4 rounded"></div>
      ))}
    </div>
  );
};

/**
 * Property card skeleton
 */
export const PropertyCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
    <div className="bg-gray-200 h-48"></div>
    <div className="p-4 space-y-3">
      <div className="bg-gray-200 h-6 rounded w-3/4"></div>
      <div className="bg-gray-200 h-4 rounded w-1/2"></div>
      <div className="bg-gray-200 h-4 rounded w-full"></div>
      <div className="flex justify-between mt-4">
        <div className="bg-gray-200 h-4 rounded w-1/4"></div>
        <div className="bg-gray-200 h-4 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

/**
 * Dashboard stats skeleton
 */
export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-pulse">
    {Array.from({ length: 7 }).map((_, index) => (
      <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start">
          <div className="bg-gray-200 p-3 rounded-lg w-12 h-12 mr-4"></div>
          <div className="flex-1 space-y-2">
            <div className="bg-gray-200 h-4 rounded w-2/3"></div>
            <div className="bg-gray-200 h-8 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
