import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import your translation files directly
import enTranslations from './messages/en.json';
import deTranslations from './messages/de.json';

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Init i18next
  .init({
    debug: process.env.NODE_ENV === 'development', // Enable debug output in development
    fallbackLng: 'en', // Fallback language if detection fails
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    resources: {
      en: {
        translation: enTranslations, // Use the imported JSON
      },
      de: {
        translation: deTranslations, // Use the imported JSON
      },
    },
    // Configuration for LanguageDetector (optional, customize as needed)
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],

      // Keys or params to lookup language from
      lookupLocalStorage: 'appSettings.locale', // Sync with our settings context key if possible
      // lookupQuerystring: 'lng',
      // lookupCookie: 'i18next',
      // lookupFromPathIndex: 0,
      // lookupFromSubdomainIndex: 0,

      // Cache user language on
      caches: ['localStorage'], // Cache detected language in localStorage (i18next will use its own key)
      // excludeCacheFor: ['cimode'], // Languages to not follow the cache

      // Optional htmlTag update, set lang attr on <html> (usually handled by react-helmet or next/head)
      // htmlTag: document.documentElement,

      // Optional set cookie options: 
      // cookieOptions: { path: '/', sameSite: 'strict' }
    }
  });

export default i18n; 
