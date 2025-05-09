import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anwendung | BillSplitter',
  description: "Nutzen Sie das BillSplitter-Tool zum Hochladen & Aufteilen von Rechnungen.",
};

export default function AppLayoutDE({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
