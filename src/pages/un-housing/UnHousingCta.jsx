import React from 'react';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';

/**
 * The closing call to action. Moved out of `UNHousing.jsx` (Task 27)
 * unchanged.
 */
const UnHousingCta = () => (
  <section className="py-16 bg-gradient-to-r from-brand to-indigo-700 text-content-on-brand">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-4xl font-bold mb-6">
        Ready to Find Your Nairobi Home?
      </h2>
      <p className="text-xl mb-8 text-content-on-brand/90">
        Contact our UN housing specialists for personalized assistance
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Link
          to="/contact?type=un-housing"
          className="bg-surface-raised text-brand-content hover:bg-surface-sunken px-8 py-4 rounded-lg font-semibold text-lg transition-all inline-flex items-center justify-center gap-2"
        >
          <Phone className="w-5 h-5" />
          Contact UN Housing Team
        </Link>
        <a
          href="#properties"
          className="bg-brand-hover hover:bg-brand-hover px-8 py-4 rounded-lg font-semibold text-lg transition-all"
        >
          View Properties
        </a>
      </div>

      <div className="text-sm text-content-on-brand/90">
        <p>24/7 Support for UN Staff • Fast-Track Processing • Diplomatic Services</p>
      </div>
    </div>
  </section>
);

export default UnHousingCta;
