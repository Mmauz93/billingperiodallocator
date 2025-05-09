import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Notice | BillSplitter',
  description: "Legal notice and publisher information for BillSplitter.",
};

export default function LegalImpressumLayoutEN({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
