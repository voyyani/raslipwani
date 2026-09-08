import {
  Briefcase,
  Building,
  Calendar,
  DollarSign,
  Download,
  FileText,
  Globe,
  Home,
  MessageSquare,
  Shield,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react';

/**
 * Everything the /international page says, as data. Lifted out of
 * `International.jsx` (Task 25), where six literals were rebuilt on every
 * render of a page that renders eight sections from them.
 */

export const currencies = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'GBP', symbol: '£', rate: 0.79 },
  { code: 'KES', symbol: 'KSh', rate: 129.5 },
];

// a real section; a triage card that goes nowhere is worse than no triage at all.
export const audiencePaths = [
  {
    icon: Building,
    title: 'UN Staff & Diplomats',
    description: 'Housing near the UN complex in Gigiri and Runda, with fast-track viewings and furnished options.',
    benefits: ['Fast-track viewings', 'Furnished options', 'Diplomatic services support'],
    cta: 'View UN & diplomatic housing',
    to: '/international/un-housing'
  },
  {
    icon: Globe,
    title: 'African Diaspora',
    description: 'Own and manage Nairobi property from abroad, with monthly USD returns and full remote reporting.',
    benefits: ['Remote property management', 'Monthly USD returns', 'Full transparency'],
    cta: 'See diaspora investment',
    section: 'diaspora'
  },
  {
    icon: Briefcase,
    title: 'International Professionals',
    description: 'Premium homes for expatriates and relocating professionals, with flexible leases and relocation help.',
    benefits: ['Corporate housing', 'Flexible leases', 'Relocation assistance'],
    cta: 'Browse listings',
    to: '/properties'
  }
];

export const investmentOpportunities = [
  {
    title: 'Premium Residential',
    roi: '10-12% Annual',
    minInvestment: '$50,000',
    description: 'High-end apartments and houses in prime locations serving expatriates and professionals',
    features: ['Guaranteed tenant pool', 'Professional management', 'Capital appreciation']
  },
  {
    title: 'Diaspora Portfolio',
    roi: '12-14% Annual',
    minInvestment: '$30,000',
    description: 'Diversified investment portfolio with remote management and USD returns',
    features: ['Monthly USD returns', 'Full transparency', 'Exit flexibility']
  },
  {
    title: 'Commercial Real Estate',
    roi: '15-20% Annual',
    minInvestment: '$100,000',
    description: 'Office spaces and retail units leased to international organizations',
    features: ['Long-term contracts', 'Blue-chip tenants', 'Stable income']
  }
];

export const whyNairobi = [
  {
    stat: '40+',
    label: 'International HQs',
    detail: 'UN, World Bank, and more'
  },
  {
    stat: '15%',
    label: 'Market Growth',
    detail: 'Annual property appreciation'
  },
  {
    stat: '$2B+',
    label: 'Economic Activity',
    detail: 'International organizations'
  },
  {
    stat: '5,000+',
    label: 'Expats Annually',
    detail: 'Creating housing demand'
  }
];

export const internationalServices = [
  {
    icon: Video,
    title: 'Virtual Property Tours',
    description: 'HD video tours, 360° views, and live virtual walkthroughs from anywhere in the world'
  },
  {
    icon: DollarSign,
    title: 'Multi-Currency Transactions',
    description: 'Pay in USD, EUR, GBP or KES with transparent exchange rates'
  },
  {
    icon: Home,
    title: 'Remote Property Management',
    description: 'Full management service - tenant screening, rent collection, maintenance, reporting'
  },
  {
    icon: Shield,
    title: 'Legal & Compliance Support',
    description: 'Navigate Kenya property laws, visa requirements, and tax obligations'
  },
  {
    icon: TrendingUp,
    title: 'Investment Reporting',
    description: 'Monthly statements, tax documents, ROI tracking in your preferred currency'
  },
  {
    icon: Users,
    title: 'Relocation Assistance',
    description: 'Complete support for your move to Nairobi - from arrival to settlement'
  }
];

export const featuredProperties = [
  {
    title: 'Executive Apartment - Kilimani',
    location: 'Near UN Complex, 2km',
    price: 80000,
    bedrooms: 3,
    type: 'Sale',
    furnished: true,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
  },
  {
    title: 'Luxury Villa - Runda',
    location: 'Diplomatic Area',
    price: 250000,
    bedrooms: 5,
    type: 'Sale',
    furnished: true,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
  },
  {
    title: 'Modern Townhouse - Lavington',
    location: 'Near International Schools',
    price: 150000,
    bedrooms: 4,
    type: 'Sale',
    furnished: false,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
  }
];

export const diasporaFeatures = [
  {
    icon: FileText,
    title: 'Document Management',
    description: 'Access all property documents, leases, and reports from your dashboard'
  },
  {
    icon: Video,
    title: 'Virtual Inspections',
    description: 'Schedule live video property inspections whenever you need'
  },
  {
    icon: MessageSquare,
    title: 'Direct Communication',
    description: 'Message tenants and property managers instantly via platform'
  },
  {
    icon: Download,
    title: 'Financial Reports',
    description: 'Download monthly income statements and annual tax documents'
  },
  {
    icon: Calendar,
    title: 'Automated Reminders',
    description: 'Get notified about rent payments, maintenance, and important dates'
  },
  {
    icon: TrendingUp,
    title: 'Performance Analytics',
    description: 'Track property value, rental income, and ROI in real-time'
  }
];

