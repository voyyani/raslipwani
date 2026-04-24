import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiX, FiClock, FiTrash2 } from 'react-icons/fi';
import OptimizedImage from './OptimizedImage';

/**
 * RecentlyViewed Component
 * Displays a horizontal scrollable list of recently viewed properties
 */
const RecentlyViewed = ({ 
  properties = [], 
  onClear,
  onRemove,
  title = "Recently Viewed",
  maxDisplay = 6 
}) => {
  if (!properties.length) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
      notation: price >= 1000000 ? 'compact' : 'standard'
    }).format(price);
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return 'Over a week ago';
  };

  const displayProperties = properties.slice(0, maxDisplay);

  return (
    <motion.section 
      className="py-8 bg-white border-t border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <FiClock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-500">{properties.length} properties</p>
            </div>
          </div>
          
          {onClear && (
            <button
              onClick={onClear}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              <FiTrash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}
        </div>

        {/* Horizontal scrollable container */}
        <div className="relative">
          <div 
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {displayProperties.map((property, index) => (
              <motion.div
                key={property.id}
                className="flex-shrink-0 w-72 snap-start"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link 
                  to={`/properties/${property.slug || property.id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group-hover:border-primary/30">
                    {/* Image */}
                    <div className="relative h-36 overflow-hidden">
                      <OptimizedImage
                        src={property.images?.[0]}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        containerClassName="w-full h-full"
                      />
                      
                      {/* Remove button */}
                      {onRemove && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onRemove(property.id);
                          }}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                          title="Remove from history"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      )}

                      {/* Time ago badge */}
                      {property.viewedAt && (
                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                          {getTimeAgo(property.viewedAt)}
                        </div>
                      )}

                      {/* Purpose badge */}
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                        {property.purpose === 'sale' ? '💰 Sale' : '📅 Rent'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors text-sm">
                        {property.title}
                      </h3>
                      
                      <p className="text-xs text-gray-500 flex items-center mt-1 mb-2">
                        <FiMapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{property.location}</span>
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary text-sm">
                          {formatPrice(property.price)}
                        </span>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {property.bedrooms && (
                            <span>🛏️ {property.bedrooms}</span>
                          )}
                          {property.bathrooms && (
                            <span>🚿 {property.bathrooms}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Scroll fade indicators */}
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>

        {/* View all link */}
        {properties.length > maxDisplay && (
          <div className="text-center mt-4">
            <span className="text-sm text-gray-500">
              + {properties.length - maxDisplay} more viewed
            </span>
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default RecentlyViewed;
