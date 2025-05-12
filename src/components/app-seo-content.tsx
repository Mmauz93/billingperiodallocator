"use client";

import { useEffect, useState } from 'react';

import { usePathname } from 'next/navigation';

/**
 * Client-only SEO content component.
 * Renders JSON-LD structured data only on the client to avoid hydration mismatches.
 */
export default function AppSeoContent() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isAppPage = pathname?.includes('/app');
  
  // Determine language from URL path instead of i18n hooks to avoid hydration issues
  const isGerman = pathname?.includes('/de/');
  
  // Always run this effect at top level
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render during SSR
  if (!mounted || !isAppPage) {
    return null;
  }
  
  // Hardcoded content by language for reliable rendering
  const description = isGerman
    ? "Teilen Sie Rechnungen präzise auf Geschäftsjahre, Quartale oder Monate auf."
    : "Split invoices across fiscal years, quarters, or months with precision.";
  
  return (
    <div className="hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "BillSplitter",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": description
          })
        }}
      />
    </div>
  );
} 
