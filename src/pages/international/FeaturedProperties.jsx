import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Home, MapPin } from 'lucide-react';
import { featuredProperties } from './internationalContent';

/**
 * The three showcased listings, priced in the visitor's chosen currency.
 * Moved out of `International.jsx` (Task 25) unchanged.
 */
const FeaturedProperties = React.forwardRef(({ formatCurrency }, ref) => (
  <section ref={ref} className="py-20 bg-gradient-to-b from-surface to-surface-raised">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-content mb-4">
          Featured International Properties
        </h2>
        <p className="text-xl text-content-muted max-w-3xl mx-auto">
          Prime locations ideal for international clients, expats, and investors
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {featuredProperties.map((property, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-surface-raised rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all border-2 border-line hover:border-line"
          >
            <div className="relative h-64">
              <img 
                src={property.image} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-brand text-content-on-brand px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  {property.type}
                </span>
              </div>
              {property.furnished && (
                <div className="absolute top-4 right-4">
                  <span className="bg-success-content text-content-on-brand px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Furnished
                  </span>
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-bold text-content mb-2">{property.title}</h3>
              <p className="text-content-muted mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {property.location}
              </p>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold bg-gradient-to-r from-brand to-purple-600 bg-clip-text text-transparent">
                  {formatCurrency(property.price)}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6 text-content-muted">
                <span className="flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  {property.bedrooms} bed
                </span>
              </div>

              <Link
                to={`/properties`}
                className="block w-full bg-gradient-to-r from-brand to-indigo-600 hover:from-brand-hover hover:to-indigo-700 text-content-on-brand text-center py-3 rounded-xl font-semibold transition-all"
              >
                View Details
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <Link
          to="/properties?filter=international"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-brand to-indigo-600 hover:from-brand-hover hover:to-indigo-700 text-content-on-brand px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
        >
          View All International Properties
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  </section>
));

FeaturedProperties.displayName = 'FeaturedProperties';

FeaturedProperties.propTypes = { formatCurrency: PropTypes.func.isRequired };

export default FeaturedProperties;
