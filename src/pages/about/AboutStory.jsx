import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../components/Icon';

/**
 * How the firm started and what it does now. Moved out of `About.jsx`
 * (Task 27) unchanged.
 */
const AboutStory = () => (
<section className="py-16 md:py-24">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Icon name="history" size={14} />
          Our Journey
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-content mb-6">Building Dreams Across Kenya</h1>
        <div className="space-y-4 text-content leading-relaxed">
          <p>
            Founded with a vision to transform real estate in Kenya, Raslipwani Properties has grown from 
            a coastal specialist to a nationwide leader in property solutions. Our journey began in Kilifi 
            County and has expanded to serve clients across all major Kenyan regions.
          </p>
          <p>
            We combine deep local market knowledge with international standards of professionalism, 
            creating a unique approach that serves both local and international clients seeking 
            premium properties in Kenya.
          </p>
          <p>
            Our team of seasoned experts brings together decades of collective experience in real 
            estate development, property management, and investment consulting, ensuring our clients 
            receive unparalleled service and results.
          </p>
        </div>
        
        <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-brand-subtle rounded-2xl border border-primary/10">
          <h2 className="text-xl font-semibold text-primary mb-3">Why Invest in Kenya?</h2>
          <ul className="space-y-2 text-content">
            <li className="flex items-center gap-3">
              <Icon name="chart-line" size={14} className="text-primary" />
              <span>Consistent property value appreciation averaging 8-12% annually</span>
            </li>
            <li className="flex items-center gap-3">
              <Icon name="gem" size={14} className="text-primary" />
              <span>Growing middle class driving real estate demand</span>
            </li>
            <li className="flex items-center gap-3">
              <Icon name="city" size={14} className="text-primary" />
              <span>Urban development and infrastructure expansion</span>
            </li>
            <li className="flex items-center gap-3">
              <Icon name="globe-africa" size={14} className="text-primary" />
              <span>Strategic location as East Africa's economic hub</span>
            </li>
          </ul>
        </div>
      </motion.div>
      
      <motion.div 
        className="relative"
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          <div className="aspect-w-4 aspect-h-5 bg-gradient-to-br from-surface-sunken to-surface-sunken rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-brand-subtle flex items-center justify-center p-8">
              <div className="text-center w-full">
                <div className="bg-surface-raised rounded-2xl p-8 shadow-lg border border-line mx-auto max-w-md">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon name="home" size={30} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-content mb-3">Nationwide Coverage</h3>
                  <p className="text-content-muted mb-6">
                    Serving clients in Nairobi, Mombasa, Kilifi, Diani, Naivasha, Malindi, and beyond
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Nairobi', 'Mombasa', 'Kilifi', 'Diani', 'Naivasha', 'Malindi'].map((city, index) => (
                      <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-2xl blur-xl"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-brand-subtle rounded-2xl blur-xl"></div>
      </motion.div>
    </div>
  </div>
</section>
);

export default AboutStory;
