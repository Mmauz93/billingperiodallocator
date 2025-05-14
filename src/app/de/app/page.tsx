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

// German version of app page
export default function AppPageDE() {
  const { t, i18n } = useTranslation();
  const pageTitleForCalculator = t("InvoiceForm.title");

  useEffect(() => {
    // Force German language
    if (i18n.language !== 'de') {
      i18n.changeLanguage('de');
    }
    
    document.title = t("AppPage.title", "Rechner") + " | BillSplitter";
  }, [t, i18n]);

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      {/* Add breadcrumb navigation for better SEO and user navigation */}
      <Breadcrumb currentPage="Rechner" lang="de" />
      
      {/* Main Page Heading - REMOVED */}
      {/* <h1 className="text-3xl font-bold my-6 text-center">
        {t("AppPage.title", "Rechner")}
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
