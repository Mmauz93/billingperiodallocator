"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalculationInput, CalculationResult } from "@/lib/calculations";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

// Import the CalculationCallbackData type from InvoiceForm
import { CalculationCallbackData } from "@/components/invoice-form";
import Cookies from 'js-cookie';
import { GoogleAnalytics } from '@next/third-parties/google';
import { InvoiceForm } from "@/components/invoice-form";
import { ResultsDisplay } from "@/components/results-display";
import { SettingsModal } from "@/components/settings-modal";
import { Terminal } from "lucide-react";
import { useTranslation } from 'react-i18next';

// Define props interface
interface InvoiceCalculatorClientProps {
  pageTitle: string;
}

// Define a type alias that matches ResultsDisplay's expected inputData type
type InputDataForDisplay = Pick<
  CalculationInput,
  "startDate" | "endDate" | "includeEndDate" | "amounts" | "splitPeriod"
>;

export function InvoiceCalculatorClient({ pageTitle }: InvoiceCalculatorClientProps) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  // Add state specifically for the dynamic title, initialized with the prop
  const [dynamicTitle, setDynamicTitle] = useState<string>(pageTitle);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  // Update storedInputData to use CalculationCallbackData type
  const [storedInputData, setStoredInputData] = useState<CalculationCallbackData>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Consent Management State and Logic --- 
  const gaMeasurementId = "G-9H2KTHX5YK"; 
  const consentCookieName = "siempiBillSplitterConsent";
  const [hasConsent, setHasConsent] = useState(false);

  // Effect to check for existing consent cookie on mount
  useEffect(() => {
    setMounted(true);
    setDynamicTitle(t('InvoiceForm.title'));
    
    // Check consent cookie
    const consentGiven = Cookies.get(consentCookieName) === "true";
    setHasConsent(consentGiven);
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
    } else {
        setStoredInputData(null);
    }
  };

  return (
    <>
      {/* Conditionally render Google Analytics only if consent is given */}
      {hasConsent && gaMeasurementId && <GoogleAnalytics gaId={gaMeasurementId} />}

      <div className="container mx-auto px-4 py-8 max-w-4xl grow">
         {/* Title and description moved outside the card */}
         <div className="text-center mb-8">
           <h1 className="text-3xl font-bold mb-4">
             {dynamicTitle}
           </h1>
           <div className="max-w-2xl mx-auto space-y-2">
             {mounted ? <p>{t('InvoiceForm.description_p1')}</p> : <p>Loading description...</p>}
             {mounted ? <p>{t('InvoiceForm.description_p2')}</p> : <p></p>}
           </div>
         </div>
         
         {/* Wrap just the form in a Card */}
         <Card className="mb-12 shadow-md">
             <CardContent className="pt-6">
                 <div className="w-full">
                     <InvoiceForm onCalculateAction={handleCalculation} />
                 </div>
             </CardContent>
         </Card>

        <div id="results-section" className="mt-12 w-full flex justify-center">
          {mounted && calculationError && (
            <Alert variant="destructive" className="max-w-2xl">
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
        </div>
      </div>

      {mounted && <SettingsModal isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />}
    </>
  );
}
