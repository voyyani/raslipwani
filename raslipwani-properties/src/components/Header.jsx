import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import AuthButtons from './AuthButtons';

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
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
        
        <AuthButtons />
      </div>
    </header>
  );
};

export default Header;