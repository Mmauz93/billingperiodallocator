import { SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/language-service";
import {
  TypographyH1,
  TypographyH2,
  TypographyLarge,
  TypographyLead,
} from "@/components/ui/typography";
import {
  ctaSubtitle,
  ctaTitle,
  demoAmount,
  demoEndDate,
  demoIncludeEndDate,
  demoSplitPeriod,
  demoStartDate,
  faqData,
  feature1Desc,
  feature1Title,
  feature2Desc,
  feature2Title,
  feature3Desc,
  feature3Title,
  heroSubtitle,
  heroTitle,
} from "./landing-page-data";

import { FaqSection } from "@/components/faq-section";
import { FeatureCard } from "@/components/feature-card";
import Image from "next/image";
import LandingPageClientInteractions from "@/components/landing-page-client-interactions";
import Link from "next/link";
import { Metadata } from "next";
import { PageSection } from "@/components/page-section";
import React from "react";
import { getServerSideTranslator } from "@/lib/translation";

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  // Validate language parameter
  const currentLang =
    params.lang &&
    SUPPORTED_LANGUAGES.includes(params.lang as SupportedLanguage)
      ? (params.lang as SupportedLanguage)
      : ("de" as SupportedLanguage);

  const { t } = getServerSideTranslator(currentLang);
  const siteUrl = "https://billsplitter.siempi.ch";
  const canonicalUrl = `${siteUrl}/${currentLang}/`;

  return {
    title: t(
      "LandingPage.title",
      "BillSplitter – Rechnungen auf Geschäftsperioden aufteilen",
    ),
    description: t(
      "LandingPage.metaDescription",
      "Rechnungen einfach auf Geschäftsperioden aufteilen. Zahlungen monatlich, vierteljährlich, jährlich splitten – gemäß IFRS 15, HGB, OR.",
    ),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${siteUrl}/en/`,
        de: `${siteUrl}/de/`,
        "x-default": `${siteUrl}/en/`, // Default to English version
      },
    },
  };
}

export default async function GermanLandingPage({
  params,
}: {
  params: { lang: string };
}) {
  // Validate language parameter
  const lang =
    params.lang &&
    SUPPORTED_LANGUAGES.includes(params.lang as SupportedLanguage)
      ? (params.lang as SupportedLanguage)
      : ("de" as SupportedLanguage);

  const { t } = getServerSideTranslator(lang);

  const faqSectionTitle = t("Landing.faqTitle", {
    defaultValue: "Häufig gestellte Fragen",
  });

  // Prepare ldJsonMainEntity using server-side t
  const ldJsonMainEntity = faqData.map((item, index) => ({
    "@type": "Question" as const,
    name: t(`Landing.faqQuestion${index + 1}`, { defaultValue: item.question }),
    acceptedAnswer: {
      "@type": "Answer" as const,
      text: t(`Landing.faqAnswer${index + 1}`, { defaultValue: item.answer }),
    },
  }));

  return (
    <>
      {/* Hero Section */}
      <PageSection
        as="header"
        py="20"
        bg="bg-background"
        mb="16"
        textAlignment="text-center"
        maxWidth="3xl"
      >
        <Image
          src="/images/icon.svg"
          alt={t("Landing.logoAlt", { defaultValue: "BillSplitter Logo" })}
          width={64}
          height={64}
          className="mx-auto mb-6 w-16 h-16"
          priority
        />
        <TypographyH1 className="mb-6 cursor-default">
          {t("Landing.heroTitle", { defaultValue: heroTitle })}
        </TypographyH1>
        <TypographyLead className="cursor-default">
          {t("Landing.heroSubtitle", { defaultValue: heroSubtitle })}
        </TypographyLead>
      </PageSection>

      {/* Features Section */}
      <PageSection
        maxWidth="6xl"
        bg="bg-background"
        className="grid gap-10 md:grid-cols-3"
        py="16"
        mb="16"
      >
        <FeatureCard
          iconSrc="/feature-icon-1.svg"
          iconAlt={t("Landing.feature1Alt", {
            defaultValue: "Genaue Zuordnungs-Ikone",
          })}
          title={t("Landing.feature1Title", { defaultValue: feature1Title })}
          description={
            <>
              {t("Landing.feature1Desc", { defaultValue: feature1Desc })}{" "}
              Erfahren Sie mehr über die{" "}
              <Link
                href="https://de.wikipedia.org/wiki/Periodenabgrenzung"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:opacity-80 whitespace-nowrap cursor-pointer select-none"
              >
                Periodenabgrenzung
              </Link>
              .
            </>
          }
        />
        <FeatureCard
          iconSrc="/feature-icon-2.svg"
          iconAlt={t("Landing.feature2Alt", {
            defaultValue: "Abgegrenzte Einnahmen Ikone",
          })}
          title={t("Landing.feature2Title", { defaultValue: feature2Title })}
          description={
            <>
              {t("Landing.feature2Desc", { defaultValue: feature2Desc })} Im
              Einklang mit{" "}
              <Link
                href="https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:opacity-80 whitespace-nowrap cursor-pointer select-none"
              >
                IFRS 15
              </Link>{" "}
              Standards.
            </>
          }
        />
        <FeatureCard
          iconSrc="/feature-icon-3.svg"
          iconAlt={t("Landing.feature3Alt", {
            defaultValue: "Kein Login Notwendig Ikone",
          })}
          title={t("Landing.feature3Title", { defaultValue: feature3Title })}
          description={
            <>
              {t("Landing.feature3Desc", { defaultValue: feature3Desc })} Lesen
              Sie mehr über unsere{" "}
              <Link
                href={`/${lang}/legal/privacy-policy`}
                className="text-primary underline hover:opacity-80 whitespace-nowrap cursor-pointer select-none"
              >
                Datenschutzrichtlinie
              </Link>
              .
            </>
          }
        />
      </PageSection>

      {/* Call to Action */}
      <PageSection py="20" mb="16" maxWidth="full">
        <div className="max-w-4xl mx-auto bg-card border border-border/40 shadow-lg rounded-xl overflow-hidden cursor-default">
          <div className="flex flex-col md:flex-row items-center p-8 md:p-10 gap-8 cursor-default">
            <div className="text-left flex-1 cursor-default">
              <TypographyH2 className="mb-4 text-primary cursor-default">
                {t("Landing.ctaTitle", { defaultValue: ctaTitle })}
              </TypographyH2>
              <TypographyLarge className="mb-6 text-muted-foreground cursor-default">
                {t("Landing.ctaSubtitle", { defaultValue: ctaSubtitle })}{" "}
                Erfahren Sie, wie{" "}
                <a
                  href="https://www.investopedia.com/terms/a/accrualaccounting.asp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline cursor-pointer select-none"
                >
                  Periodenabgrenzung
                </a>{" "}
                Ihre Finanzberichterstattung verbessern kann.
              </TypographyLarge>
              <LandingPageClientInteractions
                buttonText={t("Landing.ctaButton", {
                  defaultValue: "Test with Demo Data",
                })}
                demoStartDate={demoStartDate}
                demoEndDate={demoEndDate}
                demoAmount={demoAmount}
                demoIncludeEndDate={demoIncludeEndDate}
                demoSplitPeriod={demoSplitPeriod}
                appPath={`/${lang}/app`} // Construct app path based on lang
              />
            </div>
            <div className="flex-shrink-0 w-full md:w-1/3 flex justify-center">
              <Image
                src="/images/calculator-illustration.svg"
                alt={t("Landing.ctaIconAlt", {
                  defaultValue: "Invoice Allocation Illustration",
                })}
                width={240}
                height={180}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </PageSection>

      <FaqSection
        faqData={faqData}
        title={faqSectionTitle}
        ldJsonMainEntity={ldJsonMainEntity}
      />
    </>
  );
}
