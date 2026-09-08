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
/*
 * `unProperties` used to live here: three listings with Unsplash photographs,
 * invented prices and an availability date already in the past. Migration 013
 * added `properties.segment`, the seed carries those three rows minus what was
 * invented, and `UnHousingProperties.jsx` reads them through
 * `propertyQueries.segment('un-diplomatic')` (Task 34).
 */

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
