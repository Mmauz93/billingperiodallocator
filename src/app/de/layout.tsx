import { Metadata } from 'next';
import { generateHreflangMetadata } from '@/lib/seo-utils';

// Generate alternates for German root page
const alternates = generateHreflangMetadata('de');

export const metadata: Metadata = {
  title: 'BillSplitter – Rechnungen auf Geschäftsjahre aufteilen',
  description: 'Teilen Sie Rechnungen einfach auf Geschäftsperioden auf. Splitten Sie Zahlungen in monatliche, vierteljährliche und jährliche Abschnitte gemäß IFRS 15, HGB und OR.',
  alternates,
  openGraph: {
    title: 'BillSplitter – Rechnungen auf Geschäftsjahre aufteilen',
    description: 'Teilen Sie Rechnungen einfach auf Geschäftsperioden auf. Splitten Sie Zahlungen in monatliche, vierteljährliche und jährliche Abschnitte gemäß IFRS 15, HGB und OR.',
    url: 'https://billsplitter.siempi.ch/de/',
    type: 'website',
    images: [
      {
        url: 'https://billsplitter.siempi.ch/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BillSplitter Rechnungsaufteilungstool'
      }
    ]
  }
};

export default function GermanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
