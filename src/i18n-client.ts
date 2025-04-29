import LanguageDetector from "i18next-browser-languagedetector";
import deTranslations from "./messages/de.json";
// Import your translation files directly
import enTranslations from "./messages/en.json";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Init i18next
  .init({
    debug: process.env.NODE_ENV === "development", // Enable debug output in development
    fallbackLng: "en", // Fallback language if detection fails
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
      order: ["localStorage", "cookie", "navigator", "htmlTag"],

      // Keys or params to lookup language from
      lookupLocalStorage: "billingperiodallocator-language", // Simple key for localStorage
      lookupCookie: "billingperiodallocator-language", // Use matching cookie name

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

// Force language reloading on page changes
export const changeLanguage = (lng: string) => {
  return i18n.changeLanguage(lng).then(() => {
    localStorage.setItem("billingperiodallocator-language", lng);
    document.documentElement.lang = lng;
  });
};

export default i18n;

