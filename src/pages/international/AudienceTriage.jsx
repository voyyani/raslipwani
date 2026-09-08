import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { audiencePaths } from './internationalContent';

/**
 * The three people who arrive at /international — a diaspora buyer, an expat
 * renter, a global investor — and the different next page each of them needs.
 * Moved out of `International.jsx` (Task 25) unchanged.
 */
const AudienceTriage = ({ onScrollToDiaspora }) => (
  <section className="py-16 bg-surface-raised border-b border-line">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-content mb-4">
          Capturing the UN Nairobi Opportunity
        </h2>
        <p className="text-xl text-content-muted max-w-3xl mx-auto">
          Nairobi is the UN&apos;s only headquarters city in the global south. Three
          groups of people buy and rent here for very different reasons — start with
          the one that describes you.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {audiencePaths.map((audience) => {
          const Icon = audience.icon;
          const body = (
            <>
              <div className="bg-gradient-to-br from-brand to-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icon className="w-8 h-8 text-content-on-brand" />
              </div>
              <h3 className="text-2xl font-bold text-content mb-3">{audience.title}</h3>
              <p className="text-content-muted mb-6">{audience.description}</p>
              <ul className="space-y-2 mb-6">
                {audience.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center text-sm text-content">
                    <span className="w-2 h-2 bg-brand rounded-full mr-3" aria-hidden="true" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <span className="inline-flex items-center gap-2 font-semibold text-brand-content">
                {audience.cta}
                <ChevronRight className="w-4 h-4" />
              </span>
            </>
          );
          const cardClass =
            'group block text-left w-full h-full bg-gradient-to-br from-brand-subtle to-indigo-50 p-8 rounded-2xl border-2 border-line hover:border-blue-300 transition-all hover:shadow-xl';

          return audience.to ? (
            <Link key={audience.title} to={audience.to} className={cardClass}>
              {body}
            </Link>
          ) : (
            <button
              key={audience.title}
              type="button"
              onClick={() => onScrollToDiaspora(audience.section)}
              className={cardClass}
            >
              {body}
            </button>
          );
        })}
      </div>
    </div>
  </section>
);

AudienceTriage.propTypes = { onScrollToDiaspora: PropTypes.func.isRequired };

export default AudienceTriage;
