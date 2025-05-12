"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalculationInput, CalculationResult } from "@/lib/calculations";
import { Card, CardContent } from "@/components/ui/card";
import { Suspense, useEffect, useRef, useState } from "react";

// Import the CalculationCallbackData type from InvoiceForm
import { CalculationCallbackData } from "@/components/invoice-form";
import Cookies from 'js-cookie';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Loader2 } from "lucide-react";
import { ResultsDisplay } from "@/components/results-display";
import { SettingsModal } from "@/components/settings-modal";
import { Terminal } from "lucide-react";
import dynamic from 'next/dynamic';
import { useTranslation } from '@/translations';

// Define a type for the demo data that matches the one in InvoiceForm
type DemoDataType = {
  startDateString?: string;
  endDateString?: string;
  amount?: string;
  includeEndDate?: boolean;
  splitPeriod?: 'yearly' | 'quarterly' | 'monthly';
  isDemo?: boolean;
} | null;

// Dynamic import of the InvoiceForm component with SSR disabled for faster loading
const InvoiceForm = dynamic(
  () => import('@/components/invoice-form').then(mod => ({ default: mod.InvoiceForm })),
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
    )
  }
);

// Define a type alias that matches ResultsDisplay's expected inputData type
type InputDataForDisplay = Pick<
  CalculationInput,
  "startDate" | "endDate" | "includeEndDate" | "amounts" | "splitPeriod"
>;

