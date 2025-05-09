import { useTranslation } from 'react-i18next';

// This component adds SEO-friendly text content to the app pages
export default function AppSeoContent() {
  const { i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

  // Define content in both languages
  const content = {
    en: {
      title: "Invoice Period Allocation Calculator",
      description: "Split invoices across fiscal years, quarters, or months with precision.",
      para1: "BillSplitter's calculator tool is designed to help you accurately allocate invoice amounts across different accounting periods. Whether you need to split expenses, defer revenue recognition, or handle prepaid items across fiscal years, our calculator makes the process fast and error-free.",
      para2: "The calculator works with exact day counts to ensure accurate proportional allocation according to accounting standards like IFRS 15, HGB, and OR. Simply enter your invoice details, service period dates, and preferred split method (yearly, quarterly, or monthly) to get instant results.",
      para3: "All calculations happen in your browser - we never store your data on our servers. This makes BillSplitter perfect for handling sensitive financial information while still providing powerful allocation capabilities.",
      featureTitle: "Calculator Features:",
      features: [
        "Day-precise allocation across fiscal periods",
        "Support for monthly, quarterly, and yearly splits",
        "Automatic rounding with penny difference handling",
        "Configurable decimal places for precision control",
        "No account needed - use immediately without signup",
        "Zero data storage - your information stays private"
      ],
      useCaseTitle: "Common Use Cases:",
      useCases: [
        "Prepaid expense allocation (rent, insurance, subscriptions)",
        "Accrued revenue recognition (services spanning fiscal years)",
        "Multi-period contract allocations",
        "Quarterly financial reporting allocations",
        "Budget planning and forecasting"
      ]
    },
    de: {
      title: "Rechnungsperioden-Zuordnungsrechner",
      description: "Teilen Sie Rechnungen präzise auf Geschäftsjahre, Quartale oder Monate auf.",
      para1: "Der BillSplitter-Rechner wurde entwickelt, um Rechnungsbeträge genau auf verschiedene Abrechnungszeiträume aufzuteilen. Ob Sie Ausgaben aufteilen, Umsatzrealisierung abgrenzen oder Vorauszahlungen auf Geschäftsjahre verteilen müssen - unser Rechner macht den Prozess schnell und fehlerfrei.",
      para2: "Der Rechner arbeitet mit exakten Tageszählungen, um eine genaue anteilige Zuordnung gemäß Rechnungslegungsstandards wie IFRS 15, HGB und OR zu gewährleisten. Geben Sie einfach Ihre Rechnungsdetails, den Leistungszeitraum und die bevorzugte Aufteilungsmethode (jährlich, vierteljährlich oder monatlich) ein, um sofortige Ergebnisse zu erhalten.",
      para3: "Alle Berechnungen erfolgen in Ihrem Browser - wir speichern Ihre Daten nie auf unseren Servern. Dies macht BillSplitter perfekt für den Umgang mit sensiblen Finanzdaten, während trotzdem leistungsstarke Zuordnungsfunktionen bereitgestellt werden.",
      featureTitle: "Rechner-Funktionen:",
      features: [
        "Tagespräzise Zuordnung auf Abrechnungsperioden",
        "Unterstützung für monatliche, vierteljährliche und jährliche Aufteilungen",
        "Automatische Rundung mit Cent-Differenz-Behandlung",
        "Konfigurierbare Dezimalstellen für Präzisionskontrolle",
        "Kein Konto erforderlich - sofortige Nutzung ohne Anmeldung",
        "Keine Datenspeicherung - Ihre Informationen bleiben privat"
      ],
      useCaseTitle: "Typische Anwendungsfälle:",
      useCases: [
        "Zuordnung von Vorauszahlungen (Miete, Versicherung, Abonnements)",
        "Abgegrenzte Ertragserfassung (Dienstleistungen über Geschäftsjahre hinweg)",
        "Zuordnung mehrperiodischer Verträge",
        "Zuordnungen für vierteljährliche Finanzberichte",
        "Budgetplanung und Prognose"
      ]
    }
  };

  // Use the content based on the current language
  const { 
    title, 
    description, 
    para1, 
    para2, 
    para3, 
    featureTitle, 
    features, 
    useCaseTitle,
    useCases 
  } = isGerman ? content.de : content.en;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 mt-8 bg-background/50">
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-lg text-muted-foreground mb-6">{description}</p>
        <div className="space-y-4">
          <p>{para1}</p>
          <p>{para2}</p>
          <p>{para3}</p>
        </div>
      </section>
      
      <section className="mb-10">
        <h3 className="text-xl font-semibold mb-4">{featureTitle}</h3>
        <ul className="list-disc pl-5 space-y-2">
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold mb-4">{useCaseTitle}</h3>
        <ul className="list-disc pl-5 space-y-2">
          {useCases.map((useCase, index) => (
            <li key={index}>{useCase}</li>
          ))}
        </ul>
      </section>
      
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "BillSplitter",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": description
          })
        }}
      />
    </div>
  );
} 
