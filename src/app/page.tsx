import { InvoiceCalculatorClient } from '@/components/invoice-calculator-client'; // Import the new client component
// No longer a client component at the page level
import { Metadata } from 'next';

// Define metadata for the Home page
export const metadata: Metadata = {
  title: 'Allocate Multi-Year Invoices Easily', // Specific title for the home page
  description: 'Online tool to accurately split and allocate invoice amounts across multiple fiscal years or periods based on start and end dates. Perfect for accountants and budget planning.',
  // Optional: Add page-specific Open Graph details if different from layout
  // openGraph: {
  //   title: 'Override OG Title for Home',
  //   description: 'Override OG Description for Home',
  // },
};

// Define the JSON-LD Schema for the WebApplication
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Invoice Split Calculator',
  description: metadata.description, // Reuse description from metadata
  url: 'https://billsplitter.siempi.ch/',
  applicationCategory: 'FinanceApplication', // More specific category
  operatingSystem: 'Any', // It's web-based
  offers: {
    '@type': 'Offer',
    price: '0', // Assuming it's free
    priceCurrency: 'CHF' // Specify currency if applicable, even if free
  },
  creator: {
      '@type': 'Organization',
      name: 'Siempi AG', // Assuming from copyright
      url: 'https://siempi.ch/' // Assuming base domain
  }
};

export default function Home() {
  // Define a default title for server-side rendering and initial client render
  const defaultPageTitle = "Invoice Allocation Calculator";

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-12 lg:p-24">
      {/* Embed JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

       {/* Render the client component which contains all the interactive UI */}
       <InvoiceCalculatorClient pageTitle={defaultPageTitle} />
    </main>
  );
}
