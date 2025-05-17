"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import React from "react";

interface ComplianceAccordionProps {
  question: string;
  answer: React.ReactNode;
}

export function ComplianceAccordionShared({
  question,
  answer,
}: ComplianceAccordionProps) {
  return (
    <div className="w-full max-w-3xl mx-auto rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow duration-200 mb-8">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value="compliance"
          className="bg-card rounded-xl px-6 py-4 border-none"
        >
          <AccordionTrigger className="text-xl font-bold text-foreground hover:no-underline cursor-pointer">
            {question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground text-base pt-2">
            {answer}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
