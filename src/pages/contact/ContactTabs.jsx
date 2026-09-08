import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../components/Icon';

const TABS = [
  { id: 'general', icon: 'envelope', label: 'General Inquiry' },
  { id: 'buying', icon: 'home', label: 'Buying' },
  { id: 'selling', icon: 'building', label: 'Selling' },
  { id: 'investment', icon: 'city', label: 'Investment' },
];

/**
 * The four kinds of enquiry the contact form can take. Moved out of
 * `Contact.jsx` (Task 26); the four near-identical buttons the page repeated
 * are now one map over `TABS`.
 */
const ContactTabs = ({ activeTab, onChange }) => (
  <div className="border-b border-line">
    <div className="flex overflow-x-auto">
      {TABS.map(({ id, icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
            activeTab === id
              ? 'border-primary text-primary'
              : 'border-transparent text-content-subtle hover:text-content'
          }`}
        >
          <Icon name={icon} className="mr-2" />
          {label}
        </button>
      ))}
    </div>
  </div>
);

ContactTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ContactTabs;
