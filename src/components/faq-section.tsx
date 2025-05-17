"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { useState } from "react";

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [openItemValue, setOpenItemValue] = useState<string | null>(null); // Tracks the value of the open item

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Radix Accordion's onValueChange gives the value of the item being opened/closed
  const handleValueChange = (value: string) => {
    setOpenItemValue(value);
  };

  return (
    <section className="py-16 px-6 max-w-3xl mx-auto bg-background mb-10 cursor-default">
      <h2 className="text-3xl font-bold mb-10 text-center text-foreground cursor-default">
        {title}
      </h2>
      <Accordion 
        type="single" 
        collapsible 
        className="space-y-4"
        value={openItemValue || undefined} // Controlled component
        onValueChange={handleValueChange} // Update open item state
      >
        {faqData.map((faq, index) => {
          const itemValue = `item-${index}`;
          const isOpen = openItemValue === itemValue;

          return (
            <div 
              key={index}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              className="relative" // No cursor style here, let children define
            >
              <AccordionItem 
                value={itemValue} // Necessary for Accordion to identify the item
                className="bg-card dark:bg-card rounded-xl px-6 py-2 border border-border/60 shadow-sm transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: isOpen ? 'hsl(var(--primary) / 0.5)' : '', // Color on open
                  boxShadow: isOpen ? '0 8px 16px rgba(0, 0, 0, 0.1)' : (hoveredIndex === index ? '0 4px 12px rgba(0,0,0,0.08)' : ''), // Different shadow for open vs hover
                  transform: hoveredIndex === index ? 'translateY(-1px)' : '' // Movement on hover
                }}
              >
                <AccordionTrigger 
                  className="text-xl font-semibold text-foreground hover:no-underline cursor-pointer select-none transition-colors"
                  style={{
                    color: isOpen ? '#0284C7' : '' // Title color on open
                  }}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent 
                  className="text-muted-foreground pt-2"
                >
                  <div 
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                    className="faq-content" // Default cursor for answer text, links will have their own
                  />
                </AccordionContent>
              </AccordionItem>
            </div>
          );
        })}
      </Accordion>
      
      {/* Structured data for SEO */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": ldJsonMainEntity
          })
        }}
      />
      
      <style jsx global>{`
        .faq-content a {
          text-decoration: underline;
          user-select: none;
          color: var(--primary);
          transition: opacity 0.2s;
        }
        .faq-content a:hover {
          opacity: 0.8;
        }
      `}</style>
    </section>
  );
} 

