"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// FAQ data type
export type FaqItem = {
  question: string;
  answer: string;
};

// For ld+json
export type LdJsonFaqItem = {
  "@type": "Question";
  name: string;
  acceptedAnswer: {
    "@type": "Answer";
    text: string;
  };
};

interface FaqSectionProps {
  faqData: FaqItem[]; // For display
  title: string;
  ldJsonMainEntity: LdJsonFaqItem[]; // Pre-translated for ld+json
}

export function FaqSection({ 
  faqData, 
  title, 
  ldJsonMainEntity
}: FaqSectionProps) {
  // const { t } = useTranslation(); // t might still be needed for items if not passed directly
  // For simplicity, let's assume faqData items are already translated or use their defaults.
  // If faqData items *also* use keys that need translation by this component's t, that's more complex.
  // The immediate issue is the title and the ld+json content.

  return (
    <section className="py-16 px-6 max-w-3xl mx-auto bg-background mb-10">
      <h2 className="text-3xl font-bold mb-10 text-center text-foreground">
        {title} {/* Use passed title */}
      </h2>
      <Accordion type="single" collapsible className="space-y-4">
        {faqData.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`}
            className="bg-card rounded-xl px-6 py-2 border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-default"
          >
            {/* Assuming faq.question and faq.answer are pre-translated or fine as defaults */}
            <AccordionTrigger className="text-xl font-semibold text-foreground hover:no-underline cursor-pointer">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pt-2">
              {faq.answer}
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
            "mainEntity": ldJsonMainEntity // Use the pre-built prop
          })
        }}
      />
    </section>
  );
} 
