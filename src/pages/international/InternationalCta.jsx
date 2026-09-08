import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Mail, Phone, TrendingUp } from 'lucide-react';

/**
 * The closing call to action: talk to us, or model the numbers first. Moved
 * out of `International.jsx` (Task 25) unchanged.
 */
const InternationalCta = ({ onOpenCalculator }) => (
  <section className="py-20 bg-gradient-to-r from-brand via-indigo-600 to-purple-700 text-content-on-brand">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-4xl md:text-5xl font-bold mb-6">
        Ready to Start Your Journey?
      </h2>
      <p className="text-xl mb-10 text-content-on-brand/90">
        Schedule a consultation with our international property specialists
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <Link
          to="/contact?type=international"
          className="bg-surface-raised text-brand-content hover:bg-surface-sunken px-8 py-4 rounded-xl font-semibold text-lg transition-all inline-flex items-center justify-center gap-2 shadow-xl"
        >
          <Phone className="w-5 h-5" />
          Schedule Consultation
        </Link>
        <button
          onClick={onOpenCalculator}
          className="bg-brand-hover hover:bg-brand-hover px-8 py-4 rounded-xl font-semibold text-lg transition-all inline-flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-5 h-5" />
          Calculate Returns
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
        <div className="bg-content-on-brand/10 backdrop-blur-sm rounded-xl p-6 border border-content-on-brand/20">
          <Mail className="w-6 h-6 mb-3" />
          <div className="text-sm text-content-on-brand/80 mb-1">Email Us</div>
          <div className="font-semibold">international@raslipwani.com</div>
        </div>
        <div className="bg-content-on-brand/10 backdrop-blur-sm rounded-xl p-6 border border-content-on-brand/20">
          <Phone className="w-6 h-6 mb-3" />
          <div className="text-sm text-content-on-brand/80 mb-1">WhatsApp</div>
          <div className="font-semibold">+254 758 066 526</div>
        </div>
      </div>
    </div>
  </section>
);

InternationalCta.propTypes = { onOpenCalculator: PropTypes.func.isRequired };

export default InternationalCta;
