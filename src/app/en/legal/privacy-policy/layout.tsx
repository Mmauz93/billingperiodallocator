import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | BillSplitter',
  description: "Learn how we protect and handle your personal data. Transparent privacy.",
  alternates: {
    canonical: 'https://billsplitter.siempi.ch/en/legal/privacy-policy/',
    languages: {
      'en': 'https://billsplitter.siempi.ch/en/legal/privacy-policy/',
      'de': 'https://billsplitter.siempi.ch/de/legal/privacy-policy/',
      'x-default': 'https://billsplitter.siempi.ch/en/legal/privacy-policy/'
    }
  }
};

export default function PrivacyPolicyLayoutEN({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
