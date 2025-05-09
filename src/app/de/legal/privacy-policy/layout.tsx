import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung | BillSplitter',
  description: "Wie wir Ihre Daten schützen – Datenschutzerklärung der BillSplitter-Plattform.",
};

export default function LegalPrivacyLayoutDE({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
