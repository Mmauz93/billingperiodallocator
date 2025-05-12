import Link from 'next/link';

interface BreadcrumbProps {
  currentPage: string;
  lang: string;
}

/**
 * Simple breadcrumb component with hardcoded translations for stability.
 * No client-side effects or hooks to cause hydration issues.
 */
export function Breadcrumb({ currentPage, lang }: BreadcrumbProps) {
  // Static translations to avoid hydration mismatches
  const homeLabel = lang === 'de' ? 'Startseite' : 'Home';
  
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
          <span className="text-foreground">{currentPage}</span>
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
                "name": currentPage
              }
            ]
          })
        }}
      />
    </nav>
  );
} 
