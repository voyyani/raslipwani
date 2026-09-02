import { logger } from './logger';

// Currency conversion utilities for international clients
// Note: Base currencies are defined here. For dynamic currency settings, 
// use the SettingsContext to override the default currency.

// Default currencies (can be extended via admin settings)
export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', rate: 1, locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', rate: 0.92, locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', rate: 0.79, locale: 'en-GB' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', rate: 129.5, locale: 'en-KE' }
};

// Mutable currency config that can be updated from settings
let currencyConfig = { ...CURRENCIES };

/**
 * Update currency configuration from admin settings
 * @param {object} settings - Currency settings from admin_settings table
 */
export const updateCurrencyFromSettings = (settings) => {
  if (settings?.currency) {
    const { code, symbol, rate, locale } = settings.currency;
    if (code && currencyConfig[code]) {
      currencyConfig[code] = {
        ...currencyConfig[code],
        symbol: symbol || currencyConfig[code].symbol,
        rate: rate || currencyConfig[code].rate,
        locale: locale || currencyConfig[code].locale
      };
    }
  }
  // Update exchange rates if provided
  if (settings?.exchange_rates) {
    Object.entries(settings.exchange_rates).forEach(([code, rate]) => {
      if (currencyConfig[code]) {
        currencyConfig[code].rate = rate;
      }
    });
  }
};

/**
 * Get current currency configuration
 * @returns {object} Current currency config
 */
export const getCurrencyConfig = () => currencyConfig;

/**
 * Convert amount from base currency (USD) to target currency
 * @param {number} amount - Amount in USD
 * @param {string} toCurrency - Target currency code (USD, EUR, GBP, KES)
 * @returns {number} Converted amount
 */
export const convertCurrency = (amount, toCurrency = 'USD') => {
  const currency = currencyConfig[toCurrency] || CURRENCIES[toCurrency];
  if (!currency) {
    logger.warn(`Currency ${toCurrency} not supported, defaulting to USD`);
    return amount;
  }
  return amount * currency.rate;
};

/**
 * Format amount with currency symbol and locale-specific formatting
 * @param {number} amount - Amount in USD (base currency)
 * @param {string} currency - Target currency code
 * @param {boolean} convertFirst - Whether to convert from USD first
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', convertFirst = true) => {
  const currencyData = currencyConfig[currency] || CURRENCIES[currency];
  
  if (!currencyData) {
    logger.warn(`Currency ${currency} not supported, defaulting to USD`);
    return `$${amount.toLocaleString('en-US')}`;
  }

  const finalAmount = convertFirst ? convertCurrency(amount, currency) : amount;

  // Special handling for KES (no decimals)
  if (currency === 'KES') {
    return `${currencyData.symbol} ${Math.round(finalAmount).toLocaleString(currencyData.locale)}`;
  }

  return new Intl.NumberFormat(currencyData.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(finalAmount);
};

/**
 * Get exchange rate info for display
 * @param {string} fromCurrency 
 * @param {string} toCurrency 
 * @returns {object} Exchange rate information
 */
export const getExchangeRate = (fromCurrency = 'USD', toCurrency = 'KES') => {
  const from = currencyConfig[fromCurrency] || CURRENCIES[fromCurrency];
  const to = currencyConfig[toCurrency] || CURRENCIES[toCurrency];
  
  if (!from || !to) {
    return null;
  }

  const rate = to.rate / from.rate;
  
  return {
    from: fromCurrency,
    to: toCurrency,
    rate: rate,
    formatted: `1 ${fromCurrency} = ${rate.toFixed(2)} ${toCurrency}`,
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Format currency range (e.g., for property prices)
 * @param {number} minAmount 
 * @param {number} maxAmount 
 * @param {string} currency 
 * @returns {string} Formatted range
 */
export const formatCurrencyRange = (minAmount, maxAmount, currency = 'USD') => {
  const min = formatCurrency(minAmount, currency);
  const max = formatCurrency(maxAmount, currency);
  return `${min} - ${max}`;
};

/**
 * Parse currency string back to number
 * @param {string} currencyString 
 * @returns {number} Numeric value
 */
export const parseCurrency = (currencyString) => {
  return parseFloat(currencyString.replace(/[^0-9.-]+/g, ''));
};

/**
 * React hook for currency selection and conversion
 * @returns {object} Currency utilities
 */
export const useCurrency = () => {
  const [selectedCurrency, setSelectedCurrency] = React.useState(() => {
    // Try to get from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('preferredCurrency') || 'KES';
    }
    return 'KES';
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredCurrency', selectedCurrency);
    }
  }, [selectedCurrency]);

  const convert = (amount) => convertCurrency(amount, selectedCurrency);
  const format = (amount, convertFirst = true) => formatCurrency(amount, selectedCurrency, convertFirst);
  
  return {
    currency: selectedCurrency,
    setCurrency: setSelectedCurrency,
    convert,
    format,
    currencies: currencyConfig,
    exchangeRate: getExchangeRate('USD', selectedCurrency)
  };
};

// React component for currency selector
import React from 'react';
import { Globe } from 'lucide-react';

export const CurrencySelector = ({ value, onChange, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="w-4 h-4 text-gray-500" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm font-medium"
      >
        {Object.entries(currencyConfig).map(([code, curr]) => (
          <option key={code} value={code}>
            {curr.symbol} {code}
          </option>
        ))}
      </select>
    </div>
  );
};

export default {
  CURRENCIES,
  convertCurrency,
  formatCurrency,
  formatCurrencyRange,
  getExchangeRate,
  parseCurrency,
  useCurrency,
  CurrencySelector,
  updateCurrencyFromSettings,
  getCurrencyConfig
};
