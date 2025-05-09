import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Notice | BillSplitter',
  description: "Legal notice and publisher information for BillSplitter.",
  alternates: {
    canonical: 'https://billsplitter.siempi.ch/en/legal/impressum/',
    languages: {
      'en': 'https://billsplitter.siempi.ch/en/legal/impressum/',
      'de': 'https://billsplitter.siempi.ch/de/legal/impressum/',
      'x-default': 'https://billsplitter.siempi.ch/en/legal/impressum/'
    }
  }
};

export default function LegalImpressumLayoutEN({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
