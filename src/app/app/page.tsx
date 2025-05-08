"use client";

import { InvoiceCalculatorClient } from "@/components/invoice-calculator-client";

// No metadata needed here, handled by layout.tsx

export default function AppPage() {
  return (
    // The surrounding layout.tsx provides structure, header, footer
    // This page only needs to render the core calculator component
    <InvoiceCalculatorClient pageTitle="Invoice Calculator" />
  );
} 
