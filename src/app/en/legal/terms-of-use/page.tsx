// Import the new client component

import { Metadata } from 'next';
import TermsOfUseClient from './terms-of-use-client';
import fs from 'fs/promises';
import { getServerSideTranslator } from '@/lib/translation'; // For metadata
import path from 'path';
import process from 'process';

export async function generateMetadata(/* { params }: { params: { lang: string } } */): Promise<Metadata> {
  // Note: This page is /en/legal/terms-of-use/page.tsx, so params.lang might not be directly available
  // We are hardcoding lang = 'en' for this specific file. This should ideally come from params if the folder structure was [lang]
  const currentLang = 'en'; // For this specific file
  const { t } = getServerSideTranslator(currentLang);
  const pageTitle = t("Legal.termsOfUseTitle", "Terms of Use");
  const siteUrl = 'https://billsplitter.siempi.ch';
  const pagePath = `legal/terms-of-use/`;
  const canonicalUrl = `${siteUrl}/${currentLang}/${pagePath}`;

  return {
    title: pageTitle + ' | BillSplitter',
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${siteUrl}/en/${pagePath}`,
        'de': `${siteUrl}/de/${pagePath}`,
        'x-default': `${siteUrl}/en/${pagePath}`,
      },
    },
  };
}

// Server Component: Fetches data and passes it to the Client Component
export default async function TermsOfUsePageEN() {
  const lang = 'en'; // Explicitly 'en' for this file
  let termsContent = '';
  let lastUpdatedDate = '';

  try {
    const filePath = path.join(process.cwd(), 'public', `terms-of-use.md`); // Always fetch english version for this file
    const rawContent = await fs.readFile(filePath, 'utf-8');

    // Extract date (assuming format "Last updated on Month Day, Year")
    const dateMatch = rawContent.match(/^Last updated on (.*)$/m);
    if (dateMatch && dateMatch[1]) {
      lastUpdatedDate = dateMatch[1];
    }

    termsContent = rawContent
        .replace(/^# .*$/m, '') // Remove the first heading (e.g., "# Terms of Use")
        .replace(/^Last updated on.*$/m, '') // Remove the date line
        .trim();

    } catch (error) {
    console.error('Error loading terms of use server-side:', error);
    termsContent = 'Failed to load terms of use. Please try again later.';
    // lastUpdatedDate will remain empty or you can set a default error message for it too
  }

  return <TermsOfUseClient initialContent={termsContent} initialLang={lang} lastUpdatedDate={lastUpdatedDate} />;
}
