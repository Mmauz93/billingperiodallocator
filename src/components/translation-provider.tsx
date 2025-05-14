'use client';

import React, { createContext, useEffect, useMemo, useState } from 'react';
import {
  SUPPORTED_LANGUAGES,
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

// Default context values
const defaultContextValue: ITranslationContext = {
  language: 'en',
  t: (key: string, optionsOrDefaultValue?: Parameters<typeof globalT>[1]): string => {
    const optionsAsObject = typeof optionsOrDefaultValue === 'object' ? optionsOrDefaultValue : undefined;
    const defaultValueAsString = typeof optionsOrDefaultValue === 'string' ? optionsOrDefaultValue : undefined;

    if (optionsAsObject?.defaultValue) {
      return optionsAsObject.defaultValue;
    }
    if (defaultValueAsString) {
      return defaultValueAsString;
    }
    return key;
  },
  changeLanguage: () => {}, // No-op - user should use navigation instead
};

// Initialize context with safe default values
export const TranslationContext = createContext<ITranslationContext>(defaultContextValue);

export default function TranslationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  
  // Get language from path - the authoritative source
  const pathLanguage = getLanguageFromPath(pathname);
  
  // State to hold current language
  const [contextLang, setContextLang] = useState<string>(pathLanguage || 'en');

  // Update global language state when path changes
  useEffect(() => {
    if (pathLanguage && pathLanguage !== contextLang) {
      setContextLang(pathLanguage);
      globalChangeLanguage(pathLanguage);
    }
  }, [pathname, contextLang, pathLanguage]);

  // Listen for language change events (from the [lang]/layout.tsx script)
  useEffect(() => {
    const handleLanguageChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newLang = customEvent.detail?.language || '';
      
      if (newLang && SUPPORTED_LANGUAGES.includes(newLang) && newLang !== contextLang) {
        setContextLang(newLang);
        globalChangeLanguage(newLang);
      }
    };

    document.addEventListener('languageChanged', handleLanguageChanged);
    return () => {
      document.removeEventListener('languageChanged', handleLanguageChanged);
    };
  }, [contextLang]);

  // Memoize the context value to avoid unnecessary re-renders
  const providerValue = useMemo(() => ({
    language: contextLang,
    t: globalT,
    changeLanguage: globalChangeLanguage,
  }), [contextLang]);

  return (
    <TranslationContext.Provider value={providerValue}>
      {children}
    </TranslationContext.Provider>
  );
} 
 