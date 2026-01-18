import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthButtons from './AuthButtons';
import { FiX, FiChevronDown, FiChevronUp, FiMenu, FiHome, FiGrid, FiTool, FiInfo, FiHelpCircle } from 'react-icons/fi';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when route changes
  useEffect(() => {
    setOpenDropdown(null);
    setOpenMobileDropdown(null);
  }, [location]);

  const navItems = [
    { 
      path: '/', 
      label: 'Home', 
      icon: FiHome 
    },
    { 
      path: '/properties', 
      label: 'Listings', 
      icon: FiGrid 
    },
    { 
      path: '/services', 
      label: 'Services', 
      icon: FiTool 
    },
    { 
      path: '/internationalproperties', 
      label: 'International', 
      icon: FiGrid 
    },
    { 
      path: '/about', 
      label: 'About', 
      icon: FiInfo 
    },
    { 
      path: '/construction-support', 
      label: 'Construction', 
      icon: FiHelpCircle 
    },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenMobileDropdown(null);
  };

  return (
    <>
      <header className={`bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-all duration-500 ${
        isScrolled ? 'shadow-lg py-2 border-b border-gray-100/80' : 'py-4'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo & Brand */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
            onClick={closeMenu}
          >
            <div className="relative">
              <img
                src="https://res.cloudinary.com/dzqdxosk2/image/upload/v1751885050/Raslipwani_Logo_qgwaen.jpg"
                alt="Raslipwani Properties - Premium Real Estate in Kenya"
                className={`transition-all duration-500 rounded-xl object-cover border-2 border-primary shadow-lg ${
                  isScrolled ? 'w-10 h-10' : 'w-12 h-12 md:w-14 md:h-14'
                } group-hover:scale-105 group-hover:shadow-xl`}
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="flex flex-col">
              <h1 className={`font-bold text-primary transition-all duration-500 ${
                isScrolled ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'
              }`}>
                Raslipwani Properties
              </h1>
              <p className="hidden md:block text-xs text-gray-600 font-medium">
                Premium Real Estate Across Kenya
              </p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              
              // Handle dropdown menus
              if (item.dropdown) {
                return (
                  <div 
                    key={item.label} 
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      className="relative font-semibold transition-all duration-300 px-4 py-3 rounded-xl flex items-center gap-2 group text-gray-700 hover:text-primary hover:bg-gray-50/80"
                    >
                      <IconComponent className={`w-4 h-4 transition-transform duration-300 ${
                        isScrolled ? 'scale-90' : 'scale-100'
                      }`} />
                      <span className="relative">{item.label}</span>
                      <FiChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                        openDropdown === item.label ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {openDropdown === item.label && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className="block px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
                            onClick={() => setOpenDropdown(null)}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              
              // Regular menu items
              return (
                <div key={item.label} className="relative">
                  <NavLink 
                    to={item.path}
                    className={({ isActive }) => 
                      `relative font-semibold transition-all duration-300 px-4 py-3 rounded-xl flex items-center gap-2 group
                       ${isActive 
                          ? 'text-primary bg-primary/10 shadow-sm' 
                          : 'text-gray-700 hover:text-primary hover:bg-gray-50/80'}`
                    }
                  >
                    <IconComponent className={`w-4 h-4 transition-transform duration-300 ${
                      isScrolled ? 'scale-90' : 'scale-100'
                    }`} />
                    <span className="relative">
                      {item.label}
                      <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ${
                        location.pathname === item.path ? 'w-full' : 'group-hover:w-full'
                      }`}></span>
                    </span>
                  </NavLink>
                </div>
              );
            })}
          </nav>
          
          {/* Right Section - Auth & Mobile Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <AuthButtons />
            </div>
            
            {/* Mobile Menu Button */}
            <motion.button 
              onClick={toggleMenu}
              className="lg:hidden relative p-3 rounded-xl border-2 border-primary bg-white hover:bg-gray-50 transition-all duration-300 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <div className="relative w-6 h-6">
                <motion.span
                  className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  animate={isMenuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  animate={isMenuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={closeMenu}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary to-blue-600 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://res.cloudinary.com/dzqdxosk2/image/upload/v1751885050/Raslipwani_Logo_qgwaen.jpg"
                      alt="Raslipwani Properties"
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white"
                    />
                    <div>
                      <h2 className="text-lg font-bold">Raslipwani</h2>
                      <p className="text-white/80 text-xs">Properties</p>
                    </div>
                  </div>
                  <button 
                    onClick={closeMenu}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    aria-label="Close menu"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Quick Contact */}
                <div className="text-xs space-y-1">
                  <p>📞 +254 758 066 526</p>
                  <p>📧 info@raslipwani.co.ke</p>
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="flex flex-col py-2">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  // Handle dropdown menus
                  if (item.dropdown) {
                    const isDropdownOpen = openMobileDropdown === item.label;
                    return (
                      <div key={item.label} className="border-b border-gray-100 last:border-b-0">
                        <button
                          onClick={() => setOpenMobileDropdown(isDropdownOpen ? null : item.label)}
                          className="flex items-center gap-4 px-6 py-5 font-medium transition-all duration-300 group text-gray-700 hover:text-primary hover:bg-gray-50 w-full"
                        >
                          <div className="p-2 rounded-lg transition-colors bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span className="flex-1 text-left">{item.label}</span>
                          {isDropdownOpen ? (
                            <FiChevronUp className="w-5 h-5" />
                          ) : (
                            <FiChevronDown className="w-5 h-5" />
                          )}
                        </button>
                        
                        {/* Dropdown items */}
                        {isDropdownOpen && (
                          <div className="bg-gray-50 py-2">
                            {item.dropdown.map((subItem) => (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                onClick={closeMenu}
                                className="flex items-center gap-4 px-6 py-3 pl-16 text-gray-600 hover:text-primary hover:bg-white transition-colors"
                              >
                                <span>{subItem.label}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  // Regular menu items
                  return (
                    <div key={item.label} className="border-b border-gray-100 last:border-b-0">
                      <NavLink 
                        to={item.path}
                        onClick={closeMenu}
                        className={`flex items-center gap-4 px-6 py-5 font-medium transition-all duration-300 group
                         ${isActive 
                            ? 'text-primary bg-primary/5 border-r-4 border-primary' 
                            : 'text-gray-700 hover:text-primary hover:bg-gray-50'}`}
                      >
                        <div className={`p-2 rounded-lg transition-colors ${
                          isActive ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="flex-1">{item.label}</span>
                        <div className={`w-2 h-2 rounded-full transition-colors ${
                          isActive ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/30'
                        }`}></div>
                      </NavLink>
                    </div>
                  );
                })}
              </nav>
              
              {/* CTA Section */}
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Ready to find your dream property?
                  </p>
                  
                  <Link
                    to="/properties"
                    onClick={closeMenu}
                    className="block w-full bg-primary hover:bg-primary-dark text-white text-center font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg hover:shadow-xl"
                  >
                    Browse Listings
                  </Link>
                  
                  <Link
                    to="/contact"
                    onClick={closeMenu}
                    className="block w-full border-2 border-primary text-primary hover:bg-primary hover:text-white text-center font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                  >
                    Contact Us
                  </Link>
                </div>
                
                {/* Social Links */}
                <div className="flex justify-center space-x-4 mt-6 pt-6 border-t border-gray-200">
                  {[
                    { icon: 'fab fa-whatsapp', href: 'https://wa.me/254758066526', color: 'hover:text-green-500' },
                    { icon: 'fab fa-instagram', href: 'https://www.instagram.com/raslipwani/', color: 'hover:text-pink-500' },
                    { icon: 'fab fa-facebook', href: 'https://www.facebook.com/raslipwani/', color: 'hover:text-blue-500' },
                    { icon: 'fab fa-tiktok', href: 'https://www.tiktok.com/@raslipwani0', color: 'hover:text-gray-800' }
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-gray-400 ${social.color} transition-colors duration-300 text-xl`}
                      aria-label={social.icon.split('-')[1]}
                    >
                      <i className={social.icon}></i>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-blue-600"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isScrolled ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: 'left' }}
        />
      </div>
    </>
  );
};

export default Header;