import { FaqItem, FaqSection } from "@/components/faq-section";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/language-service';
import { TypographyH1, TypographyH2, TypographyLarge, TypographyLead } from "@/components/ui/typography";

import { FeatureCard } from "@/components/feature-card";
import Image from "next/image";
import LandingPageClientInteractions from "@/components/landing-page-client-interactions";
import Link from "next/link";
import { Metadata } from 'next';
import { PageSection } from "@/components/page-section";
import React from "react";
import { getServerSideTranslator } from '@/lib/translation';

// REMOVED Dev comment about FaqItem as it's imported and used.
// // Define or ensure FaqItem is correctly typed if not exported from faq-section
// // export type FaqItem = { question: string; answer: string; };

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  // Validate language parameter
  const currentLang = (params.lang && SUPPORTED_LANGUAGES.includes(params.lang as SupportedLanguage))
    ? params.lang as SupportedLanguage
    : 'en' as SupportedLanguage;
    
  const { t } = getServerSideTranslator(currentLang);
  const siteUrl = 'https://billsplitter.siempi.ch';
  const canonicalUrl = `${siteUrl}/${currentLang}/`;

  return {
    title: t('LandingPage.title', 'BillSplitter – Split Invoices Across Fiscal Periods'),
    description: t('LandingPage.metaDescription', 'Easily split invoices across fiscal periods. Allocate payments monthly, quarterly, or yearly according to IFRS 15, HGB, and OR standards.'),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${siteUrl}/en/`,
        'de': `${siteUrl}/de/`,
        'x-default': `${siteUrl}/en/`,
      },
    },
  };
}

export default async function EnglishLandingPage({ params }: { params: { lang: string }}) {
  // Validate language parameter
  const lang = (params.lang && SUPPORTED_LANGUAGES.includes(params.lang as SupportedLanguage))
    ? params.lang as SupportedLanguage
    : 'en' as SupportedLanguage;
    
  const { t } = getServerSideTranslator(lang);

  // Define default texts for translation keys (these are fallbacks for t())
  const heroTitle = "Automated Invoice Split Calculator";
  const heroSubtitle = "BillSplitter helps you split invoices across fiscal years accurately and effortlessly. Built for finance professionals and businesses. Fast, simple, precise.";
  const feature1Title = "Accurate Period Allocation";
  const feature1Desc = "Automatically calculate how much of an invoice belongs to each fiscal year — no more manual errors.";
  const feature2Title = "Prepaid Expenses & Deferred Revenue";
  const feature2Desc = "Supports allocation aligned with IFRS 15, HGB, and OR standards for clean, compliant bookkeeping.";
  const feature3Title = "No Login. No Data Storage.";
  const feature3Desc = "Use BillSplitter instantly without creating an account. Your data stays secure and private.";
  const ctaTitle = "Start Splitting Invoices Now";
  const ctaSubtitle = "Launch the calculator and automate your revenue and expense allocations within seconds.";
  
  // FAQ content for SEO (remains the same, as FaqSection handles its own translations now)
  const faqData: FaqItem[] = [
    {
      question: "How does BillSplitter calculate invoice allocations?",
      answer: "BillSplitter calculates proportional allocations based on the exact number of days in each fiscal period. It divides the total invoice amount by the number of days in the service period, then multiplies by the days in each fiscal year or period."
    },
    {
      question: "Do I need to create an account to use BillSplitter?",
      answer: "No, BillSplitter is completely account-free. You can use it instantly without signing up, creating a password, or providing any personal information. Your data is processed locally and never stored on our servers."
    },
    {
      question: "Is BillSplitter compliant with accounting standards?",
      answer: "Yes, BillSplitter follows the principles of accrual accounting in accordance with <a href='https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/' target='_blank' rel='noopener noreferrer' class='text-primary hover:underline whitespace-nowrap'>IFRS 15</a>, <a href='https://www.gesetze-im-internet.de/hgb/' target='_blank' rel='noopener noreferrer' class='text-primary hover:underline whitespace-nowrap'>HGB</a>, and <a href='https://www.fedlex.admin.ch/eli/cc/27/317_321_377/en' target='_blank' rel='noopener noreferrer' class='text-primary hover:underline whitespace-nowrap'>OR</a> standards, making it suitable for proper recognition of deferred revenue and prepaid expenses in financial statements."
    },
    {
      question: "Can I split invoices by monthly, quarterly, or yearly periods?",
      answer: "Yes, BillSplitter supports multiple splitting options. You can allocate invoices across yearly, quarterly, or monthly periods depending on your accounting and reporting needs."
    },
    {
      question: "How accurate are the calculations?",
      answer: "BillSplitter provides highly accurate calculations down to the day, with proper rounding to the decimal place of your choice. Any minor rounding differences are automatically adjusted to ensure the total always matches your input amount."
    }
  ];
  
  const faqSectionTitle = t('Landing.faqTitle', { defaultValue: 'Frequently Asked Questions' });

  // Prepare ldJsonMainEntity using server-side t
  const ldJsonMainEntity = faqData.map((item, index) => ({
    "@type": "Question" as const,
    name: t(`Landing.faqQuestion${index + 1}`, { defaultValue: item.question }),
    acceptedAnswer: {
      "@type": "Answer" as const,
      text: t(`Landing.faqAnswer${index + 1}`, { defaultValue: item.answer }),
    },
  }));

  // Demo data for pre-filling the calculator form (remains the same)
  const demoEndDate = "2025-04-29";
  const demoStartDate = "2024-11-01";
  const demoAmount = "5000";
  const demoIncludeEndDate = "true";
  const demoSplitPeriod = "yearly" as 'yearly' | 'quarterly' | 'monthly'; // Ensure type
  
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
          alt={t('Landing.logoAlt', { defaultValue: 'BillSplitter Logo' })} 
          width={64}
          height={64}
          className="mx-auto mb-6 w-16 h-16" 
          priority // Keep priority for LCP elements
        />
        <TypographyH1 className="mb-6 cursor-default">
          {t('Landing.heroTitle', { defaultValue: heroTitle })}
        </TypographyH1>
        <TypographyLead className="cursor-default">
          {t('Landing.heroSubtitle', { defaultValue: heroSubtitle })}
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
          iconAlt={t('Landing.feature1Alt', { defaultValue: 'Accurate Allocation Icon' })}
          title={t('Landing.feature1Title', { defaultValue: feature1Title })}
          description={
            <>
              {t('Landing.feature1Desc', { defaultValue: feature1Desc })} Learn more about <Link href="https://en.wikipedia.org/wiki/Matching_principle" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80 whitespace-nowrap cursor-pointer select-none">expense recognition</Link>.
            </>
          }
        />
        <FeatureCard
          iconSrc="/feature-icon-2.svg"
          iconAlt={t('Landing.feature2Alt', { defaultValue: 'Deferred Revenue Icon' })}
          title={t('Landing.feature2Title', { defaultValue: feature2Title })}
          description={
            <>
              {t('Landing.feature2Desc', { defaultValue: feature2Desc })} In line with <Link href="https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80 whitespace-nowrap cursor-pointer select-none">IFRS 15</Link> standards.
            </>
          }
        />
        <FeatureCard
          iconSrc="/feature-icon-3.svg"
          iconAlt={t('Landing.feature3Alt', { defaultValue: 'No Login Needed Icon' })}
          title={t('Landing.feature3Title', { defaultValue: feature3Title })}
          description={
            <>
              {t('Landing.feature3Desc', { defaultValue: feature3Desc })} Read more about our <Link href={`/${lang}/legal/privacy-policy`} className="text-primary underline hover:opacity-80 whitespace-nowrap cursor-pointer select-none">privacy policy</Link>.
            </>
          }
        />
      </PageSection>

      {/* Call to Action */}
      <PageSection 
        py="20" 
        mb="16" 
        maxWidth="full" // Section itself is full-width with padding
      >
        <div className="max-w-4xl mx-auto bg-card border border-border/40 shadow-lg rounded-xl overflow-hidden cursor-default">
          <div className="flex flex-col md:flex-row items-center p-8 md:p-10 gap-8 cursor-default">
            <div className="text-left flex-1 cursor-default">
              <TypographyH2 className="mb-4 text-primary cursor-default">
                {t('Landing.ctaTitle', { defaultValue: ctaTitle })}
              </TypographyH2>
              <TypographyLarge className="mb-6 text-muted-foreground cursor-default">
                {t('Landing.ctaSubtitle', { defaultValue: ctaSubtitle })} Learn how <a href="https://www.investopedia.com/terms/a/accrualaccounting.asp" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline cursor-pointer select-none">accrual accounting</a> can improve your financial reporting.
              </TypographyLarge>
              <LandingPageClientInteractions 
                buttonText={t('Landing.ctaButton', { defaultValue: 'Test with Demo Data' })}
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
                alt={t('Landing.ctaIconAlt', { defaultValue: 'Invoice Allocation Illustration' })}
                width={240} 
                height={180} 
                className="object-contain"
                // priority // Removed priority as it might be below the fold
              />
            </div>
          </div>
        </div>
      </PageSection>
      
      {/* FAQ/Q&A Section for SEO - FaqSection is now a client component */}
      <FaqSection 
        faqData={faqData} 
        title={faqSectionTitle}
        ldJsonMainEntity={ldJsonMainEntity} // Pass the pre-built array
      />
    </>
  );
} 
