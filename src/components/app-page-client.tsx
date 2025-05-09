"use client";

import { useEffect, useState } from "react";

import InvoiceCalculatorClient from "@/components/invoice-calculator-client";
import { useTranslation } from "react-i18next";

export function AppPageClient() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultTitle = "Enter Invoice Details";
  const defaultDescription = "Fill in the fields below to split invoice amounts across fiscal periods.";

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {mounted ? t('AppPage.title', { defaultValue: defaultTitle }) : defaultTitle}
        </h1>
        <p className="text-muted-foreground mt-2">
          {mounted ? t('AppPage.description', { defaultValue: defaultDescription }) : defaultDescription}
        </p>
      </div>
      <InvoiceCalculatorClient />
    </div>
  );
} 
