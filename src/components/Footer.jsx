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
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='40' cy='40' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Subtle top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info - Enhanced */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src="https://res.cloudinary.com/dzqdxosk2/image/upload/v1751885050/Raslipwani_Logo_qgwaen.jpg"
                  alt="Raslipwani Properties - Premier Real Estate in Kenya"
                  className="w-14 h-14 rounded-xl object-cover border-2 border-primary/80 shadow-lg transition-all duration-300 hover:border-primary hover:shadow-xl"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent leading-tight">
                  Raslipwani Properties
                </h3>
                <p className="text-gray-300 mt-2 text-sm leading-relaxed">
                  Your premier real estate partner across Kenya. Connecting dreams with exceptional properties nationwide.
                </p>
              </div>
            </div>
            
            {/* Enhanced Social Links */}
            <div className="flex space-x-3 pt-4">
              {[
                { icon: 'fab fa-facebook', href: 'https://www.facebook.com/raslipwani/', label: 'Facebook', color: 'hover:bg-blue-500' },
                { icon: 'fab fa-instagram', href: 'https://www.instagram.com/raslipwani/', label: 'Instagram', color: 'hover:bg-gradient-to-r from-purple-500 to-pink-500' },
                { icon: 'fab fa-tiktok', href: 'https://www.tiktok.com/@raslipwani0', label: 'TikTok', color: 'hover:bg-gray-800' },
                { icon: 'fab fa-linkedin', href: 'https://linkedin.com/company/raslipwani', label: 'LinkedIn', color: 'hover:bg-blue-600' },
                { icon: 'fab fa-twitter', href: 'https://twitter.com/raslipwani', label: 'Twitter', color: 'hover:bg-blue-400' }
              ].map((social, index) => (
                <a 
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-700/80 hover:bg-primary rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg backdrop-blur-sm"
                  aria-label={social.label}
                >
                  <i className={`${social.icon} text-white text-sm`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links - Enhanced */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-3 border-b border-gray-700/80 relative">
              Quick Links
              <div className="absolute bottom-0 left-0 w-10 h-0.5 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path}
                    className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group py-1.5 rounded-lg hover:bg-white/5 px-2 -mx-2"
                  >
                    <svg className="w-3 h-3 text-primary mr-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 -translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="group-hover:translate-x-1 transition-transform duration-300 text-sm">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Services - Enhanced */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-3 border-b border-gray-700/80 relative">
              Our Services
              <div className="absolute bottom-0 left-0 w-10 h-0.5 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
            </h4>
            <ul className="space-y-2.5">
              {services.map((service, index) => (
                <li key={index}>
                  <div className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group py-1.5 rounded-lg hover:bg-white/5 px-2 -mx-2 cursor-pointer">
                    <svg className="w-3 h-3 text-primary mr-3 opacity-70 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{service}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information - Enhanced */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-3 border-b border-gray-700/80 relative">
              Get In Touch
              <div className="absolute bottom-0 left-0 w-10 h-0.5 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
            </h4>
            <div className="space-y-4">
              <div className="flex items-start group p-2 rounded-lg hover:bg-white/5 transition-all duration-300">
                <div className="w-9 h-9 bg-primary/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary/30 transition-colors flex-shrink-0">
                  <i className="fas fa-map-marker-alt text-primary text-xs"></i>
                </div>
                <div>
                  <p className="text-gray-300 group-hover:text-white transition-colors font-medium text-sm">Headquarters</p>
                  <p className="text-gray-400 text-xs mt-1">Kilifi, Kenya</p>
                  <p className="text-gray-400 text-xs">Services Nationwide</p>
                </div>
              </div>

              <a href="tel:+254758066526" className="flex items-start group p-2 rounded-lg hover:bg-white/5 transition-all duration-300">
                <div className="w-9 h-9 bg-primary/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary/30 transition-colors flex-shrink-0">
                  <i className="fas fa-phone text-primary text-xs"></i>
                </div>
                <div>
                  <p className="text-gray-300 group-hover:text-white transition-colors font-medium text-sm">+254 758 066 526</p>
                  <p className="text-gray-400 text-xs mt-1">Mon-Fri, 8AM-6PM</p>
                </div>
              </a>

              <a href="mailto:info@raslipwani.co.ke" className="flex items-start group p-2 rounded-lg hover:bg-white/5 transition-all duration-300">
                <div className="w-9 h-9 bg-primary/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary/30 transition-colors flex-shrink-0">
                  <i className="fas fa-envelope text-primary text-xs"></i>
                </div>
                <div>
                  <p className="text-gray-300 group-hover:text-white transition-colors font-medium text-sm">info@raslipwani.co.ke</p>
                  <p className="text-gray-400 text-xs mt-1">Quick response guaranteed</p>
                </div>
              </a>
            </div>

            {/* Enhanced Locations Served */}
            <div className="mt-6 pt-6 border-t border-gray-700/80">
              <p className="text-gray-300 font-medium mb-3 text-sm">Serving Key Locations:</p>
              <div className="flex flex-wrap gap-1.5">
                {locations.map((location, index) => (
                  <span 
                    key={index}
                    className="px-2.5 py-1 bg-gray-700/50 rounded-full text-gray-300 text-xs border border-gray-600/50 hover:border-primary/50 hover:text-white transition-all duration-300 cursor-pointer backdrop-blur-sm"
                  >
                    {location}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Bar */}
        <div className="border-t border-gray-700/80 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-gray-400 text-sm text-center lg:text-left">
              <p>
                &copy; {currentYear} Raslipwani Properties. All rights reserved. 
                <span className="mx-2 hidden sm:inline">•</span>
                <br className="sm:hidden" />
                <span className="text-gray-500">Premier Real Estate Services Across Kenya</span>
              </p>
            </div>
            
            <div className="flex items-center space-x-5 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-xs hover:underline">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-xs hover:underline">
                Terms of Service
              </Link>
              <div className="text-gray-500 text-xs">
                Crafted by{' '}
                <a 
                  href="https://voyani.tech" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors font-medium"
                >
                  Voyani
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Floating CTA for Mobile */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <a 
          href="https://wa.me/254758066526"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 animate-soft-bounce"
          aria-label="Chat on WhatsApp"
        >
          <i className="fab fa-whatsapp text-white text-xl"></i>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
        </a>
      </div>

      {/* Enhanced Desktop CTA */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-50">
        <a 
          href="https://wa.me/254758066526"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 group"
          aria-label="Chat on WhatsApp"
        >
          <i className="fab fa-whatsapp text-white text-lg group-hover:scale-110 transition-transform"></i>
          <span className="text-sm font-semibold">Chat with us</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </a>
      </div>
    </footer>
  );
};

export default Footer;