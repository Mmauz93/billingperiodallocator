"use client";

import { SUPPORTED_LANGUAGES, getLanguageFromPath } from '@/translations';
import { useEffect, useState } from 'react';

import PrivacyWidgetSkeleton from '@/components/privacy-widget-skeleton';
import { ThemeProvider } from "next-themes";
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/translations';

// Define interface for component props
interface PrivacyWidgetProps {
  lang: string;
}

// Use dynamic import with ssr: false and a loading skeleton
const PrivacyWidget = dynamic<PrivacyWidgetProps>(() => 
  Promise.resolve(({ lang }: PrivacyWidgetProps) => {
    // Construct the widget HTML string
    const widgetHtml = `<privacybee-widget website-id="cmama28x0005vjo8hyyznlmon" type="dsgvo" lang="${lang}" data-theme="dark"></privacybee-widget>`;

    // Return only the div with innerHTML (no visibility logic)
    return <div dangerouslySetInnerHTML={{ __html: widgetHtml }} />;
  }), 
  {
    ssr: false,
    loading: () => <PrivacyWidgetSkeleton />
  }
);

export default function PrivacyPolicyPageDE() {
  const { i18n, t } = useTranslation();
  const pathname = usePathname();
  
  const urlLanguage = pathname ? getLanguageFromPath(pathname) : 'de';
  
  const [isMounted, setIsMounted] = useState(false);
  const [pageLanguage, setPageLanguage] = useState(urlLanguage || 'de');
  const [translationsReady, setTranslationsReady] = useState(false);

  // Effect to force dark mode and manage body background
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';

    // Cleanup function to remove styles when the component unmounts
    return () => {
      console.log("Cleaning up dark mode styles from Privacy Policy DE");
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.style.colorScheme = ''; // Reset color scheme
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  // Effect for mounting and script loading
  useEffect(() => {
    setIsMounted(true);
    
    // Handle script loading only once (same script)
    let script = document.querySelector<HTMLScriptElement>(
      'script[src="https://app.privacybee.io/widget.js"]'
    );
    if (!script) {
      script = document.createElement('script');
      script.id = 'privacybee-widget-script';
      script.src = 'https://app.privacybee.io/widget.js';
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // Second effect synchronizes language between i18n, URL, and component state
  useEffect(() => {
    if (!isMounted) return;
    
    const pathLanguage = getLanguageFromPath(pathname || '');
    
    if (pathLanguage && pathLanguage !== i18n.language) {
      i18n.changeLanguage(pathLanguage);
      setTranslationsReady(true);
      document.title = t("Legal.privacyPolicyTitle") + " | BillSplitter";
      setPageLanguage(pathLanguage);
    } else {
      setTranslationsReady(true);
      document.title = t("Legal.privacyPolicyTitle") + " | BillSplitter";
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

  // Loading state for translations/mounting (KEEP THIS)
  if (!isMounted || !translationsReady) {
    return (
      <div className="flex justify-center items-center py-16 min-h-[500px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const today = new Date();
  // Use German locale for date formatting
  const formattedDate = today.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <ThemeProvider attribute="class" forcedTheme="dark">
      <div className="container mx-auto max-w-3xl px-6 py-16 dark" style={{ backgroundColor: "#121212" }}>
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#0284C7] to-[#0284C7]/80 bg-clip-text text-transparent">
            {t("Legal.privacyPolicyTitle", "Datenschutzerklärung")}
          </h1>
          <p className="text-sm text-white opacity-70 mt-2">
            {`${t("Legal.lastUpdatedPrefix", "Zuletzt aktualisiert am")} ${formattedDate}`}
          </p>
        </div>
        {/* Render the dynamic widget directly, loading handles the skeleton */}
        <PrivacyWidget lang={pageLanguage} />
      </div>
    </ThemeProvider>
  );
} 
