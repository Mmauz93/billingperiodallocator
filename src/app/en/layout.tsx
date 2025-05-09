import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BillSplitter – Split Invoices Across Fiscal Years',
  description: 'Split invoices across fiscal years with ease. Divide your invoices into monthly, quarterly, and yearly periods while complying with IFRS 15, HGB, and OR standards.',
  alternates: {
    canonical: 'https://billsplitter.siempi.ch/en/',
    languages: {
      'en': 'https://billsplitter.siempi.ch/en/',
      'de': 'https://billsplitter.siempi.ch/de/',
      'x-default': 'https://billsplitter.siempi.ch/en/'
    }
  }
};

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