export default function InvoiceCalculatorClient() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  // Add state specifically for the dynamic title, initialized with the prop
  const [dynamicTitle, setDynamicTitle] = useState<string>('');
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  // Update storedInputData to use CalculationCallbackData type
  const [storedInputData, setStoredInputData] = useState<CalculationCallbackData>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Add ref for the results section
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  // State to store demo data to pass to InvoiceForm
  const [demoData, setDemoData] = useState<DemoDataType>(null);

  // --- Consent Management State and Logic --- 
  const gaMeasurementId = "G-9H2KTHX5YK"; 
  const consentCookieName = "siempiBillSplitterConsent";
  const [hasConsent, setHasConsent] = useState(false);

  // Add cleanup effect that runs on component unmount
  useEffect(() => {
    // This cleanup will run when the component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        // Safely capture current values for logging (useful for debugging)
        const hasDemoData = sessionStorage.getItem('billSplitterDemoData') !== null;
        const hasFormCache = sessionStorage.getItem('invoiceFormDataCache') !== null;
        
        // Safely remove only the form cache on unmount.
        // Let InvoiceForm handle clearing billSplitterDemoData after processing.
        try {
          // sessionStorage.removeItem('billSplitterDemoData'); // REMOVED
          sessionStorage.removeItem('invoiceFormDataCache');
          console.log('[InvoiceCalculatorClient] Cleaned up sessionStorage on unmount', { 
            hadDemoData: hasDemoData, 
            hadFormCache: hasFormCache, 
            // Note: billSplitterDemoData is no longer removed here.
          });
        } catch (error) {
          console.error('[InvoiceCalculatorClient] Error clearing sessionStorage on unmount:', error);
        }
      }
    };
  }, []); // Empty dependency array means this runs only on mount/unmount

  // Effect to check for existing consent cookie on mount and handle demo data
  useEffect(() => {
    setMounted(true);
    setDynamicTitle(t('InvoiceForm.title'));
    
    console.log("[InvoiceCalculatorClient] useEffect for initial mount. Reading sessionStorage for demo data.");
    // Check consent cookie
    const consentGiven = Cookies.get(consentCookieName) === "true";
    setHasConsent(consentGiven);
    
    // Read demo data before lazy loading InvoiceForm
    if (typeof window !== 'undefined') {
      const demoDataString = sessionStorage.getItem('billSplitterDemoData');
      console.log("[InvoiceCalculatorClient] sessionStorage billSplitterDemoData:", demoDataString);
      if (demoDataString) {
        try {
          const parsedDemoData = JSON.parse(demoDataString);
          console.log("[InvoiceCalculatorClient] Parsed demo data from sessionStorage:", parsedDemoData);
          if (parsedDemoData.isDemo) {
            console.log("[InvoiceCalculatorClient] isDemo is true. Setting demoData state.");
            setDemoData(parsedDemoData);
            // Don't remove it yet - we'll pass it to InvoiceForm and let it handle removal
          } else {
            console.log("[InvoiceCalculatorClient] isDemo is false or not present in parsedDemoData. Not setting demoData state.");
          }
        } catch (error) {
          console.error("Error parsing demo data from session storage in InvoiceCalculatorClient:", error);
          sessionStorage.removeItem('billSplitterDemoData');
          console.warn("[InvoiceCalculatorClient] Removed billSplitterDemoData from sessionStorage due to parsing error.");
        }
      }
    }
  }, [t]);

  const handleCalculation = (
    formData: CalculationCallbackData,
    results: CalculationResult | null,
    error?: string
   ) => {
    setCalculationResult(results);
    if (error && error.includes("At least one amount is required")) {
        setCalculationError(t('Errors.calculationErrorTitle') + ": " + t('InvoiceForm.errorAmountRequired'));
    } else if (error && error.includes("Start date must be before")) {
         setCalculationError(t('Errors.calculationErrorTitle') + ": " + t('InvoiceForm.errorEndDateBeforeStart'));
    } else {
         setCalculationError(error ? (t('Errors.calculationErrorTitle') + ": " + t('Errors.unexpectedError')) : null);
    }

    if (formData && results && !error) {
        setStoredInputData(formData);
        // Use requestAnimationFrame + timeout to ensure the layout is stable before scrolling
        setTimeout(() => {
          requestAnimationFrame(() => {
            if (resultsSectionRef.current) {
              resultsSectionRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
              });
            }
          });
        }, 200); // Slightly longer delay to ensure layout is fully settled
    } else {
        setStoredInputData(null);
    }
  };

  return (
    <>
      {/* Conditionally render Google Analytics only if consent is given */}
      {hasConsent && gaMeasurementId && <GoogleAnalytics gaId={gaMeasurementId} />}

      <div className="container mx-auto px-4 py-8 max-w-4xl grow overflow-hidden w-full">
        {/* Title and description moved outside the card */}
        <div className="text-center mb-8">
          {!mounted ? (
            <>
              <div className="h-9 bg-muted/60 rounded-md animate-pulse w-1/3 mx-auto mb-4" />
              <div className="h-4 bg-muted/60 rounded-sm animate-pulse w-2/3 mx-auto mb-2" />
              <div className="h-4 bg-muted/60 rounded-sm animate-pulse w-1/2 mx-auto" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-4">
                {dynamicTitle}
              </h1>
              <div className="max-w-2xl mx-auto space-y-2 px-4">
                <p>{t('InvoiceForm.description_p1')}</p>
                <p>{t('InvoiceForm.description_p2')}</p>
              </div>
            </>
          )}
        </div>
        
        {/* Only show loading indicator when component is not mounted */}
        {!mounted && (
          <div className="flex items-center gap-2 justify-center text-muted-foreground text-sm mb-6">
            <Loader2 className="animate-spin h-4 w-4 text-primary" />
            <span>Loading calculator...</span>
          </div>
        )}
        
        {/* Fixed-width container for consistent card sizes */}
        <div className="mx-auto" style={{ maxWidth: "768px" }}>
          {/* Form Card */}
          <Card className="mb-12 shadow-md w-full transition-opacity duration-300 ease-in-out" 
                data-loaded={mounted ? "true" : "false"}
                style={{ opacity: mounted ? 1 : 0.85 }}>
            <CardContent className="pt-6">
              <div className="w-full">
                <Suspense fallback={
                  <div className="space-y-6 animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-24 bg-muted/60 rounded-lg"></div>
                      <div className="h-24 bg-muted/60 rounded-lg"></div>
                    </div>
                    <div className="h-20 bg-muted/60 rounded-lg"></div>
                    <div className="h-48 bg-muted/60 rounded-lg"></div>
                    <div className="h-10 bg-muted/60 rounded-lg"></div>
                  </div>
                }>
                  <InvoiceForm 
                    onCalculateAction={handleCalculation} 
                    demoData={demoData} 
                  />
                </Suspense>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div ref={resultsSectionRef} className="mt-12 w-full">
            {mounted && calculationError && (
              <Alert variant="destructive" className="w-full">
                <Terminal className="h-4 w-4" />
                <AlertTitle>{t('Errors.calculationErrorTitle')}</AlertTitle>
                <AlertDescription>{calculationError}</AlertDescription>
              </Alert>
            )}
            {mounted && calculationResult && storedInputData && !calculationError && (
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

      {mounted && <SettingsModal isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />}
    </>
  );
}
