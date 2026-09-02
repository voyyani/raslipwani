import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import InvestmentCalculator from '../components/InvestmentCalculator';
import { 
  Globe, 
  TrendingUp, 
  Home, 
  Shield, 
  Video, 
  DollarSign,
  Users,
  Building,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Star,
  Clock,
  Car,
  Wifi,
  Calendar,
  FileText,
  MessageSquare,
  Download,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

const International = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showCalculator, setShowCalculator] = useState(false);
  
  const overviewRef = useRef(null);
  const investRef = useRef(null);
  const diasporaRef = useRef(null);
  const servicesRef = useRef(null);
  const propertiesRef = useRef(null);

  const currencies = [
    { code: 'USD', symbol: '$', rate: 1 },
    { code: 'EUR', symbol: '€', rate: 0.92 },
    { code: 'GBP', symbol: '£', rate: 0.79 },
    { code: 'KES', symbol: 'KSh', rate: 129.5 }
  ];

  const scrollToSection = (ref, section) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(section);
  };

  const formatCurrency = (amount) => {
    const curr = currencies.find(c => c.code === selectedCurrency);
    const convertedAmount = amount * curr.rate;
    
    if (selectedCurrency === 'KES') {
      return `${curr.symbol} ${convertedAmount.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
    }
    return `${curr.symbol}${convertedAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const targetMarkets = [
    {
      icon: Building,
      title: 'International Organizations',
      description: 'UN agencies, embassies, and global NGOs expanding operations in East Africa',
      stats: '40+ Organizations',
      highlight: 'Growing demand for premium housing'
    },
    {
      icon: Globe,
      title: 'African Diaspora',
      description: 'Africans abroad investing in real estate back home for wealth building',
      stats: '$5B+ Annual Remittances',
      highlight: 'Build passive income from anywhere'
    },
    {
      icon: Briefcase,
      title: 'Global Investors',
      description: 'International investors seeking emerging market opportunities',
      stats: '12-15% Annual ROI',
      highlight: 'Attractive returns with professional management'
    }
  ];

  const investmentOpportunities = [
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

  const whyNairobi = [
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

  const internationalServices = [
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

  const featuredProperties = [
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

  const diasporaFeatures = [
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

  return (
    <>
      <Helmet>
        <title>International Property Services | Nairobi Real Estate | Raslipwani</title>
        <meta 
          name="description" 
          content="International real estate services in Nairobi. Investment opportunities for diaspora, expats, and global investors. Remote property management, multi-currency support, 12-15% ROI." 
        />
        <meta name="keywords" content="Nairobi international property, Kenya diaspora investment, expat housing Nairobi, international real estate Kenya, African diaspora property" />
      </Helmet>

      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEyYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-white/20">
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">International Property Services</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Gateway to<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500">
                Nairobi Real Estate
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto">
              Whether you're in the diaspora, relocating for work, or seeking investment opportunities - 
              we make Nairobi real estate accessible from anywhere in the world.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
                onClick={() => scrollToSection(propertiesRef, 'properties')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Explore Properties
              </button>
              <button 
                onClick={() => setShowCalculator(!showCalculator)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
              >
                Investment Calculator
              </button>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="text-sm text-blue-200">View prices in:</span>
              {currencies.map(curr => (
                <button
                  key={curr.code}
                  onClick={() => setSelectedCurrency(curr.code)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCurrency === curr.code
                      ? 'bg-white text-blue-900'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {curr.code}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating Navigation Pills */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden lg:flex gap-2 bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/20">
          {[
            { label: 'Overview', ref: overviewRef, section: 'overview' },
            { label: 'Investment', ref: investRef, section: 'invest' },
            { label: 'For Diaspora', ref: diasporaRef, section: 'diaspora' },
            { label: 'Services', ref: servicesRef, section: 'services' },
            { label: 'Properties', ref: propertiesRef, section: 'properties' }
          ].map(item => (
            <button
              key={item.section}
              onClick={() => scrollToSection(item.ref, item.section)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeSection === item.section
                  ? 'bg-white text-blue-900'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* Investment Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowCalculator(false)}
              className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <InvestmentCalculator />
          </div>
        </div>
      )}

      {/* Why Nairobi Section */}
      <section ref={overviewRef} className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Nairobi? Why Now?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              East Africa's hub for international business, diplomacy, and investment - creating unprecedented real estate opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {whyNairobi.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {item.stat}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-2">{item.label}</div>
                <div className="text-sm text-gray-600">{item.detail}</div>
              </motion.div>
            ))}
          </div>

          {/* Target Markets */}
          <div className="grid md:grid-cols-3 gap-8">
            {targetMarkets.map((market, index) => {
              const Icon = market.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-xl group"
                >
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{market.title}</h3>
                  <p className="text-gray-600 mb-4">{market.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-600">{market.stats}</span>
                    <span className="text-xs text-gray-500">{market.highlight}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Investment Opportunities */}
      <section ref={investRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Investment Opportunities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparent, professionally managed investments with attractive returns
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {investmentOpportunities.map((opp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-blue-200"
              >
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3">{opp.title}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold">{opp.roi}</span>
                  </div>
                  <span className="text-blue-200 text-sm">expected returns</span>
                </div>
                
                <div className="p-8">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                    <div className="text-sm text-green-700 font-medium mb-1">From</div>
                    <div className="text-3xl font-bold text-green-900">{opp.minInvestment}</div>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">{opp.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    {opp.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    to="/contact?inquiry=investment"
                    className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-center py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    Learn More
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Diaspora Section */}
      <section ref={diasporaRef} className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 px-6 py-3 rounded-full mb-6">
              <Globe className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">For African Diaspora</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Manage Your Property Portfolio Remotely
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Own and manage Nairobi real estate from anywhere in the world with complete transparency and professional support
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-blue-100">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Remote Management Dashboard</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div>
                      <div className="text-sm text-gray-600">Monthly Income</div>
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(4000)}</div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div>
                      <div className="text-sm text-gray-600">Portfolio Value</div>
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(320000)}</div>
                    </div>
                    <Home className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div>
                      <div className="text-sm text-gray-600">Annual ROI</div>
                      <div className="text-2xl font-bold text-purple-600">13.2%</div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {diasporaFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-blue-200"
                  >
                    <Icon className="w-10 h-10 text-blue-600 mb-4" />
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-12 text-white text-center shadow-2xl">
            <h3 className="text-3xl font-bold mb-4">Build Wealth Back Home</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start with as little as $30,000 and receive monthly USD returns directly to your international account
            </p>
            <Link
              to="/contact?type=diaspora"
              className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg"
            >
              Schedule Consultation
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              International Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to invest, buy, or relocate - no matter where you are
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {internationalServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="p-8 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all bg-gradient-to-br from-white to-gray-50 group"
                >
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section ref={propertiesRef} className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured International Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Prime locations ideal for international clients, expats, and investors
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {featuredProperties.map((property, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-blue-200"
              >
                <div className="relative h-64">
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {property.type}
                    </span>
                  </div>
                  {property.furnished && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                        Furnished
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h3>
                  <p className="text-gray-600 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {property.location}
                  </p>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {formatCurrency(property.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-6 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      {property.bedrooms} bed
                    </span>
                  </div>

                  <Link
                    to={`/properties`}
                    className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-center py-3 rounded-xl font-semibold transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/properties?filter=international"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              View All International Properties
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-10 text-blue-100">
            Schedule a consultation with our international property specialists
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/contact?type=international"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all inline-flex items-center justify-center gap-2 shadow-xl"
            >
              <Phone className="w-5 h-5" />
              Schedule Consultation
            </Link>
            <button
              onClick={() => setShowCalculator(true)}
              className="bg-blue-800 hover:bg-blue-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all inline-flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Calculate Returns
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Mail className="w-6 h-6 mb-3" />
              <div className="text-sm text-blue-200 mb-1">Email Us</div>
              <div className="font-semibold">international@raslipwani.com</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Phone className="w-6 h-6 mb-3" />
              <div className="text-sm text-blue-200 mb-1">WhatsApp</div>
              <div className="font-semibold">+254 758 066 526</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default International;
