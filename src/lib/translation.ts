/**
 * Simple, direct translation system with zero eval() usage
 */

import { TranslationContext } from '../components/translation-provider';
import deTranslations from '../messages/de.json';
import enTranslations from '../messages/en.json';
import { safeText } from './utils';
import { useContext } from 'react';

// Type safety for translation objects
type TranslationResource = Record<string, string | Record<string, string>>;
type NestedTranslations = Record<string, TranslationResource>;

interface TranslationOptions {
  defaultValue?: string;
  values?: Record<string, string | number>;
}

// Translations store
const translations: Record<string, NestedTranslations> = {
  en: { translation: enTranslations as TranslationResource },
  de: { translation: deTranslations as TranslationResource },
};

// Language-related constants
const SUPPORTED_LANGUAGES = ['en', 'de'];
const DEFAULT_LANGUAGE = 'en';
const STORAGE_KEY = 'billingperiodallocator-language';

// Use serverLanguage during initial SSR to prevent language flash
// This is important - we initialize with an empty string rather than 'en'
// to indicate no language has been detected yet
let currentLanguage: string = '';

// Prevent language flash by ensuring current language is set correctly from the start
// This function will be called both during server-side rendering AND client hydration
function detectLanguage(): string {
  // If language already set, don't re-detect
  if (currentLanguage) return currentLanguage;
  
  // On server, we can't access window/localStorage, but Next.js provides the URL
  let detectedLang = DEFAULT_LANGUAGE; // Default as fallback
  
  if (typeof window !== 'undefined') {
    // CLIENT-SIDE detection (hydration phase)
    
    // 1. First priority: Get language from URL path (most reliable indicator)
    const pathSegments = window.location.pathname.split('/');
    const urlLang = pathSegments.length > 1 && SUPPORTED_LANGUAGES.includes(pathSegments[1])
      ? pathSegments[1]
      : null;
    
    // 2. Second priority: Check localStorage for saved preference
    const storedLang = localStorage.getItem(STORAGE_KEY);
    
    // 3. Third priority: Check browser language
    const browserLang = navigator.language && 
      SUPPORTED_LANGUAGES.includes(navigator.language.substring(0, 2).toLowerCase())
        ? navigator.language.substring(0, 2).toLowerCase()
        : null;
    
    // Use URL language (highest priority) or stored or browser language or default
    detectedLang = urlLang || storedLang || browserLang || DEFAULT_LANGUAGE;
    
    // Update localStorage if we're using URL language but storage doesn't match
    if (urlLang && storedLang !== urlLang) {
      localStorage.setItem(STORAGE_KEY, urlLang);
    }
    
    // Set html lang attribute for accessibility
    document.documentElement.lang = detectedLang;
  } else {
    // SERVER-SIDE detection: Can't detect much, will rely on Next.js's params
    // Will be updated during client-side hydration
    detectedLang = DEFAULT_LANGUAGE;
  }
  
  // Set the current language
  currentLanguage = detectedLang;
  return detectedLang;
}

// Initial detection call (will run during both SSR and client hydration)
detectLanguage();

/**
 * Get a translated string with NO eval
 * Compatible with i18next API - accepts either options object or defaultValue string
 */
export function t(key: string, optionsOrDefaultValue?: TranslationOptions | string): string {
  // Ensure current language is set before translations are accessed
  const lang = currentLanguage || detectLanguage();
  
  let options: TranslationOptions = {};
  
  // Handle i18next compatibility where second param can be defaultValue string
  if (typeof optionsOrDefaultValue === 'string') {
    options = { defaultValue: optionsOrDefaultValue };
  } else if (optionsOrDefaultValue) {
    options = optionsOrDefaultValue;
  }
  
  // Get the translation or default value
  const translation = getTranslation(key, lang);
  
  // Ensure we always have a string, not an object (prevents React Error #418)
  const finalText = safeText(translation || options.defaultValue || key);
  
  // Replace any {{key}} values
  if (options.values && Object.keys(options.values).length > 0) {
    return replaceValues(finalText, options.values);
  }
  
  return finalText;
}

/**
 * Change the current language
 */
export function changeLanguage(lang: string): void {
  if (lang === currentLanguage) return;
  
  // Only allow supported languages
  if (!SUPPORTED_LANGUAGES.includes(lang)) return;
  
  currentLanguage = lang;
  
  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    
    // Dispatch event for components to know language changed
    const event = new CustomEvent('languageChanged', { detail: { language: lang } });
    document.dispatchEvent(event);
  }
}

/**
 * Get the current language
 */
export function getLanguage(): string {
  // Ensure language is detected if this is called early
  return currentLanguage || detectLanguage();
}

/**
 * Get a translation from the nested structure with dot notation
 * This is a safer implementation without eval()
 */
function getTranslation(key: string, lang: string): string | undefined {
  // Get correct namespace
  const namespace = 'translation'; // We only use a single namespace
  const resource = translations[lang]?.[namespace];
  
  if (!resource) return undefined;
  
  // Handle dot notation (e.g., "header.title")
  const parts = key.split('.');
  let current: unknown = resource;
  
  // Navigate down the object path
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    
    // Type assertion since we've checked current is an object
    current = (current as Record<string, unknown>)[part];
  }
  
  // Return the found string or undefined - but ensure it's a string
  return typeof current === 'string' ? current : undefined;
}

/**
 * Replace {{key}} placeholders in a string with values
 */
function replaceValues(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{\{([^{}]+)\}\}/g, (match, key) => {
    const replacement = values[key.trim()];
    // Ensure replacement is always a string
    return replacement !== undefined ? safeText(replacement) : match;
  });
}

// Helper function to extract language from URL path
export function getLanguageFromPath(path: string): string | null {
  if (!path) return null;
  
  const segments = path.split('/');
  if (segments.length > 1 && SUPPORTED_LANGUAGES.includes(segments[1])) {
    return segments[1];
  }
  
  return null;
}

// Simple functions to mimic i18next interface for easier migration
export const i18n = {
  changeLanguage,
  language: getLanguage(),
  t
};

// Export a hook-like function for React components
export function useTranslation() {
  const { language, t: contextT, changeLanguage: contextChangeLanguage } = useContext(TranslationContext);

  // The t function from context already uses the correct language.
  // The changeLanguage function from context will update the provider and global state.
  return { 
    t: contextT,
    i18n: {
      language: language, // Use language from context
      changeLanguage: contextChangeLanguage // Use changeLanguage from context
    }
  };
}

// Enhanced Server-Side Translator function that gets language from params
export function getServerSideTranslator(lang: string) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    // Default to 'en' or throw an error if an unsupported language is passed
    // console.warn(`Unsupported language "${lang}" for getServerSideTranslator, defaulting to 'en'.`);
    lang = DEFAULT_LANGUAGE; 
  }

  // Update the currentLanguage on the server to match what we'll use
  // This helps prevent language flash during hydration
  if (typeof window === 'undefined') {
    currentLanguage = lang;
  }

  return {
    t: (key: string, optionsOrDefaultValue?: TranslationOptions | string): string => {
      let options: TranslationOptions = {};
      if (typeof optionsOrDefaultValue === 'string') {
        options = { defaultValue: optionsOrDefaultValue };
      } else if (optionsOrDefaultValue) {
        options = optionsOrDefaultValue;
      }

      const translation = getTranslation(key, lang); // Use the passed 'lang'
      const finalText = safeText(translation || options.defaultValue || key);

      if (options.values && Object.keys(options.values).length > 0) {
        return replaceValues(finalText, options.values);
      }
      return finalText;
    },
    language: lang // Expose the language for consistency
  };
} 
 