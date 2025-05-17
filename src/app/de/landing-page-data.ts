import { FaqItem } from "@/components/faq-section";

export const heroTitle = "Automatisierter Rechnungsabgrenzungsrechner";
export const heroSubtitle =
  "BillSplitter hilft Ihnen, Rechnungen über Geschäftsjahre hinweg genau und mühelos abzugrenzen. Entwickelt für Finanzfachleute und Unternehmen. Schnell, einfach, präzise.";
export const feature1Title = "Genaue Periodenabgrenzung";
export const feature1Desc =
  "Berechnen Sie automatisch, wie viel einer Rechnung zu jedem Geschäftsjahr gehört – keine manuellen Fehler mehr.";
export const feature2Title = "Vorauszahlungen & Rechnungsabgrenzung";
export const feature2Desc =
  "Unterstützt die Abgrenzung nach IFRS 15, HGB und OR Standards für eine saubere, konforme Buchhaltung.";
export const feature3Title = "Keine Anmeldung. Keine Datenspeicherung.";
export const feature3Desc =
  "Nutzen Sie BillSplitter sofort, ohne ein Konto zu erstellen. Ihre Daten bleiben sicher und privat.";
export const ctaTitle = "Rechnungen jetzt abgrenzen";
export const ctaSubtitle =
  "Starten Sie den Rechner und automatisieren Sie Ihre Ertrags- und Aufwandsabgrenzungen in Sekunden.";

export const demoEndDate = "2025-04-29";
export const demoStartDate = "2024-11-01";
export const demoAmount = "5000";
export const demoIncludeEndDate = "true";
export const demoSplitPeriod = "yearly" as "yearly" | "quarterly" | "monthly";

export const faqData: FaqItem[] = [
  {
    question: "Wie berechnet BillSplitter die Rechnungsabgrenzungen?",
    answer:
      "BillSplitter berechnet anteilige Abgrenzungen basierend auf der genauen Anzahl der Tage in jeder Finanzperiode. Der Gesamtbetrag der Rechnung wird durch die Anzahl der Tage im Leistungszeitraum geteilt und dann mit den Tagen in jedem Geschäftsjahr oder jeder Periode multipliziert.",
  },
  {
    question: "Muss ich ein Konto erstellen, um BillSplitter zu nutzen?",
    answer:
      "Nein, BillSplitter ist vollständig kontofrei. Sie können es sofort nutzen, ohne sich anzumelden, ein Passwort zu erstellen oder persönliche Informationen anzugeben. Ihre Daten werden lokal verarbeitet und niemals auf unseren Servern gespeichert.",
  },
  {
    question: "Ist BillSplitter konform mit Rechnungslegungsstandards?",
    answer:
      "Ja, BillSplitter folgt den Grundsätzen der periodengerechten Rechnungslegung gemäss <a href='https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/' target='_blank' rel='noopener noreferrer' class='text-primary hover:underline whitespace-nowrap'>IFRS 15</a>, <a href='https://www.gesetze-im-internet.de/hgb/' target='_blank' rel='noopener noreferrer' class='text-primary hover:underline whitespace-nowrap'>HGB</a>, und <a href='https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de' target='_blank' rel='noopener noreferrer' class='text-primary hover:underline whitespace-nowrap'>OR</a> Standards, und eignet sich somit für die korrekte Erfassung von passiven und aktiven Rechnungsabgrenzungsposten in der Finanzbuchhaltung.",
  },
  {
    question:
      "Kann ich Rechnungen nach monatlichen, vierteljährlichen oder jährlichen Perioden aufteilen?",
    answer:
      "Ja, BillSplitter unterstützt mehrere Aufteilungsoptionen. Sie können Rechnungen über jährliche, vierteljährliche oder monatliche Perioden abgrenzen, je nach Ihren Buchhaltungs- und Berichtsanforderungen.",
  },
  {
    question: "Wie genau sind die Berechnungen?",
    answer:
      "BillSplitter liefert tagesgenaue Berechnungen mit korrekter Rundung auf die Dezimalstelle Ihrer Wahl. Geringfügige Rundungsdifferenzen werden automatisch angepasst, um sicherzustellen, dass die Summe immer Ihrem Eingabebetrag entspricht.",
  },
];
