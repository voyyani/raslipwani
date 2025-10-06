import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Properties', path: '/properties' },
    { name: 'Services', path: '/services' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const services = [
    'Property Sales',
    'Property Acquisition', 
    'Property Valuation',
    'Property Management',
    'Investment Consulting'
  ];

  const locations = [
    'Nairobi',
    'Mombasa',
    'Kilifi',
    'Diani',
    'Naivasha',
    'Malindi'
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src="https://res.cloudinary.com/dzqdxosk2/image/upload/v1751885050/Raslipwani_Logo_qgwaen.jpg"
                  alt="Raslipwani Properties - Premier Real Estate in Kenya"
                  className="w-16 h-16 rounded-xl object-cover border-2 border-primary shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Raslipwani Properties
                </h3>
                <p className="text-gray-300 mt-2 text-sm leading-relaxed">
                  Your premier real estate partner across Kenya. Connecting dreams with exceptional properties nationwide.
                </p>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4 pt-4">
              {[
                { icon: 'fab fa-facebook', href: 'https://www.facebook.com/raslipwani/', label: 'Facebook' },
                { icon: 'fab fa-instagram', href: 'https://www.instagram.com/raslipwani/', label: 'Instagram' },
                { icon: 'fab fa-tiktok', href: 'https://www.tiktok.com/@raslipwani0', label: 'TikTok' },
                { icon: 'fab fa-linkedin', href: 'https://linkedin.com/company/raslipwani', label: 'LinkedIn' },
                { icon: 'fab fa-twitter', href: 'https://twitter.com/raslipwani', label: 'Twitter' }
              ].map((social, index) => (
                <a 
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 hover:bg-primary rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                  aria-label={social.label}
                >
                  <i className={`${social.icon} text-white text-lg`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-3 border-b border-gray-700 relative">
              Quick Links
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-primary"></div>
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path}
                    className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group py-2"
                  >
                    <svg className="w-3 h-3 text-primary mr-3 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-3 border-b border-gray-700 relative">
              Our Services
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-primary"></div>
            </h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <div className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group py-2 cursor-pointer">
                    <svg className="w-3 h-3 text-primary mr-3 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{service}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-3 border-b border-gray-700 relative">
              Get In Touch
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-primary"></div>
            </h4>
            <div className="space-y-4">
              <div className="flex items-start group">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary/30 transition-colors">
                  <i className="fas fa-map-marker-alt text-primary text-sm"></i>
                </div>
                <div>
                  <p className="text-gray-300 group-hover:text-white transition-colors font-medium">Headquarters</p>
                  <p className="text-gray-400 text-sm mt-1">Kilifi, Kenya</p>
                  <p className="text-gray-400 text-sm">Services Nationwide</p>
                </div>
              </div>

              <a href="tel:+254758066526" className="flex items-start group">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary/30 transition-colors">
                  <i className="fas fa-phone text-primary text-sm"></i>
                </div>
                <div>
                  <p className="text-gray-300 group-hover:text-white transition-colors font-medium">+254 758 066 526</p>
                  <p className="text-gray-400 text-sm mt-1">Mon-Fri, 8AM-6PM</p>
                </div>
              </a>

              <a href="mailto:info@raslipwani.co.ke" className="flex items-start group">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary/30 transition-colors">
                  <i className="fas fa-envelope text-primary text-sm"></i>
                </div>
                <div>
                  <p className="text-gray-300 group-hover:text-white transition-colors font-medium">info@raslipwani.co.ke</p>
                  <p className="text-gray-400 text-sm mt-1">Quick response guaranteed</p>
                </div>
              </a>
            </div>

            {/* Locations Served */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-300 font-medium mb-3">Serving Key Locations:</p>
              <div className="flex flex-wrap gap-2">
                {locations.map((location, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-700/50 rounded-full text-gray-300 text-xs border border-gray-600 hover:border-primary transition-colors cursor-pointer"
                  >
                    {location}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-gray-400 text-sm">
              <p>
                &copy; {currentYear} Raslipwani Properties. All rights reserved. 
                <span className="mx-2">•</span>
                Premier Real Estate Services Across Kenya
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <div className="text-gray-400">
                Designed by{' '}
                <a 
                  href="https://voyani.tech" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary transition-colors font-medium"
                >
                  Voyani
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating CTA for Mobile */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <a 
          href="https://wa.me/254758066526"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 animate-pulse"
          aria-label="Chat on WhatsApp"
        >
          <i className="fab fa-whatsapp text-white text-2xl"></i>
        </a>
      </div>
    </footer>
  );
};

export default Footer;