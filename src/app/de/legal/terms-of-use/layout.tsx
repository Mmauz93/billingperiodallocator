import { Metadata } from 'next';
import { generateHreflangMetadata } from '@/lib/seo-utils';

// Generate alternates for this page
const alternates = generateHreflangMetadata('de/legal/terms-of-use');

export const metadata: Metadata = {
  title: 'Nutzungsbedingungen | BillSplitter',
  description: "Nutzungsbedingungen für BillSplitter.",
  alternates
};

export default function LegalTermsLayoutDE({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
