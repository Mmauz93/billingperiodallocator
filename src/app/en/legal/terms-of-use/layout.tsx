import { Metadata } from 'next';
import { generateHreflangMetadata } from '@/lib/seo-utils';

// Generate alternates for this page
const alternates = generateHreflangMetadata('en/legal/terms-of-use');

export const metadata: Metadata = {
  title: 'Terms of Use | BillSplitter',
  description: "Terms of use for the BillSplitter service.",
  alternates
};

export default function LegalTermsLayoutEN({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
