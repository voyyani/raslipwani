import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import AuthButtons from './AuthButtons';

const Header = ({ toggleMenu }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
        <img
            src="https://res.cloudinary.com/dzqdxosk2/image/upload/v1750188349/raslipwanilogo_kryuwa.jpg"
            alt="Raslipwani Logo"
            className="w-16 h-16 rounded-xl object-cover border-2 border-dashed"
          />
          <div>
            <h1 className="text-2xl font-bold text-primary">Raslipwani Properties</h1>
            <p className="text-sm text-secondary">Your Trusted Real Estate Partner</p>
          </div>
        </Link>
        
        <nav className="hidden md:flex space-x-8">
          <NavLink 
            to="/" 
            className={({isActive}) => 
              `font-medium ${isActive ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-primary'}`
            }
          >
            Home
          </NavLink>
          <NavLink 
            to="/properties" 
            className={({isActive}) => 
              `font-medium ${isActive ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-primary'}`
            }
          >
            Properties
          </NavLink>
          <NavLink 
            to="/services" 
            className={({isActive}) => 
              `font-medium ${isActive ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-primary'}`
            }
          >
            Services
          </NavLink>
          <NavLink 
            to="/about" 
            className={({isActive}) => 
              `font-medium ${isActive ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-primary'}`
            }
          >
            About
          </NavLink>
          <NavLink 
            to="/contact" 
            className={({isActive}) => 
              `font-medium ${isActive ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-primary'}`
            }
          >
            Contact
          </NavLink>
        </nav>
        
        <div className="flex items-center gap-4">
          <AuthButtons />
          
          {/* Mobile menu button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden text-gray-700 hover:text-primary focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;