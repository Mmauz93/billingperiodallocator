import { Metadata } from 'next';
import { ReactNode } from 'react';

// The only supported languages - used for validation
const SUPPORTED_LANGUAGES = ['en', 'de'];

interface LangLayoutProps {
  children: ReactNode;
  params: {
    lang: string;
  };
}

// Generate metadata for language-specific routes
export async function generateMetadata({ params }: { params: { lang: string }}): Promise<Metadata> {
  // Validate language
  const lang = SUPPORTED_LANGUAGES.includes(params.lang) ? params.lang : 'en';
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
export default function LangLayout({ children, params }: LangLayoutProps) {
  // Validate language parameter
  const lang = SUPPORTED_LANGUAGES.includes(params.lang) ? params.lang : 'en';
  
  return (
    <>
      {/* Immediately set language attributes on HTML tag */}
      <script 
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Set HTML language attributes using the URL's language
              document.documentElement.lang = "${lang}";
              document.documentElement.setAttribute("data-lang", "${lang}");
              document.documentElement.classList.add("lang-${lang}");
              
              // Store language in localStorage for client-side components
              localStorage.setItem('billingperiodallocator-language', '${lang}');
              
              // Force any already loaded components to use this language
              try {
                document.dispatchEvent(new CustomEvent('languageChanged', { 
                  detail: { language: '${lang}' } 
                }));
              } catch(e) {}
            })();
          `,
        }}
      />
      {children}
    </>
  );
} 
