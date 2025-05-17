"use client";

import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  motion,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { CookieBannerMainView } from "./cookie-banner-main-view";
import { CookieBannerOptionsView } from "./cookie-banner-options-view";
import Cookies from "js-cookie";
import { useModalBehavior } from "@/lib/hooks/use-modal-behavior";
import { useTranslation } from "@/translations";

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
  onOpenPrivacyAction,
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
    Cookies.set(consentCookieName, analyticsEnabled ? "true" : "false", {
      expires: 150,
    });
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

  useModalBehavior(visible, modalRef);

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
              <div
                className="pointer-events-auto bg-card text-card-foreground shadow-xl border border-border/40 rounded-lg p-8 flex flex-col items-center w-full max-w-md mx-auto"
                style={{ backgroundColor: "hsl(var(--card))", opacity: 1 }}
              >
                <div
                  ref={modalRef}
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="cookie-dialog-title"
                  tabIndex={-1}
                  className="w-full flex flex-col items-center gap-6"
                  style={{ backgroundColor: "transparent" }}
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                        <path d="M8.5 8.5v.01" />
                        <path d="M16 15.5v.01" />
                        <path d="M12 12v.01" />
                      </svg>
                    </div>
                  </div>

                  {!showOptions ? (
                    <CookieBannerMainView
                      t={t}
                      onAcceptAction={handleAccept}
                      onManageOptions={handleManageOptions}
                      onOpenPrivacyAction={onOpenPrivacyAction}
                    />
                  ) : (
                    <CookieBannerOptionsView
                      t={t}
                      analyticsEnabled={analyticsEnabled}
                      onAnalyticsChange={setAnalyticsEnabled}
                      onSavePreferences={handleSavePreferences}
                      onBack={handleBack}
                    />
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
