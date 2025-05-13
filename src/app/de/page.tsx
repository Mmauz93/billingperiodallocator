"use client";

import { Button } from "@/components/ui/button";
import { FaqSection } from "@/components/faq-section";
import Image from "next/image";
import React from "react";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useTranslation } from "@/translations";

export default function GermanLandingPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    // Force German language 
    if (i18n.language !== 'de') {
      i18n.changeLanguage('de');
    }
    
    // Set document title
    document.title = t("LandingPage.title", "Startseite") + " | BillSplitter";
    
    // Force scroll to top when component mounts
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [i18n, t]);

  // Define default texts for translation keys
  const heroTitle = "Automatischer Rechnungssplit-Rechner";
  const heroSubtitle = "BillSplitter hilft Ihnen, Rechnungen präzise und mühelos auf verschiedene Geschäftsjahre aufzuteilen. Entwickelt für Finanzfachleute und Unternehmen. Schnell, einfach, präzise.";
  const feature1Title = "Genaue Periodenaufteilung";
  const feature1Desc = "Berechnen Sie automatisch, welcher Teil einer Rechnung zu welchem Geschäftsjahr gehört — keine manuellen Fehler mehr.";
  const feature2Title = "Vorauszahlungen & Abgrenzungen";
  const feature2Desc = "Unterstützt Aufteilungen gemäß IFRS 15, HGB und OR Standards für eine saubere, konforme Buchhaltung.";
  const feature3Title = "Kein Login. Keine Datenspeicherung.";
  const feature3Desc = "Nutzen Sie BillSplitter sofort ohne Konto. Ihre Daten bleiben sicher und privat.";
  const ctaTitle = "Starten Sie jetzt mit der Rechnungsaufteilung";
  const ctaSubtitle = "Starten Sie den Rechner und automatisieren Sie Ihre Einnahmen- und Ausgabenverteilung in Sekundenschnelle.";
  
  // FAQ content for SEO
  const faqData = [
    {
      question: "Wie berechnet BillSplitter die Rechnungsaufteilungen?",
      answer: "BillSplitter berechnet anteilige Zuordnungen auf Basis der genauen Anzahl der Tage in jeder Abrechnungsperiode. Es teilt den Gesamtrechnungsbetrag durch die Anzahl der Tage im Leistungszeitraum und multipliziert diese mit den Tagen in jedem Geschäftsjahr oder jeder Periode."
    },
    {
      question: "Muss ich ein Konto erstellen, um BillSplitter zu nutzen?",
      answer: "Nein, BillSplitter ist komplett kontofrei. Sie können es sofort nutzen, ohne sich zu registrieren, ein Passwort zu erstellen oder persönliche Daten anzugeben. Ihre Daten werden lokal verarbeitet und niemals auf unseren Servern gespeichert."
    },
    {
      question: "Ist BillSplitter konform mit Buchhaltungsstandards?",
      answer: "Ja, BillSplitter folgt den Grundsätzen der Periodenabgrenzung gemäß IFRS 15, HGB und OR, wodurch es sich für die ordnungsgemäße Erfassung von abgegrenzten Erträgen und Vorauszahlungen in Jahresabschlüssen eignet."
    },
    {
      question: "Kann ich Rechnungen nach monatlichen, vierteljährlichen oder jährlichen Perioden aufteilen?",
      answer: "Ja, BillSplitter unterstützt verschiedene Aufteilungsoptionen. Sie können Rechnungen auf jährliche, vierteljährliche oder monatliche Perioden entsprechend Ihren Buchhaltungs- und Berichtsanforderungen verteilen."
    },
    {
      question: "Wie genau sind die Berechnungen?",
      answer: "BillSplitter bietet hochgenaue Berechnungen bis auf den Tag, mit korrekter Rundung auf die Dezimalstelle Ihrer Wahl. Kleinere Rundungsdifferenzen werden automatisch angepasst, um sicherzustellen, dass die Summe immer mit Ihrem Eingabebetrag übereinstimmt."
    }
  ];
  
  // Demo data for pre-filling the calculator form
  const demoEndDate = "2025-04-29";
  const demoStartDate = "2024-11-01";
  const demoAmount = "5000";
  const demoIncludeEndDate = "true";
  const demoSplitPeriod = "yearly";
  
  const handleTestWithDemoData = () => {
    if (typeof window !== "undefined") {
      const demoDataForForm = {
        startDateString: demoStartDate,
        endDateString: demoEndDate,
        amount: demoAmount,
        includeEndDate: demoIncludeEndDate === 'true',
        splitPeriod: demoSplitPeriod as 'yearly' | 'quarterly' | 'monthly',
        isDemo: true
      };
      sessionStorage.setItem('billSplitterDemoData', JSON.stringify(demoDataForForm));
      // Navigate to language-specific app route
      router.push('/de/app');
    }
  };
  
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
        <div className="group p-6 rounded-lg transition-colors duration-200 hover:bg-muted/10 hover:shadow-sm">
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
        <div className="group p-6 rounded-lg transition-colors duration-200 hover:bg-muted/10 hover:shadow-sm">
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
              <Button 
                size="lg" 
                onClick={handleTestWithDemoData}
                className="inline-flex items-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 group"
              >
                {t('Landing.ctaButton', { defaultValue: 'Mit Demodaten testen' })}
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Button>
            </div>
            <div className="flex-shrink-0 w-full md:w-1/3 flex justify-center">
              <Image 
                src="/images/calculator-illustration.svg" 
                alt={t('Landing.ctaIconAlt', { defaultValue: 'Rechnungsaufteilungs-Illustration' })}
                width={240} 
                height={180} 
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ/Q&A Section for SEO */}
      <FaqSection faqData={faqData} />
    </>
  );
} 
