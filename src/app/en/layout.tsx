import { Metadata } from 'next';
import { generateHreflangMetadata } from '@/lib/seo-utils';

// Generate alternates for English root page
const alternates = generateHreflangMetadata('en');

export const metadata: Metadata = {
  title: 'BillSplitter – Split Invoices Across Fiscal Years',
  description: 'Split invoices across fiscal years with ease. Divide your invoices into monthly, quarterly, and yearly periods while complying with IFRS 15, HGB, and OR standards.',
  alternates
};

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
