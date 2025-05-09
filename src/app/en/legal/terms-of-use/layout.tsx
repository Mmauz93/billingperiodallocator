import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use | BillSplitter',
  description: "Terms of use for the BillSplitter service.",
};

export default function LegalTermsLayoutEN({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
