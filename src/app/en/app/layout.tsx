import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Application | BillSplitter',
  description: "Use the BillSplitter tool to upload and split invoices. Free for private use.",
};

export default function AppLayoutEN({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
