import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../components/Icon';
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
      icon: 'cog', 
      component: GeneralSettings,
      color: 'blue'
    },
    { 
      id: 'cloudinary', 
      label: 'Cloudinary', 
      description: 'Image storage and CDN settings',
      icon: 'cloud', 
      component: CloudinarySettings,
      color: 'purple'
    },
    { 
      id: 'email', 
      label: 'Email', 
      description: 'Email notifications and templates',
      icon: 'envelope', 
      component: EmailSettings,
      color: 'green'
    },
    { 
      id: 'business', 
      label: 'Business Hours', 
      description: 'Operating hours and availability',
      icon: 'clock', 
      component: BusinessHoursSettings,
      color: 'yellow'
    },
    { 
      id: 'localization', 
      label: 'Localization', 
      description: 'Language and regional settings',
      icon: 'globe', 
      component: LocalizationSettings,
      color: 'indigo'
    },
    { 
      id: 'advanced', 
      label: 'Advanced', 
      description: 'Developer and advanced options',
      icon: 'tools', 
      component: AdvancedSettings,
      color: 'red'
    }
  ];

  const colorClasses = {
    blue: 'bg-brand-subtle text-brand',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-success-surface text-success-content',
    yellow: 'bg-warning-surface text-warning-content',
    indigo: 'bg-indigo-100 text-indigo-600',
    red: 'bg-danger-surface text-danger-content'
  };

  const borderColorClasses = {
    blue: 'border-brand',
    purple: 'border-purple-500',
    green: 'border-success-border',
    yellow: 'border-warning-border',
    indigo: 'border-indigo-500',
    red: 'border-danger-border'
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
    <div className="min-h-screen bg-surface p-3 sm:p-4 lg:p-6 pb-20 md:pb-6">
      <Helmet>
        <title>Settings - Raslipwani Properties Admin</title>
      </Helmet>

      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-3xl font-bold text-content">Settings</h1>
        <p className="text-sm md:text-base text-content-muted mt-1">Manage system configuration</p>
      </div>

      {/* Mobile Accordion View */}
      {isMobile && (
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Component = tab.component;
            const isExpanded = expandedAccordion === tab.id;
            
            return (
              <div 
                key={tab.id} 
                className={`bg-surface-raised rounded-xl shadow-sm overflow-hidden transition-all ${
                  isExpanded ? `border-l-4 ${borderColorClasses[tab.color]}` : 'border border-line'
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
                    <Icon name={tab.icon} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-content text-base">{tab.label}</h3>
                    <p className="text-xs text-content-subtle truncate">{tab.description}</p>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-content-subtle"
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
                      <div className="px-4 pb-4 border-t border-line">
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
        <div className="bg-surface-raised rounded-lg shadow-md overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b bg-surface">
            <div className="flex gap-1 px-4 lg:px-6">
              {tabs.map((tab) => {
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 -mb-[2px] ${
                      activeTab === tab.id
                        ? `text-brand border-brand bg-surface-raised`
                        : 'text-content-muted hover:text-content hover:bg-surface-sunken border-transparent'
                    }`}
                  >
                    <Icon name={tab.icon} size={18} />
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
