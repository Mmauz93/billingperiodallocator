'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Browser detection and redirection component for the site root
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
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

  // Return null instead of loading state for immediate redirect
  return null;
}
