'use client';

import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Browser detection and redirection component for the site root
export default function RootPage() {
  const router = useRouter();
  
  const siteUrl = 'https://billsplitter.siempi.ch';
  
  useEffect(() => {
    // Add explicit hreflang links for the root URL
    const addHreflangTags = () => {
      // Function to create and add a link element
      const addLinkElement = (rel: string, hreflang: string | null, href: string) => {
        const linkElement = document.createElement('link');
        linkElement.rel = rel;
        if (hreflang) {
          linkElement.hreflang = hreflang;
        }
        linkElement.href = href;
        document.head.appendChild(linkElement);
        return linkElement;
      };
      
      // Add canonical tag
      addLinkElement('canonical', null, `${siteUrl}/en/`);
      
      // Add hreflang tags for all supported languages
      addLinkElement('alternate', 'en', `${siteUrl}/en/`);
      addLinkElement('alternate', 'de', `${siteUrl}/de/`);
      addLinkElement('alternate', 'x-default', `${siteUrl}/en/`);
    };
    
    // Add the hreflang tags
    addHreflangTags();
    
    // Function to detect user's preferred language
    const detectLanguage = () => {
      // Use browser language settings if available
      if (typeof navigator !== 'undefined' && navigator.language) {
        const browserLang = navigator.language.split('-')[0].toLowerCase();
        
        // Check if browser language is one of our supported languages
        if (browserLang === 'de') {
          return 'de';
        }
      }
      
      // Default to English
      return 'en';
    };
    
    // Immediately redirect to the appropriate language version
    const detectedLang = detectLanguage();
    router.replace(`/${detectedLang}`);
  }, [router]);

  // Return a minimal component that will never actually render
  // but includes the hreflang tags in the head
  return (
    <>
      <Head>
        <link rel="canonical" href={`${siteUrl}/en/`} />
        <link rel="alternate" hrefLang="en" href={`${siteUrl}/en/`} />
        <link rel="alternate" hrefLang="de" href={`${siteUrl}/de/`} />
        <link rel="alternate" hrefLang="x-default" href={`${siteUrl}/en/`} />
      </Head>
    </>
  );
}
