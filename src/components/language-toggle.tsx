"use client";

import * as React from "react";

import { AnimatePresence, LazyMotion, domAnimation, motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES, changeLanguage } from "@/translations";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import ReactCountryFlag from "react-country-flag";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/translations";

// Direct SVG implementation as fallback
const GlobeIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="lucide lucide-globe h-[1.2rem] w-[1.2rem]"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// Helper function to set a cookie
function setCookie(name: string, value: string, days: number) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  // Ensure SameSite=Lax for compatibility with middleware default
  document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax";
}

export default function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Use static labels for server render and initial hydration
  const toggleLanguageLabel = mounted 
    ? t("LanguageToggle.toggleLanguage", { defaultValue: "Toggle language" })
    : "Toggle language"; // Static fallback for server rendering

  // Ensure hydration works properly
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (lang: string) => {
    // Don't do anything if the language is already set to the target language
    if (i18n.language === lang) {
      setOpen(false);
      // Remove focus from button to reset its visual state
      if (buttonRef.current) {
        buttonRef.current.blur();
      }
      return;
    }
    
    // Save language in localStorage for persistence
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    
    // Set cookie for middleware persistence
    setCookie('NEXT_LOCALE', lang, 365);
    setCookie('billingperiodallocator-language', lang, 365);
    
    // Close dropdown menu
    setOpen(false);

    // Handle URL change and language update
    if (pathname) {
      // Get current language from URL
      const pathSegments = pathname.split('/');
      const currentLang = pathSegments.length > 1 && SUPPORTED_LANGUAGES.includes(pathSegments[1]) 
                           ? pathSegments[1] 
                           : null;
      
      let newPath;
      
      if (currentLang) {
        // Replace language segment in path, but preserve the rest of the path
        const pathWithoutLang = pathname.substring(pathname.indexOf('/', 1) || pathname.length);
        newPath = `/${lang}${pathWithoutLang}`;
      } else {
        // If no language in URL, add it
        // This case should ideally not happen if all pages are under /en or /de
        newPath = `/${lang}${pathname}`;
      }
      
      // Call changeLanguage directly before navigation to ensure client components update immediately
      changeLanguage(lang);

      // Always do a hard navigation when changing languages to ensure complete refresh
      // This ensures all components get properly re-rendered with the new language
      window.location.href = newPath;
      
      // Remove focus from button to reset its visual state
      if (buttonRef.current) {
        buttonRef.current.blur();
      }
    } else {
      // If no pathname available, just change the language and refresh
      changeLanguage(lang);
      window.location.reload();
      
      // Remove focus from button to reset its visual state
      if (buttonRef.current) {
        buttonRef.current.blur();
      }
    }
  };

  // Server-side and first render - use static content that won't change during hydration
  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        aria-label="Toggle language"
        className="header-toggle-button relative w-10 h-10 text-foreground focus-visible:ring-0 focus:outline-none"
        style={{ border: 'none' }}
      >
        <GlobeIcon />
        <span className="sr-only">Toggle language</span>
      </Button>
    );
  }

  // Client-side only - safe to use dynamic content
  const isEnglish = i18n.language === "en";
  const isGerman = i18n.language === "de";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          ref={buttonRef}
          aria-label={toggleLanguageLabel}
          style={open ? { backgroundColor: '#0284C7', color: 'white' } : {}}
          className={`header-toggle-button relative w-10 h-10 text-foreground focus-visible:ring-0 focus:outline-none`}
        >
          <GlobeIcon />
          <span className="sr-only">{toggleLanguageLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <LazyMotion features={domAnimation}>
        <AnimatePresence>
          {open && (
            <DropdownMenuContent 
              align="end" 
              side="top" 
              sideOffset={4} 
              className="z-[1000] bg-popover border border-border shadow-lg rounded-lg"
              asChild
              forceMount
            >
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
              >
                <DropdownMenuItem 
                  onClick={() => handleLanguageChange("en")}
                  className={`header-dropdown-item ${isEnglish ? "font-medium" : ""}`}
                  style={{ cursor: 'pointer' }}
                >
                  <ReactCountryFlag
                    countryCode="GB"
                    svg
                    style={{
                      width: "1.2em",
                      height: "1.2em",
                      marginRight: "0.5rem",
                      cursor: "pointer"
                    }}
                    title="English"
                    className="pointer-events-none"
                  />
                  <span className={`${isEnglish ? "font-bold" : ""} pointer-events-none`} style={{ cursor: 'pointer' }}>English</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleLanguageChange("de")}
                  className={`header-dropdown-item ${isGerman ? "font-medium" : ""}`}
                  style={{ cursor: 'pointer' }}
                >
                  <ReactCountryFlag
                    countryCode="DE"
                    svg
                    style={{
                      width: "1.2em",
                      height: "1.2em",
                      marginRight: "0.5rem",
                      cursor: "pointer"
                    }}
                    title="Deutsch"
                    className="pointer-events-none"
                  />
                  <span className={`${isGerman ? "font-bold" : ""} pointer-events-none`} style={{ cursor: 'pointer' }}>Deutsch</span>
                </DropdownMenuItem>
              </motion.div>
            </DropdownMenuContent>
          )}
        </AnimatePresence>
      </LazyMotion>
    </DropdownMenu>
  );
}
