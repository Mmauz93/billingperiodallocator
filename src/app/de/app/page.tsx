// "use client"; // No longer a client component by default

import { Suspense, lazy } from 'react'; // Removed useEffect

import AppSeoContent from '@/components/app-seo-content';
import { Breadcrumb } from '@/components/breadcrumb';
import Loading from '@/components/loading';
import { Metadata } from 'next';
import { SupportedLanguage } from "@/lib/language-service"; // FIXED IMPORT
import { getServerSideTranslator } from '@/lib/translation'; // For metadata

// import { InvoiceCalculatorApp } from "@/components/invoice-calculator-app"; // REMOVED




// import { getTranslations } from "@/lib/translation"; // REMOVED

// import { SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/language-service"; // REMOVED









// import { useTranslation } from '@/translations'; // Not needed for metadata or if title comes from metadata




// Lazy load the main component
const InvoiceCalculatorClient = lazy(() => 
  import('@/components/invoice-calculator-client')
);

export async function generateMetadata(): Promise<Metadata> {
  const currentLang: SupportedLanguage = 'de'; // Hardcoded for de/app/page.tsx
  const { t } = getServerSideTranslator(currentLang);
  const siteUrl = 'https://billsplitter.siempi.ch';
  const pagePath = '/app/'; // Path specific to this page

  return {
    title: t("AppPage.title", "Rechner") + " | BillSplitter",
    description: t("AppPage.metaDescription", "Online-Rechner zur Aufteilung von Rechnungen und wiederkehrenden Ausgaben (z.B. aktive Rechnungsabgrenzungsposten oder passive Rechnungsabgrenzungsposten) auf Geschäftsperioden. Proportionale Aufteilung nach Tagen für IFRS 15, HGB, OR Konformität."), // Ensure German description
    alternates: {
      canonical: `${siteUrl}/${currentLang}${pagePath}`,
      languages: {
        'en': `${siteUrl}/en${pagePath}`,
        'de': `${siteUrl}/de${pagePath}`,
        'x-default': `${siteUrl}/en${pagePath}`,
      },
    },
  };
}

// German version of app page
export default function AppPageDE() {
  // const { t, i18n } = useTranslation(); // No longer needed if page is server component
  // IMPORTANT: Use the exact hardcoded string to avoid hydration mismatch
  // This matches the exact text in de.json for InvoiceForm.title
  const pageTitleForCalculator = "Rechnungsperioden-Rechner";

  // useEffect(() => {
  //   // Force German language
  //   if (i18n.language !== 'de') {
  //     i18n.changeLanguage('de');
  //   }
  //   
  //   document.title = t("AppPage.title", "Rechner") + " | BillSplitter";
  // }, [t, i18n]); // REMOVED

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      {/* Add breadcrumb navigation for better SEO and user navigation */}
      <Breadcrumb currentPage="Rechner" lang="de" />
      
      {/* Main Page Heading - REMOVED */}
      {/* <h1 className="text-3xl font-bold my-6 text-center">
        {t("AppPage.title", "Rechner")}
      </h1> */}
      
      {/* The surrounding layout.tsx provides structure, header, footer */}
      {/* This page only needs to render the core calculator component with proper suspense */}
      <Suspense fallback={<Loading />}>
        <InvoiceCalculatorClient pageTitle={pageTitleForCalculator} />
      </Suspense>
      
      {/* Add SEO content for better discoverability and word count */}
      <AppSeoContent />
    </div>
  );
} 
