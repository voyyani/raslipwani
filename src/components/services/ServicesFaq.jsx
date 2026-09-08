import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { faqs } from './serviceCatalog';

/**
 * The services page's accordion of frequently asked questions, and the one
 * piece of state it needs. Moved out of `ServicesMain.jsx` (Task 24).
 */
const ServicesFaq = () => {
  const [activeFAQ, setActiveFAQ] = useState(null);
  const toggleFAQ = (index) => setActiveFAQ(activeFAQ === index ? null : index);

  return (
    <section className="py-16 bg-surface">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-content-muted max-w-2xl mx-auto text-lg">
          Everything you need to know about our Kenya real estate services
        </p>
      </motion.div>
      
      <div className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-b border-line last:border-b-0"
          >
            <button 
              className="flex justify-between items-center w-full text-left py-6 group"
              onClick={() => toggleFAQ(index)}
            >
              <h3 className="text-lg font-semibold text-content group-hover:text-primary transition-colors pr-4">
                {faq.question}
              </h3>
              <motion.span
                animate={{ rotate: activeFAQ === index ? 180 : 0 }}
                className="text-primary text-lg font-bold min-w-6 flex items-center justify-center"
              >
                ➕
              </motion.span>
            </button>
            <AnimatePresence>
              {activeFAQ === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pb-6 text-content-muted leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default ServicesFaq;
