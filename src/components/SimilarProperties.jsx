import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiArrowRight, FiHome } from 'react-icons/fi';
import { supabase } from '../utils/supabaseClient';
import OptimizedImage from './OptimizedImage';

/**
 * SimilarProperties Component
 * Fetches and displays properties similar to the current one
 * Based on: property type, location, price range
 */
const SimilarProperties = ({ 
  currentProperty,
  maxDisplay = 4,
  title = "Similar Properties",
  showViewAll = true
}) => {
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarProperties = async () => {
      if (!currentProperty) return;

      try {
        setLoading(true);
        
        // Calculate price range (±30% of current price)
        const priceMin = currentProperty.price * 0.7;
        const priceMax = currentProperty.price * 1.3;

        // First, try to find properties with same type and location
        let { data: similar, error } = await supabase
          .from('properties')
          .select('*')
          .neq('id', currentProperty.id)
          .eq('property_type', currentProperty.property_type)
          .eq('purpose', currentProperty.purpose)
          .gte('price', priceMin)
          .lte('price', priceMax)
          .limit(maxDisplay);

        if (error) throw error;

        // If not enough results, broaden search to same type only
        if (!similar || similar.length < maxDisplay) {
          const existingIds = similar?.map(p => p.id) || [];
          
          const { data: moreSimilar, error: moreError } = await supabase
            .from('properties')
            .select('*')
            .neq('id', currentProperty.id)
            .not('id', 'in', `(${existingIds.join(',') || 0})`)
            .eq('property_type', currentProperty.property_type)
            .limit(maxDisplay - (similar?.length || 0));

          if (!moreError && moreSimilar) {
            similar = [...(similar || []), ...moreSimilar];
          }
        }

        // If still not enough, get any properties with same purpose
        if (!similar || similar.length < maxDisplay) {
          const existingIds = similar?.map(p => p.id) || [];
          
          const { data: fallback, error: fallbackError } = await supabase
            .from('properties')
            .select('*')
            .neq('id', currentProperty.id)
            .not('id', 'in', `(${existingIds.join(',') || 0})`)
            .eq('purpose', currentProperty.purpose)
            .limit(maxDisplay - (similar?.length || 0));

          if (!fallbackError && fallback) {
            similar = [...(similar || []), ...fallback];
          }
        }

        setSimilarProperties(similar || []);
      } catch (err) {
        console.error('Error fetching similar properties:', err);
        setSimilarProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProperties();
  }, [currentProperty, maxDisplay]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
      notation: price >= 1000000 ? 'compact' : 'standard'
    }).format(price);
  };

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <FiHome className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(maxDisplay)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!similarProperties.length) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <FiHome className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-500">
                Properties similar to {currentProperty?.title}
              </p>
            </div>
          </div>

          {showViewAll && (
            <Link
              to={`/properties?type=${currentProperty?.property_type}&purpose=${currentProperty?.purpose}`}
              className="hidden sm:flex items-center gap-2 text-primary hover:text-primary-dark transition-colors font-medium"
            >
              View All
              <FiArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {similarProperties.slice(0, maxDisplay).map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/properties/${property.slug || property.id}`}
                className="group block"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-primary/30">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <OptimizedImage
                      src={property.images?.[0]}
                      alt={property.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      containerClassName="w-full h-full"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {property.featured && (
                        <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                      <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
                        {property.purpose === 'sale' ? '💰 For Sale' : '📅 For Rent'}
                      </span>
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors mb-1">
                      {property.title}
                    </h3>
                    
                    <p className="text-sm text-gray-500 flex items-center mb-3">
                      <FiMapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                      <span className="line-clamp-1">{property.location}</span>
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      {property.bedrooms && (
                        <span className="flex items-center gap-1">
                          🛏️ {property.bedrooms} beds
                        </span>
                      )}
                      {property.bathrooms && (
                        <span className="flex items-center gap-1">
                          🚿 {property.bathrooms} baths
                        </span>
                      )}
                      {property.area_sqft && (
                        <span className="flex items-center gap-1">
                          📐 {property.area_sqft} sqft
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="font-bold text-primary">
                        {formatPrice(property.price)}
                        {property.purpose === 'rent' && (
                          <span className="text-xs font-normal text-gray-500">/mo</span>
                        )}
                      </span>
                      
                      <span className="text-xs text-gray-400 capitalize">
                        {property.property_type}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All */}
        {showViewAll && (
          <div className="sm:hidden text-center mt-6">
            <Link
              to={`/properties?type=${currentProperty?.property_type}&purpose=${currentProperty?.purpose}`}
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors font-medium"
            >
              View All Similar Properties
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default SimilarProperties;
