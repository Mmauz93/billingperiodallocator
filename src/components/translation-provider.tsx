'use client';

import React, { createContext, useEffect, useState } from 'react';
import { getLanguageFromPath, i18n } from '@/translations';

import { usePathname } from 'next/navigation';

export const TranslationContext = createContext(i18n);

export default function TranslationProvider({ children }: { children: React.ReactNode }) {
  // We need state for forcing rerenders, but don't directly use the value
  const [, setMounted] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    setMounted(true);
    
    // Sync language with URL path if needed
    const pathLanguage = getLanguageFromPath(pathname || '');
    if (pathLanguage && pathLanguage !== i18n.language) {
      i18n.changeLanguage(pathLanguage);
    }
    
    // Set document language
    document.documentElement.lang = i18n.language;
  }, [pathname]);
  
  // Subscribe to language changes
  useEffect(() => {
    const handleLanguageChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newLang = customEvent.detail?.language || i18n.language;
      document.documentElement.lang = newLang;
      
      // Force a component rerender when language changes
      setMounted(prev => !prev);
    };
    
    document.addEventListener('languageChanged', handleLanguageChanged);
    return () => {
      document.removeEventListener('languageChanged', handleLanguageChanged);
    };
  }, []);
  
  return (
    <TranslationContext.Provider value={i18n}>
      {children}
    </TranslationContext.Provider>
  );
} 
 