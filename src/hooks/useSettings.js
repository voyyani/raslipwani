/**
 * useSettings Hook - Convenience wrapper for SettingsContext
 * 
 * This hook provides easy access to settings throughout the application.
 * It re-exports from SettingsContext for simpler imports.
 * 
 * @example
 * import { useSettings } from '../hooks/useSettings';
 * 
 * function MyComponent() {
 *   const { siteName, logo, phone, loading } = useSettings();
 *   
 *   if (loading) return <Skeleton />;
 *   
 *   return (
 *     <header>
 *       <img src={logo()} alt={siteName()} />
 *       <span>{phone()}</span>
 *     </header>
 *   );
 * }
 * 
 * @example
 * // Get specific category only
 * const { settings } = useSettings('localization');
 * console.log(settings.currency.symbol); // "KSh"
 * 
 * @example
 * // Get raw setting with fallback
 * const { getSetting } = useSettings();
 * const tagline = getSetting('general', 'company_tagline', 'Your Premier Real Estate Partner');
 */

export { useSettings } from '../contexts/SettingsContext';

// Re-export provider for App.jsx
export { SettingsProvider } from '../contexts/SettingsContext';
