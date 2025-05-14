"use client"; // Keep client-side for useTranslation

// import { Github, Linkedin, Twitter } from "lucide-react"; // Unused imports

import { useEffect, useState } from "react";

import { FeedbackButton } from "@/components/feedback-button";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/translations";

// import { getLanguageFromPath } from "@/translations"; // Removed unused import



// Improved footer component with cleaner visual hierarchy and fixed positioning
export function Footer() {
  // Remove unused t variable, just use i18n
  const { i18n: i18nFromHook } = useTranslation();
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const [mounted, setMounted] = useState(false);
  
  // Determine language for initial render (hydration) based on pathname
  let initialLangFromPath = 'en'; // Default language
  if (pathname) {
    const pathSegments = pathname.split('/');
    if (pathSegments.length > 1 && (pathSegments[1] === 'de' || pathSegments[1] === 'en')) {
      initialLangFromPath = pathSegments[1];
    }
  }
  
  // Mark component as mounted
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // For SSR, use the language from the path
  // After hydration, use the language from i18n
  const effectiveLang = mounted ? (i18nFromHook.language || initialLangFromPath) : initialLangFromPath;
  
  // Define labels based on effective language - no conditional rendering based on mounted state
  // This ensures consistent rendering between server and client
  const calculatorLabel = effectiveLang === 'de' ? "Rechner" : "Calculator";
  const privacyLabel = effectiveLang === 'de' ? "Datenschutzerklärung" : "Privacy Policy";
  const termsLabel = effectiveLang === 'de' ? "Nutzungsbedingungen" : "Terms of Use";
  const impressumLabel = effectiveLang === 'de' ? "Impressum" : "Imprint";
  const feedbackLabel = effectiveLang === 'de' ? "Feedback teilen" : "Share Your Feedback";
  const companyLabel = "Siempi AG"; // Company name is the same in both languages
  
  const defaultCopyright = effectiveLang === 'de' 
    ? `© ${currentYear} Siempi AG — Alle Rechte vorbehalten.`
    : `© ${currentYear} Siempi AG — All rights reserved.`;
  
  // Check if we're already on the calculator page to avoid showing link to current page
  const isOnCalculatorPage = pathname?.includes('/app');

  return (
    <footer className="w-full border-t border-border text-sm text-gray-600 dark:text-gray-400 py-6 px-4 transition-colors duration-300">
      <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Logo and Brand section - fixed width to maintain consistent positioning */}
        <div className="flex items-center gap-2 mb-4 md:mb-0 md:w-1/3">
          <Link href={`/${effectiveLang}/`} className="flex items-center gap-2 cursor-pointer">
            <Image
              src="/images/icon.svg" 
              alt="BillSplitter Logo Icon"
              width={24}
              height={24}
              className="w-6 h-6"
              priority
            />
            {/* Styled span as the relative container for the logo image */}
            <span className="relative block h-7 w-[130px] cursor-pointer">
              <Image 
                src="/images/logo.svg" 
                alt="BillSplitter Logo" 
                fill
                className="object-contain"
                priority
              />
            </span>
          </Link>
          {/* "by Siempi AG" is now a sibling to the Link, not a child */}
          <span className="text-gray-600 dark:text-gray-400 text-xs">by <a href="https://siempi.ch/" target="_blank" rel="noopener noreferrer" className="!text-gray-600 !dark:text-gray-400 no-underline hover:underline transition-colors duration-200">{companyLabel}</a></span>
        </div>

        {/* Navigation Links - Grouped into two rows */}
        <nav className="flex flex-col items-center gap-2 text-sm md:w-1/3">
          {/* Top Row: Calculator & Feedback */}
          <div className="flex flex-wrap justify-center gap-4 min-h-12 items-center">
            {/* 1. Calculator link (now always rendered, conditionally hidden) */}
            <Link
              href={`/${effectiveLang}/app/`}
              className={cn(
                "hover:underline transition-colors duration-200",
                isOnCalculatorPage && "hidden"
              )}
            >
              {calculatorLabel}
            </Link>
            {/* 2. Feedback Button - pass the language-specific label as children */}
            <FeedbackButton 
              variant="link" 
              size="sm"
              className="p-0 h-auto font-normal text-sm hover:underline transition-colors duration-200"
            >
              {feedbackLabel}
            </FeedbackButton>
          </div>

          {/* Bottom Row: Legal Links */}
          <div className="flex flex-wrap justify-center gap-4 min-h-12 items-center">
            {/* 3. Privacy Policy */}
          <Link
            href={`/${effectiveLang}/legal/privacy-policy/`}
            className="!text-gray-600 !dark:text-gray-400 hover:underline transition-colors duration-200"
          >
            {privacyLabel}
          </Link>
            {/* 4. Terms of Use */}
          <Link
            href={`/${effectiveLang}/legal/terms-of-use/`}
            className="!text-gray-600 !dark:text-gray-400 hover:underline transition-colors duration-200"
          >
            {termsLabel}
          </Link>
            {/* 5. Impressum */}
          <Link
            href={`/${effectiveLang}/legal/impressum/`}
            className="!text-gray-600 !dark:text-gray-400 hover:underline transition-colors duration-200"
          >
            {impressumLabel}
          </Link>
          </div>
        </nav>

        {/* Copyright notice - fixed width to maintain consistent positioning */}
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-4 md:mt-0 md:w-1/3 md:text-right transition-colors duration-200">
          {defaultCopyright}
        </div>
      </div>
    </footer>
  );
} 
