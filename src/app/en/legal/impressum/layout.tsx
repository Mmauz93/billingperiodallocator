import { Metadata } from 'next';
import { generateHreflangMetadata } from '@/lib/seo-utils';

// Generate alternates for this page
const alternates = generateHreflangMetadata('en/legal/impressum');

export const metadata: Metadata = {
  title: 'Legal Notice | BillSplitter',
  description: "Legal notice and publisher information for BillSplitter.",
  alternates
};

export default function LegalImpressumLayoutEN({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
