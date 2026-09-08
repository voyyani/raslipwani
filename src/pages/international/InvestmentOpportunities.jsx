import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { investmentOpportunities } from './internationalContent';

/**
 * The three investment profiles, with their yields. Moved out of
 * `International.jsx` (Task 25) unchanged.
 */
const InvestmentOpportunities = React.forwardRef((props, ref) => (
  <section ref={ref} className="py-20 bg-surface-raised">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-content mb-4">
          Investment Opportunities
        </h2>
        <p className="text-xl text-content-muted max-w-3xl mx-auto">
          Transparent, professionally managed investments with attractive returns
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {investmentOpportunities.map((opp, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-surface-raised rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all border-2 border-line hover:border-line"
          >
            <div className="bg-gradient-to-r from-brand via-indigo-600 to-purple-600 p-8 text-content-on-brand">
              <h3 className="text-2xl font-bold mb-3">{opp.title}</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">{opp.roi}</span>
              </div>
              <span className="text-content-on-brand/80 text-sm">expected returns</span>
            </div>
            
            <div className="p-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-success-border rounded-xl p-4 mb-6">
                <div className="text-sm text-success-content font-medium mb-1">From</div>
                <div className="text-3xl font-bold text-success-content">{opp.minInvestment}</div>
              </div>
              
              <p className="text-content-muted mb-6 leading-relaxed">{opp.description}</p>
              
              <div className="space-y-3 mb-8">
                {opp.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success-content flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-content">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Link
                to="/contact?inquiry=investment"
                className="block w-full bg-gradient-to-r from-brand to-indigo-600 hover:from-brand-hover hover:to-indigo-700 text-content-on-brand text-center py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
));

InvestmentOpportunities.displayName = 'InvestmentOpportunities';

export default InvestmentOpportunities;
