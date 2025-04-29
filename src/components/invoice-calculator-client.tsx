"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalculationInput, CalculationResult } from "@/lib/calculations";
import { useEffect, useRef, useState } from "react";

import { AccessibleIcon } from "@/components/ui/accessible-icon";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { GoogleAnalytics } from "@next/third-parties/google";
import { InvoiceForm } from "@/components/invoice-form";
import { LegalDocumentModal } from "@/components/legal-document-modal";
import { ResultsDisplay } from "./results-display";
import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParallaxSafety } from "@/lib/hooks/useParallaxSafety";
import { useTranslation } from "react-i18next";

// Define StoredInputData based on actual form data needed for potential re-population or display
type StoredInputData = Pick<
  CalculationInput,
  "startDate" | "endDate" | "includeEndDate" | "amounts"
>;

// Define the type for the callback data, aligning with InvoiceForm's definition
type CalculationCallbackDataForClient = StoredInputData | null;

// Accept props
export function InvoiceCalculatorClient() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [storedInputData, setStoredInputData] =
    useState<StoredInputData | null>(null);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [modalTitle] = useState("");
  const [modalContent] = useState<string | null>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const shouldEnableParallax = useParallaxSafety();
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

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

  // Effect to handle scroll position for scroll-to-top button visibility
  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScrollTopButton && window.scrollY > 300) {
        setShowScrollTopButton(true);
      } else if (showScrollTopButton && window.scrollY <= 300) {
        setShowScrollTopButton(false);
      }
    };

    window.addEventListener("scroll", checkScrollTop);
    return () => window.removeEventListener("scroll", checkScrollTop);
  }, [showScrollTopButton]);

  // Effect to handle parallax scrolling - NOW controlled by the hook
  useEffect(() => {
    const currentParallaxRef = parallaxRef.current; // Capture ref value for cleanup
    if (!mounted || !shouldEnableParallax) {
      if (currentParallaxRef) {
        currentParallaxRef.style.transform = "";
      }
      return; // Exit if not mounted or parallax is disabled
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (currentParallaxRef) {
        const offset = scrollY * 0.02;
        currentParallaxRef.style.transform = `translateY(${offset}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true }); // Use passive listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
      // Clear transform on cleanup
      if (currentParallaxRef) {
        currentParallaxRef.style.transform = "";
      }
    };
    // Depend on shouldEnableParallax to re-run effect if it changes
  }, [mounted, shouldEnableParallax]);

  // Function to scroll window to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCalculation = (
    formData: CalculationCallbackDataForClient,
    results: CalculationResult | null,
    error?: string,
  ) => {
    setResults(results);
    setError(error ? `${t("Errors.calculationErrorTitle")}: ${error}` : null);

    if (formData && results && !error) {
      setStoredInputData(formData);

      // Use a slightly longer delay to ensure DOM is fully updated
      setTimeout(() => {
        if (resultsSectionRef.current) {
          // Get the header height (approximately 64px)
          const headerHeight = 64; 
          
          // Use a more reliable way to scroll
          const offsetPosition = resultsSectionRef.current.offsetTop - headerHeight - 16;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 500);
    } else {
      setStoredInputData(null);
    }
  };

  return (
    <div className="space-y-8 relative pt-4">
      {/* Parallax Background - Conditionally apply class if needed */}
      <div
        ref={parallaxRef}
        className={cn(
          "fixed inset-0 -z-10 opacity-5 dark:opacity-[0.03]",
          shouldEnableParallax ? "parallax-background" : "", 
        )}
      >
        {/* Background pattern SVG or image */}
      </div>

      {/* Main Content - Updated with responsive max-width and centering */}
      <div className="flex justify-center w-full">
        <div className="w-[95%] md:w-[90%] lg:w-[85%] max-w-[960px] space-y-6">
          {/* Invoice Form Card */}
          <div className="bg-card rounded-lg border border-border shadow-lg p-6 md:p-8">
            <InvoiceForm onCalculateAction={handleCalculation} />
          </div>
            
          {/* Results or Error Card Container - Conditionally Rendered */}
          {(results || error) && (
            <div 
              ref={resultsSectionRef} 
              // Apply card styles directly to this container
              className="bg-card rounded-lg border border-border shadow-lg overflow-hidden min-h-[60px] animate-fadeIn"
            >
              {/* Conditional Rendering within the styled container */} 
              {results && storedInputData && (
                // Add padding specifically when showing results
                <div className="p-6 md:p-8 space-y-6"> 
                   <ResultsDisplay
                      results={results}
                      inputData={storedInputData}
                   />
                </div>
              )}
              
              {error && (
                // Add padding specifically when showing error
                <div className="p-6 md:p-8"> 
                   <Alert variant="destructive" className="shadow-md">
                     <AccessibleIcon label="Error">
                       <Terminal className="size-4" />
                     </AccessibleIcon>
                     <AlertTitle>{t("Errors.calculationErrorTitle")}</AlertTitle>
                     <AlertDescription>{error}</AlertDescription>
                   </Alert>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <LegalDocumentModal
        isOpen={isLegalModalOpen}
        onOpenChange={setIsLegalModalOpen}
        title={modalTitle}
        content={modalContent}
      />

      {/* Render GA only if consent is given */}
      {mounted && hasConsent && gaMeasurementId && (
        <GoogleAnalytics gaId={gaMeasurementId} />
      )}

      {/* Scroll to Top Button */}
      {showScrollTopButton && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-28 right-6 h-10 w-10 rounded-full shadow-lg 
                     border border-input 
                     bg-[#F5A623] text-primary-foreground 
                     hover:bg-[#F5A623]/90 
                     dark:bg-[#F5A623] dark:text-primary-foreground dark:hover:bg-[#F5A623]/90 
                     transition-opacity duration-300 z-50"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
