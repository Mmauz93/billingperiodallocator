import { SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/language-service";

import { ForceDarkTheme } from "@/components/force-dark-theme";
import { Metadata } from "next";
import PrivacyWidgetClientWrapper from "@/components/privacy-widget-client-wrapper";
import React from "react";
import { ThemeProvider } from "next-themes";
import { getServerSideTranslator } from "@/lib/translation";

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang =
    params.lang &&
    SUPPORTED_LANGUAGES.includes(params.lang as SupportedLanguage)
      ? (params.lang as SupportedLanguage)
      : ("de" as SupportedLanguage);

  const { t } = getServerSideTranslator(lang);
  const pageTitle = t("Legal.privacyPolicyTitle", "Datenschutzerklärung");
  const siteUrl = "https://billsplitter.siempi.ch";
  const pagePath = `legal/privacy-policy/`;
  const canonicalUrl = `${siteUrl}/${lang}/${pagePath}`;

  return {
    title: pageTitle + " | BillSplitter",
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${siteUrl}/en/${pagePath}`,
        de: `${siteUrl}/de/${pagePath}`,
        "x-default": `${siteUrl}/en/${pagePath}`,
      },
    },
  };
}

export default async function PrivacyPolicyPageDE({
  params,
}: {
  params: { lang: string };
}) {
  const lang =
    params.lang &&
    SUPPORTED_LANGUAGES.includes(params.lang as SupportedLanguage)
      ? (params.lang as SupportedLanguage)
      : ("de" as SupportedLanguage);

  const { t } = getServerSideTranslator(lang);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <ForceDarkTheme>
      <ThemeProvider attribute="class" forcedTheme="dark">
        <main className="container mx-auto max-w-3xl px-6 py-16 dark bg-background cursor-default">
          <div className="mb-6 text-center cursor-default">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent cursor-default">
              {t("Legal.privacyPolicyTitle", "Datenschutzerklärung")}
            </h1>
            <p className="text-sm text-foreground opacity-70 mt-2 cursor-default">
              {`${t("Legal.lastUpdatedPrefix", "Zuletzt aktualisiert am")} ${formattedDate}`}
            </p>
          </div>
          <PrivacyWidgetClientWrapper lang={lang} />
        </main>
      </ThemeProvider>
    </ForceDarkTheme>
  );
}
