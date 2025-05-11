import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useTranslation } from '@/translations';

interface BreadcrumbProps {
  currentPage: string;
  lang: string;
}

export function Breadcrumb({ currentPage, lang }: BreadcrumbProps) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  
  // Get correct language-specific default labels to avoid hydration mismatch
  const getDefaultHomeLabel = () => {
    if (lang === 'de') return 'Startseite';
    return 'Home';
  };
  
  const getDefaultCalculatorLabel = () => {
    if (lang === 'de') return 'Rechner';
    return 'Calculator';
  };
  
  // Use static default text for initial render to avoid hydration mismatch
  const homeLabel = mounted 
    ? t('General.home', { defaultValue: getDefaultHomeLabel() })
    : getDefaultHomeLabel();
    
  const currentPageLabel = currentPage || (mounted 
    ? t('General.calculator', { defaultValue: getDefaultCalculatorLabel() })
    : getDefaultCalculatorLabel());
  
  // After mount, allow React to handle the component normally
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <nav className="flex mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
      <ol className="inline-flex items-center">
        <li className="inline-flex items-center">
          <Link 
            href={`/${lang}/`}
            className="hover:text-primary transition-colors"
          >
            {homeLabel}
          </Link>
        </li>
        <li>
          <div className="flex items-center mx-2">
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
            </svg>
          </div>
        </li>
        <li aria-current="page">
          <span className="text-foreground">{currentPageLabel}</span>
        </li>
      </ol>
      
      {/* Schema.org structured data for breadcrumbs */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": homeLabel,
                "item": `https://billsplitter.siempi.ch/${lang}/`
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": currentPageLabel
              }
            ]
          })
        }}
      />
    </nav>
  );
} 
