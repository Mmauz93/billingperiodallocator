"use client";

import { ReactNode, useEffect, useRef, useState } from 'react';
import { SUPPORTED_LANGUAGES, getLanguageFromPath } from '@/i18n-client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

// Create a NoSSR wrapper component with proper typing
const NoSSR = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

// Define interface for component props
interface PrivacyWidgetProps {
  lang: string;
}

// Use dynamic import with ssr: false to prevent SSR
const PrivacyWidget = dynamic<PrivacyWidgetProps>(() => 
  Promise.resolve(({ lang }: PrivacyWidgetProps) => {
    // Construct the widget HTML string for dangerouslySetInnerHTML
    const widgetHtml = `<privacybee-widget website-id="cma1q0yid003g14kfg78yzilb" type="dsgvo" lang="${lang}"></privacybee-widget>`;
    
    return <div dangerouslySetInnerHTML={{ __html: widgetHtml }} />;
  }), 
  { ssr: false }
);

export default function PrivacyPolicyPageDE() {
  const { i18n, t } = useTranslation();
  const pathname = usePathname();
  const { theme: currentTheme, setTheme } = useTheme();
  const originalThemeRef = useRef<string | undefined>(undefined);
  const themeWasSetRef = useRef(false);
  
  // Set initial language from URL path for better consistency
  const urlLanguage = pathname ? getLanguageFromPath(pathname) : 'de';
  
  const [isMounted, setIsMounted] = useState(false);
  const [pageLanguage, setPageLanguage] = useState(urlLanguage || 'de');
  const [translationsReady, setTranslationsReady] = useState(false);

  // First effect handles mounting, theme and script
  useEffect(() => {
    setIsMounted(true);
    
    // Store the original theme only once
    if (originalThemeRef.current === undefined) {
      originalThemeRef.current = currentTheme;
    }

    // Set dark theme once
    if (!themeWasSetRef.current) {
      setTheme('dark');
      themeWasSetRef.current = true;
    }

    // Handle script loading only once
    let script = document.querySelector<HTMLScriptElement>(
      'script[src="https://app.privacybee.io/widget.js"]'
    );
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://app.privacybee.io/widget.js';
      script.defer = true;
      document.head.appendChild(script);
    }
    
    // Cleanup function to restore original theme
    return () => {
      if (originalThemeRef.current) {
        setTheme(originalThemeRef.current);
      }
    };
  }, [currentTheme, setTheme]);

  // Second effect synchronizes language between i18n, URL, and component state
  useEffect(() => {
    if (!isMounted) return;
    
    // Sync language with URL if needed
    const pathLanguage = getLanguageFromPath(pathname || '');
    
    if (pathLanguage && pathLanguage !== i18n.language) {
      i18n.changeLanguage(pathLanguage).then(() => {
        setTranslationsReady(true);
      });
      setPageLanguage(pathLanguage);
    } else {
      setTranslationsReady(true);
    }
  }, [pathname, isMounted, i18n]);

  // Third effect listens for language change events from language toggle
  useEffect(() => {
    if (!isMounted) return;
    
    const handleLanguageChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newLang = customEvent.detail?.language || customEvent.detail;
      
      if (newLang && typeof newLang === 'string' && SUPPORTED_LANGUAGES.includes(newLang)) {
        // Update component language state to trigger widget re-render
        setPageLanguage(newLang);
        setTranslationsReady(false);
        
        // Ensure i18n is in sync
        if (i18n.language !== newLang) {
          i18n.changeLanguage(newLang).then(() => {
            setTranslationsReady(true);
          });
        } else {
          setTranslationsReady(true);
        }
      }
    };
    
    document.addEventListener('languageChanged', handleLanguageChanged);
    
    return () => {
      document.removeEventListener('languageChanged', handleLanguageChanged);
    };
  }, [isMounted, i18n]);

  // Show loading state until fully mounted
  if (!isMounted || !translationsReady) {
    return (
      <div className="flex justify-center items-center py-16 min-h-[500px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const today = new Date();
  // Format date for German locale
  const formattedDate = today.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="container mx-auto max-w-3xl px-6 py-16">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#0284C7] to-[#0284C7]/80 bg-clip-text text-transparent">
          {t("Legal.privacyPolicyTitle", "Datenschutzerklärung")}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {`${t("Legal.lastUpdatedPrefix", "Zuletzt aktualisiert am")} ${formattedDate}`}
        </p>
      </div>
      {/* Use the PrivacyBee widget without our own headings */}
      <NoSSR>
        <PrivacyWidget lang={pageLanguage} />
      </NoSSR>
    </div>
  );
} 
