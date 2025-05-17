/**
 * Simple, direct translation system with zero eval() usage
 * Now using language-service.ts for language management
 */

import { SupportedLanguage, getCurrentLanguage } from "./language-service";

import { TranslationContext } from "../components/translation-provider";
import deTranslations from "../messages/de.json";
import enTranslations from "../messages/en.json";
import { safeText } from "./utils";
import { useContext } from "react";

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

/**
 * Get a translated string with NO eval
 * Compatible with i18next API - accepts either options object or defaultValue string
 */
export function t(
  key: string,
  optionsOrDefaultValue?: TranslationOptions | string,
): string {
  // Get current language from language service
  const lang = getCurrentLanguage();

  let options: TranslationOptions = {};

  // Handle i18next compatibility where second param can be defaultValue string
  if (typeof optionsOrDefaultValue === "string") {
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
 * Get a translation from the nested structure with dot notation
 * This is a safer implementation without eval()
 */
function getTranslation(
  key: string,
  lang: SupportedLanguage,
): string | undefined {
  // Get correct namespace
  const namespace = "translation"; // We only use a single namespace
  const resource = translations[lang]?.[namespace];

  if (!resource) return undefined;

  // Handle dot notation (e.g., "header.title")
  const parts = key.split(".");
  let current: unknown = resource;

  // Navigate down the object path
  for (const part of parts) {
    if (
      current === undefined ||
      current === null ||
      typeof current !== "object"
    ) {
      return undefined;
    }

    // Type assertion since we've checked current is an object
    current = (current as Record<string, unknown>)[part];
  }

  // Return the found string or undefined - but ensure it's a string
  return typeof current === "string" ? current : undefined;
}

/**
 * Replace {{key}} placeholders in a string with values
 */
function replaceValues(
  text: string,
  values: Record<string, string | number>,
): string {
  return text.replace(/\{\{([^{}]+)\}\}/g, (match, key) => {
    const replacement = values[key.trim()];
    // Ensure replacement is always a string
    return replacement !== undefined ? safeText(replacement) : match;
  });
}

// Simple i18n interface for compatibility with existing code
export const i18n = {
  language: getCurrentLanguage(),
  t,
};

// Export a hook-like function for React components
export function useTranslation() {
  const {
    language,
    t: contextT,
    changeLanguage: contextChangeLanguage,
  } = useContext(TranslationContext);

  // The t function from context already uses the correct language.
  // The changeLanguage function from context will update the provider and global state.
  return {
    t: contextT,
    i18n: {
      language: language, // Use language from context
      changeLanguage: contextChangeLanguage, // Use changeLanguage from context
    },
  };
}

// Enhanced Server-Side Translator function that gets language from params
export function getServerSideTranslator(lang: SupportedLanguage) {
  return {
    t: (
      key: string,
      optionsOrDefaultValue?: TranslationOptions | string,
    ): string => {
      let options: TranslationOptions = {};
      if (typeof optionsOrDefaultValue === "string") {
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
    language: lang, // Expose the language for consistency
  };
}
