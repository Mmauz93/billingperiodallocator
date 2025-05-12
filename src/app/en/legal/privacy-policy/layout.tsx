import { Metadata } from 'next';
import { generateSubpageHreflangMetadata } from '@/lib/seo-utils';
import PrivacyPolicyDarkLayoutClient from './PrivacyPolicyDarkLayoutClient';

// Generate alternates for English privacy policy page
const alternates = generateSubpageHreflangMetadata('en', 'legal/privacy-policy');

export const metadata: Metadata = {
  title: 'Privacy Policy | BillSplitter',
  description: 'Our privacy policy outlines how we collect, use, and protect your personal information when using BillSplitter.',
  alternates
};

export default function PrivacyPolicyLayoutEN({ children }: { children: React.ReactNode }) {
  return <PrivacyPolicyDarkLayoutClient>{children}</PrivacyPolicyDarkLayoutClient>;
} 
