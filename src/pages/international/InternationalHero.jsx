import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Globe, TrendingUp, Shield, Star, ChevronRight } from 'lucide-react';
import { currencies } from './internationalContent';

/**
 * The page's hero and the floating navigation pills under it, including the
 * currency selector every price on the page reads from. Moved out of
 * `International.jsx` (Task 25); the pills now name the section they scroll to
 * and let the page hold the refs, rather than each carrying one.
 */
const InternationalHero = ({
  activeSection, selectedCurrency, onCurrencyChange, onNavigate, onOpenCalculator,
}) => (
  <section className="relative bg-gradient-to-br from-brand-hover via-indigo-900 to-purple-900 text-content-on-brand py-24 overflow-hidden">
    <div className="absolute inset-0 opacity-20">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEyYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] animate-pulse"></div>
    </div>
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 bg-content-on-brand/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-content-on-brand/20">
          <Globe className="w-5 h-5" />
          <span className="text-sm font-medium">International Property Services</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Your Gateway to<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500">
            Nairobi Real Estate
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-content-on-brand/90 mb-8 max-w-4xl mx-auto">
          Whether you're in the diaspora, relocating for work, or seeking investment opportunities - 
          we make Nairobi real estate accessible from anywhere in the world.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button 
            onClick={() => onNavigate('properties')}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-content px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Explore Properties
          </button>
          <button 
            onClick={onOpenCalculator}
            className="bg-content-on-brand/10 hover:bg-content-on-brand/20 backdrop-blur-sm border-2 border-content-on-brand/30 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
          >
            Investment Calculator
          </button>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="text-sm text-content-on-brand/80">View prices in:</span>
          {currencies.map(curr => (
            <button
              key={curr.code}
              onClick={() => onCurrencyChange(curr.code)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCurrency === curr.code
                  ? 'bg-surface-raised text-brand-content'
                  : 'bg-content-on-brand/10 hover:bg-content-on-brand/20 text-content-on-brand'
              }`}
            >
              {curr.code}
            </button>
          ))}
        </div>
      </motion.div>
    </div>

    {/* Floating Navigation Pills */}
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden lg:flex gap-2 bg-content-on-brand/10 backdrop-blur-md rounded-full p-2 border border-content-on-brand/20">
      {[
        { label: 'Overview', section: 'overview' },
        { label: 'Investment', section: 'invest' },
        { label: 'For Diaspora', section: 'diaspora' },
        { label: 'Services', section: 'services' },
        { label: 'Properties', section: 'properties' }
      ].map(item => (
        <button
          key={item.section}
          onClick={() => onNavigate(item.section)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            activeSection === item.section
              ? 'bg-surface-raised text-brand-content'
              : 'text-content-on-brand hover:bg-content-on-brand/10'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  </section>
);

InternationalHero.propTypes = {
  activeSection: PropTypes.string.isRequired,
  selectedCurrency: PropTypes.string.isRequired,
  onCurrencyChange: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onOpenCalculator: PropTypes.func.isRequired,
};

export default InternationalHero;
