"use client"; // Needs to be client for translations

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Import Accordion components
import { useEffect, useState } from "react"; // Import hooks

import { Button } from "@/components/ui/button"; // Import Button for CTA
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next"; // Import useTranslation

// Metadata should be defined in layout.tsx

export default function NewLandingPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Force scroll to top when component mounts
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  // Define default texts for translation keys
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
  const ctaButton = "Try it now";
  
  // FAQ content for SEO
  const faqData = [
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
      answer: "Yes, BillSplitter follows the principles of accrual accounting in accordance with IFRS 15, HGB, and OR standards, making it suitable for proper recognition of deferred revenue and prepaid expenses in financial statements."
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
  
  // Demo data for pre-filling the calculator form
  // Using 6-month service period with end date as the current date provided (29.04.2025)
  const demoEndDate = "2025-04-29";
  // Calculate start date 6 months before end date (approximately 180 days)
  const demoStartDate = "2024-11-01";
  // Demo amount
  const demoAmount = "5000";
  // Include end date in calculation
  const demoIncludeEndDate = "true";
  // Split period - yearly is default
  const demoSplitPeriod = "yearly";
  
  // Create query string for demo data
  const demoQueryString = `?startDate=${demoStartDate}&endDate=${demoEndDate}&amount=${demoAmount}&includeEndDate=${demoIncludeEndDate}&splitPeriod=${demoSplitPeriod}`;
  
  // Early return null or placeholder if not mounted to avoid hydration mismatch
  if (!mounted) {
      return null; // Or a loading skeleton if preferred
  }

  return (
    <>
      {/* Hero Section */}
      <header className="py-20 text-center px-6 bg-background">
        <div className="max-w-3xl mx-auto">
          <Image 
            src="/images/icon.svg" // Use path relative to public folder
            alt={t('Landing.logoAlt', { defaultValue: 'BillSplitter Logo Icon' })} 
            width={64} // Specify width
            height={64} // Specify height
            className="mx-auto mb-6 w-16 h-16" 
          />
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {t('Landing.heroTitle', { defaultValue: heroTitle })}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            {t('Landing.heroSubtitle', { defaultValue: heroSubtitle })}
          </p>
        </div>
      </header>

      {/* Features Section - MOVED ABOVE CTA */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid gap-10 md:grid-cols-3 text-center bg-background">
        <div className="group p-6 rounded-lg transition-all duration-200 hover:bg-muted/10 hover:shadow-sm">
          <div className="mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Image 
              src="/feature-icon-1.svg" 
              alt={t('Landing.feature1Alt', { defaultValue: 'Accurate Allocation Icon' })} 
              width={28} 
              height={28} 
              className="text-primary transition-colors duration-200"
            />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-foreground">
            {t('Landing.feature1Title', { defaultValue: feature1Title })}
          </h2>
          <p className="text-muted-foreground">
            {t('Landing.feature1Desc', { defaultValue: feature1Desc })}
          </p>
        </div>
        <div className="group p-6 rounded-lg transition-all duration-200 hover:bg-muted/10 hover:shadow-sm">
          <div className="mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Image 
              src="/feature-icon-2.svg" 
              alt={t('Landing.feature2Alt', { defaultValue: 'Deferred Revenue Icon' })} 
              width={28} 
              height={28} 
              className="text-primary transition-colors duration-200"
            />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-foreground">
            {t('Landing.feature2Title', { defaultValue: feature2Title })}
          </h2>
          <p className="text-muted-foreground">
            {t('Landing.feature2Desc', { defaultValue: feature2Desc })}
          </p>
        </div>
        <div className="group p-6 rounded-lg transition-all duration-200 hover:bg-muted/10 hover:shadow-sm">
          <div className="mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Image 
              src="/feature-icon-3.svg" 
              alt={t('Landing.feature3Alt', { defaultValue: 'No Login Needed Icon' })} 
              width={28} 
              height={28} 
              className="text-primary transition-colors duration-200"
            />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-foreground">
            {t('Landing.feature3Title', { defaultValue: feature3Title })}
          </h2>
          <p className="text-muted-foreground">
            {t('Landing.feature3Desc', { defaultValue: feature3Desc })}
          </p>
        </div>
      </section>

      {/* Call to Action - MOVED AFTER FEATURES */}
      <section className="py-20 px-6 mb-16"> 
        <div className="max-w-4xl mx-auto bg-muted/30 shadow-lg rounded-xl border border-border overflow-hidden">
          <div className="flex flex-col md:flex-row items-center p-8 md:p-10 gap-8">
            <div className="text-left flex-1">
              <h2 className="text-3xl font-bold mb-4 text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {t('Landing.ctaTitle', { defaultValue: ctaTitle })}
              </h2>
              <p className="text-lg mb-6 text-muted-foreground">
                {t('Landing.ctaSubtitle', { defaultValue: ctaSubtitle })}
              </p>
              <Button 
                asChild 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 group"
              > 
                <Link 
                  href={`/app${demoQueryString}`} 
                  className="flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('Landing.ctaButton', { defaultValue: ctaButton })}
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </Button>
            </div>
            <div className="flex-shrink-0 w-full md:w-1/3 flex justify-center">
              <Image 
                src="/images/calculator-illustration.svg" 
                alt={t('Landing.ctaIconAlt', { defaultValue: 'Invoice Allocation Illustration' })}
                width={240} 
                height={180} 
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ/Q&A Section for SEO - Converted to Accordion */}
      <section className="py-16 px-6 max-w-3xl mx-auto bg-background mt-24 sm:mt-32">
        <h2 className="text-3xl font-bold mb-10 text-center text-foreground">
          {t('Landing.faqTitle', { defaultValue: 'Frequently Asked Questions' })}
        </h2>
        <Accordion type="single" collapsible className="space-y-4">
          {faqData.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-muted/30 rounded-xl px-6 py-2 border border-border cursor-default"
            >
              <AccordionTrigger className="text-xl font-semibold text-foreground hover:no-underline cursor-pointer">
                {t(`Landing.faqQuestion${index + 1}`, { defaultValue: faq.question })}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t(`Landing.faqAnswer${index + 1}`, { defaultValue: faq.answer })}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        {/* Structured data for SEO */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqData.map((item, index) => ({
                "@type": "Question",
                "name": t(`Landing.faqQuestion${index + 1}`, { defaultValue: item.question }),
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": t(`Landing.faqAnswer${index + 1}`, { defaultValue: item.answer })
                }
              }))
            })
          }}
        />
      </section>
    </>
  );
}
