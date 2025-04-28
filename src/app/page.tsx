import { InvoiceCalculatorClient } from '@/components/invoice-calculator-client';
import { Metadata } from 'next';

// No longer a client component at the page level


// Define metadata for the Home page
export const metadata: Metadata = {
  title: 'BillSplitter - Easy Bill Period Allocation',
  description: 'Split bills over time periods easily. Perfect for sharing costs or calculating periodic expenses.',
  // Add other metadata here
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12">
      <InvoiceCalculatorClient />
    </main>
  );
}
