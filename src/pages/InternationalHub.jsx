import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
  Mail
} from 'lucide-react';

const InternationalHub = () => {
  const [, setActiveTab] = useState('overview');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const currencies = [
    { code: 'USD', symbol: '$', rate: 1 },
    { code: 'EUR', symbol: '€', rate: 0.92 },
    { code: 'GBP', symbol: '£', rate: 0.79 },
    { code: 'KES', symbol: 'KSh', rate: 129.5 }
  ];

  const targetAudiences = [
    {
      icon: Building,
      title: 'UN Staff & Diplomats',
      description: 'Exclusive housing solutions near UN offices in Gigiri with premium amenities',
      benefits: ['Fast-track viewings', 'Furnished options', 'Diplomatic services support']
    },
    {
      icon: Globe,
      title: 'Diaspora Africans',
      description: 'Invest in Nairobi real estate from anywhere in the world',
      benefits: ['Remote property management', 'Investment returns', 'Citizenship opportunities']
    },
    {
      icon: Briefcase,
      title: 'International Professionals',
      description: 'Premium properties for expats and foreign professionals',
      benefits: ['Corporate housing', 'Flexible leases', 'Relocation assistance']
    }
  ];

  const investmentOpportunities = [
    {
      title: 'UN Proximity Properties',
      roi: '12-15% Annual',
      minInvestment: '$50,000',
      description: 'Properties within 5km of UN complex - high demand from international staff',
      features: ['Guaranteed tenants', 'Management included', 'Currency-hedged returns']
    },
    {
      title: 'Diaspora Investment Portfolio',
      roi: '10-12% Annual',
      minInvestment: '$30,000',
      description: 'Diversified property portfolio managed remotely',
      features: ['Monthly USD returns', 'Full transparency', 'Exit flexibility']
    },
    {
      title: 'Commercial Real Estate',
      roi: '15-20% Annual',
      minInvestment: '$100,000',
      description: 'Office spaces leased to international organizations',
      features: ['Long-term contracts', 'Blue-chip tenants', 'Capital appreciation']
    }
  ];

  const whyNairobiNow = [
    {
      stat: '40+',
      label: 'International Organizations',
      detail: 'UN, World Bank, IMF and more'
    },
    {
      stat: '15%',
      label: 'Annual Property Growth',
      detail: 'Consistent market appreciation'
    },
    {
      stat: '$2B+',
      label: 'UN Annual Budget',
      detail: 'Creating housing demand'
    },
    {
      stat: '3,000+',
      label: 'UN Staff Relocating',
      detail: 'New housing needs in 2026'
    }
  ];

  return (
    <>
      <Helmet>
        <title>International Property Hub | Nairobi UN Market | Raslipwani</title>
        <meta 
          name="description" 
          content="Capture Nairobi's UN opportunity. Properties for diaspora, diplomats & international investors. Remote management, USD returns, premium locations near UN complex." 
        />
        <meta name="keywords" content="Nairobi UN housing, Kenya diaspora investment, international property Nairobi, UN staff accommodation, expat housing Kenya" />
      </Helmet>
      
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
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
              <span className="text-sm font-medium">Capturing the UN Nairobi Opportunity</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Your Gateway to<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Nairobi's UN Real Estate Boom
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              As the UN shifts major operations to Nairobi, seize premium investment opportunities. 
              Designed for diaspora Africans, UN staff, diplomats, and international investors.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                to="/properties?filter=international"
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Browse UN-Area Properties
              </Link>
              <button 
                onClick={() => setActiveTab('investment')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
              >
                Investment Calculator
              </button>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center justify-center gap-3">
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
      </section>

      {/* Why Nairobi Now */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Nairobi? Why Now?
            </h2>
            <p className="text-xl text-gray-600">
              The UN's Africa hub expansion creates unprecedented real estate opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {whyNairobiNow.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-5xl font-bold text-blue-600 mb-2">{item.stat}</div>
                <div className="text-lg font-semibold text-gray-900 mb-2">{item.label}</div>
                <div className="text-sm text-gray-600">{item.detail}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audiences */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Who We Serve
            </h2>
            <p className="text-xl text-gray-600">
              Specialized services for international clients
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {targetAudiences.map((audience, index) => {
              const Icon = audience.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-lg"
                >
                  <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{audience.title}</h3>
                  <p className="text-gray-600 mb-6">{audience.description}</p>
                  <ul className="space-y-2">
                    {audience.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Investment Opportunities */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Investment Opportunities
            </h2>
            <p className="text-xl text-gray-600">
              Transparent, managed investments with attractive returns
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
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{opp.title}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{opp.roi}</span>
                    <span className="text-blue-200">expected returns</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="text-sm text-green-700 font-medium">Minimum Investment</div>
                    <div className="text-2xl font-bold text-green-900">{opp.minInvestment}</div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">{opp.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {opp.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-700">
                        <Shield className="w-4 h-4 text-green-600 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    to="/contact?inquiry=investment"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-semibold transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services for International Clients */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Services Designed for You
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need, no matter where you are
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Video,
                title: 'Virtual Property Tours',
                description: 'HD video tours, 360° views, and live virtual walkthroughs'
              },
              {
                icon: DollarSign,
                title: 'Multi-Currency Transactions',
                description: 'Pay in USD, EUR, GBP or KES with transparent exchange rates'
              },
              {
                icon: Home,
                title: 'Remote Property Management',
                description: 'Full management service - we handle everything from abroad'
              },
              {
                icon: Shield,
                title: 'Legal & Visa Support',
                description: 'Navigate Kenya property laws and visa requirements'
              },
              {
                icon: TrendingUp,
                title: 'Investment Reporting',
                description: 'Monthly statements, tax documents, and ROI tracking'
              },
              {
                icon: Users,
                title: 'Relocation Assistance',
                description: 'Complete support for your move to Nairobi'
              }
            ].map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all"
                >
                  <Icon className="w-12 h-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Invest in Nairobi's Future?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Schedule a consultation with our international property specialists
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/contact?type=international"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all inline-flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Schedule Consultation
            </Link>
            <Link
              to="/properties?category=international"
              className="bg-blue-800 hover:bg-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all inline-flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              View Properties
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              international@raslipwani.com
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              +254 (WhatsApp for international clients)
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default InternationalHub;
