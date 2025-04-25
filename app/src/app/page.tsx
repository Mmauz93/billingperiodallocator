"use client"; // Required for useState

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalculationInput, CalculationResult } from "@/lib/calculations"; // Import CalculationInput

import { FeedbackButton } from "@/components/feedback-button";
import { InvoiceForm } from "@/components/invoice-form";
import { ResultsDisplay } from "@/components/results-display";
import { Terminal } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";

// Define StoredInputData based on actual form data needed for potential re-population or display
// which aligns with CalculationInput used by the form/calculation
type StoredInputData = Pick<
    CalculationInput, // Use CalculationInput as base
    'startDate' | 'endDate' | 'includeEndDate' | 'amounts' // Use 'amounts' array
>;

export default function Home() {
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [storedInputData, setStoredInputData] = useState<StoredInputData | null>(null);

  // Ensure handleCalculation uses the correct StoredInputData type
  const handleCalculation = (
    formData: StoredInputData, // formData type is now correct
    results: CalculationResult | null,
    error?: string
   ) => {
    setCalculationResult(results);
    setCalculationError(error || null);

    if (results && !error) {
        setStoredInputData(formData);
    } else {
        setStoredInputData(null);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-12 lg:p-24">
      <header className="w-full max-w-4xl flex justify-end mb-4 px-4">
        <ThemeToggle />
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl grow">
        <h1 className="text-3xl font-bold text-center mb-8">Invoice Split Calculator</h1>
        <div className="w-full">
            <InvoiceForm onCalculate={handleCalculation} />
        </div>

        {/* Results/Error Display Section */}
        <div id="results-section" className="mt-12 w-full flex justify-center">
          {calculationError && (
            <Alert variant="destructive" className="max-w-2xl">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Calculation Error</AlertTitle>
                <AlertDescription>{calculationError}</AlertDescription>
            </Alert>
          )}

          {/* Pass updated storedInputData type */} 
          {calculationResult && storedInputData && !calculationError && (
            <ResultsDisplay results={calculationResult} inputData={storedInputData} />
          )}
        </div>
      </div>

       {/* Footer */}
       <footer className="w-full max-w-4xl mt-auto px-4 py-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-center sm:text-left text-sm text-muted-foreground">
             {/* TODO: Add actual legal info link/modal */}
             &copy; {new Date().getFullYear()} Invoice Splitter. All rights reserved. | <a href="#" className="underline">Privacy Policy</a> | <a href="#" className="underline">Terms of Service</a>
          </p>
         <FeedbackButton />
       </footer>
    </main>
  );
}
