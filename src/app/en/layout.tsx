import { Metadata } from 'next';
import { generateHreflangMetadata } from '@/lib/seo-utils';

// Generate alternates for English root page
const alternates = generateHreflangMetadata('en');

export const metadata: Metadata = {
  title: 'BillSplitter – Split Invoices Across Fiscal Years',
  description: 'Easily allocate invoices across fiscal periods. Split payments into monthly, quarterly, or yearly segments while maintaining IFRS 15, HGB, and OR compliance.',
  alternates,
  openGraph: {
    title: 'BillSplitter – Split Invoices Across Fiscal Years',
    description: 'Easily allocate invoices across fiscal periods. Split payments into monthly, quarterly, or yearly segments while maintaining IFRS 15, HGB, and OR compliance.',
    url: 'https://billsplitter.siempi.ch/en/',
    type: 'website',
    images: [
      {
        url: 'https://billsplitter.siempi.ch/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BillSplitter Invoice Allocation Tool'
      }
    ]
  }
};

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
