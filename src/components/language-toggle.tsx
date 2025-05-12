"use client";

import * as React from "react";

import { AnimatePresence, motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES, changeLanguage } from "@/translations";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "@/translations";

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
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Ensure hydration works properly
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (lng: string) => {
    // Don't do anything if the language is already set to the target language
    if (i18n.language === lng) {
      setOpen(false);
      return;
    }
    
    // First check if we're on a legal page that requires special handling
    const isLegalPage = pathname && (
      pathname.includes('/legal/privacy-policy') || 
      pathname.includes('/legal/terms-of-use') ||
      pathname.includes('/legal/impressum')
    );
    
    // Save language in localStorage for persistence
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    // Set cookie for middleware persistence
    setCookie('NEXT_LOCALE', lng, 365); 
    
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
        // Replace language segment in path
        newPath = pathname.replace(`/${currentLang}`, `/${lng}`);
      } else {
        // If no language in URL, add it
        newPath = `/${lng}${pathname}`;
      }
      
      // Different handling based on page type
      if (isLegalPage) {
        // For legal pages:
        // 1. Update URL without a full page reload
        window.history.pushState(null, '', newPath);
        
        // 2. Change the language after URL is updated
        // This sequence is important to prevent the race condition
        setTimeout(() => {
          changeLanguage(lng);
          
          // 3. Dispatch event so other components know to update
          document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lng, source: 'language-toggle' } 
          }));
        }, 0);
      } else {
        // For regular pages, use router navigation
        // Change language first to avoid flashing
        changeLanguage(lng);
        router.push(newPath);
      }
    } else {
      // If no pathname available, just change the language
      changeLanguage(lng);
    }
  };

  if (!mounted) return null;

  const isEnglish = i18n.language === "en";
  const isGerman = i18n.language === "de";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative w-10 h-10 flex items-center justify-center"
          onClick={(e) => {
            // Prevent event propagation to avoid layout shifts
            e.stopPropagation();
          }}
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <Globe className="h-5 w-5 text-foreground hover:text-primary" />
          </div>
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
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
                className={`cursor-pointer hover:text-primary ${isEnglish ? "font-medium" : ""}`}
              >
                <ReactCountryFlag
                  countryCode="GB"
                  svg
                  style={{
                    width: "1.2em",
                    height: "1.2em",
                    marginRight: "0.5rem",
                  }}
                  title="English"
                />
                <span className={isEnglish ? "font-bold" : ""}>English</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleLanguageChange("de")}
                className={`cursor-pointer hover:text-primary ${isGerman ? "font-medium" : ""}`}
              >
                <ReactCountryFlag
                  countryCode="DE"
                  svg
                  style={{
                    width: "1.2em",
                    height: "1.2em",
                    marginRight: "0.5rem",
                  }}
                  title="Deutsch"
                />
                <span className={isGerman ? "font-bold" : ""}>Deutsch</span>
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  );
}
