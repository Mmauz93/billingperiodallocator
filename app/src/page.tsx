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
    <main className="flex min-h-screen flex-col items-center p-4 md:p-12 lg:p-24">
      {/* Add Header for Theme Toggle */}
      <header className="w-full max-w-4xl flex justify-end mb-4 px-4">
        <ThemeToggle />
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl grow"> {/* Increased max-width */}
        <h1 className="text-3xl font-bold text-center mb-8">Invoice Split Calculator</h1>
        <div className="w-full"> {/* Form takes full width */} 
          <InvoiceForm onCalculate={handleCalculation} /> {/* Pass handler */} 
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
