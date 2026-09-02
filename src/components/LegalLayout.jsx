import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

/**
 * Shared chrome for the statutory pages (privacy, terms). They share a layout,
 * a reading measure, and a "last updated" convention, so it lives in one place
 * rather than being copied per document.
 */
const LegalLayout = ({ title, description, updatedOn, children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>{`${title} | Raslipwani Properties`}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <>
        <main className="flex-grow bg-gray-50">
          <div className="bg-primary text-white py-14 md:py-20">
            <div className="container mx-auto px-4 max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
              <p className="mt-3 text-white/80 text-sm">
                Last updated{' '}
                <time dateTime={updatedOn}>
                  {new Date(`${updatedOn}T00:00:00Z`).toLocaleDateString('en-KE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'UTC',
                  })}
                </time>
              </p>
            </div>
          </div>

          <div className="container mx-auto px-4 py-12 md:py-16">
            <article className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 space-y-8 text-gray-700 leading-relaxed">
              {children}
            </article>
          </div>
        </main>

      </>
    </>
  );
};

LegalLayout.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  /** ISO date (YYYY-MM-DD) this document was last revised. */
  updatedOn: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

/** A titled block within a legal document. */
export const LegalSection = ({ heading, children }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-bold text-gray-900">{heading}</h2>
    {children}
  </section>
);

LegalSection.propTypes = {
  heading: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default LegalLayout;
