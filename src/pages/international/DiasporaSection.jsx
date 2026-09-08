import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Globe, Home, TrendingUp } from 'lucide-react';
import { diasporaFeatures } from './internationalContent';

/**
 * What the diaspora service includes, and what a typical position looks like
 * in the visitor's own currency. Moved out of `International.jsx` (Task 25).
 */
const DiasporaSection = React.forwardRef(({ formatCurrency }, ref) => (
  <section ref={ref} className="py-20 bg-gradient-to-br from-surface via-brand-subtle to-indigo-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-brand-subtle px-6 py-3 rounded-full mb-6">
          <Globe className="w-5 h-5 text-brand-content" />
          <span className="text-sm font-semibold text-brand-content">For African Diaspora</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-content mb-4">
          Manage Your Property Portfolio Remotely
        </h2>
        <p className="text-xl text-content-muted max-w-3xl mx-auto">
          Own and manage Nairobi real estate from anywhere in the world with complete transparency and professional support
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <div className="bg-surface-raised rounded-2xl shadow-2xl p-8 border-2 border-line">
            <h3 className="text-3xl font-bold text-content mb-6">Remote Management Dashboard</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-success-border">
                <div>
                  <div className="text-sm text-content-muted">Monthly Income</div>
                  <div className="text-2xl font-bold text-success-content">{formatCurrency(4000)}</div>
                </div>
                <TrendingUp className="w-8 h-8 text-success-content" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-subtle to-indigo-50 rounded-xl border border-line">
                <div>
                  <div className="text-sm text-content-muted">Portfolio Value</div>
                  <div className="text-2xl font-bold text-brand-content">{formatCurrency(320000)}</div>
                </div>
                <Home className="w-8 h-8 text-brand-content" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div>
                  <div className="text-sm text-content-muted">Annual ROI</div>
                  <div className="text-2xl font-bold text-purple-600">13.2%</div>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {diasporaFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-surface-raised p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-line hover:border-line"
              >
                <Icon className="w-10 h-10 text-brand-content mb-4" />
                <h4 className="text-lg font-bold text-content mb-2">{feature.title}</h4>
                <p className="text-sm text-content-muted">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-brand via-indigo-600 to-purple-600 rounded-2xl p-12 text-content-on-brand text-center shadow-2xl">
        <h3 className="text-3xl font-bold mb-4">Build Wealth Back Home</h3>
        <p className="text-xl text-content-on-brand/90 mb-8 max-w-2xl mx-auto">
          Start with as little as $30,000 and receive monthly USD returns directly to your international account
        </p>
        <Link
          to="/contact?type=diaspora"
          className="inline-flex items-center gap-2 bg-surface-raised text-brand-content hover:bg-surface-sunken px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg"
        >
          Schedule Consultation
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  </section>
));

DiasporaSection.displayName = 'DiasporaSection';

DiasporaSection.propTypes = { formatCurrency: PropTypes.func.isRequired };

export default DiasporaSection;
