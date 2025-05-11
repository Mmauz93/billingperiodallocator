/**
 * Simple, direct translation system with zero eval() usage
 */

import deTranslations from '../messages/de.json';
import enTranslations from '../messages/en.json';

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

// Current language state
let currentLanguage = 'en';
const STORAGE_KEY = 'billingperiodallocator-language';

// Language detection at initialization
if (typeof window !== 'undefined') {
  // Try to get language from URL path
  const pathSegments = window.location.pathname.split('/');
  const urlLang = pathSegments.length > 1 && ['en', 'de'].includes(pathSegments[1]) 
                ? pathSegments[1] 
                : null;
  
  // If not in URL, check localStorage, then browser preference
  currentLanguage = urlLang || 
                  localStorage.getItem(STORAGE_KEY) || 
                  (navigator.language && 
                  ['en', 'de'].includes(navigator.language.substring(0, 2).toLowerCase())
                    ? navigator.language.substring(0, 2).toLowerCase()
                    : 'en');
}

/**
 * Get a translated string with NO eval
 * Compatible with i18next API - accepts either options object or defaultValue string
 */
export function t(key: string, optionsOrDefaultValue?: TranslationOptions | string): string {
  let options: TranslationOptions = {};
  
  // Handle i18next compatibility where second param can be defaultValue string
  if (typeof optionsOrDefaultValue === 'string') {
    options = { defaultValue: optionsOrDefaultValue };
  } else if (optionsOrDefaultValue) {
    options = optionsOrDefaultValue;
  }
  
  // Get the translation or default value
  const translation = getTranslation(key, currentLanguage);
  const finalText = translation || options.defaultValue || key;
  
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
  if (!['en', 'de'].includes(lang)) return;
  
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
  return currentLanguage;
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
  
  // Return the found string or undefined
  return typeof current === 'string' ? current : undefined;
}

/**
 * Replace {{key}} placeholders in a string with values
 */
function replaceValues(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{\{([^{}]+)\}\}/g, (match, key) => {
    const replacement = values[key.trim()];
    return replacement !== undefined ? String(replacement) : match;
  });
}

// Helper function to extract language from URL path
export function getLanguageFromPath(path: string): string | null {
  if (!path) return null;
  
  const segments = path.split('/');
  if (segments.length > 1 && ['en', 'de'].includes(segments[1])) {
    return segments[1];
  }
  
  return null;
}

// Simple functions to mimic i18next interface for easier migration
export const i18n = {
  changeLanguage,
  language: currentLanguage,
  t
};

// Export a hook-like function for React components
export function useTranslation() {
  return { 
    t,
    i18n: {
      language: currentLanguage,
      changeLanguage
    }
  };
} 
 