import { Metadata } from 'next';
import { generateHreflangMetadata } from '@/lib/seo-utils';

// Generate alternates for this page
const alternates = generateHreflangMetadata('de/legal/impressum');

export const metadata: Metadata = {
  title: 'Impressum | BillSplitter',
  description: "Impressum und rechtliche Angaben zur BillSplitter-Plattform.",
  alternates
};

export default function LegalImpressumLayoutDE({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
