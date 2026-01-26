import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBed, 
  FaBath, 
  FaRuler, 
  FaEdit, 
  FaTrash, 
  FaStar,
  FaEye,
  FaMapMarkerAlt,
  FaHome,
  FaBuilding,
  FaLandmark,
  FaEllipsisV
} from 'react-icons/fa';

/**
 * MobilePropertyCard - Touch-optimized property card for mobile admin
 * Features: Image gallery swipe, quick actions menu, status indicators
 */
const MobilePropertyCard = ({ 
  property, 
  onEdit, 
  onDelete, 
  onView,
  onToggleFeatured 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Property type icons
  const typeIcons = {
    residential: FaHome,
    apartment: FaBuilding,
    land: FaLandmark,
    villa: FaHome,
    commercial: FaBuilding,
    office: FaBuilding
  };

  const TypeIcon = typeIcons[property.property_type] || FaHome;

  // Status colors
  const statusColors = {
    available: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    sold: 'bg-red-100 text-red-800 border-red-200',
    rented: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  // Format price
  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price}`;
  };

  // Haptic feedback
  const haptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleImageSwipe = (direction) => {
    if (!property.images?.length) return;
    
    if (direction === 'left' && currentImageIndex < property.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else if (direction === 'right' && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-3 relative">
      {/* Image Section */}
      <div className="relative h-44 bg-gray-100">
        {property.images?.length > 0 ? (
          <motion.div
            className="absolute inset-0"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.x < -50) handleImageSwipe('left');
              else if (info.offset.x > 50) handleImageSwipe('right');
            }}
          >
            <img
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <TypeIcon className="text-4xl" />
          </div>
        )}

        {/* Image Indicators */}
        {property.images?.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {property.images.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentImageIndex ? 'bg-white w-3' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Featured Badge */}
        {property.featured && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
            <FaStar className="text-[10px]" />
            Featured
          </div>
        )}

        {/* Status Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium border ${statusColors[property.status] || statusColors.available}`}>
          {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
        </div>

        {/* Price Overlay */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1.5 rounded-lg">
          <span className="text-lg font-bold">{formatPrice(property.price)}</span>
          {property.purpose === 'rent' && <span className="text-xs opacity-80">/mo</span>}
        </div>

        {/* Action Menu Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            haptic();
            setShowActions(!showActions);
          }}
          className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
        >
          <FaEllipsisV className="text-gray-600 text-sm" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-3" onClick={() => onView()}>
        {/* Title & Type */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-base">
              {property.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-0.5">
              <TypeIcon className="text-xs" />
              <span className="capitalize">{property.property_type}</span>
              <span className="text-gray-300">•</span>
              <span className="capitalize">{property.purpose}</span>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-gray-600 mb-3">
          <FaMapMarkerAlt className="text-xs text-gray-400" />
          <span className="text-sm truncate">{property.location}</span>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <FaBed className="text-gray-400" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <FaBath className="text-gray-400" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.area_sqft && (
            <div className="flex items-center gap-1">
              <FaRuler className="text-gray-400" />
              <span>{property.area_sqft.toLocaleString()} sqft</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Menu Dropdown */}
      <AnimatePresence>
        {showActions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowActions(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute right-3 top-36 z-50 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden min-w-[160px]"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  haptic();
                  setShowActions(false);
                  onView();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 active:bg-gray-100"
              >
                <FaEye className="text-blue-500" />
                <span className="text-sm font-medium">View Details</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  haptic();
                  setShowActions(false);
                  onEdit();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 active:bg-gray-100"
              >
                <FaEdit className="text-green-500" />
                <span className="text-sm font-medium">Edit Property</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  haptic();
                  setShowActions(false);
                  onToggleFeatured();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 active:bg-gray-100"
              >
                <FaStar className={property.featured ? 'text-yellow-500' : 'text-gray-400'} />
                <span className="text-sm font-medium">
                  {property.featured ? 'Remove Featured' : 'Make Featured'}
                </span>
              </button>
              
              <div className="border-t border-gray-100" />
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  haptic();
                  setShowActions(false);
                  onDelete();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 active:bg-red-100"
              >
                <FaTrash />
                <span className="text-sm font-medium">Delete</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobilePropertyCard;
