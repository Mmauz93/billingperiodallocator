"use client";

import { ReactNode, useEffect, useState } from 'react';

import dynamic from 'next/dynamic';
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

export default function PrivacyPolicyPage() {
  const { i18n } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [language, setLanguage] = useState('en');

  // Effect to ensure component only renders client-side
  useEffect(() => {
    setIsMounted(true);
    setLanguage(i18n.language.startsWith('de') ? 'de' : 'en');

    // Ensure PrivacyBee script is loaded once
    let script = document.querySelector<HTMLScriptElement>(
      'script[src="https://app.privacybee.io/widget.js"]',
    );
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://app.privacybee.io/widget.js';
      script.defer = true;
      document.head.appendChild(script);
    }
    // No cleanup needed for script tag added to head
  }, [i18n.language]); // Run when language changes

  // Render loading indicator or null until mounted
  if (!isMounted) {
    return (
      <div className="flex justify-center items-center py-16 min-h-[500px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Render the widget via dangerouslySetInnerHTML with centered container
  return (
    <div className="container mx-auto max-w-3xl py-10">
      <NoSSR>
        <PrivacyWidget lang={language} />
      </NoSSR>
    </div>
  );
} 
