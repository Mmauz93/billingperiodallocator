"use client";

import { ReactNode, useEffect, useState } from 'react';
import { SUPPORTED_LANGUAGES, getLanguageFromPath } from '@/translations';

import { ThemeProvider } from "next-themes";
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/translations';

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

export default function PrivacyPolicyPageEN() {
  const { i18n, t } = useTranslation();
  const pathname = usePathname();
  
  const urlLanguage = pathname ? getLanguageFromPath(pathname) : 'en';
  
  const [isMounted, setIsMounted] = useState(false);
  const [pageLanguage, setPageLanguage] = useState(urlLanguage || 'en');
  const [translationsReady, setTranslationsReady] = useState(false);

  // Second effect synchronizes language between i18n, URL, and component state
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      return;
    }
    
    const pathLanguage = getLanguageFromPath(pathname || '');
    
    if (pathLanguage && pathLanguage !== i18n.language) {
      i18n.changeLanguage(pathLanguage);
      setTranslationsReady(true);
      document.title = t("Legal.privacyPolicyTitle") + " | BillSplitter";
      setPageLanguage(pathLanguage);
    } else {
      setTranslationsReady(true);
      document.title = t("Legal.privacyPolicyTitle") + " | BillSplitter";
      // Ensure pageLanguage is set even if pathLanguage matches i18n
      if (pathLanguage) setPageLanguage(pathLanguage); 
    }
  }, [pathname, isMounted, i18n, t]);

  // Third effect listens for language change events from language toggle
  useEffect(() => {
    if (!isMounted) return;
    
    const handleLanguageChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newLang = customEvent.detail?.language || customEvent.detail;
      
      if (newLang && typeof newLang === 'string' && SUPPORTED_LANGUAGES.includes(newLang)) {
        setPageLanguage(newLang);
        if (i18n.language !== newLang) {
          i18n.changeLanguage(newLang);
        }
      }
    };
    
    document.addEventListener('languageChanged', handleLanguageChanged);
    
    return () => {
      document.removeEventListener('languageChanged', handleLanguageChanged);
    };
  }, [isMounted, i18n]);

  // Show loading state until fully mounted and translations ready
  if (!isMounted || !translationsReady) {
    // Render a placeholder or skeleton loader
    return (
      <div className="flex justify-center items-center py-16 min-h-[500px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <ThemeProvider attribute="class" forcedTheme="dark">
      <div className="container mx-auto max-w-3xl px-6 py-16">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#0284C7] to-[#0284C7]/80 bg-clip-text text-transparent">
            {t("Legal.privacyPolicyTitle", "Privacy Policy")}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {`${t("Legal.lastUpdatedPrefix", "Last updated on")} ${formattedDate}`}
          </p>
        </div>
        <NoSSR>
          <PrivacyWidget lang={pageLanguage} />
        </NoSSR>
      </div>
    </ThemeProvider>
  );
} 
