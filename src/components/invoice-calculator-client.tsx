"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalculationInput, CalculationResult } from "@/lib/calculations";
import { Card, CardContent } from "@/components/ui/card";
import { Suspense, useEffect, useRef, useState } from "react";

import { CalculationCallbackData } from "@/components/invoice-form";
import { CalculationErrorType } from "./invoice-form/types";
import Cookies from "js-cookie";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Loader2 } from "lucide-react";
import { ResultsDisplay } from "@/components/results-display";
import { SettingsModal } from "@/components/settings-modal";
import { Terminal } from "lucide-react";
import dynamic from "next/dynamic";
import { handleCalculationError } from "./invoice-form/error-handler";
import { safeText } from "@/lib/utils";
import { useDemoDataHandler } from "./invoice-form/demo-data-handler";
import { useTranslation } from "@/translations";

const InvoiceForm = dynamic(
  () =>
    import("@/components/invoice-form").then((mod) => ({
      default: mod.InvoiceForm,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-24 bg-muted/60 rounded-lg"></div>
          <div className="h-24 bg-muted/60 rounded-lg"></div>
        </div>
        <div className="h-20 bg-muted/60 rounded-lg"></div>
        <div className="h-48 bg-muted/60 rounded-lg"></div>
        <div className="h-10 bg-muted/60 rounded-lg"></div>
      </div>
    ),
  },
);

type InputDataForDisplay = Pick<
  CalculationInput,
  "startDate" | "endDate" | "includeEndDate" | "amounts" | "splitPeriod"
>;

interface InvoiceCalculatorClientProps {
  pageTitle: string;
}

export default function InvoiceCalculatorClient({
  pageTitle,
}: InvoiceCalculatorClientProps) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [calculationResult, setCalculationResult] =
    useState<CalculationResult | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [storedInputData, setStoredInputData] =
    useState<CalculationCallbackData>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  const { initialDemoData, handleDemoDataApplied } = useDemoDataHandler();

  const gaMeasurementId = "G-9H2KTHX5YK";
  const consentCookieName = "siempiBillSplitterConsent";
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        const hasDemoData =
          sessionStorage.getItem("billSplitterDemoData") !== null;
        const hasFormCache =
          sessionStorage.getItem("invoiceFormDataCache") !== null;

        try {
          sessionStorage.removeItem("invoiceFormDataCache");
          console.log(
            "[InvoiceCalculatorClient] Cleaned up sessionStorage on unmount",
            {
              hadDemoData: hasDemoData,
              hadFormCache: hasFormCache,
            },
          );
        } catch (error) {
          console.error(
            "[InvoiceCalculatorClient] Error clearing sessionStorage on unmount:",
            error,
          );
        }
      }
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    const consentGiven = Cookies.get(consentCookieName) === "true";
    setHasConsent(consentGiven);
  }, []);

  const handleCalculation = (
    formData: CalculationCallbackData,
    results: CalculationResult | null,
    error?: CalculationErrorType,
  ) => {
    setCalculationResult(results);
    const displayError = error ? handleCalculationError({ error, t }) : null;
    setCalculationError(displayError);

    if (formData && results && !displayError) {
      setStoredInputData(formData);
      setTimeout(() => {
        requestAnimationFrame(() => {
          if (resultsSectionRef.current) {
            resultsSectionRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        });
      }, 200);
    } else {
      setStoredInputData(null);
      if (displayError) {
        setCalculationResult(null);
      }
    }
  };

  const description1 =
    pageTitle === "Rechnungsperioden-Rechner"
      ? "Teilen Sie Rechnungen über Geschäftsjahre auf. Konform mit IFRS, HGB und OR — keine Anmeldung, keine Datenspeicherung. Einfach, schnell, präzise."
      : "Split invoices across fiscal years. Stay compliant with IFRS, HGB, and OR — no login, no data storage. Simple, fast, precise.";

  const description2 =
    pageTitle === "Rechnungsperioden-Rechner"
      ? "Ideal für Buchhalter bei der Erstellung von Gewinn- und Verlustrechnungen und Bilanzen, für Finanzfachleute bei der Budgetverwaltung oder für alle, die eine klare finanzielle Aufschlüsselung für das Reporting benötigen."
      : "Ideal for accountants preparing income statements and balance sheets, financial professionals managing budgets, or anyone needing a clear financial breakdown for reporting.";

  return (
    <>
      {hasConsent && gaMeasurementId && (
        <GoogleAnalytics gaId={gaMeasurementId} />
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl grow overflow-hidden w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-center mb-4">{pageTitle}</h1>
          <div className="max-w-2xl mx-auto space-y-2 px-4">
            <p>{mounted ? t("InvoiceForm.description_p1") : description1}</p>
            <p>{mounted ? t("InvoiceForm.description_p2") : description2}</p>
          </div>
        </div>

        {!mounted && (
          <div className="flex items-center gap-2 justify-center text-muted-foreground text-sm mb-6">
            <Loader2 className="animate-spin h-4 w-4 text-primary" />
            <span>Loading calculator...</span>
          </div>
        )}

        <div className="mx-auto" style={{ maxWidth: "768px" }}>
          <Card
            className="mb-12 shadow-md w-full transition-opacity duration-300 ease-in-out"
            data-loaded={mounted ? "true" : "false"}
            style={{ opacity: mounted ? 1 : 0.85 }}
          >
            <CardContent className="pt-6">
              <div className="w-full">
                <Suspense
                  fallback={
                    <div className="space-y-6 animate-pulse">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-24 bg-muted/60 rounded-lg"></div>
                        <div className="h-24 bg-muted/60 rounded-lg"></div>
                      </div>
                      <div className="h-20 bg-muted/60 rounded-lg"></div>
                      <div className="h-48 bg-muted/60 rounded-lg"></div>
                      <div className="h-10 bg-muted/60 rounded-lg"></div>
                    </div>
                  }
                >
                  <InvoiceForm
                    onCalculateAction={handleCalculation}
                    initialDemoData={initialDemoData}
                    onDemoDataApplied={handleDemoDataApplied}
                  />
                </Suspense>
              </div>
            </CardContent>
          </Card>

          <div ref={resultsSectionRef} className="mt-12 w-full">
            {mounted && calculationError && (
              <Alert variant="destructive" className="w-full">
                <Terminal className="h-4 w-4" />
                <AlertTitle>{t("Errors.calculationErrorTitle")}</AlertTitle>
                <AlertDescription>
                  {safeText(calculationError)}
                </AlertDescription>
              </Alert>
            )}
            {mounted &&
              calculationResult &&
              storedInputData &&
              !calculationError && (
                <ResultsDisplay
                  results={calculationResult}
                  inputData={storedInputData as InputDataForDisplay}
                />
              )}
            {!mounted && calculationResult === null && (
              <Card className="shadow-md w-full h-64 flex items-center justify-center">
                <div className="space-y-4 p-6 w-full">
                  <div className="h-6 bg-muted/60 rounded-md animate-pulse w-3/4 mx-auto mb-8" />
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="h-4 bg-muted/60 rounded-sm animate-pulse" />
                    <div className="h-4 bg-muted/60 rounded-sm animate-pulse" />
                    <div className="h-4 bg-muted/60 rounded-sm animate-pulse" />
                    <div className="h-4 bg-muted/60 rounded-sm animate-pulse" />
                  </div>
                  <div className="h-24 bg-muted/60 rounded-md animate-pulse" />
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {mounted && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
        />
      )}
    </>
  );
}
