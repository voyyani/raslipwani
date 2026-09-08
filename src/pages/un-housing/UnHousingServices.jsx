import React from 'react';
import { Icon } from 'lucide-react';
import { unServices } from './unHousingContent';

/**
 * Why UN staff use us — the four service cards. Moved out of `UNHousing.jsx`
 * (Task 27) unchanged.
 */
const UnHousingServices = () => (
  <section className="py-16 bg-surface">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-content mb-4">
          Why UN Staff Choose Raslipwani
        </h2>
        <p className="text-xl text-content-muted">
          Specialized services for international organizations and diplomats
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {unServices.map((service, index) => {
          const Icon = service.icon;
          return (
            <div
              key={index}
              className="bg-surface-raised p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="bg-brand-subtle w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-7 h-7 text-brand-content" />
              </div>
              <h3 className="text-xl font-bold text-content mb-2">{service.title}</h3>
              <p className="text-content-muted">{service.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default UnHousingServices;
