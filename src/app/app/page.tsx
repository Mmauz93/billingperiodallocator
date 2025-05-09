"use client";

import { Suspense, lazy } from 'react';

import Loading from './loading';

// Lazy load the main component
const InvoiceCalculatorClient = lazy(() => 
  import('@/components/invoice-calculator-client')
);

// No metadata needed here, handled by layout.tsx

export default function AppPage() {
  return (
    // The surrounding layout.tsx provides structure, header, footer
    // This page only needs to render the core calculator component with proper suspense
    <Suspense fallback={<Loading />}>
      <InvoiceCalculatorClient />
    </Suspense>
  );
} 
