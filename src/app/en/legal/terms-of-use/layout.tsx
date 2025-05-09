import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use | BillSplitter',
  description: "Terms of use for the BillSplitter service.",
  alternates: {
    canonical: 'https://billsplitter.siempi.ch/en/legal/terms-of-use/',
    languages: {
      'en': 'https://billsplitter.siempi.ch/en/legal/terms-of-use/',
      'de': 'https://billsplitter.siempi.ch/de/legal/terms-of-use/',
      'x-default': 'https://billsplitter.siempi.ch/en/legal/terms-of-use/'
    }
  }
};

export default function LegalTermsLayoutEN({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
