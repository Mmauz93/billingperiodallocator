import { Metadata } from 'next';
import { generateHreflangMetadata } from '@/lib/seo-utils';

// Generate alternates for this page
const alternates = generateHreflangMetadata('en/legal/privacy-policy');

export const metadata: Metadata = {
  title: 'Privacy Policy | BillSplitter',
  description: "Learn how we protect and handle your personal data. Transparent privacy.",
  alternates
};

export default function PrivacyPolicyLayoutEN({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
