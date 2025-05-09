import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | BillSplitter',
  description: "Learn how we protect and handle your personal data. Transparent privacy.",
};

export default function LegalPrivacyLayoutEN({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
