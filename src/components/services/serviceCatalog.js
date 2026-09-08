/**
 * The service catalogue the services page renders: the four service cards, the
 * four bookable service types, the two viewing formats, and the FAQ copy.
 *
 * Lifted out of `ServicesMain.jsx` (Task 24) unchanged. It was rebuilt on every
 * render of that page, and the booking wizard's step components need the same
 * lists, so it is data in a module rather than four literals in a component.
 */

export const services = [
  {
    icon: '🏠',
    title: 'Property Sales',
    description: 'Maximize your property value with our comprehensive sales strategy',
    features: ['Professional Marketing', 'Market Analysis', 'Negotiation Support', 'Legal Guidance'],
    price: 'Commission Based'
  },
  {
    icon: '💰',
    title: 'Property Acquisition',
    description: 'Find your perfect property with expert guidance across Kenya',
    features: ['Property Search', 'Due Diligence', 'Price Negotiation', 'Investment Analysis'],
    price: 'Fixed Fee'
  },
  {
    icon: '📊',
    title: 'Property Valuation',
    description: 'Accurate market valuation for informed investment decisions',
    features: ['Market Analysis', 'Comparative Pricing', 'Investment Potential', 'Detailed Report'],
    price: 'From KES 5,000'
  },
  {
    icon: '🏢',
    title: 'Property Management',
    description: 'Complete management solutions for property owners',
    features: ['Tenant Management', 'Rent Collection', 'Maintenance', 'Financial Reporting'],
    price: '8-12% Monthly'
  }
];

export const serviceTypes = [
  { value: 'viewing', label: 'Property Viewing', description: 'Schedule a viewing for any property' },
  { value: 'valuation', label: 'Property Valuation', description: 'Get professional property valuation' },
  { value: 'consultation', label: 'Investment Consultation', description: 'Expert investment advice' },
  { value: 'management', label: 'Management Inquiry', description: 'Property management services' }
];

export const viewingTypes = [
  { 
    type: "physical", 
    title: "In-Person Viewing", 
    description: "Personalized tour with our agent",
    duration: "1 hour",
    icon: "👥"
  },
  { 
    type: "virtual", 
    title: "Virtual Tour", 
    description: "Live video walkthrough",
    duration: "30 minutes",
    icon: "📱"
  }
];

export const faqs = [
  {
    question: "How quickly can I schedule a property viewing?",
    answer: "We can schedule viewings within 24 hours. For urgent viewings, we offer same-day appointments based on agent availability."
  },
  {
    question: "Do you provide virtual tours for all properties?",
    answer: "Yes, we offer virtual tours for all our listed properties. This allows you to get a feel for the property before scheduling an in-person viewing."
  },
  {
    question: "What areas in Kenya do you serve?",
    answer: "We serve the entire Kenyan market with expertise in Nairobi, Mombasa, Coast Region, Central Kenya, and major urban centers."
  },
  {
    question: "Can I get a property valuation without visiting the property?",
    answer: "Yes, we offer remote valuations using market data, comparable properties, and digital tools. For the most accurate valuation, we recommend an in-person assessment."
  },
  {
    question: "What's included in your investment consultation?",
    answer: "Our consultation includes market analysis, investment strategy, property recommendations, ROI projections, and legal considerations for Kenyan real estate."
  }
];

/**
 * The three viewing formats the viewing-experience page sells, with what each
 * one includes and what it costs. Distinct from `viewingTypes` above, which is
 * the two-way in-person/virtual choice the service booking wizard offers.
 */
export const viewingExperiences = [
  { 
    type: "physical", 
    title: "In-Person Viewing", 
    description: "Personalized tour with our agent",
    duration: "1 hour",
    icon: "walking",
    price: "Free",
    features: [
      "On-site property inspection",
      "Neighborhood tour",
      "Q&A with agent",
      "Immediate feedback"
    ]
  },
  { 
    type: "virtual", 
    title: "Virtual Tour", 
    description: "Live video walkthrough",
    duration: "30 minutes",
    icon: "video",
    price: "Free",
    features: [
      "Live guided video tour",
      "Screen sharing for documents",
      "Recorded session available",
      "Flexible scheduling"
    ]
  },
  { 
    type: "3d", 
    title: "3D Viewing Experience", 
    description: "3D virtual tour of the property, and drone footage",
    duration: "Unlimited access for 7 days",
    icon: "vr-cardboard",
    price: "Ksh 5,000",
    features: [
      "360° property view",
      "Interactive navigation",
      "Compatible with VR headsets",
      "View from any device",
      "Drone footage included"
    ]
  }
];
