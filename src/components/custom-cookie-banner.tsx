"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

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
  const modalRef = useRef<HTMLDivElement>(null);

  // Wrap in useCallback to prevent dependency cycle
  const handleAccept = useCallback(() => {
    Cookies.set(consentCookieName, "true", { expires: 150 });
    setVisible(false);
    onAcceptAction();
  }, [consentCookieName, onAcceptAction]);

  const handleDecline = useCallback(() => {
    Cookies.set(consentCookieName, "false", { expires: 150 });
    setVisible(false);
    onDeclineAction();
  }, [consentCookieName, onDeclineAction]);

  useEffect(() => {
    const consent = Cookies.get(consentCookieName);
    if (consent !== "true" && consent !== "false") {
      // Small delay to prevent the banner from appearing during page load animations
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [consentCookieName]);

  useEffect(() => {
    if (!visible) return;
    
    // Add class to prevent layout shift when modal opens
    document.documentElement.classList.add('prevent-scrollbar-shift');
    
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
    
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleDecline();
      }
    }
    
    modal.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      modal.removeEventListener('keydown', handleTab);
      document.removeEventListener('keydown', handleEscape);
      document.documentElement.classList.remove('prevent-scrollbar-shift');
    }
  }, [visible, handleDecline]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed left-0 bottom-6 w-screen flex justify-center z-[2000] pointer-events-none md:bottom-8 md:left-auto md:right-8 md:w-auto md:justify-end"
        >
          <div className="pointer-events-auto bg-card text-card-foreground rounded-lg shadow-xl border border-border/40 p-6 flex flex-col items-center space-y-5 outline-none max-w-xs sm:max-w-sm w-full mx-4 md:mx-0">
            <div ref={modalRef} role="dialog" aria-modal="true" tabIndex={-1} className="w-full flex flex-col items-center space-y-5">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                  <path d="M8.5 8.5v.01" />
                  <path d="M16 15.5v.01" />
                  <path d="M12 12v.01" />
                </svg>
              </div>
              
              <h2 className="text-lg font-semibold text-center">
                {t('ConsentBanner.headline', { defaultValue: 'We use cookies' })}
              </h2>
              
              <p className="text-sm text-center text-muted-foreground">
                {t('ConsentBanner.message')}
              </p>
              
              <button
                type="button"
                onClick={onOpenPrivacyAction}
                className="text-sm text-primary hover:underline cursor-pointer bg-transparent border-0 p-0 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm"
              >
                {t('ConsentBanner.learnMoreButton')}
              </button>
              
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 justify-center w-full mt-1">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={handleAccept}
                  autoFocus
                >
                  {t('ConsentBanner.acceptButton')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDecline}
                >
                  {t('ConsentBanner.declineButton')}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 
