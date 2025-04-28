"use client"; // Required for useState

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert
import { CalculationInput, CalculationResult } from "@/lib/calculations"; // Import CalculationResult and CalculationInput

import { FeedbackButton } from "@/components/feedback-button"; // Import FeedbackButton
import { InvoiceForm } from "@/components/invoice-form";
import { ResultsDisplay } from "@/components/results-display"; // Import ResultsDisplay
import { Terminal } from "lucide-react"; // Import icon for Alert
import { ThemeToggle } from "@/components/theme-toggle"; // Import ThemeToggle
import { useState } from "react";

// Updated StoredInputData type to reflect dynamic amounts
type StoredInputData = Pick<
    CalculationInput, // Reference the updated CalculationInput
    'startDate' | 'endDate' | 'includeEndDate' | 'amounts'
>;

export default function Home() {
  // State for calculation results and errors
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  // Store relevant input data when calculation is successful
  const [storedInputData, setStoredInputData] = useState<StoredInputData | null>(null);

  // Updated handleCalculation signature to match InvoiceForm callback
  const handleCalculation = (
    formData: StoredInputData, // Type uses the updated StoredInputData
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
    <main className="flex flex-col items-center grow w-full p-4 md:p-12 lg:p-24">
      {/* Add Header for Theme Toggle */}
      <header className="w-full max-w-4xl flex justify-end mb-4 px-4">
        <ThemeToggle />
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl grow"> {/* Increased max-width */}
        <h1 className="text-3xl font-bold text-center mb-8">Invoice Split Calculator</h1>
        <div className="w-full"> {/* Form takes full width */} 
          <InvoiceForm onCalculateAction={handleCalculation} /> {/* Pass handler with correct prop name */} 
        </div>

        {/* Results/Error Display Section */}
        <div id="results-section" className="mt-12 w-full flex justify-center">
          {/* Display Error Alert */}
          {calculationError && (
            <Alert variant="destructive" className="max-w-2xl">
                <Terminal className="h-4 w-4" /> {/* Add an icon */}
                <AlertTitle>Calculation Error</AlertTitle>
                <AlertDescription>{calculationError}</AlertDescription>
            </Alert>
          )}

          {/* Display Results */}
          {calculationResult && storedInputData && !calculationError && (
            <ResultsDisplay results={calculationResult} inputData={storedInputData} />
          )}
        </div>
      </div>
       {/* Footer */}
       <footer className="w-full max-w-5xl mx-auto mt-auto px-4 sm:px-6 lg:px-8 py-6 border-t text-muted-foreground">
         <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
            {/* Left Block: Brand */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              {/* TODO: Replace span with actual Logo/Icon component */}
              <span className="text-lg font-semibold mb-1 text-foreground">BillSplitter</span>
              <span className="text-sm">by Siempi AG</span>
            </div>

            {/* Center Block: Legal Links */}
            <nav className="flex flex-col sm:flex-row gap-3 sm:gap-4 text-sm">
              {/* TODO: Ensure these paths match your actual legal page routes */}
              <a href="/legal/privacy-policy" className="hover:text-foreground hover:underline transition-colors">Privacy Policy</a>
              <a href="/legal/terms-of-use" className="hover:text-foreground hover:underline transition-colors">Terms of Use</a>
              <a href="/legal/imprint" className="hover:text-foreground hover:underline transition-colors">Imprint</a>
            </nav>

            {/* Right Block: Feedback & Copyright */}
            <div className="flex flex-col items-center sm:items-end gap-3 text-center sm:text-right">
              <FeedbackButton />
              <p className="text-xs">
                &copy; {new Date().getFullYear()} Siempi AG — All rights reserved.
              </p>
            </div>
         </div>
       </footer>
    </main>
  );
} 
