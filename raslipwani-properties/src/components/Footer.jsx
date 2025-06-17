import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Raslipwani Properties</h3>
            <p className="text-gray-300 mb-4">
              Your Trusted Real Estate Partner on the Kenyan Coast
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <span className="sr-only">Facebook</span>
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <span className="sr-only">Instagram</span>
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <span className="sr-only">TikTok</span>
                <i className="fab fa-tiktok text-xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <span className="sr-only">WhatsApp</span>
                <i className="fab fa-whatsapp text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link to="/properties" className="text-gray-300 hover:text-white">Properties</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-white">Services</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Property Sales</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Property Purchases</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Property Valuation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Property Management</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <address className="text-gray-300 not-italic">
              <p className="mb-2">Kikambala, Kilifi County, Kenya</p>
              <p className="mb-2">Phone: +254 758 066 526</p>
              <p className="mb-2">Email: raslipwani@gmail.com</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Raslipwani Properties. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;