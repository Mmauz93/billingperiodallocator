"use client";

import { Suspense, lazy } from 'react';

import Loading from '../../app/loading';

// Lazy load the main component
const InvoiceCalculatorClient = lazy(() => 
  import('@/components/invoice-calculator-client')
);

// English version of app page
export default function AppPageEN() {
  return (
    // The surrounding layout.tsx provides structure, header, footer
    // This page only needs to render the core calculator component with proper suspense
    <Suspense fallback={<Loading />}>
      <InvoiceCalculatorClient />
    </Suspense>
  );
} 
