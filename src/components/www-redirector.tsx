'use client';

import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/language-service';
import { useParams, usePathname } from 'next/navigation';

import { useEffect } from 'react';

// This component handles www to non-www redirects only
// The metadata API handles hreflang links in the layout files
export default function WwwRedirector() {
  const pathname = usePathname();
  const params = useParams();

  // Determine current language from params or fallback
  const langParam = params?.lang;
  const currentLanguage = 
    langParam && SUPPORTED_LANGUAGES.includes(langParam as SupportedLanguage) 
    ? langParam as SupportedLanguage 
    : 'en';

  const currentPath = pathname || '/';

  // Site configuration
  // const siteUrl = 'https://billsplitter.siempi.ch'; // REMOVED - Unused

  // Extract path without language prefix
  const getPathWithoutLang = (path: string) => {
    const pathSegments = path.split('/').filter(Boolean);
    if (pathSegments.length > 0 && SUPPORTED_LANGUAGES.includes(pathSegments[0] as SupportedLanguage)) {
      return '/' + pathSegments.slice(1).join('/');
    }
    return path;
  };

  // Path without language prefix
  const pathWithoutLang = getPathWithoutLang(currentPath);

  // Get canonical URL
  const getCanonicalUrl = () => {
    // Construct non-www URL
    const nonWwwHost = window.location.hostname.replace(/^www\./, ''); // Define nonWwwHost
    const base = `${window.location.protocol}//${nonWwwHost}`;
    let fullPath = '';
    if (currentLanguage && pathWithoutLang && pathWithoutLang !== '/') {
        fullPath = `/${currentLanguage}${pathWithoutLang}`;
    } else if (currentLanguage) {
        fullPath = `/${currentLanguage}`;
    } else {
        fullPath = `/en`;
    }
    // Ensure trailing slash for directories, but not for root if it's just /
    if (fullPath.endsWith('/') && fullPath.length > 1) {
        // It already has a trailing slash, or it's just '/'
    } else if (fullPath.length > 0 && !fullPath.endsWith('/')) {
        // Check if it looks like a file path (contains a dot in the last segment)
        if (!fullPath.substring(fullPath.lastIndexOf('/') + 1).includes('.')) {
            fullPath += '/';
        }
    }

    return `${base}${fullPath}`;
  };

  const canonicalNonWwwUrl = getCanonicalUrl();

  // Detect if we're on www subdomain
  const isWwwHostname = () => {
    if (typeof window !== 'undefined') {
      return window.location.hostname.startsWith('www.');
    }
    return false;
  };

  // Handle www to non-www redirects
  useEffect(() => {
    if (isWwwHostname()) {
      // If we're on www subdomain, redirect to non-www
      // The canonicalNonWwwUrl should already be the correct non-www version with path and lang
      if (window.location.href !== canonicalNonWwwUrl) {
         window.location.href = canonicalNonWwwUrl;
      }
    }
  }, [canonicalNonWwwUrl, currentPath]);

  // This component doesn't render anything visible
  return null;
} 
