import { Metadata } from 'next';
import { generateSubpageHreflangMetadata } from '@/lib/seo-utils';

// Generate alternates for German impressum page
const alternates = generateSubpageHreflangMetadata('de', 'legal/impressum');

export const metadata: Metadata = {
  title: 'Impressum | BillSplitter',
  description: 'Rechtliche Informationen über den Betreiber von BillSplitter, Unternehmensdetails und Kontaktinformationen.',
  alternates
};

export default function ImpressumLayoutDE({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
