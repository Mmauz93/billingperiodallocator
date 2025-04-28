import { InvoiceCalculatorClient } from '@/components/invoice-calculator-client';
import { Metadata } from 'next';

// Define metadata for the App page
export const metadata: Metadata = {
  title: 'BillSplitter | Rechnung aufteilen',
  description: 'Berechnen Sie ARAP & PRAP in wenigen Sekunden – ohne Registrierung, einfach und schnell.',
};

export default function AppPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12">
      <InvoiceCalculatorClient />
    </main>
  );
} 
