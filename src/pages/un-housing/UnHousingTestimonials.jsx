import React from 'react';
import { Star } from 'lucide-react';
import { testimonials } from './unHousingContent';

/**
 * What UN staff say about the service. Moved out of `UNHousing.jsx`
 * (Task 27) unchanged.
 */
const UnHousingTestimonials = () => (
  <section className="py-16 bg-surface">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-content mb-4">
          What UN Staff Say
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-surface-raised p-8 rounded-xl shadow-lg">
            <div className="flex gap-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-accent text-accent" />
              ))}
            </div>
            <p className="text-content text-lg mb-4 italic">"{testimonial.text}"</p>
            <div>
              <div className="font-bold text-content">{testimonial.name}</div>
              <div className="text-sm text-content-muted">{testimonial.position}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default UnHousingTestimonials;
