import LanguageDetector from "i18next-browser-languagedetector";
import deTranslations from "./messages/de.json";
// Import your translation files directly
import enTranslations from "./messages/en.json";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Constants for language-related settings
export const LANGUAGE_STORAGE_KEY = "billingperiodallocator-language";
export const DEFAULT_LANGUAGE = "en";
export const SUPPORTED_LANGUAGES = ["en", "de"];

// Get the stored language from localStorage to prevent flashing
let storedLanguage = DEFAULT_LANGUAGE;
if (typeof window !== 'undefined') {
  // Try to get language from URL first for better SEO alignment
  const pathSegments = window.location.pathname.split('/');
  const urlLanguage = pathSegments.length > 1 && SUPPORTED_LANGUAGES.includes(pathSegments[1]) 
                     ? pathSegments[1] 
                     : null;
  
  // If not in URL, check localStorage, then browser preference
  storedLanguage = urlLanguage || 
                   localStorage.getItem(LANGUAGE_STORAGE_KEY) || 
                   (navigator.language && 
                    SUPPORTED_LANGUAGES.includes(navigator.language.substring(0, 2).toLowerCase())
                     ? navigator.language.substring(0, 2).toLowerCase()
                     : DEFAULT_LANGUAGE);
}

// Use a flag to prevent multiple consecutive language changes
let isChangingLanguage = false;

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Init i18next
  .init({
    debug: process.env.NODE_ENV === "development", // Enable debug output in development
    fallbackLng: DEFAULT_LANGUAGE, // Fallback language if detection fails
    lng: storedLanguage, // Set the initial language
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
      order: ["path", "localStorage", "cookie", "navigator", "htmlTag"],

      // Keys or params to lookup language from
      lookupFromPathIndex: 0,
      lookupLocalStorage: LANGUAGE_STORAGE_KEY, // Simple key for localStorage
      lookupCookie: LANGUAGE_STORAGE_KEY, // Use matching cookie name

      // Cache user language on
      caches: ["localStorage", "cookie"], // Cache in both localStorage and cookie for persistence
      
      // Cookie options for better persistence
      cookieOptions: { 
        path: '/', 
        sameSite: 'strict',
        maxAge: 31536000 // Cookie valid for 1 year (365 days in seconds)
      }
    },
  });

// If in browser, set the document language immediately to match i18n
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language;
}

// Improved language change function with debouncing to prevent multiple rapid changes
export const changeLanguage = (lng: string) => {
  // Don't change if already this language
  if (i18n.language === lng) {
    return Promise.resolve(lng);
  }
  
  // Don't allow multiple language changes at once
  if (isChangingLanguage) {
    return Promise.resolve(i18n.language);
  }
  
  isChangingLanguage = true;
  
  return i18n.changeLanguage(lng).then(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    document.documentElement.lang = lng;
    
    // Release lock after a small delay to prevent race conditions
    setTimeout(() => {
      isChangingLanguage = false;
    }, 50);
    
    return lng;
  });
};

// Get the current language - exported helper function
export const getCurrentLanguage = () => {
  return i18n.language || DEFAULT_LANGUAGE;
};

// Helper to extract language from URL path
export const getLanguageFromPath = (path: string) => {
  if (!path) return null;
  
  const segments = path.split('/');
  if (segments.length > 1 && SUPPORTED_LANGUAGES.includes(segments[1])) {
    return segments[1];
  }
  
  return null;
};

export default i18n;

