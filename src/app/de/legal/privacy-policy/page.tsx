import { ForceDarkTheme } from '@/components/force-dark-theme';
import { Metadata } from 'next';
import PrivacyWidgetClientWrapper from '@/components/privacy-widget-client-wrapper';
import React from 'react';
import { ThemeProvider } from "next-themes";
import { getServerSideTranslator } from '@/lib/translation';

export async function generateMetadata(/* { params }: { params: { lang: string } } */): Promise<Metadata> {
  const currentLang = 'de'; // For this specific /de/ page
  const { t } = getServerSideTranslator(currentLang);
  const pageTitle = t("Legal.privacyPolicyTitle", "Datenschutzerklärung");
  const siteUrl = 'https://billsplitter.siempi.ch';
  const pagePath = `legal/privacy-policy/`;
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

export default async function PrivacyPolicyPageDE(/* { params }: { params: { lang: string }} */) {
  const lang = 'de'; // Explicitly 'de' for this page
  const { t } = getServerSideTranslator(lang);
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <ForceDarkTheme />
      <ThemeProvider attribute="class" forcedTheme="dark">
        <main className="container mx-auto max-w-3xl px-6 py-16 dark" style={{ backgroundColor: "#121212" }}>
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#0284C7] to-[#0284C7]/80 bg-clip-text text-transparent">
              {t("Legal.privacyPolicyTitle", "Datenschutzerklärung")}
            </h1>
            <p className="text-sm text-white opacity-70 mt-2">
              {`${t("Legal.lastUpdatedPrefix", "Zuletzt aktualisiert am")} ${formattedDate}`}
            </p>
          </div>
          <PrivacyWidgetClientWrapper lang={lang} />
        </main>
      </ThemeProvider>
    </>
  );
} 
