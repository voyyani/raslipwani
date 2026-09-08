import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Icon from '../../components/Icon';

/**
 * The properties page's hero: the headline, the search field, and the quick
 * chips that fill it in. Moved out of `Properties.jsx` (Task 25) unchanged.
 */
const PropertySearchHero = ({ search, onSearchChange, onToggleFilters }) => (
<section className="relative bg-gradient-to-br from-surface-inverse via-brand-hover to-primary pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
  {/* Background Pattern */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute inset-0" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    }}></div>
  </div>
  
  {/* Animated Background Elements */}
  <div className="absolute top-20 left-10 w-24 h-24 bg-content-on-brand/5 rounded-full blur-xl"></div>
  <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
  
  <div className="container mx-auto px-4 relative z-10">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-12"
    >
      <motion.h1 
        className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-surface-raised to-surface-sunken bg-clip-text text-transparent leading-tight"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Discover Your <span className="text-primary">Dream Property</span>
      </motion.h1>
      
      <motion.p 
        className="text-xl text-content-inverse max-w-3xl mx-auto mb-8 font-light leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Premium real estate portfolio across Kenya's most desirable locations. 
        Find your perfect home, investment, or commercial space.
      </motion.p>
    </motion.div>
    
    {/* Enhanced Search Bar */}
    <motion.div 
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <div className="bg-surface-raised rounded-2xl shadow-2xl p-2 border border-line">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Icon name="map-marker-alt" size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-content-subtle" />
            <input
              type="text"
              placeholder="Search by location, property type, or keyword..."
              className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 focus:outline-none text-content placeholder-content-subtle"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={onToggleFilters}
              className="flex items-center gap-2 bg-surface-sunken hover:bg-surface-sunken text-content px-6 py-4 rounded-xl transition-colors font-medium"
            >
              <Icon name="filter" size={18} />
              <span className="hidden sm:inline">Filters</span>
            </button>
            
            <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-content-on-brand px-8 py-4 rounded-xl transition-colors font-medium shadow-lg hover:shadow-xl">
              <Icon name="search" size={18} />
              <span>Search</span>
            </button>
          </div>
        </div>
        
        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2 mt-4 px-2 pb-2">
          {[
            { label: 'Nairobi', value: 'nairobi' },
            { label: 'Mombasa', value: 'mombasa' },
            { label: 'Kilifi', value: 'kilifi' },
            { label: 'Diani', value: 'diani' },
            { label: 'Apartments', value: 'apartment' },
            { label: 'Lands', value: 'land' }
          ].map((chip, index) => (
            <button
              key={index}
              onClick={() => onSearchChange(chip.value)}
              className="bg-surface hover:bg-primary hover:text-content-on-brand text-content px-3 py-1.5 rounded-full text-sm transition-all duration-300 border border-line hover:border-primary"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  </div>
</section>
);

PropertySearchHero.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onToggleFilters: PropTypes.func.isRequired,
};

export default PropertySearchHero;
