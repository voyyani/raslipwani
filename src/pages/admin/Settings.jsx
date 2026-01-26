import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCog,
  FaCloud,
  FaEnvelope,
  FaClock,
  FaGlobe,
  FaTools,
  FaChevronDown
} from 'react-icons/fa';
import GeneralSettings from './settings/GeneralSettings';
import CloudinarySettings from './settings/CloudinarySettings';
import EmailSettings from './settings/EmailSettings';
import BusinessHoursSettings from './settings/BusinessHoursSettings';
import LocalizationSettings from './settings/LocalizationSettings';
import AdvancedSettings from './settings/AdvancedSettings';

/**
 * Settings - Main settings/configuration page with responsive interface
 * Features: Desktop tabs, Mobile accordion, smooth animations
 */
const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [expandedAccordion, setExpandedAccordion] = useState('general');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabs = [
    { 
      id: 'general', 
      label: 'General', 
      description: 'Basic site settings and branding',
      icon: FaCog, 
      component: GeneralSettings,
      color: 'blue'
    },
    { 
      id: 'cloudinary', 
      label: 'Cloudinary', 
      description: 'Image storage and CDN settings',
      icon: FaCloud, 
      component: CloudinarySettings,
      color: 'purple'
    },
    { 
      id: 'email', 
      label: 'Email', 
      description: 'Email notifications and templates',
      icon: FaEnvelope, 
      component: EmailSettings,
      color: 'green'
    },
    { 
      id: 'business', 
      label: 'Business Hours', 
      description: 'Operating hours and availability',
      icon: FaClock, 
      component: BusinessHoursSettings,
      color: 'yellow'
    },
    { 
      id: 'localization', 
      label: 'Localization', 
      description: 'Language and regional settings',
      icon: FaGlobe, 
      component: LocalizationSettings,
      color: 'indigo'
    },
    { 
      id: 'advanced', 
      label: 'Advanced', 
      description: 'Developer and advanced options',
      icon: FaTools, 
      component: AdvancedSettings,
      color: 'red'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    red: 'bg-red-100 text-red-600'
  };

  const borderColorClasses = {
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    green: 'border-green-500',
    yellow: 'border-yellow-500',
    indigo: 'border-indigo-500',
    red: 'border-red-500'
  };

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  // Toggle accordion on mobile
  const toggleAccordion = (tabId) => {
    setExpandedAccordion(expandedAccordion === tabId ? null : tabId);
  };

  // Haptic feedback
  const haptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6 pb-20 md:pb-6">
      <Helmet>
        <title>Settings - Raslipwani Properties Admin</title>
      </Helmet>

      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Manage system configuration</p>
      </div>

      {/* Mobile Accordion View */}
      {isMobile && (
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const Component = tab.component;
            const isExpanded = expandedAccordion === tab.id;
            
            return (
              <div 
                key={tab.id} 
                className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
                  isExpanded ? `border-l-4 ${borderColorClasses[tab.color]}` : 'border border-gray-100'
                }`}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => {
                    haptic();
                    toggleAccordion(tab.id);
                  }}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[tab.color]}`}>
                    <Icon className="text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base">{tab.label}</h3>
                    <p className="text-xs text-gray-500 truncate">{tab.description}</p>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-400"
                  >
                    <FaChevronDown />
                  </motion.div>
                </button>

                {/* Accordion Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="pt-4">
                          <Component />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Desktop Tabbed View */}
      {!isMobile && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b bg-gray-50">
            <div className="flex gap-1 px-4 lg:px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 -mb-[2px] ${
                      activeTab === tab.id
                        ? `text-blue-600 border-blue-600 bg-white`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent'
                    }`}
                  >
                    <Icon className="text-lg" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 lg:p-6">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
