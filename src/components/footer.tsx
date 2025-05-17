"use client"; // Keep client-side for useTranslation

// import { Github, Linkedin, Twitter } from "lucide-react"; // Unused imports

import { useEffect, useState } from "react";

import { FeedbackButton } from "@/components/feedback-button";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils"; // Ensure cn is imported
import { getLanguageFromPath } from "@/translations"; // Added import
import { usePathname } from "next/navigation";
import { useTranslation } from "@/translations";

// Improved footer component with cleaner visual hierarchy and fixed positioning
export function Footer() {
  const { i18n: i18nFromHook } = useTranslation();
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use getLanguageFromPath for robustness in SSR/initial state
  // Default to 'en' if path language is not recognized
  const langFromPathInitial = getLanguageFromPath(pathname) || 'en'; 
  const effectiveLang = mounted ? (i18nFromHook.language || langFromPathInitial) : langFromPathInitial;
  
  const calculatorLabel = effectiveLang === 'de' ? "Rechner" : "Calculator";
  const privacyLabel = effectiveLang === 'de' ? "Datenschutzerklärung" : "Privacy Policy";
  const termsLabel = effectiveLang === 'de' ? "Nutzungsbedingungen" : "Terms of Use";
  const impressumLabel = effectiveLang === 'de' ? "Impressum" : "Imprint";
  const feedbackLabel = effectiveLang === 'de' ? "Feedback teilen" : "Share Your Feedback";
  const companyLabel = "Siempi AG";
  
  const defaultCopyright = effectiveLang === 'de' 
    ? `© ${currentYear} Siempi AG — Alle Rechte vorbehalten.`
    : `© ${currentYear} Siempi AG — All rights reserved.`;
  
  const isOnCalculatorPage = pathname?.includes('/app');

  return (
    <footer className="w-full border-t border-border bg-card text-sm text-muted-foreground py-6 px-4 transition-colors duration-300 cursor-default">
      <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between cursor-default">
        <div className="flex items-center gap-2 mb-4 md:mb-0 md:w-1/3 cursor-default">
          <Link href={`/${effectiveLang}`} className="flex items-center gap-2 cursor-pointer select-none">
            <Image
              src="/images/icon.svg"
              alt="BillSplitter Logo Icon"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="relative block h-7 w-[130px] cursor-pointer select-none">
              <Image
                src="/images/logo.svg"
                alt="BillSplitter Logo"
                fill
                className="object-contain"
              />
            </span>
          </Link>
          <span className="text-muted-foreground text-xs cursor-default">by <a href="https://siempi.ch/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground no-underline hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card cursor-pointer select-none">{companyLabel}</a></span>
        </div>

        <nav className="flex flex-col items-center gap-2 text-sm md:w-1/3 cursor-default">
          <div className="flex flex-wrap justify-center gap-4 min-h-12 items-baseline cursor-default">
            <Link
              href={`/${effectiveLang}/app`}
              className={cn(
                "text-sky-600 no-underline hover:text-sky-600 hover:opacity-90",
                "transition-colors duration-200 font-medium decoration-muted-foreground cursor-pointer select-none",
                isOnCalculatorPage && "hidden",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              )}
            >
              {calculatorLabel}
            </Link>
            <FeedbackButton
              variant="link"
              size="sm"
              className="p-0 h-auto font-normal text-sm text-foreground hover:underline transition-colors duration-200 focus-visible:ring-offset-card cursor-pointer select-none"
            >
              {feedbackLabel}
            </FeedbackButton>
          </div>

          <div className="flex flex-wrap justify-center gap-4 min-h-12 items-center cursor-default">
            <Link
              href={`/${effectiveLang}/legal/privacy-policy`}
              className={cn(
                "text-muted-foreground hover:underline transition-colors duration-200 cursor-pointer select-none",
                "font-medium decoration-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              )}
            >
              {privacyLabel}
            </Link>
            <Link
              href={`/${effectiveLang}/legal/terms-of-use`}
              className={cn(
                "text-muted-foreground hover:underline transition-colors duration-200 cursor-pointer select-none",
                "font-medium decoration-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              )}
            >
              {termsLabel}
            </Link>
            <Link
              href={`/${effectiveLang}/legal/impressum`}
              className={cn(
                "text-muted-foreground hover:underline transition-colors duration-200 cursor-pointer select-none",
                "font-medium decoration-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              )}
            >
              {impressumLabel}
            </Link>
          </div>
        </nav>

        <div className="text-xs text-muted-foreground mt-4 md:mt-0 md:w-1/3 md:text-right transition-colors duration-200 cursor-default">
          {defaultCopyright}
        </div>
      </div>
    </footer>
  );
} 
