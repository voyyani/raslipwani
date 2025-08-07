import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Logo + Description + Socials */}
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <img
                src="https://res.cloudinary.com/dzqdxosk2/image/upload/v1751885050/Raslipwani_Logo_qgwaen.jpg"
                alt="Raslipwani Logo"
                className="w-14 h-14 rounded-xl object-cover border-2 border-dashed border-white"
              />
              <div>
                <h3 className="text-xl font-bold">Raslipwani Properties</h3>
                <p className="text-gray-300 mt-1 text-sm">
                  Your Trusted Real Estate Partner on the Kenyan Coast
                </p>
              </div>
            </div>
            
            <div className="flex space-x-5">
              <a 
                href="https://www.facebook.com/raslipwani/" 
                className="text-gray-300 hover:text-white transition-colors duration-300"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook text-2xl"></i>
              </a>
              <a 
                href="https://www.instagram.com/raslipwani/" 
                className="text-gray-300 hover:text-white transition-colors duration-300"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram text-2xl"></i>
              </a>
              <a 
                href="https://www.tiktok.com/@raslipwani0?_t=ZM-8xJKXLTzNkm&_r=1" 
                className="text-gray-300 hover:text-white transition-colors duration-300"
                aria-label="TikTok"
              >
                <i className="fab fa-tiktok text-2xl"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-5 pb-2 border-b border-gray-700">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {['Home', 'Properties', 'Services', 'About', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item === 'Home' ? '' : item.toLowerCase().replace(' ', '-')}`} 
                    className="text-gray-300 hover:text-white transition-colors duration-300 flex items-start group"
                  >
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-5 pb-2 border-b border-gray-700">
              Contact Us
            </h4>
            <address className="text-gray-300 not-italic space-y-3">
              <p className="flex items-start">
                <i className="fas fa-map-marker-alt text-primary mr-3 mt-1"></i>
                <span>Kikambala, Kilifi County, Kenya</span>
              </p>
              <p>
                <a 
                  href="tel:+254758066526" 
                  className="flex items-start hover:text-white transition-colors duration-300"
                >
                  <i className="fas fa-phone text-primary mr-3 mt-1"></i>
                  <span>+254 758 066 526</span>
                </a>
              </p>
              <p>
                <a 
                  href="mailto:info@raslipwani.co.ke" 
                  className="flex items-start hover:text-white transition-colors duration-300"
                >
                  <i className="fas fa-envelope text-primary mr-3 mt-1"></i>
                  <span>info@raslipwani.co.ke</span>
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-gray-700 mt-10 pt-8 text-center text-gray-400">
          <p>
            &copy; {currentYear} Raslipwani Properties. Designed by{' '}
            <a 
              href="https://voyani.tech" 
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              Voyani
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;