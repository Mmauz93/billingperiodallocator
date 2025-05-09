import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BillSplitter – Rechnungen auf Geschäftsjahre aufteilen',
  description: 'Teilen Sie Rechnungen einfach auf Geschäftsjahre auf. Splitten Sie Ihre Rechnungen in monatliche, vierteljährliche und jährliche Perioden gemäß IFRS 15, HGB und OR.',
  alternates: {
    canonical: 'https://billsplitter.siempi.ch/de/',
    languages: {
      'en': 'https://billsplitter.siempi.ch/en/',
      'de': 'https://billsplitter.siempi.ch/de/',
      'x-default': 'https://billsplitter.siempi.ch/en/'
    }
  }
};

export default function GermanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
