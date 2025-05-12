"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalculationInput, CalculationResult } from "@/lib/calculations";
import { Card, CardContent } from "@/components/ui/card";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

// Import the CalculationCallbackData type from InvoiceForm
import { CalculationCallbackData } from "@/components/invoice-form";
import Cookies from 'js-cookie';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Loader2 } from "lucide-react";
import { ResultsDisplay } from "@/components/results-display";
import { SettingsModal } from "@/components/settings-modal";
import { Terminal } from "lucide-react";
import dynamic from 'next/dynamic';
import { safeText } from "@/lib/utils";
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

// Define a more specific type for the error parameter
type CalculationErrorType = string | Error | { message?: string; [key: string]: unknown } | null | undefined;

export default function InvoiceCalculatorClient() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [dynamicTitle, setDynamicTitle] = useState<string>('');
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [storedInputData, setStoredInputData] = useState<CalculationCallbackData>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  // State for holding demo data to pass as prop
  const [initialDemoData, setInitialDemoData] = useState<DemoDataType>(null);
  // Ref to track if we've already processed demo data to avoid duplicate processing
  const demoDataProcessedRef = useRef(false);

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

  // Effect just for setting mounted state and title
  useEffect(() => {
    setMounted(true);
    setDynamicTitle(t('InvoiceForm.title'));

    // Check consent cookie
    const consentGiven = Cookies.get(consentCookieName) === "true";
    setHasConsent(consentGiven);
  }, [t, consentCookieName]);

  // Separate effect ONLY for reading demo data
  useEffect(() => {
    // Only process sessionStorage once per component lifecycle
    if (demoDataProcessedRef.current) {
      return;
    }

    // Read demo data from sessionStorage
    if (typeof window !== 'undefined') {
      const demoDataString = sessionStorage.getItem('billSplitterDemoData');
      console.log("[InvoiceCalculatorClient] Reading sessionStorage billSplitterDemoData:", demoDataString);
      
      if (demoDataString) {
        try {
          const parsedDemoData = JSON.parse(demoDataString);
          if (parsedDemoData && parsedDemoData.isDemo) {
            // Clear localStorage cache first to ensure it doesn't override demo data
            localStorage.removeItem('invoiceFormDataCache');
            console.log("[InvoiceCalculatorClient] Cleared localStorage cache to ensure demo data is used");
            
            console.log("[InvoiceCalculatorClient] Setting initialDemoData state:", parsedDemoData);
            setInitialDemoData(parsedDemoData);
            
            // Clear sessionStorage immediately
            sessionStorage.removeItem('billSplitterDemoData');
            console.log("[InvoiceCalculatorClient] Removed billSplitterDemoData from sessionStorage");
            
            // Mark as processed to prevent re-reading
            demoDataProcessedRef.current = true;
          } else {
            sessionStorage.removeItem('billSplitterDemoData');
          }
        } catch (error) {
          console.error("[InvoiceCalculatorClient] Error parsing demo data:", error);
          sessionStorage.removeItem('billSplitterDemoData');
        }
      }
    }
  }, []); // No dependencies - runs once on mount

  // Callback for InvoiceForm to signal demo data has been processed
  const handleDemoDataApplied = useCallback(() => {
    console.log("[InvoiceCalculatorClient] Demo data processed by InvoiceForm, clearing state");
    setInitialDemoData(null);
  }, []);

  const handleCalculation = (
    formData: CalculationCallbackData,
    results: CalculationResult | null,
    error?: CalculationErrorType // Use the more specific type
   ) => {
    setCalculationResult(results);
    let displayError: string | null = null;
    if (error) {
        const baseErrorTitle = t('Errors.calculationErrorTitle');
        if (typeof error === 'string') {
            if (error.includes("At least one amount is required")) {
                displayError = baseErrorTitle + ": " + t('InvoiceForm.errorAmountRequired');
            } else if (error.includes("Start date must be before")) {
                displayError = baseErrorTitle + ": " + t('InvoiceForm.errorEndDateBeforeStart');
            } else {
                displayError = baseErrorTitle + ": " + error;
            }
        } else if (error instanceof Error) {
            // Handle standard Error objects
            displayError = baseErrorTitle + ": " + error.message;
            console.error("[InvoiceCalculatorClient] Error object received:", error);
        } else if (error && typeof error === 'object') {
            // Improved handling for object errors
            if ('message' in error && typeof error.message === 'string') {
                displayError = baseErrorTitle + ": " + error.message;
            } else {
                // For objects without a message property, convert to JSON string or use generic message
                try {
                    const stringifiedError = JSON.stringify(error);
                    displayError = baseErrorTitle + ": " + (stringifiedError !== "{}" ? stringifiedError : t('Errors.unexpectedError'));
                } catch {
                    // If JSON stringification fails
                    displayError = baseErrorTitle + ": " + t('Errors.unexpectedError');
                }
            }
            console.error("[InvoiceCalculatorClient] Error object received:", error);
        } else {
            // For other non-string errors or null/undefined that somehow made it here
            displayError = baseErrorTitle + ": " + t('Errors.unexpectedError');
            console.error("[InvoiceCalculatorClient] An unexpected or non-standard error was received:", error);
        }
    }
    setCalculationError(displayError);

    // If there was any kind of error, we should ensure results are not processed as successful
    if (formData && results && !displayError) { // Check against displayError now
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
        // If there was an error, but results were somehow passed, clear them too
        if (displayError) {
            setCalculationResult(null);
        }
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
                    initialDemoData={initialDemoData} // Pass state as prop
                    onDemoDataApplied={handleDemoDataApplied} // Pass callback prop
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
                <AlertDescription>{safeText(calculationError)}</AlertDescription>
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
