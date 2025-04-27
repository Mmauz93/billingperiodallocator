"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalculationInput, CalculationResult } from "@/lib/calculations";
import { Fragment, useEffect, useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { FeedbackButton } from "@/components/feedback-button";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Hash } from "lucide-react";
import { InvoiceForm } from "@/components/invoice-form";
import { LanguageToggle } from "@/components/language-toggle";
import { LegalDocumentModal } from "@/components/legal-document-modal";
import { ResultsDisplay } from "@/components/results-display";
import { SettingsModal } from "@/components/settings-modal";
import { Terminal } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';

// Define props interface
interface InvoiceCalculatorClientProps {
  pageTitle: string;
}

// Define StoredInputData based on actual form data needed for potential re-population or display
type StoredInputData = Pick<
    CalculationInput,
    'startDate' | 'endDate' | 'includeEndDate' | 'amounts'
>;

// Accept props
export function InvoiceCalculatorClient({ pageTitle }: InvoiceCalculatorClientProps) {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  // Add state specifically for the dynamic title, initialized with the prop
  const [dynamicTitle, setDynamicTitle] = useState<string>(pageTitle);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [storedInputData, setStoredInputData] = useState<StoredInputData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

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

  // Function to handle consent acceptance
  const handleAcceptAnalytics = () => {
    setHasConsent(true);
    // Cookie is set automatically by CookieConsent component using cookieName prop
  };

  // Function to handle decline
  const handleDeclineAnalytics = () => {
    setHasConsent(false);
     // Cookie is set automatically by CookieConsent component
  };
  // --- End Consent Management Logic ---

  const fetchMarkdown = async (url: string): Promise<string | null> => {
    try {
      let response = await fetch(url);
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
      return t('Errors.unexpectedError');
    }
  };

  const openLegalModal = async (docType: 'privacy' | 'terms') => {
    setIsLoadingContent(true);
    setIsLegalModalOpen(true);
    let title = "";
    let url = "";
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

  const handleCalculation = (
    formData: StoredInputData,
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

    if (results && !error) {
        setStoredInputData(formData);
    } else {
        setStoredInputData(null);
    }
  };

  // --- Custom CookieConsentBanner Implementation ---
  function CookieConsentBanner({ onAccept, onDecline, consentCookieName, onOpenPrivacy }: { onAccept: () => void, onDecline: () => void, consentCookieName: string, onOpenPrivacy: () => void }) {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // Show banner only if consent cookie is not set
      const consent = Cookies.get(consentCookieName);
      if (consent !== "true" && consent !== "false") {
        setVisible(true);
      }
    }, [consentCookieName]);

    // Trap focus in modal for accessibility
    useEffect(() => {
      if (!visible) return;
      const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const modal = modalRef.current;
      if (!modal) return;
      const focusableEls = modal.querySelectorAll<HTMLElement>(focusableSelectors);
      if (focusableEls.length) focusableEls[0].focus();
      function handleTab(e: KeyboardEvent) {
        if (e.key !== 'Tab') return;
        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
      modal.addEventListener('keydown', handleTab);
      return () => modal.removeEventListener('keydown', handleTab);
    }, [visible]);

    const handleAccept = () => {
      Cookies.set(consentCookieName, "true", { expires: 150 });
      setVisible(false);
      onAccept();
    };
    const handleDecline = () => {
      Cookies.set(consentCookieName, "false", { expires: 150 });
      setVisible(false);
      onDecline();
    };

    if (!visible) return null;

    return (
      <div className="fixed z-[2000] bottom-6 right-6 max-w-sm w-full">
        <div ref={modalRef} role="dialog" aria-modal="true" tabIndex={-1} className="bg-muted text-foreground rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4 outline-none border">
          <h2 className="text-lg font-semibold text-center mb-1">{t('ConsentBanner.headline', { defaultValue: 'We use cookies' })}</h2>
          <p className="text-sm text-center mb-1">{t('ConsentBanner.message')}</p>
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="text-sm underline text-foreground hover:text-primary mb-2 cursor-pointer bg-transparent border-0 p-0 focus:outline-none"
            tabIndex={0}
          >
            {t('ConsentBanner.learnMoreButton')}
          </button>
          <div className="flex flex-row gap-3 w-full justify-center">
            <button
              type="button"
              className="bg-black text-white border border-border rounded-md px-5 py-2 text-base font-medium cursor-pointer hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              onClick={handleAccept}
              autoFocus
            >
              {t('ConsentBanner.acceptButton')}
            </button>
            <button
              type="button"
              className="bg-transparent text-secondary-foreground text-base font-medium px-5 py-2 rounded-md cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              onClick={handleDecline}
            >
              {t('ConsentBanner.declineButton')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Conditionally render Google Analytics only if consent is given */}
      {/* Note: Rendered outside the main visual structure is fine */}
      {hasConsent && gaMeasurementId && <GoogleAnalytics gaId={gaMeasurementId} />}

      <header className="w-full max-w-4xl flex justify-end items-center space-x-2 mb-4 px-4">
        <LanguageToggle />
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            aria-label={mounted ? t('SettingsModal.title') : "Number Formatting"}
        >
            <Hash className="h-5 w-5" />
        </Button>
        <ThemeToggle />
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl grow">
         {/* Use the dynamicTitle state for the h1 */}
         <h1 className="text-3xl font-bold text-center mb-8">
             {dynamicTitle}
         </h1>
         {/* Use translation keys for descriptive text */}
         <div className="text-center text-muted-foreground mb-8 max-w-xl mx-auto space-y-2">
           {/* Show placeholders until mounted and translated */}
           <p>{mounted ? t('InvoiceForm.description_p1') : 'Loading description...'}</p>
           <p>{mounted ? t('InvoiceForm.description_p2') : ''}</p>
         </div>
        <div className="w-full">
            <InvoiceForm onCalculate={handleCalculation} />
        </div>

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

      {mounted && <SettingsModal isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />}
      {mounted && <LegalDocumentModal
        isOpen={isLegalModalOpen}
        onOpenChange={setIsLegalModalOpen}
        title={modalTitle}
        content={isLoadingContent ? t('FeedbackDialog.messagePlaceholder') : modalContent}
      />}

       <footer className="w-full max-w-4xl mt-auto px-4 py-6 border-t text-sm text-muted-foreground">
           <div className="flex flex-col sm:flex-row justify-between items-center gap-y-2 gap-x-4">
               <div className="flex flex-col sm:flex-row items-center text-center sm:text-left order-2 sm:order-1 grow gap-x-3 gap-y-1">
                  <p className="shrink-0">
                     {mounted ? t('General.allRightsReserved', { year: new Date().getFullYear() }) : <>&copy; {new Date().getFullYear()}</>}
                  </p>
                  <div className="flex gap-x-3 justify-center sm:justify-start">
                     <Button variant="link" onClick={() => openLegalModal('privacy')} className="h-auto p-0 text-muted-foreground hover:text-foreground whitespace-nowrap">{mounted ? t('General.privacyPolicy') : "Privacy Policy"}</Button>
                     <Button variant="link" onClick={() => openLegalModal('terms')} className="h-auto p-0 text-muted-foreground hover:text-foreground whitespace-nowrap">{mounted ? t('General.termsOfUse') : "Terms of Use"}</Button>
                  </div>
               </div>
              <div className="order-1 sm:order-2 shrink-0">
                 {mounted ? <FeedbackButton /> : <div className="h-9 w-[130px]"></div> }
              </div>
           </div>
       </footer>

       <CookieConsentBanner onAccept={handleAcceptAnalytics} onDecline={handleDeclineAnalytics} consentCookieName={consentCookieName} onOpenPrivacy={() => openLegalModal('privacy')} />
    </>
  );
} 
