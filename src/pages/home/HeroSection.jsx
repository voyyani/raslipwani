import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * The home page's hero, with the responsive background it preloads and the
 * two calls to action under it. Moved out of `Home.jsx` (Task 26).
 */
const HeroSection = ({ heroLoaded, onHeroLoad, onExplore }) => (
<section className="relative bg-cover bg-center min-h-screen flex items-center">
  {/* Background overlay with gradient */}
  <div className="absolute inset-0 bg-gradient-to-b from-surface-inverse/40 to-surface-inverse/70 z-0"></div>
  
  {/* Optimized responsive background */}
  <picture className="absolute inset-0 z-[-1] pointer-events-none">
    <source 
      srcSet="https://res.cloudinary.com/dzqdxosk2/image/upload/f_auto,q_auto,w_800/v1718900000/kenya-property-hero_sm_omfqo1.jpg" 
      media="(max-width: 640px)"
    />
    <source 
      srcSet="https://res.cloudinary.com/dzqdxosk2/image/upload/f_auto,q_auto,w_1200/v1718900000/kenya-property-hero_md_omfqo1.jpg" 
      media="(max-width: 1024px)"
    />
    <img 
      src="https://res.cloudinary.com/dzqdxosk2/image/upload/f_auto,q_auto,w_1920/v1718900000/kenya-property-hero_lg_omfqo1.jpg" 
      alt="Luxury property with city view in Nairobi, Kenya"
      className="w-full h-full object-cover"
      loading="eager"
      fetchpriority="high"
      width="1920"
      height="1080"
      onLoad={onHeroLoad}
    />
  </picture>
  
  {/* Loading overlay */}
  {!heroLoaded && (
    <div className="absolute inset-0 bg-surface-sunken animate-pulse z-10"></div>
  )}
  
  <div className="container mx-auto px-4 relative z-10">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-2xl text-content-on-brand"
    >
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
        Your Trusted Real Estate Partner in Kenya
      </h1>
      <p className="text-xl mb-8 max-w-xl">
        Buy, sell or invest in houses, land &amp; apartments across Nairobi, Mombasa, Kilifi, Diani and beyond. Expert guidance from listing to keys.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to="/properties" 
          className="bg-primary hover:bg-primary-dark text-content-on-brand font-bold py-3 px-6 rounded-md transition-colors duration-300 text-center shadow-lg hover:shadow-xl"
        >
          Browse Properties
        </Link>
        <button 
          onClick={onExplore}
          className="bg-content-on-brand/10 backdrop-blur-sm hover:bg-content-on-brand/20 text-content-on-brand font-bold py-3 px-6 rounded-md transition-all duration-300 border border-content-on-brand/30"
        >
          Our Services
        </button>
      </div>
    </motion.div>
  </div>
  
  {/* Scroll indicator removed to eliminate hovering circle */}
</section>
);

HeroSection.propTypes = {
  heroLoaded: PropTypes.bool.isRequired,
  onHeroLoad: PropTypes.func.isRequired,
  onExplore: PropTypes.func.isRequired,
};

export default HeroSection;
