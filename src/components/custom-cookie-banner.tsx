"use client";

import { AnimatePresence, LazyMotion, domAnimation, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import Cookies from 'js-cookie';
import { Switch } from "@/components/ui/switch";
import { useTranslation } from '@/translations';

// import Link from 'next/link'; // Not used in the provided snippet for the banner itself

interface CustomCookieConsentBannerProps {
  onAcceptAction: () => void;
  onDeclineAction: () => void;
  consentCookieName: string;
  onOpenPrivacyAction: () => void;
}

export function CustomCookieConsentBanner({ 
  onAcceptAction, 
  onDeclineAction, 
  consentCookieName, 
  onOpenPrivacyAction
}: CustomCookieConsentBannerProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  // Wrap in useCallback to prevent dependency cycle
  const handleAccept = useCallback(() => {
    // Store scroll position before closing
    const scrollPos = window.scrollY;
    
    // Set cookie and close banner
    Cookies.set(consentCookieName, "true", { expires: 150 });
    setVisible(false);
    onAcceptAction();
    
    // Restore scroll position after a short delay
    setTimeout(() => window.scrollTo(0, scrollPos), 10);
  }, [consentCookieName, onAcceptAction]);

  const handleSavePreferences = useCallback(() => {
    // Store scroll position before closing
    const scrollPos = window.scrollY;
    
    // Set cookie based on analytics preference and close banner
    Cookies.set(consentCookieName, analyticsEnabled ? "true" : "false", { expires: 150 });
    setVisible(false);
    
    if (analyticsEnabled) {
      onAcceptAction();
    } else {
      onDeclineAction();
    }
    
    // Restore scroll position after a short delay
    setTimeout(() => window.scrollTo(0, scrollPos), 10);
  }, [analyticsEnabled, consentCookieName, onAcceptAction, onDeclineAction]);

  // Toggle options panel
  const handleManageOptions = () => {
    setShowOptions(true);
  };

  // Go back to main banner
  const handleBack = () => {
    setShowOptions(false);
  };

  useEffect(() => {
    const consent = Cookies.get(consentCookieName);
    if (consent !== "true" && consent !== "false") {
      // Small delay to prevent the banner from appearing during page load animations
      const timer = setTimeout(() => {
        // Save the current scroll position before showing the banner
        const scrollPos = window.scrollY;
        setVisible(true);
        // Restore scroll position to prevent jumping
        setTimeout(() => window.scrollTo(0, scrollPos), 10);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [consentCookieName]);

  useEffect(() => {
    if (!visible) return;
    
    // Add class to prevent scrolling while modal is open
    document.documentElement.classList.add('prevent-scrollbar-shift');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    const scrollPos = window.scrollY;
    const preventScrollJump = () => {
      if (window.scrollY !== scrollPos) {
        window.scrollTo(0, scrollPos);
      }
    };
    preventScrollJump();
    setTimeout(preventScrollJump, 50);
    setTimeout(preventScrollJump, 150);
    
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = modalRef.current;
    if (!modal) return;
    const focusableEls = modal.querySelectorAll<HTMLElement>(focusableSelectors);
    if (focusableEls.length) focusableEls[0].focus(); // Auto-focus first element
    
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
    
    // Disable escape key to force a choice
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault(); // Prevent escape from closing the modal
      }
    }
    
    modal.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      modal.removeEventListener('keydown', handleTab);
      document.removeEventListener('keydown', handleEscape);
      document.documentElement.classList.remove('prevent-scrollbar-shift');
      document.body.style.overflow = ''; // Restore scrolling
    }
  }, [visible]);

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {visible && (
          <>
            {/* Full-screen overlay with higher opacity */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[1999]"
              aria-hidden="true"
            />
            
            {/* Centered Cookie Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-0 z-[2000] pointer-events-none flex items-center justify-center p-4"
              aria-label="Cookie consent banner"
              aria-live="polite"
              role="region"
            >
              <div className="pointer-events-auto bg-card text-card-foreground shadow-xl border border-border/40 rounded-lg p-8 flex flex-col items-center w-full max-w-md mx-auto">
                <div ref={modalRef} role="alertdialog" aria-modal="true" aria-labelledby="cookie-dialog-title" tabIndex={-1} className="w-full flex flex-col items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary cookie-icon">
                        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                        <path d="M8.5 8.5v.01" />
                        <path d="M16 15.5v.01" />
                        <path d="M12 12v.01" />
                      </svg>
                    </div>
                  </div>
                  
                  {!showOptions ? (
                    <div className="flex-1 flex flex-col items-center w-full">
                      <h2 id="cookie-dialog-title" className="text-2xl font-semibold text-center">
                        {t('ConsentBanner.headline', { defaultValue: 'We use cookies' })}
                      </h2>
                      
                      <p className="text-base text-center text-muted-foreground my-4 max-w-sm">
                        {t('ConsentBanner.message')}
                      </p>
                      
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); onOpenPrivacyAction(); }}
                        className="text-sm text-primary hover:underline cursor-pointer bg-transparent border-0 mb-4 inline-block"
                      >
                        {t('ConsentBanner.learnMoreButton')}
                      </a>
                      
                      <div className="flex flex-col space-y-3 w-full mt-2">
                        <Button
                          variant="default"
                          className="w-full text-base py-6 bg-[#0284C7] hover:bg-[#0284C7]/90 cookie-accept text-lg font-medium"
                          onClick={handleAccept}
                          autoFocus
                        >
                          {t('ConsentBanner.acceptButton')}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full text-base py-4"
                          onClick={handleManageOptions}
                        >
                          {t('ConsentBanner.declineButton', { defaultValue: 'Manage Options' })}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col w-full">
                      <h2 id="options-dialog-title" className="text-2xl font-semibold text-center">
                        Cookie Preferences
                      </h2>
                      
                      <p className="text-sm text-center text-muted-foreground my-4">
                        You can customize which cookies you allow us to use. Essential cookies cannot be disabled as they are required for the website to function.
                      </p>
                      
                      <div className="border border-border/40 rounded-md p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium">Essential Cookies</h3>
                            <p className="text-xs text-muted-foreground">Required for the website to function properly</p>
                          </div>
                          <Switch checked={true} disabled={true} />
                        </div>
                      </div>
                      
                      <div className="border border-border/40 rounded-md p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium">Analytics Cookies</h3>
                            <p className="text-xs text-muted-foreground">Help us improve the website by collecting anonymous usage data</p>
                          </div>
                          <Switch 
                            checked={analyticsEnabled} 
                            onCheckedChange={setAnalyticsEnabled}
                            id="analytics-toggle"
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 w-full mt-4">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleBack}
                        >
                          Back
                        </Button>
                        <Button
                          variant="default"
                          className="flex-1 bg-[#0284C7] hover:bg-[#0284C7]/90"
                          onClick={handleSavePreferences}
                        >
                          Save Preferences
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
} 
