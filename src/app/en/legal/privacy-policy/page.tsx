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

// Use dynamic import with ssr: false and loading skeleton
const PrivacyWidget = dynamic<PrivacyWidgetProps>(() => 
  Promise.resolve(({ lang }: PrivacyWidgetProps) => {
    const widgetHtml = `<privacybee-widget website-id="cma1q0yid003g14kfg78yzilb" type="dsgvo" lang="${lang}" data-theme="dark"></privacybee-widget>`;
    return <div dangerouslySetInnerHTML={{ __html: widgetHtml }} />;
  }), 
  {
    ssr: false,
    loading: () => <PrivacyWidgetSkeleton />
  }
);

export default function PrivacyPolicyPageEN() {
  const { i18n, t } = useTranslation();
  const pathname = usePathname();
  
  const [isMounted, setIsMounted] = useState(false);
  const [pageLanguage, setPageLanguage] = useState(() => pathname ? getLanguageFromPath(pathname) || 'en' : 'en');
  const [translationsReady, setTranslationsReady] = useState(false);

  // Effect for mounting and initial setup
  useEffect(() => {
    setIsMounted(true);

    // Force dark mode for entire page including header and footer
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    document.body.classList.add('dark');

    // Load Privacy Bee script if not already present
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
    
    // Initial language setup based on path
    const initialPathLanguage = getLanguageFromPath(pathname || '');
    if (initialPathLanguage && initialPathLanguage !== i18n.language) {
      i18n.changeLanguage(initialPathLanguage);
      document.title = t("Legal.privacyPolicyTitle") + " | BillSplitter";
      setTranslationsReady(true);
      // Update pageLanguage state if needed, although already set initially
      if (pageLanguage !== initialPathLanguage) {
         setPageLanguage(initialPathLanguage);
      }
    } else {
       document.title = t("Legal.privacyPolicyTitle") + " | BillSplitter";
       setTranslationsReady(true);
    }

    // Cleanup function: restore original theme state when component unmounts
    return () => {
      // Removed to avoid unwanted flashes: let the theme context handle it
      // document.documentElement.classList.remove('dark');
      // document.documentElement.style.colorScheme = '';
      // document.body.classList.remove('dark');
    };
  }, [pathname, i18n, t, pageLanguage]); // Dependencies for initial setup

  // Effect for handling language changes triggered by the language toggle
  useEffect(() => {
    if (!isMounted) return; // Ensure component is mounted

    const handleLanguageChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newLang = customEvent.detail?.language || customEvent.detail;

      if (newLang && typeof newLang === 'string' && SUPPORTED_LANGUAGES.includes(newLang)) {
        // Update state and i18n only if the language actually changed
        if (newLang !== pageLanguage) {
           setPageLanguage(newLang);
           if (i18n.language !== newLang) {
             setTranslationsReady(false); // Set loading state for translation change
             i18n.changeLanguage(newLang);
             document.title = t("Legal.privacyPolicyTitle") + " | BillSplitter";
             setTranslationsReady(true);
           } else {
             // If i18n language is already correct, just update title
             document.title = t("Legal.privacyPolicyTitle") + " | BillSplitter";
           }
        }
      }
    };

    document.addEventListener('languageChanged', handleLanguageChanged);

    return () => {
      document.removeEventListener('languageChanged', handleLanguageChanged);
    };
    // Dependencies: isMounted, i18n, t, and pageLanguage (to compare against newLang)
  }, [isMounted, i18n, t, pageLanguage]); 

  // Show loading state until fully mounted and translations ready
  if (!isMounted || !translationsReady) {
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
      <div className="container mx-auto max-w-3xl px-6 py-16 dark" style={{ backgroundColor: "#121212" }}>
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#0284C7] to-[#0284C7]/80 bg-clip-text text-transparent">
            {t("Legal.privacyPolicyTitle", "Privacy Policy")}
          </h1>
          <p className="text-sm text-white opacity-70 mt-2">
            {`${t("Legal.lastUpdatedPrefix", "Last updated on")} ${formattedDate}`}
          </p>
        </div>
        <PrivacyWidget lang={pageLanguage} />
      </div>
    </ThemeProvider>
  );
} 
