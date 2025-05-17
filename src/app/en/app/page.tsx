import { Suspense, lazy } from "react";

import AppSeoContent from "@/components/app-seo-content";
import { Breadcrumb } from "@/components/breadcrumb";
import Loading from "@/components/loading";
import { Metadata } from "next";
import { SupportedLanguage } from "@/lib/language-service";
import { getServerSideTranslator } from "@/lib/translation";

const InvoiceCalculatorClient = lazy(
  () => import("@/components/invoice-calculator-client"),
);

export async function generateMetadata(): Promise<Metadata> {
  const currentLang: SupportedLanguage = "en";
  const { t } = getServerSideTranslator(currentLang);
  const siteUrl = "https://billsplitter.siempi.ch";
  const pagePath = "/app/";

  return {
    title: t("AppPage.title", "Calculator") + " | BillSplitter",
    description: t(
      "AppPage.metaDescription",
      "Online calculator to split invoices and recurring expenses (e.g. prepaid expenses or deferred revenue) across fiscal periods. Proportional allocation by days for IFRS 15, HGB, OR compliance.",
    ),
    alternates: {
      canonical: `${siteUrl}/${currentLang}${pagePath}`,
      languages: {
        en: `${siteUrl}/en${pagePath}`,
        de: `${siteUrl}/de${pagePath}`,
        "x-default": `${siteUrl}/en${pagePath}`,
      },
    },
  };
}

// English version of app page
export default function AppPageEN() {
  const pageTitleForCalculator = "Invoice Split Calculator";

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      <Breadcrumb currentPage="Calculator" lang="en" />

      <Suspense fallback={<Loading />}>
        <InvoiceCalculatorClient pageTitle={pageTitleForCalculator} />
      </Suspense>

      <AppSeoContent />
    </div>
  );
}
