import { Metadata } from 'next';
import { generateHreflangMetadata } from '@/lib/seo-utils';

// Generate alternates for German root page
const alternates = generateHreflangMetadata('de');

export const metadata: Metadata = {
  title: 'BillSplitter – Rechnungen auf Geschäftsjahre aufteilen',
  description: 'Teilen Sie Rechnungen einfach auf Geschäftsjahre auf. Splitten Sie Ihre Rechnungen in monatliche, vierteljährliche und jährliche Perioden gemäß IFRS 15, HGB und OR.',
  alternates
};

export default function GermanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
