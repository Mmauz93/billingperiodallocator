'use client';

import React, { createContext, useEffect, useMemo, useState } from 'react';
import {
  SupportedLanguage,
  changeLanguage,
  getCurrentLanguage,
  getLanguageFromPath,
  initializeLanguage
} from '@/lib/language-service';

import { t as globalT } from '@/translations';
import { usePathname } from 'next/navigation';

// Define the shape of the context value
interface ITranslationContext {
  language: SupportedLanguage;
  t: typeof globalT;
  changeLanguage: typeof changeLanguage;
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
  changeLanguage: () => false, // No-op - user should use navigation instead
};

// Initialize context with safe default values
export const TranslationContext = createContext<ITranslationContext>(defaultContextValue);

export default function TranslationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  
  // Get language from path - the authoritative source
  const pathLanguage = getLanguageFromPath(pathname);
  
  // State to hold current language, initialize from path
  const [contextLang, setContextLang] = useState<SupportedLanguage>(
    pathLanguage || getCurrentLanguage()
  );

  // Initialize language service on mount
  useEffect(() => {
    if (pathLanguage) {
      // Initialize with path language if available (URL is the source of truth)
      initializeLanguage(pathLanguage);
      setContextLang(pathLanguage);
    } else {
      // Use whatever language service detects otherwise
      const detectedLang = getCurrentLanguage();
      setContextLang(detectedLang);
    }
  }, [pathLanguage]);

  // Update language when path changes
  useEffect(() => {
    if (pathLanguage && pathLanguage !== contextLang) {
      // Update language service and context state
      initializeLanguage(pathLanguage);
      setContextLang(pathLanguage);
    }
  }, [pathname, contextLang, pathLanguage]);

  // Listen for language change events
  useEffect(() => {
    const handleLanguageChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newLang = customEvent.detail?.language as SupportedLanguage;
      
      if (newLang && newLang !== contextLang) {
        setContextLang(newLang);
      }
    };

    document.addEventListener('languageChanged', handleLanguageChanged);
    return () => {
      document.removeEventListener('languageChanged', handleLanguageChanged);
    };
  }, [contextLang]);

  // Wrap the language service's changeLanguage to include navigation
  const handleChangeLanguage = (lang: SupportedLanguage): boolean => {
    return changeLanguage(lang, { navigate: true });
  };

  // Memoize the context value to avoid unnecessary re-renders
  const providerValue = useMemo(() => ({
    language: contextLang,
    t: globalT,
    changeLanguage: handleChangeLanguage,
  }), [contextLang]);

  return (
    <TranslationContext.Provider value={providerValue}>
      {children}
    </TranslationContext.Provider>
  );
} 
 