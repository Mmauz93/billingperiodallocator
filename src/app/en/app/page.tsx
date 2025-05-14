"use client";

import { Suspense, lazy, useEffect } from 'react';

import AppSeoContent from '@/components/app-seo-content';
import { Breadcrumb } from '@/components/breadcrumb';
import Loading from '@/components/loading';
import { useTranslation } from '@/translations';

// Lazy load the main component
const InvoiceCalculatorClient = lazy(() => 
  import('@/components/invoice-calculator-client')
);

// English version of app page
export default function AppPageEN() {
  const { t, i18n } = useTranslation();
  // IMPORTANT: Use the exact hardcoded string to avoid hydration mismatch
  // This matches the exact text in en.json for InvoiceForm.title
  const pageTitleForCalculator = "Invoice Split Calculator";

  useEffect(() => {
    // Force English language
    if (i18n.language !== 'en') {
      i18n.changeLanguage('en');
    }
    
    document.title = t("AppPage.title", "Calculator") + " | BillSplitter";
  }, [t, i18n]);

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      {/* Add breadcrumb navigation for better SEO and user navigation */}
      {/* Use hardcoded "Calculator" instead of t() to prevent hydration mismatch */}
      <Breadcrumb currentPage="Calculator" lang="en" />
      
      {/* Main Page Heading - REMOVED */}
      {/* <h1 className="text-3xl font-bold my-6 text-center">
        {t("AppPage.title", "Calculator")}
      </h1> */}
      
      {/* The surrounding layout.tsx provides structure, header, footer */}
      {/* This page only needs to render the core calculator component with proper suspense */}
      <Suspense fallback={<Loading />}>
        <InvoiceCalculatorClient pageTitle={pageTitleForCalculator} />
      </Suspense>
      
      {/* Add SEO content for better discoverability and word count */}
      <AppSeoContent />
    </div>
  );
} 
