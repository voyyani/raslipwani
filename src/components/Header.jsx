import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthButtons from './AuthButtons';
import { FiX, FiChevronDown, FiChevronUp, FiMenu } from 'react-icons/fi';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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
    { path: '/', label: 'Home' },
    { 
      label: 'For Sale', 
      dropdown: [
        { path: '/properties?type=land&purpose=sale', label: 'Land' },
        { path: '/properties?type=houses&purpose=sale', label: 'Houses' },
        { path: '/properties?type=commercial&purpose=sale', label: 'Commercial' }
      ]
    },
    { 
      label: 'For Rent', 
      dropdown: [
        { path: '/properties?type=apartments&purpose=rent', label: 'Apartments' },
        { path: '/properties?type=villas&purpose=rent', label: 'Villas' },
        { path: '/properties?type=offices&purpose=rent', label: 'Office Spaces' }
      ]
    },
    { path: '/services', label: 'Services' },
    { path: '/about', label: 'About' },
    { path: '/construction', label: 'Construction Support' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenMobileDropdown(null);
  };

  // FIXED: Properly compare path and query parameters
  const isActiveDropdown = (dropdownItems) => {
    return dropdownItems.some(item => {
      const url = new URL(item.path, window.location.origin);
      return location.pathname === url.pathname && 
             location.search === url.search;
    });
  };

  return (
    <>
      <header className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-lg py-2 border-b border-gray-100' : 'py-3'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center gap-3"
            onClick={closeMenu}
          >
            <img
              src="https://res.cloudinary.com/dzqdxosk2/image/upload/v1750188349/raslipwanilogo_kryuwa.jpg"
              alt="Raslipwani Logo"
              className={`transition-all duration-300 rounded-xl object-cover border-2 border-primary ${
                isScrolled ? 'w-10 h-10' : 'w-12 h-12 md:w-16 md:h-16'
              }`}
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-primary">
                Raslipwani Properties
              </h1>
              <p className="hidden md:block text-sm text-gray-600">
                Your Trusted Real Estate Partner
              </p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {navItems.map((item) => (
              <div 
                key={item.label}
                className="relative"
                onMouseEnter={() => item.dropdown && setOpenDropdown(item.label)}
                onMouseLeave={() => item.dropdown && setOpenDropdown(null)}
              >
                {item.path ? (
                  <NavLink 
                    to={item.path}
                    className={({ isActive }) => 
                      `relative font-medium transition-colors duration-200 px-4 py-2 rounded-lg
                       ${isActive ? 'text-primary bg-primary/10' : 'text-gray-700 hover:text-primary hover:bg-gray-50'}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ) : (
                  <button
                    className={`relative font-medium transition-colors duration-200 px-4 py-2 rounded-lg flex items-center
                      ${isActiveDropdown(item.dropdown) ? 'text-primary bg-primary/10' : 'text-gray-700 hover:text-primary hover:bg-gray-50'}`}
                    onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                    aria-expanded={openDropdown === item.label}
                  >
                    {item.label}
                    {openDropdown === item.label ? (
                      <FiChevronUp className="ml-1 text-sm" />
                    ) : (
                      <FiChevronDown className="ml-1 text-sm" />
                    )}
                  </button>
                )}
                
                {item.dropdown && openDropdown === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl py-2 z-20 border border-gray-100"
                  >
                    {item.dropdown.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) => 
                          `block px-6 py-3 transition-colors text-sm ${
                            isActive 
                              ? 'text-primary bg-blue-50 font-medium' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`
                        }
                        onClick={() => setOpenDropdown(null)}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <AuthButtons />
            </div>
            
            <button 
              onClick={toggleMenu}
              className="lg:hidden text-gray-700 hover:text-primary transition-colors p-2 rounded-lg hover:bg-gray-100"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={closeMenu}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-5 border-b flex justify-between items-center bg-primary text-white">
                <h2 className="text-xl font-bold">Menu</h2>
                <button 
                  onClick={closeMenu}
                  className="text-white hover:text-gray-200"
                  aria-label="Close menu"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="flex flex-col py-4">
                {navItems.map((item) => (
                  <div key={item.label} className="border-b border-gray-100 last:border-b-0">
                    {item.path ? (
                      <NavLink 
                        to={item.path}
                        onClick={closeMenu}
                        className={({ isActive }) => 
                          `block px-6 py-4 font-medium transition-colors duration-300
                           ${isActive 
                              ? 'text-primary bg-primary/10 border-l-4 border-primary' 
                              : 'text-gray-700 hover:bg-gray-50'}`
                        }
                      >
                        {item.label}
                      </NavLink>
                    ) : (
                      <div>
                        <button
                          className={`w-full text-left px-6 py-4 font-medium transition-colors duration-300 flex justify-between items-center
                            ${openMobileDropdown === item.label ? 'text-primary' : 'text-gray-700'}`}
                          onClick={() => setOpenMobileDropdown(openMobileDropdown === item.label ? null : item.label)}
                          aria-expanded={openMobileDropdown === item.label}
                        >
                          {item.label}
                          {openMobileDropdown === item.label ? (
                            <FiChevronUp className="ml-1" />
                          ) : (
                            <FiChevronDown className="ml-1" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {openMobileDropdown === item.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden bg-gray-50"
                            >
                              {item.dropdown.map((child) => (
                                <NavLink
                                  key={child.path}
                                  to={child.path}
                                  onClick={closeMenu}
                                  className={({ isActive }) => 
                                    `block px-10 py-3 transition-colors text-sm ${
                                      isActive 
                                        ? 'text-primary font-medium bg-blue-50' 
                                        : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                                    }`
                                  }
                                >
                                  {child.label}
                                </NavLink>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
              
              <div className="sticky bottom-0 w-full p-4 border-t bg-white">
                <AuthButtons mobile={true} closeMenu={closeMenu} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;