import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Building, 
  MapPin, 
  Shield, 
  Clock, 
  CheckCircle, 
  Star,
  Home,
  Briefcase,
  Users,
  Phone,
  Calendar,
  Car,
  Wifi,
  Zap,
  Droplet
} from 'lucide-react';

const UNHousing = () => {
  const unProperties = [
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

  const unServices = [
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

  const testimonials = [
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      <Helmet>
        <title>UN Housing Solutions | Diplomatic Housing Nairobi | Raslipwani</title>
        <meta 
          name="description" 
          content="Premium housing for UN staff, diplomats and international organizations in Nairobi. Properties near UN complex in Gigiri. Fast-track approvals, furnished options." 
        />
        <meta name="keywords" content="UN housing Nairobi, diplomatic housing Kenya, Gigiri apartments, UN staff accommodation, international housing Nairobi" />
      </Helmet>
      
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEyYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav aria-label="Breadcrumb" className="mb-8">
            <Link
              to="/international"
              className="text-sm text-blue-200 hover:text-white transition-colors"
            >
              &larr; International
            </Link>
          </nav>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-white/20">
              <Building className="w-5 h-5" />
              <span className="text-sm font-medium">Official UN Housing Partner</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Premium Housing for<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                UN Staff & Diplomats
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Exclusive properties near the UN Complex in Gigiri. 
              Fast-track approvals, furnished options, and diplomatic services support.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a 
                href="#properties"
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
              >
                View Available Properties
              </a>
              <Link 
                to="/contact?type=un-housing"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
              >
                Contact Us
              </Link>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div>
                <div className="text-4xl font-bold text-yellow-400">48hrs</div>
                <div className="text-sm text-blue-200">Average Approval Time</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400">50+</div>
                <div className="text-sm text-blue-200">UN Staff Housed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400">100%</div>
                <div className="text-sm text-blue-200">Furnished Options</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us for UN Housing */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why UN Staff Choose Raslipwani
            </h2>
            <p className="text-xl text-gray-600">
              Specialized services for international organizations and diplomats
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {unServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section id="properties" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Available Properties Near UN Complex
            </h2>
            <p className="text-xl text-gray-600">
              Premium locations within 5km of UN offices
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {unProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-200"
              >
                <div className="relative h-64">
                  <img 
                    src={property.imageUrl} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {property.distance}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Available
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h3>
                  <p className="text-gray-600 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {property.address}
                  </p>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-blue-600">{formatCurrency(property.price)}</span>
                    <span className="text-gray-600">/ month</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <div className="text-sm text-gray-500">Bedrooms</div>
                      <div className="font-semibold text-gray-900">{property.bedrooms}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Bathrooms</div>
                      <div className="font-semibold text-gray-900">{property.bathrooms}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Size</div>
                      <div className="font-semibold text-gray-900">{property.size}m²</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      {property.furnished ? 'Fully Furnished' : 'Unfurnished'}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Shield className="w-4 h-4 text-green-600 mr-2" />
                      {property.security}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Car className="w-4 h-4 text-green-600 mr-2" />
                      {property.parking} Parking Spaces
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Key Amenities:</div>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          +{property.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="text-xs text-blue-700 font-medium mb-1">Preferred Tenants</div>
                    <div className="text-sm text-blue-900">{property.preferredTenants}</div>
                  </div>

                  <Link
                    to={`/properties/${property.id}`}
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-semibold transition-colors"
                  >
                    View Details & Book Tour
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/properties?filter=un-area"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg"
            >
              View All UN-Area Properties
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What UN Staff Say
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.position}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple 3-Step Process
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Submit UN Contract</h3>
              <p className="text-gray-600">
                Provide your UN employment letter or consultant agreement
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Property Viewing</h3>
              <p className="text-gray-600">
                Virtual or in-person tours scheduled within 24 hours
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Move In</h3>
              <p className="text-gray-600">
                Approval and move-in within 48 hours, fully furnished
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Find Your Nairobi Home?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Contact our UN housing specialists for personalized assistance
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/contact?type=un-housing"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all inline-flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Contact UN Housing Team
            </Link>
            <a
              href="#properties"
              className="bg-blue-800 hover:bg-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
            >
              View Properties
            </a>
          </div>

          <div className="text-sm text-blue-100">
            <p>24/7 Support for UN Staff • Fast-Track Processing • Diplomatic Services</p>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default UNHousing;
