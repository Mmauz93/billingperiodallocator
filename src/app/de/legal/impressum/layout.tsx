import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum | BillSplitter',
  description: "Impressum und rechtliche Angaben zur BillSplitter-Plattform.",
};

export default function LegalImpressumLayoutDE({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
