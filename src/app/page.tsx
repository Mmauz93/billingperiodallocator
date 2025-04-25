"use client"; // Required for useState

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalculationInput, CalculationResult } from "@/lib/calculations"; // Import CalculationInput
import { Fragment, useEffect, useState } from "react"; // Import useEffect and Fragment

import { Button } from "@/components/ui/button"; // Import Button
import { FeedbackButton } from "@/components/feedback-button";
import { Hash } from "lucide-react"; // Replace Calculator with Hash icon
import { InvoiceForm } from "@/components/invoice-form";
import { LanguageToggle } from "@/components/language-toggle"; // Import LanguageToggle
import { LegalDocumentModal } from "@/components/legal-document-modal"; // Import the new modal
import { ResultsDisplay } from "@/components/results-display";
import { SettingsModal } from "@/components/settings-modal"; // Import the modal
import { Terminal } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslation } from 'react-i18next'; // Import the correct hook

// Define StoredInputData based on actual form data needed for potential re-population or display
// which aligns with CalculationInput used by the form/calculation
type StoredInputData = Pick<
    CalculationInput, // Use CalculationInput as base
    'startDate' | 'endDate' | 'includeEndDate' | 'amounts' // Use 'amounts' array
>;

export default function Home() {
  const { t, i18n } = useTranslation(); // Extract i18n here
  const [mounted, setMounted] = useState(false); // Mounted state

  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [storedInputData, setStoredInputData] = useState<StoredInputData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // State for modal visibility
  
  // State for legal modal
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Effect to set mounted state on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to fetch markdown content
  const fetchMarkdown = async (url: string): Promise<string | null> => {
    try {
      let response = await fetch(url);
      
      // If localized version not found, try falling back to the English version
      if (!response.ok && url.includes('.de.md')) {
        const englishUrl = url.replace('.de.md', '.md');
        console.log(`Localized version not found, trying English version: ${englishUrl}`);
        response = await fetch(englishUrl);
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      
      const text = await response.text();
      return text;
    } catch (error) {
      console.error("Error fetching markdown:", error);
      // Optionally set an error state here to display in the modal
      return t('Errors.unexpectedError'); // Fallback error message
    }
  };

  // Function to open the legal modal
  const openLegalModal = async (docType: 'privacy' | 'terms') => {
    setIsLoadingContent(true);
    setIsLegalModalOpen(true);
    let title = "";
    let url = "";
    
    // Get current language from i18n instance
    const currentLanguage = i18n.language || 'en';
    const langSuffix = currentLanguage === 'de' ? '.de' : '';

    if (docType === 'privacy') {
        title = t('General.privacyPolicy');
        url = `/privacy-policy${langSuffix}.md`; 
    } else {
        title = t('General.termsOfUse');
        url = `/terms-of-use${langSuffix}.md`;
    }

    setModalTitle(title);
    const content = await fetchMarkdown(url);
    setModalContent(content);
    setIsLoadingContent(false);
  };

  // Ensure handleCalculation uses the correct StoredInputData type
  const handleCalculation = (
    formData: StoredInputData, // formData type is now correct
    results: CalculationResult | null,
    error?: string
   ) => {
    setCalculationResult(results);
    // Use i18next keys for error messages
    if (error && error.includes("At least one amount is required")) {
        setCalculationError(t('Errors.calculationErrorTitle') + ": " + t('InvoiceForm.errorAmountRequired'));
    } else if (error && error.includes("Start date must be before")) {
         setCalculationError(t('Errors.calculationErrorTitle') + ": " + t('InvoiceForm.errorEndDateBeforeStart'));
    } else {
         setCalculationError(error ? (t('Errors.calculationErrorTitle') + ": " + t('Errors.unexpectedError')) : null);
    }

    if (results && !error) {
        setStoredInputData(formData);
    } else {
        setStoredInputData(null);
    }
  };

  // Render the full component structure, but conditionally render translated content
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-12 lg:p-24">
      <header className="w-full max-w-4xl flex justify-end items-center space-x-2 mb-4 px-4">
        {/* Add Language Toggle Here */}
        <LanguageToggle />
        {/* Settings Button - Updated Icon and aria-label */}
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSettingsOpen(true)} 
            aria-label={mounted ? t('SettingsModal.title') : "Number Formatting"} // Use new title, static fallback
        >
            <Hash className="h-5 w-5" /> {/* Use Hash icon */}
        </Button>
         {/* Theme Toggle */}
        <ThemeToggle />
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl grow">
        {/* Conditionally render title text */}
        <h1 className="text-3xl font-bold text-center mb-8">
            {mounted ? t('InvoiceForm.title') : <>&nbsp;</>} {/* Render placeholder/nothing pre-mount */} 
        </h1>
        <div className="w-full">
            <InvoiceForm onCalculate={handleCalculation} />
        </div>

        {/* Results/Error Display Section - Assumes ResultsDisplay handles its own potential hydration issues if any */}
        <div id="results-section" className="mt-12 w-full flex justify-center">
          {mounted && calculationError && (
            <Alert variant="destructive" className="max-w-2xl">
                <Terminal className="h-4 w-4" />
                <AlertTitle>{t('Errors.calculationErrorTitle')}</AlertTitle>
                <AlertDescription>{calculationError}</AlertDescription> 
            </Alert>
          )}
          {mounted && calculationResult && storedInputData && !calculationError && (
            <ResultsDisplay results={calculationResult} inputData={storedInputData} />
          )}
        </div>
      </div>

      {/* Render Modals - These are typically client-only anyway */}
      {mounted && <SettingsModal isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />} 
      {mounted && <LegalDocumentModal 
        isOpen={isLegalModalOpen} 
        onOpenChange={setIsLegalModalOpen} 
        title={modalTitle} 
        content={isLoadingContent ? t('FeedbackDialog.messagePlaceholder') : modalContent} 
      />}

       {/* Footer - Use mounted state for translated text */}
       <footer className="w-full max-w-4xl mt-auto px-4 py-6 border-t text-sm text-muted-foreground">
           <div className="flex flex-col sm:flex-row justify-between items-center gap-y-2 gap-x-4">
               <div className="flex flex-col sm:flex-row items-center text-center sm:text-left order-2 sm:order-1 grow gap-x-3 gap-y-1">
                  <p className="shrink-0"> 
                     {mounted ? t('General.allRightsReserved', { year: new Date().getFullYear() }) : <>&copy; {new Date().getFullYear()}</>} {/* Static fallback */}
                  </p>
                  <div className="flex gap-x-3 justify-center sm:justify-start"> 
                     <button onClick={() => openLegalModal('privacy')} className="underline hover:text-foreground whitespace-nowrap">{mounted ? t('General.privacyPolicy') : "Privacy Policy"}</button> 
                     <button onClick={() => openLegalModal('terms')} className="underline hover:text-foreground whitespace-nowrap">{mounted ? t('General.termsOfUse') : "Terms of Use"}</button>
                  </div>
               </div>
              <div className="order-1 sm:order-2 shrink-0">
                  {/* FeedbackButton likely handles its own mount state if needed, or we wrap it */} 
                 {mounted ? <FeedbackButton /> : <div className="h-9 w-[130px]"></div> } {/* Placeholder for button */} 
              </div>
           </div>
       </footer>
    </main>
  );
}
