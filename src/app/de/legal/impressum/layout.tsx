import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum | BillSplitter',
  description: "Impressum und rechtliche Angaben zur BillSplitter-Plattform.",
  alternates: {
    canonical: 'https://billsplitter.siempi.ch/de/legal/impressum/',
    languages: {
      'en': 'https://billsplitter.siempi.ch/en/legal/impressum/',
      'de': 'https://billsplitter.siempi.ch/de/legal/impressum/',
      'x-default': 'https://billsplitter.siempi.ch/en/legal/impressum/'
    }
  }
};

export default function LegalImpressumLayoutDE({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
