'use client';

import { useEffect } from 'react';

interface HeadWithHreflangProps {
  currentPath: string;
  currentLanguage: string;
}

// This component adds explicit hreflang link tags to all pages
export default function HeadWithHreflang({ currentPath, currentLanguage }: HeadWithHreflangProps) {
  // Site configuration
  const siteUrl = 'https://billsplitter.siempi.ch';
  const supportedLanguages = ['en', 'de'];
  
  // Extract path without language prefix
  const getPathWithoutLang = (path: string) => {
    const pathSegments = path.split('/').filter(Boolean);
    if (pathSegments.length > 0 && supportedLanguages.includes(pathSegments[0])) {
      return '/' + pathSegments.slice(1).join('/');
    }
    return path;
  };
  
  // Path without language prefix
  const pathWithoutLang = getPathWithoutLang(currentPath);
  
  // Generate URLs for all language versions
  const generateUrls = () => {
    const urls: Record<string, string> = {};
    
    supportedLanguages.forEach(lang => {
      if (pathWithoutLang === '/') {
        // For the root page
        urls[lang] = `${siteUrl}/${lang}/`;
      } else {
        // For subpages
        urls[lang] = `${siteUrl}/${lang}${pathWithoutLang}/`;
      }
    });
    
    // Add x-default (pointing to English version)
    if (pathWithoutLang === '/') {
      urls['x-default'] = `${siteUrl}/en/`;
    } else {
      urls['x-default'] = `${siteUrl}/en${pathWithoutLang}/`;
    }
    
    return urls;
  };
  
  // Get canonical URL
  const getCanonicalUrl = () => {
    if (currentLanguage && pathWithoutLang) {
      return `${siteUrl}/${currentLanguage}${pathWithoutLang}/`;
    } else if (currentLanguage) {
      return `${siteUrl}/${currentLanguage}/`;
    } else {
      return `${siteUrl}/en/`;
    }
  };
  
  // URLs for all language versions
  const urls = generateUrls();
  const canonicalUrl = getCanonicalUrl();

  // Add the link tags directly to the document head
  useEffect(() => {
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
    
    // Array to track added elements for cleanup
    const addedElements: HTMLLinkElement[] = [];
    
    // Add canonical tag
    addedElements.push(addLinkElement('canonical', null, canonicalUrl));
    
    // Add hreflang tags for all language versions
    Object.entries(urls).forEach(([lang, url]) => {
      if (lang === 'x-default') {
        addedElements.push(addLinkElement('alternate', 'x-default', url));
      } else {
        addedElements.push(addLinkElement('alternate', lang, url));
      }
    });
    
    // Cleanup function to remove link elements when component unmounts
    return () => {
      addedElements.forEach(element => {
        if (document.head.contains(element)) {
          document.head.removeChild(element);
        }
      });
    };
  }, [currentPath, currentLanguage, canonicalUrl, urls]);

  // This component doesn't render anything visible
  return null;
} 
