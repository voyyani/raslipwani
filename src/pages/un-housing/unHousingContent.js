import {
  Briefcase,
  Calendar,
  Clock,
  Home,
  Shield,
  Users,
} from 'lucide-react';

/**
 * The UN-housing page's content: the featured properties, the services offered
 * to UN staff, and the testimonials. Lifted out of `UNHousing.jsx` (Task 27),
 * where all three were rebuilt on every render.
 *
 * Block 3 Task 33/34 moves `unProperties` into the database; keeping it as one
 * exported array here is the shape that swap replaces.
 */
export const unProperties = [
  {
    id: 1,
    title: 'Executive Apartment - Gigiri',
    address: '500m from UN Complex, Gigiri',
    price: 2500,
    bedrooms: 3,
    bathrooms: 2,
    size: 150,
    furnished: true,
    security: '24/7 Armed Security',
    parking: 2,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    amenities: ['High-speed Internet', 'Generator Backup', 'Water Backup', 'DSTV', 'Gym', 'Swimming Pool'],
    distance: '500m to UN',
    availableFrom: '2026-02-01',
    leaseTerms: 'Minimum 6 months',
    preferredTenants: 'UN Staff, Diplomats, International NGOs'
  },
  {
    id: 2,
    title: 'Luxury Villa - Runda',
    address: 'Runda Estate, 3km from UN',
    price: 4500,
    bedrooms: 4,
    bathrooms: 3,
    size: 280,
    furnished: true,
    security: 'Gated Community with 24/7 Security',
    parking: 3,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    amenities: ['High-speed Internet', 'Generator', 'Water Backup', 'Garden', 'Staff Quarters', 'Pool'],
    distance: '3km to UN',
    availableFrom: '2026-02-15',
    leaseTerms: 'Minimum 12 months',
    preferredTenants: 'Senior UN Officials, Ambassadors'
  },
  {
    id: 3,
    title: 'Modern Townhouse - Rosslyn',
    address: 'Rosslyn Valley, 4km from UN',
    price: 1800,
    bedrooms: 3,
    bathrooms: 2.5,
    size: 180,
    furnished: true,
    security: 'Perimeter Wall + Security Guard',
    parking: 2,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    amenities: ['High-speed Internet', 'Generator', 'DSTV', 'Modern Kitchen', 'Balcony'],
    distance: '4km to UN',
    availableFrom: '2026-02-01',
    leaseTerms: 'Flexible 3-12 months',
    preferredTenants: 'UN Consultants, International Professionals'
  }
];

export const unServices = [
  {
    icon: Clock,
    title: 'Fast-Track Processing',
    description: '48-hour approval for UN staff with valid contracts'
  },
  {
    icon: Shield,
    title: 'Diplomatic Services',
    description: 'Experience with diplomatic requirements and protocols'
  },
  {
    icon: Home,
    title: 'Furnished Options',
    description: 'Move-in ready properties with all amenities'
  },
  {
    icon: Briefcase,
    title: 'Corporate Leases',
    description: 'Direct billing to organizations available'
  },
  {
    icon: Users,
    title: 'Relocation Support',
    description: 'Complete assistance from airport to settlement'
  },
  {
    icon: Calendar,
    title: 'Flexible Terms',
    description: 'Short-term and long-term lease options'
  }
];

export const testimonials = [
  {
    name: 'Dr. Sarah Johnson',
    position: 'Senior Programme Officer, UN Environment',
    text: 'Raslipwani made my relocation to Nairobi seamless. Found the perfect property near the UN complex within 48 hours.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    position: 'Consultant, UNDP',
    text: 'Excellent service! The furnished apartment had everything I needed, and the property management team is very responsive.',
    rating: 5
  }
];
