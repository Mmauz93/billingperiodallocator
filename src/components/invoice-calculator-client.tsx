"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalculationInput, CalculationResult } from "@/lib/calculations";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import Cookies from 'js-cookie';
import { FeedbackButton } from "@/components/feedback-button";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Hash } from "lucide-react";
import Image from "next/image";
import { InvoiceForm } from "@/components/invoice-form";
import LanguageToggle from "@/components/language-toggle";
import { LegalDocumentModal } from "@/components/legal-document-modal";
import { ResultsDisplay } from "@/components/results-display";
import { SettingsModal } from "@/components/settings-modal";
import { Terminal } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslation } from 'react-i18next';

// Define StoredInputData based on actual form data needed for potential re-population or display
type StoredInputData = Pick<
    CalculationInput,
    'startDate' | 'endDate' | 'includeEndDate' | 'amounts'
>;

// Accept props
export function InvoiceCalculatorClient() {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [storedInputData, setStoredInputData] = useState<StoredInputData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  // Reference for the results section
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  // Reference for the parallax background
  const parallaxRef = useRef<HTMLDivElement>(null);

  // --- Consent Management State and Logic --- 
  const gaMeasurementId = "G-9H2KTHX5YK"; 
  const consentCookieName = "siempiBillSplitterConsent";
  const [hasConsent, setHasConsent] = useState(false);

  // Effect to check for existing consent cookie on mount
  useEffect(() => {
    setMounted(true);
    
    // Check consent cookie
    const consentGiven = Cookies.get(consentCookieName);
    // Only show the banner if no cookie exists
    setHasConsent(consentGiven === "true");
  }, []);

  // Effect to handle parallax scrolling
  useEffect(() => {
    if (!mounted) return;

    // Only apply on desktop
    const isDesktop = window.innerWidth >= 1024;
    if (!isDesktop) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (parallaxRef.current) {
        // Very subtle movement (1-3px per 100px scroll)
        const offset = scrollY * 0.02; // 2px per 100px scroll
        parallaxRef.current.style.transform = `translateY(${offset}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mounted]);

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
        
        // Add a small delay before scrolling for perceived complexity
        setTimeout(() => {
          // Use a smoother scrolling behavior with offset to position results optimally
          resultsSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start' 
          });
          // Add a subtle highlight animation to draw attention
          if (resultsSectionRef.current) {
            resultsSectionRef.current.classList.add('pulse-highlight');
            // Remove the class after animation completes
            setTimeout(() => {
              resultsSectionRef.current?.classList.remove('pulse-highlight');
            }, 1000);
          }
        }, 400); // Increased delay to enhance perception of computation
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
      // Show banner only if consent cookie is not set at all
      const consent = Cookies.get(consentCookieName);
      setVisible(consent !== "true" && consent !== "false");
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
      // Set cookie with 365 days expiry for better persistence
      Cookies.set(consentCookieName, "true", { expires: 365, sameSite: 'strict' });
      setVisible(false);
      onAccept();
    };
    const handleDecline = () => {
      // Set cookie with 365 days expiry for better persistence
      Cookies.set(consentCookieName, "false", { expires: 365, sameSite: 'strict' });
      setVisible(false);
      onDecline();
    };

    if (!visible) return null;

    return (
      <div className="fixed left-0 bottom-12 w-screen flex justify-center z-[2000] pointer-events-none md:left-auto md:right-6 md:w-auto md:justify-end transition-opacity duration-300">
        <div className="pointer-events-auto bg-muted text-foreground rounded-2xl shadow-2xl p-6 flex flex-col items-center space-y-6 outline-none border max-w-xs sm:max-w-sm w-full mx-4 md:mx-0">
          <div ref={modalRef} role="dialog" aria-modal="true" tabIndex={-1} className="w-full flex flex-col items-center space-y-6">
            <h2 className="text-lg font-semibold text-center">
              {t('ConsentBanner.headline', { defaultValue: 'We use cookies' })}
            </h2>
            <p className="text-sm text-center">
              {t('ConsentBanner.message')}
            </p>
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="text-sm underline text-foreground hover:text-primary cursor-pointer bg-transparent border-0 p-0 focus:outline-none"
            >
              {t('ConsentBanner.learnMoreButton')}
            </button>
            <div className="flex space-x-4 justify-center w-full mt-4">
              <button
                type="button"
                onClick={handleAccept}
                autoFocus
                className="bg-[#2E5A8C] text-white border border-border rounded-md px-5 py-2 text-base font-medium cursor-pointer hover:bg-[#2E5A8C]/90 focus:outline-none focus:ring-2 focus:ring-primary transition-colors transition-transform duration-300 hover:scale-105"
              >
                {t('ConsentBanner.acceptButton')}
              </button>
              <button
                type="button"
                onClick={handleDecline}
                className="bg-[#cccccc] text-secondary-foreground text-base font-medium px-5 py-2 rounded-md cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-primary transition-colors transition-transform duration-300 hover:scale-105"
              >
                {t('ConsentBanner.declineButton')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    // Wrap in a flex container that grows to fill parent height
    <div className="flex flex-col grow">
      {/* Parallax Background (desktop only) */}
      <div ref={parallaxRef} className="parallax-background"></div>

      {/* Conditionally render Google Analytics only if consent is given */}
      {/* Note: Rendered outside the main visual structure is fine */}
      {hasConsent && gaMeasurementId && <GoogleAnalytics gaId={gaMeasurementId} />}

      <header className="w-full max-w-4xl flex justify-between items-center space-x-2 mb-8 px-4">
        <div className="flex items-center">
          <Image src="/images/logo.svg" alt="BillSplitter Logo" width={100} height={30} />
        </div>
        <div className="flex items-center space-x-2">
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl grow">
         {/* Use translation keys for the title and description */}
         <h1 className="text-3xl md:text-[42px] font-bold text-center mb-8">
             {mounted ? t('App.title', 'Automated Invoice Split Calculator — Accurate. Effortless. Compliant.') : 'Loading...'}
         </h1>
         <div className="text-center text-muted-foreground mb-2 text-sm">
           {mounted ? t('App.tagline', 'Built for Finance Professionals') : '...'}
         </div>
         <div className="text-center text-muted-foreground mb-12 max-w-xl mx-auto space-y-2">
           <p>{mounted ? t('App.description', 'Split invoices across fiscal years... Compliant...') : 'Loading description...'}</p>
         </div>
        <div className="w-full flex justify-center mt-12">
            <div className="w-[95%] sm:w-[90%] mx-auto max-w-[800px] shadow-sm rounded-xl">
                <InvoiceForm onCalculateAction={handleCalculation} />
            </div>
        </div>

        <div ref={resultsSectionRef} id="results-section" className="mt-12 w-full flex justify-center">
          {mounted && calculationError && (
            <Alert variant="destructive" className="w-[95%] sm:w-[90%] mx-auto max-w-[800px] animate-fadeIn">
                <Terminal className="h-4 w-4" />
                <AlertTitle>{t('Errors.calculationErrorTitle')}</AlertTitle>
                <AlertDescription>{calculationError}</AlertDescription>
            </Alert>
          )}
          {mounted && calculationResult && storedInputData && !calculationError && (
            <div className="w-[95%] sm:w-[90%] mx-auto max-w-[800px] shadow-sm rounded-xl animate-result-glow transition-all duration-150 ease-in-out">
            <ResultsDisplay results={calculationResult} inputData={storedInputData} />
            </div>
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

      {/* Footer with reduced top margin (mt-2 instead of -mt-4) */}
      <footer className="w-full border-t text-muted-foreground mt-2">
        <div className="max-w-[1200px] mx-auto px-8 py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
          {/* Left Block: Logo + Brand */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <Image
              src="/images/logo.svg"
              alt="BillSplitter Logo"
              width={120}
              height={30}
              className="mb-1"
              priority
            />
            <span className="text-sm mt-2 text-muted-foreground font-normal">by Siempi AG</span>
          </div>

          {/* Center Block: Navigation Links */}
          <nav className="flex flex-col sm:flex-row items-center gap-4 sm:gap-4">
            <button 
              onClick={() => openLegalModal('privacy')} 
              className="text-sm font-medium text-foreground/80 hover:text-foreground hover:underline transition-colors duration-200 cursor-pointer"
            >
              {t('General.privacyPolicy')}
            </button>
            <button 
              onClick={() => openLegalModal('terms')} 
              className="text-sm font-medium text-foreground/80 hover:text-foreground hover:underline transition-colors duration-200 cursor-pointer"
            >
              {t('General.termsOfUse')}
            </button>
          </nav>

          {/* Right Block: Feedback & Copyright */}
          <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
            {/* Ghost variant aligns better with the design spec */}
            <FeedbackButton 
              variant="outline" 
              size="sm"
              className="h-8 text-sm font-medium border border-muted-foreground/30 bg-transparent"
            />
            <p className="text-xs text-muted-foreground/75 mt-2">
              &copy; {new Date().getFullYear()} Siempi AG — All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Consent Banner */}
      <CookieConsentBanner 
          onAccept={handleAcceptAnalytics}
          onDecline={handleDeclineAnalytics}
          consentCookieName={consentCookieName}
          onOpenPrivacy={() => openLegalModal('privacy')}
      />
    </div> // Close the wrapping div
  );
} 
