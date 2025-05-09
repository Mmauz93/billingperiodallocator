import { Metadata } from 'next';
import { generateHreflangMetadata } from '@/lib/seo-utils';

// Generate alternates for English app page
const alternates = generateHreflangMetadata('en/app');

export const metadata: Metadata = {
  title: 'Calculator | BillSplitter',
  description: "Use the BillSplitter tool to upload and split invoices. Free for private use.",
  alternates
};

export default function AppLayoutEN({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
