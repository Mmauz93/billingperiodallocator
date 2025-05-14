import { FaqItem, FaqSection } from "@/components/faq-section";

import Image from "next/image";
import LandingPageClientInteractions from "@/components/landing-page-client-interactions";
import { Metadata } from 'next';
import React from "react";
import { getServerSideTranslator } from '@/lib/translation';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const currentLang = params.lang || 'de';
  const { t } = getServerSideTranslator(currentLang);
  const siteUrl = 'https://billsplitter.siempi.ch';
  const canonicalUrl = `${siteUrl}/${currentLang}/`;

  return {
    title: t('LandingPage.title', 'Startseite') + ' | BillSplitter',
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
  const feature2Title = "Rechnungsabgrenzungsposten"; // Adjusted for German context
  const feature2Desc = "Unterstützt die Abgrenzung nach IFRS 15, HGB und OR Standards für eine saubere, konforme Buchhaltung.";
  const feature3Title = "Kein Login. Keine Datenspeicherung.";
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
      answer: "Ja, BillSplitter folgt den Grundsätzen der periodengerechten Rechnungslegung gemäss IFRS 15, HGB und OR Standards und eignet sich somit für die korrekte Erfassung von passiven und aktiven Rechnungsabgrenzungsposten in der Finanzbuchhaltung."
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
        <div className="group p-6 rounded-lg transition-colors duration-200 hover:bg-muted/10 hover:shadow-sm">
          <div className="mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Image 
              src="/feature-icon-1.svg" 
              alt={t('Landing.feature1Alt', { defaultValue: 'Genaue Abgrenzung Icon' })} 
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
        <div className="group p-6 rounded-lg transition-colors duration-200 hover:bg-muted/10 hover:shadow-sm">
          <div className="mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Image 
              src="/feature-icon-2.svg" 
              alt={t('Landing.feature2Alt', { defaultValue: 'Rechnungsabgrenzung Icon' })} 
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
        <div className="group p-6 rounded-lg transition-colors duration-200 hover:bg-muted/10 hover:shadow-sm">
          <div className="mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Image 
              src="/feature-icon-3.svg" 
              alt={t('Landing.feature3Alt', { defaultValue: 'Kein Login Icon' })} 
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

      {/* Call to Action */}
      <section className="py-20 px-6 mb-16">
        <div className="max-w-4xl mx-auto bg-muted/30 shadow-lg rounded-xl border border-border overflow-hidden">
          <div className="flex flex-col md:flex-row items-center p-8 md:p-10 gap-8">
            <div className="text-left flex-1">
              <h2 className="text-3xl font-bold mb-4 text-primary">
                {t('Landing.ctaTitle', { defaultValue: ctaTitle })}
              </h2>
              <p className="text-lg mb-6 text-muted-foreground">
                {t('Landing.ctaSubtitle', { defaultValue: ctaSubtitle })}
              </p>
              <LandingPageClientInteractions 
                buttonText={t('Landing.ctaButton', { defaultValue: 'Mit Testdaten ausprobieren' })}
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
                alt={t('Landing.ctaIconAlt', { defaultValue: 'Rechnungsabgrenzung Illustration' })}
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
