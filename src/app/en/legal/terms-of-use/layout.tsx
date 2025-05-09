import { Metadata } from 'next';
import { generateSubpageHreflangMetadata } from '@/lib/seo-utils';

// Generate alternates for English terms of use page
const alternates = generateSubpageHreflangMetadata('en', 'legal/terms-of-use');

export const metadata: Metadata = {
  title: 'Terms of Use | BillSplitter',
  description: 'Terms and conditions for using the BillSplitter service. Please read these terms carefully before using our platform.',
  alternates
};

export default function TermsOfUseLayoutEN({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
