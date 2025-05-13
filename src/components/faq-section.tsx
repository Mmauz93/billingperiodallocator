"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { useTranslation } from "@/translations";

// FAQ data type
export type FaqItem = {
  question: string;
  answer: string;
};

interface FaqSectionProps {
  faqData: FaqItem[];
}

export function FaqSection({ faqData }: FaqSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="py-16 px-6 max-w-3xl mx-auto bg-background mb-10">
      <h2 className="text-3xl font-bold mb-10 text-center text-foreground">
        {t('Landing.faqTitle', { defaultValue: 'Häufig gestellte Fragen' })}
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
  );
} 
