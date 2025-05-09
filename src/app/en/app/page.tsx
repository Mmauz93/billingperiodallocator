"use client";

import { Suspense, lazy, useEffect } from 'react';

import Loading from '../../app/loading';
import { useTranslation } from 'react-i18next';

// Lazy load the main component
const InvoiceCalculatorClient = lazy(() => 
  import('@/components/invoice-calculator-client')
);

// English version of app page
export default function AppPageEN() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t("AppPage.title", "Enter Invoice Details") + " | BillSplitter";
  }, [t, i18n.language]);

  return (
    // The surrounding layout.tsx provides structure, header, footer
    // This page only needs to render the core calculator component with proper suspense
    <Suspense fallback={<Loading />}>
      <InvoiceCalculatorClient />
    </Suspense>
  );
} 
