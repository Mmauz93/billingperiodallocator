import { ForceDarkTheme } from '@/components/force-dark-theme';
import { Metadata } from 'next';
import PrivacyWidgetClientWrapper from '@/components/privacy-widget-client-wrapper';
import React from 'react';
import { ThemeProvider } from "next-themes"; // Keep for forced dark theme
import { getServerSideTranslator } from '@/lib/translation';

export async function generateMetadata(/* { params }: { params: { lang: string } } */): Promise<Metadata> {
  const currentLang = 'en'; // For this specific /en/ page
  const { t } = getServerSideTranslator(currentLang);
  const pageTitle = t("Legal.privacyPolicyTitle", "Privacy Policy");
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

// Optional: Client component to enforce body dark mode if ThemeProvider on main isn't enough
// For now, we assume ThemeProvider on the main div is sufficient.
// If not, this could be added:
// "use client";
// import { useEffect } from 'react';
// export function BodyDarkModeSetter() {
//   useEffect(() => {
//     document.body.classList.add('dark');
//     document.documentElement.classList.add('dark'); // Ensure html tag also has it
//     document.documentElement.style.colorScheme = 'dark';
//     return () => {
//       document.body.classList.remove('dark');
//       document.documentElement.classList.remove('dark');
//       document.documentElement.style.colorScheme = '';
//     };
//   }, []);
//   return null;
// }

export default async function PrivacyPolicyPageEN(/* { params }: { params: { lang: string }} */) {
  const lang = 'en'; // Explicitly 'en' for this page
  const { t } = getServerSideTranslator(lang);
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <ForceDarkTheme>
      <ThemeProvider attribute="class" forcedTheme="dark"> {/* Applies dark theme to this page context */}
        {/* <BodyDarkModeSetter /> */}{/* Uncomment if explicit body/html styling is needed beyond ThemeProvider */}
        <main className="container mx-auto max-w-3xl px-6 py-16 dark bg-background">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {t("Legal.privacyPolicyTitle", "Privacy Policy")}
            </h1>
            <p className="text-sm text-foreground opacity-70 mt-2">
              {`${t("Legal.lastUpdatedPrefix", "Last updated on")} ${formattedDate}`}
            </p>
          </div>
          <PrivacyWidgetClientWrapper lang={lang} />
        </main>
      </ThemeProvider>
    </ForceDarkTheme>
  );
} 
