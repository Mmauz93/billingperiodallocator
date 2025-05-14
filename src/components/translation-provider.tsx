'use client';

import React, { createContext, useEffect, useMemo, useState } from 'react';
import {
  getLanguage as getGlobalLanguage,
  getLanguageFromPath,
  changeLanguage as globalChangeLanguage,
  t as globalT,
} from '@/translations';

import { usePathname } from 'next/navigation';

// Define the shape of the context value
interface ITranslationContext {
  language: string;
  t: typeof globalT;
  changeLanguage: typeof globalChangeLanguage;
}

// Define default values that don't call back into '@/translations' at module initialization time.
// These are placeholders for when context is used outside a provider or during problematic init.
const defaultContextValue: ITranslationContext = {
  language: 'en', // Sensible hardcoded default
  t: (key: string, optionsOrDefaultValue?: Parameters<typeof globalT>[1]): string => {
    // Basic fallback t function.
    // It uses Parameters<typeof globalT>[1] to match the type of optionsOrDefaultValue.
    const optionsAsObject = typeof optionsOrDefaultValue === 'object' ? optionsOrDefaultValue : undefined;
    const defaultValueAsString = typeof optionsOrDefaultValue === 'string' ? optionsOrDefaultValue : undefined;

    if (optionsAsObject?.defaultValue) {
      return optionsAsObject.defaultValue;
    }
    if (defaultValueAsString) {
      return defaultValueAsString;
    }
    return key; // Fallback to key
  },
  changeLanguage: (lang: string): void => {
    // Basic no-op changeLanguage, with a warning if on client.
    if (typeof document !== 'undefined') { // Check if running on the client
      console.warn(
        `Language change to "${lang}" attempted using default translation context. ` +
        `Ensure TranslationProvider is correctly wrapping your application.`
      );
    }
  },
};

// Initialize context with safe default values.
export const TranslationContext = createContext<ITranslationContext>(defaultContextValue);

export default function TranslationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // State to hold the language for this provider instance.
  // Initialize with the current global language.
  const [contextLang, setContextLang] = useState(() => getGlobalLanguage());

  useEffect(() => {
    // This effect syncs the provider's language state with the URL path.
    const pathLanguage = getLanguageFromPath(pathname || '');
    if (pathLanguage && pathLanguage !== getGlobalLanguage()) {
      // If path language is different from current global, change global
      // This will also trigger the 'languageChanged' event
      globalChangeLanguage(pathLanguage);
      // The event listener below will pick this up and setContextLang
    } else if (pathLanguage && pathLanguage !== contextLang) {
      // If path language is different from our context state (but global might be same or changing)
      // directly update our context state.
      setContextLang(pathLanguage);
      if (typeof document !== 'undefined') document.documentElement.lang = pathLanguage;
    } else if (!pathLanguage && getGlobalLanguage() !== contextLang) {
      // If no language in path (e.g. root, though not used in this app)
      // and our context state differs from global, sync to global.
      const globLang = getGlobalLanguage();
      setContextLang(globLang);
      if (typeof document !== 'undefined') document.documentElement.lang = globLang;
    }
  }, [pathname, contextLang]); // Re-run if path changes or our own contextLang changes

  useEffect(() => {
    // This effect listens for the global 'languageChanged' event.
    // This event is dispatched by globalChangeLanguage.
    const handleGlobalLanguageChange = () => {
      const newGlobalLang = getGlobalLanguage();
      if (newGlobalLang !== contextLang) {
        setContextLang(newGlobalLang); // Update provider's state
        if (typeof document !== 'undefined') document.documentElement.lang = newGlobalLang;
      }
    };

    if (typeof document !== 'undefined') {
        document.addEventListener('languageChanged', handleGlobalLanguageChange);
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('languageChanged', handleGlobalLanguageChange);
      }
    };
  }, [contextLang]); // Re-subscribe if contextLang changes

  // Memoize the context value. This object reference will change if contextLang changes.
  const providerValue = useMemo(() => ({
    language: contextLang,
    t: globalT, // globalT always uses the module-level 'currentLanguage'
                 // which is updated by globalChangeLanguage.
    changeLanguage: globalChangeLanguage,
  }), [contextLang]);

  return (
    <TranslationContext.Provider value={providerValue}>
      {children}
    </TranslationContext.Provider>
  );
} 
 