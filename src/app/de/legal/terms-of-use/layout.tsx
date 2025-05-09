import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nutzungsbedingungen | BillSplitter',
  description: "Nutzungsbedingungen für BillSplitter.",
};

export default function LegalTermsLayoutDE({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
