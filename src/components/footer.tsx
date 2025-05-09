"use client"; // Keep client-side for useTranslation

import { useEffect, useState } from "react";

import { FeedbackButton } from "@/components/feedback-button";
import Image from "next/image";
import Link from "next/link";
import { getLanguageFromPath } from "@/i18n-client";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

// Improved footer component with cleaner visual hierarchy and fixed positioning
export function Footer() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const [mounted, setMounted] = useState(false);

  // Get current language from URL or fall back to i18n.language (This is the local function)
  const getCurrentLanguage = () => {
    if (!pathname) return i18n.language || 'en';
    
    const pathLanguage = getLanguageFromPath(pathname);
    return pathLanguage || i18n.language || 'en';
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Define all labels upfront to avoid conditional rendering
  // Only use translations after mounting to prevent hydration mismatch
  const calculatorLabel = mounted ? t("General.calculator") : "Calculator";
  const privacyLabel = mounted ? t("General.privacyPolicy") : "Privacy Policy";
  const termsLabel = mounted ? t("General.termsOfUse") : "Terms of Use";
  const impressumLabel = mounted ? t("General.impressum") : "Imprint";
  const feedbackLabel = mounted ? t("General.feedback") : "Feedback";
  const copyrightLabel = mounted 
    ? t("Footer.copyright", { year: currentYear }) 
    : `© ${currentYear} Siempi AG — All rights reserved.`;
  const companyLabel = mounted ? t("Footer.companyName") : "Siempi AG";

  const currentLang = getCurrentLanguage();
  
  // Check if we're already on the calculator page to avoid showing link to current page
  const isOnCalculatorPage = pathname?.includes('/app');

  return (
    <footer className="w-full border-t border-border text-sm text-gray-600 dark:text-gray-400 py-6 px-4 transition-colors duration-300">
      <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Logo and Brand section - fixed width to maintain consistent positioning */}
        <div className="flex items-center gap-2 mb-4 md:mb-0 md:w-1/3">
          <Link href={`/${currentLang}/`} className="flex items-center gap-2 cursor-pointer">
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
          <span className="text-gray-500 text-xs">by {companyLabel}</span>
        </div>

        {/* Navigation Links - fixed width to maintain consistent positioning */}
        <nav className="flex flex-wrap justify-center gap-4 text-sm md:w-1/3 md:justify-center">
          {/* Add Calculator link if not on the calculator page */}
          {!isOnCalculatorPage && (
            <Link
              href={`/${currentLang}/app/`}
              className="hover:underline transition-colors duration-200"
            >
              {calculatorLabel}
            </Link>
          )}
          <Link
            href={`/${currentLang}/legal/privacy-policy/`}
            className="hover:underline transition-colors duration-200"
          >
            {privacyLabel}
          </Link>
          <Link
            href={`/${currentLang}/legal/terms-of-use/`}
            className="hover:underline transition-colors duration-200"
          >
            {termsLabel}
          </Link>
          <Link
            href={`/${currentLang}/legal/impressum/`}
            className="hover:underline transition-colors duration-200"
          >
            {impressumLabel}
          </Link>
          <div className="hover:underline transition-colors duration-200">
            <FeedbackButton 
              variant="link" 
              size="sm"
              className="p-0 h-auto font-normal"
          >
            {feedbackLabel}
            </FeedbackButton>
          </div>
        </nav>

        {/* Copyright notice - fixed width to maintain consistent positioning */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 md:mt-0 md:w-1/3 md:text-right transition-colors duration-200">
          {copyrightLabel}
        </div>
      </div>
    </footer>
  );
} 
