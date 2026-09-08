/**
 * What the contact form offers and says: the property types and locations its
 * dropdowns list, and every string that changes with the kind of enquiry.
 * Lifted out of `ContactForm.jsx` (Task 27).
 */
export const PROPERTY_TYPES = [
  'Residential Homes',
  'Apartments & Condos',
  'Commercial Properties',
  'Land & Plots',
  'Luxury Villas',
  'Beach Properties',
  'Investment Properties',
];

export const DEFAULT_LOCATIONS = [
  'Nairobi', 'Mombasa', 'Kilifi', 'Malindi', 'Diani', 'Watamu',
  'Lamu', 'Naivasha', 'Kisumu', 'Nakuru', 'Thika', 'Countrywide',
];

// Every string on this form that changes with the kind of enquiry. These were
// four inline ternary chains repeated at five points in the markup, which is
// how the heading could describe one enquiry while the button offered another.
export const COPY = {
  general: {
    heading: 'Get in Touch',
    intro: 'Contact our Kenya-wide real estate experts for any inquiries',
    subjectPlaceholder: 'How can we help you?',
    messagePlaceholder: 'Tell us about your inquiry...',
    submit: 'Send Message',
    showPropertyPreferences: false,
  },
  buying: {
    heading: 'Find Your Dream Property',
    intro: "Tell us what you're looking for and we'll find the perfect match across Kenya",
    subjectPlaceholder: 'What type of property are you looking for?',
    messagePlaceholder: 'Describe your ideal property and requirements...',
    submit: 'Find My Property',
    showPropertyPreferences: true,
  },
  selling: {
    heading: 'Sell Your Property',
    intro: 'Get the best value for your property with our nationwide marketing reach',
    subjectPlaceholder: 'Tell us about your property',
    messagePlaceholder: 'Provide details about your property...',
    submit: 'Get Property Valuation',
    showPropertyPreferences: false,
  },
  investment: {
    heading: 'Investment Opportunities',
    intro: 'Discover lucrative real estate investment opportunities throughout Kenya',
    subjectPlaceholder: 'What type of investment interests you?',
    messagePlaceholder: 'Tell us about your investment goals...',
    submit: 'Explore Investments',
    showPropertyPreferences: true,
  },
};
