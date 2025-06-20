import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthButtons from './AuthButtons';
import { FiX } from 'react-icons/fi';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/properties', label: 'Properties' },
    { path: '/services', label: 'Services' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center gap-3"
            onClick={closeMenu}
          >
            <img
              src="https://res.cloudinary.com/dzqdxosk2/image/upload/v1750188349/raslipwanilogo_kryuwa.jpg"
              alt="Raslipwani Logo"
              className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover border-2 border-dashed"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-primary">
                Raslipwani Properties
              </h1>
              <p className="hidden md:block text-sm text-secondary">
                Your Trusted Real Estate Partner
              </p>
            </div>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <NavLink 
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `relative font-medium transition-colors duration-300
                   ${isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'}`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.div 
                        className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary"
                        layoutId="header-underline"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <AuthButtons />
            </div>
            
            <button 
              onClick={toggleMenu}
              className="md:hidden text-gray-700 hover:text-primary transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
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
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={closeMenu}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 md:hidden"
            >
              <div className="p-5 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-primary">Menu</h2>
                <button 
                  onClick={closeMenu}
                  className="text-gray-500 hover:text-primary"
                  aria-label="Close menu"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="flex flex-col py-4">
                {navItems.map((item) => (
                  <NavLink 
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    className={({ isActive }) => 
                      `px-6 py-3 font-medium transition-colors duration-300
                       ${isActive 
                          ? 'text-primary bg-primary/10 border-l-4 border-primary' 
                          : 'text-gray-700 hover:bg-gray-50'}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              
              <div className="absolute bottom-0 w-full p-4 border-t">
                <AuthButtons mobile={true} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;