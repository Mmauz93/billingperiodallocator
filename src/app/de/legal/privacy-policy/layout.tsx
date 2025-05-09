import { Metadata } from 'next';
import { generateHreflangMetadata } from '@/lib/seo-utils';

// Generate alternates for this page
const alternates = generateHreflangMetadata('de/legal/privacy-policy');

export const metadata: Metadata = {
  title: 'Datenschutzerklärung | BillSplitter',
  description: "Wie wir Ihre Daten schützen – Datenschutzerklärung der BillSplitter-Plattform.",
  alternates
};

export default function PrivacyPolicyLayoutDE({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
