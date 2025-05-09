import { Metadata } from 'next';

// Server component root page
export const metadata: Metadata = {
  title: 'BillSplitter – Split Invoices Across Fiscal Years',
  description: "Split invoices across fiscal years with ease. Handle active/passive accruals for accounting.",
};

export default function RootPage() {
  // This page component is primarily to ensure the root URL has metadata.
  // Content or redirection can be handled by other means if necessary.
  return (
    <>
      {/* Root page content can go here */}
    </>
  );
}
