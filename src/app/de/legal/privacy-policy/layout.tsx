import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung | BillSplitter',
  description: "Wie wir Ihre Daten schützen – Datenschutzerklärung der BillSplitter-Plattform.",
  alternates: {
    canonical: 'https://billsplitter.siempi.ch/de/legal/privacy-policy/',
    languages: {
      'en': 'https://billsplitter.siempi.ch/en/legal/privacy-policy/',
      'de': 'https://billsplitter.siempi.ch/de/legal/privacy-policy/',
      'x-default': 'https://billsplitter.siempi.ch/en/legal/privacy-policy/'
    }
  }
};

export default function PrivacyPolicyLayoutDE({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
