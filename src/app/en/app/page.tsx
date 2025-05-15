// "use client"; // No longer a client component by default

import { Suspense, lazy } from 'react'; // Removed useEffect

import AppSeoContent from '@/components/app-seo-content';
import { Breadcrumb } from '@/components/breadcrumb';
import Loading from '@/components/loading';
import { Metadata } from 'next';
import { SupportedLanguage } from '@/lib/language-service';
import { getServerSideTranslator } from '@/lib/translation'; // For metadata

// import { useTranslation } from '@/translations'; // Not needed for metadata or if title comes from metadata




// Lazy load the main component
const InvoiceCalculatorClient = lazy(() => 
  import('@/components/invoice-calculator-client')
);

export async function generateMetadata(): Promise<Metadata> {
  const currentLang: SupportedLanguage = 'en'; // Hardcoded for en/app/page.tsx
  const { t } = getServerSideTranslator(currentLang);
  const siteUrl = 'https://billsplitter.siempi.ch';
  const pagePath = '/app/'; // Path specific to this page

  return {
    title: t("AppPage.title", "Calculator") + " | BillSplitter",
    description: t("AppPage.metaDescription", "Online calculator to split invoices and recurring expenses (e.g. prepaid expenses or deferred revenue) across fiscal periods. Proportional allocation by days for IFRS 15, HGB, OR compliance."),
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

// English version of app page
export default function AppPageEN() {
  // const { t, i18n } = useTranslation(); // No longer needed if page is server component
  // IMPORTANT: Use the exact hardcoded string to avoid hydration mismatch
  // This matches the exact text in en.json for InvoiceForm.title
  const pageTitleForCalculator = "Invoice Split Calculator"; // This could be passed if InvoiceCalculatorClient needs it, or it uses its own t()

  // useEffect(() => {
  //   // Force English language
  //   if (i18n.language !== 'en') {
  //     i18n.changeLanguage('en');
  //   }
  //   
  //   document.title = t("AppPage.title", "Calculator") + " | BillSplitter";
  // }, [t, i18n]); // REMOVED

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      {/* Add breadcrumb navigation for better SEO and user navigation */}
      {/* Use hardcoded "Calculator" instead of t() to prevent hydration mismatch */}
      <Breadcrumb currentPage="Calculator" lang="en" />
      
      {/* Main Page Heading - REMOVED */}
      {/* <h1 className="text-3xl font-bold my-6 text-center">
        {t("AppPage.title", "Calculator")}
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
