import React from 'react';

/**
 * The four steps from enquiry to keys. Moved out of `UNHousing.jsx`
 * (Task 27) unchanged.
 */
const UnHousingProcess = () => (
  <section className="py-16 bg-surface-raised">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-content mb-4">
          Simple 3-Step Process
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-brand text-content-on-brand w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            1
          </div>
          <h3 className="text-xl font-bold text-content mb-2">Submit UN Contract</h3>
          <p className="text-content-muted">
            Provide your UN employment letter or consultant agreement
          </p>
        </div>

        <div className="text-center">
          <div className="bg-brand text-content-on-brand w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            2
          </div>
          <h3 className="text-xl font-bold text-content mb-2">Property Viewing</h3>
          <p className="text-content-muted">
            Virtual or in-person tours scheduled within 24 hours
          </p>
        </div>

        <div className="text-center">
          <div className="bg-brand text-content-on-brand w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            3
          </div>
          <h3 className="text-xl font-bold text-content mb-2">Move In</h3>
          <p className="text-content-muted">
            Approval and move-in within 48 hours, fully furnished
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default UnHousingProcess;
