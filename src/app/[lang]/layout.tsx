import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/language-service';

import { Metadata } from 'next';
import { ReactNode } from 'react';
import WwwRedirector from '@/components/www-redirector';

interface LangLayoutProps {
  children: ReactNode;
  params: {
    lang: string;
  };
}

// Generate metadata for language-specific routes
export async function generateMetadata({ params }: { params: { lang: string }}): Promise<Metadata> {
  // Validate language
  const lang = SUPPORTED_LANGUAGES.includes(params.lang as SupportedLanguage) ? params.lang : 'en';
  const siteUrl = 'https://billsplitter.siempi.ch';
  
  return {
    alternates: {
      canonical: `${siteUrl}/${lang}/`,
      languages: {
        'en': `${siteUrl}/en/`,
        'de': `${siteUrl}/de/`,
        'x-default': `${siteUrl}/en/`,
      },
    },
  };
}

// This layout handles language specifically - it's the single source of truth
export default function LangLayout({ children }: LangLayoutProps) {
  // Validate language parameter - REMOVED UNUSED 'lang' VARIABLE
  // const lang = SUPPORTED_LANGUAGES.includes(params.lang as SupportedLanguage) 
  //   ? params.lang as SupportedLanguage 
  //   : 'en';
  
  return (
    <>
      <WwwRedirector />
      {/* Initialize language via script - REMOVED */}
      {children}
    </>
  );
} 
