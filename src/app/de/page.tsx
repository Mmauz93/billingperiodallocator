import { FaqItem, FaqSection } from "@/components/faq-section";

import Image from "next/image";
import LandingPageClientInteractions from "@/components/landing-page-client-interactions";
import Link from "next/link";
import { Metadata } from 'next';
import React from "react";
import { getServerSideTranslator } from '@/lib/translation';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const currentLang = params.lang || 'de';
  const { t } = getServerSideTranslator(currentLang);
  const siteUrl = 'https://billsplitter.siempi.ch';
  const canonicalUrl = `${siteUrl}/${currentLang}/`;

  return {
    title: t('LandingPage.title', 'BillSplitter – Rechnungen auf Geschäftsperioden aufteilen'),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${siteUrl}/en/`,
        'de': `${siteUrl}/de/`,
        'x-default': `${siteUrl}/en/`, // Default to English version
      },
    },
  };
}

export default async function GermanLandingPage({ params }: { params: { lang: string }}) {
  const { t } = getServerSideTranslator(params.lang || 'de');

  const heroTitle = "Automatisierter Rechnungsabgrenzungsrechner";
  const heroSubtitle = "BillSplitter hilft Ihnen, Rechnungen über Geschäftsjahre hinweg genau und mühelos abzugrenzen. Entwickelt für Finanzfachleute und Unternehmen. Schnell, einfach, präzise.";
  const feature1Title = "Genaue Periodenabgrenzung";
  const feature1Desc = "Berechnen Sie automatisch, wie viel einer Rechnung zu jedem Geschäftsjahr gehört – keine manuellen Fehler mehr.";
  const feature2Title = "Vorauszahlungen & Rechnungsabgrenzung"; // Updated to match image
  const feature2Desc = "Unterstützt die Abgrenzung nach IFRS 15, HGB und OR Standards für eine saubere, konforme Buchhaltung.";
  const feature3Title = "Keine Anmeldung. Keine Datenspeicherung.";
  const feature3Desc = "Nutzen Sie BillSplitter sofort, ohne ein Konto zu erstellen. Ihre Daten bleiben sicher und privat.";
  const ctaTitle = "Rechnungen jetzt abgrenzen";
  const ctaSubtitle = "Starten Sie den Rechner und automatisieren Sie Ihre Ertrags- und Aufwandsabgrenzungen in Sekunden.";
  
  const faqData: FaqItem[] = [
    {
      question: "Wie berechnet BillSplitter die Rechnungsabgrenzungen?",
      answer: "BillSplitter berechnet anteilige Abgrenzungen basierend auf der genauen Anzahl der Tage in jeder Finanzperiode. Der Gesamtbetrag der Rechnung wird durch die Anzahl der Tage im Leistungszeitraum geteilt und dann mit den Tagen in jedem Geschäftsjahr oder jeder Periode multipliziert."
    },
    {
      question: "Muss ich ein Konto erstellen, um BillSplitter zu nutzen?",
      answer: "Nein, BillSplitter ist vollständig kontofrei. Sie können es sofort nutzen, ohne sich anzumelden, ein Passwort zu erstellen oder persönliche Informationen anzugeben. Ihre Daten werden lokal verarbeitet und niemals auf unseren Servern gespeichert."
    },
    {
      question: "Ist BillSplitter konform mit Rechnungslegungsstandards?",
      answer: "Ja, BillSplitter folgt den Grundsätzen der periodengerechten Rechnungslegung gemäss <a href='https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/' target='_blank' rel='noopener noreferrer' class='text-primary hover:underline whitespace-nowrap'>IFRS 15</a>, <a href='https://www.gesetze-im-internet.de/hgb/' target='_blank' rel='noopener noreferrer' class='text-primary hover:underline whitespace-nowrap'>HGB</a>, und <a href='https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de' target='_blank' rel='noopener noreferrer' class='text-primary hover:underline whitespace-nowrap'>OR</a> Standards, und eignet sich somit für die korrekte Erfassung von passiven und aktiven Rechnungsabgrenzungsposten in der Finanzbuchhaltung."
    },
    {
      question: "Kann ich Rechnungen nach monatlichen, vierteljährlichen oder jährlichen Perioden aufteilen?",
      answer: "Ja, BillSplitter unterstützt mehrere Aufteilungsoptionen. Sie können Rechnungen über jährliche, vierteljährliche oder monatliche Perioden abgrenzen, je nach Ihren Buchhaltungs- und Berichtsanforderungen."
    },
    {
      question: "Wie genau sind die Berechnungen?",
      answer: "BillSplitter liefert tagesgenaue Berechnungen mit korrekter Rundung auf die Dezimalstelle Ihrer Wahl. Geringfügige Rundungsdifferenzen werden automatisch angepasst, um sicherzustellen, dass die Summe immer Ihrem Eingabebetrag entspricht."
    }
  ];
  
  const faqSectionTitle = t('Landing.faqTitle', { defaultValue: 'Häufig gestellte Fragen' });
  
  // Prepare ldJsonMainEntity using server-side t
  const ldJsonMainEntity = faqData.map((item, index) => ({
    "@type": "Question" as const,
    name: t(`Landing.faqQuestion${index + 1}`, { defaultValue: item.question }),
    acceptedAnswer: {
      "@type": "Answer" as const,
      text: t(`Landing.faqAnswer${index + 1}`, { defaultValue: item.answer }),
    },
  }));
  
  const demoEndDate = "2025-04-29";
  const demoStartDate = "2024-11-01";
  const demoAmount = "5000";
  const demoIncludeEndDate = "true";
  const demoSplitPeriod = "yearly" as 'yearly' | 'quarterly' | 'monthly';
  
  return (
    <>
      {/* Hero Section */}
      <header className="py-20 text-center px-6 bg-background mb-16">
        <div className="max-w-3xl mx-auto">
          <Image 
            src="/images/icon.svg"
            alt={t('Landing.logoAlt', { defaultValue: 'BillSplitter Logo' })} 
            width={64}
            height={64}
            className="mx-auto mb-6 w-16 h-16" 
            priority
          />
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {t('Landing.heroTitle', { defaultValue: heroTitle })}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            {t('Landing.heroSubtitle', { defaultValue: heroSubtitle })}
          </p>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid gap-10 md:grid-cols-3 text-center bg-background mb-16">
        <Link href="https://de.wikipedia.org/wiki/Rechnungsabgrenzung" target="_blank" rel="noopener noreferrer" className="group p-6 rounded-lg transition-all duration-200 bg-card border border-border/40 shadow-sm hover:shadow-md hover:border-border/60 hover:-translate-y-1 cursor-pointer">
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
            {t('Landing.feature1Desc', { defaultValue: feature1Desc })} Mehr über <span className="text-primary underline hover:opacity-80 whitespace-nowrap">Aufwandsabgrenzung</span>.
          </p>
        </Link>
        <Link href="https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/" target="_blank" rel="noopener noreferrer" className="group p-6 rounded-lg transition-all duration-200 bg-card border border-border/40 shadow-sm hover:shadow-md hover:border-border/60 hover:-translate-y-1 cursor-pointer">
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
            {t('Landing.feature2Desc', { defaultValue: feature2Desc })} In Übereinstimmung mit <span className="text-primary underline hover:opacity-80 whitespace-nowrap">IFRS 15</span> Standards.
          </p>
        </Link>
        <Link href="/de/legal/privacy-policy" className="group p-6 rounded-lg transition-all duration-200 bg-card border border-border/40 shadow-sm hover:shadow-md hover:border-border/60 hover:-translate-y-1 cursor-pointer">
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
            {t('Landing.feature3Desc', { defaultValue: feature3Desc })} Lesen Sie mehr über unsere <span className="text-primary underline hover:opacity-80 whitespace-nowrap">Datenschutzerklärung</span>.
          </p>
        </Link>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 mb-16">
        <div className="max-w-4xl mx-auto bg-card border border-border/40 shadow-lg rounded-xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center p-8 md:p-10 gap-8">
            <div className="text-left flex-1">
              <h2 className="text-3xl font-bold mb-4 text-primary">
                {t('Landing.ctaTitle', { defaultValue: ctaTitle })}
              </h2>
              <p className="text-lg mb-6 text-muted-foreground">
                {t('Landing.ctaSubtitle', { defaultValue: ctaSubtitle })} Erfahren Sie, wie <a href="https://www.investopedia.com/terms/a/accrualaccounting.asp" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">zeitliche Abgrenzung</a> Ihre Finanzberichterstattung verbessern kann.
              </p>
              <LandingPageClientInteractions 
                buttonText={t('Landing.ctaButton', { defaultValue: 'Test with Demo Data' })}
                demoStartDate={demoStartDate}
                demoEndDate={demoEndDate}
                demoAmount={demoAmount}
                demoIncludeEndDate={demoIncludeEndDate}
                demoSplitPeriod={demoSplitPeriod}
                appPath={`/${params.lang || 'de'}/app`} // Construct app path based on lang
              />
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
      
      <FaqSection 
        faqData={faqData} 
        title={faqSectionTitle}
        ldJsonMainEntity={ldJsonMainEntity}
      />
    </>
  );
} 
