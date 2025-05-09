"use client";

import { ReactNode, useEffect, useRef, useState } from 'react';

import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
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

// Server component that redirects to language-specific version
export default function PrivacyPolicyRedirect() {
  // Redirects to default language version (English)
  redirect('/en/legal/privacy-policy');
}

export function PrivacyPolicyPage() {
  const { i18n } = useTranslation();
  const { theme: currentTheme, setTheme } = useTheme(); // Get current theme and setTheme function
  const originalThemeRef = useRef<string | undefined>(undefined); // Ref to store original theme
  const themeWasSetRef = useRef(false); // Track if we've already set the theme
  const [isMounted, setIsMounted] = useState(false);
  const [language, setLanguage] = useState('en');

  // First effect to handle mounting and language setup
  useEffect(() => {
    setIsMounted(true);
    setLanguage(i18n.language.startsWith('de') ? 'de' : 'en');
  }, [i18n.language]);

  // Separate effect to handle theme changes - only runs once
  useEffect(() => {
    if (!isMounted) return;
    
    // Store the original theme only once
    if (originalThemeRef.current === undefined) {
      originalThemeRef.current = currentTheme;
    }

    // Set dark theme once
    if (!themeWasSetRef.current) {
      setTheme('dark');
      themeWasSetRef.current = true;
    }

    // Cleanup function to restore original theme
    return () => {
      if (originalThemeRef.current) {
        setTheme(originalThemeRef.current);
      }
    };
  }, [currentTheme, setTheme, isMounted]);

  // Separate effect for script loading
  useEffect(() => {
    if (!isMounted) return;
    
    // --- PrivacyBee script loading --- 
    let script = document.querySelector<HTMLScriptElement>(
      'script[src="https://app.privacybee.io/widget.js"]',
    );
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://app.privacybee.io/widget.js';
      script.defer = true;
      document.head.appendChild(script);
    }
    // --- End script loading ---
  }, [isMounted]); // Only load script once mounted

  // Render loading indicator or null until mounted
  if (!isMounted) {
    return (
      <div className="flex justify-center items-center py-16 min-h-[500px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Render the widget
  return (
    <div className="container mx-auto max-w-3xl py-10">
      <NoSSR>
        <PrivacyWidget lang={language} />
      </NoSSR>
    </div>
  );
} 
