import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FaCog,
  FaCloud,
  FaEnvelope,
  FaClock,
  FaGlobe,
  FaTools
} from 'react-icons/fa';
import GeneralSettings from './settings/GeneralSettings';
import CloudinarySettings from './settings/CloudinarySettings';
import EmailSettings from './settings/EmailSettings';
import BusinessHoursSettings from './settings/BusinessHoursSettings';
import LocalizationSettings from './settings/LocalizationSettings';
import AdvancedSettings from './settings/AdvancedSettings';

/**
 * Settings - Main settings/configuration page with tabbed interface
 * Features: All system configuration in one place with organized tabs
 */
const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: FaCog, component: GeneralSettings },
    { id: 'cloudinary', label: 'Cloudinary', icon: FaCloud, component: CloudinarySettings },
    { id: 'email', label: 'Email', icon: FaEnvelope, component: EmailSettings },
    { id: 'business', label: 'Business Hours', icon: FaClock, component: BusinessHoursSettings },
    { id: 'localization', label: 'Localization', icon: FaGlobe, component: LocalizationSettings },
    { id: 'advanced', label: 'Advanced', icon: FaTools, component: AdvancedSettings }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Helmet>
        <title>Settings - Raslipwani Properties Admin</title>
      </Helmet>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage system configuration and preferences</p>
      </div>

      {/* Settings Container */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b bg-gray-50 overflow-x-auto">
          <div className="flex gap-1 px-2 sm:px-4 lg:px-6 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-medium transition text-sm sm:text-base whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="text-base sm:text-lg" />
                  <span className="hidden xs:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-3 sm:p-4 lg:p-6">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
