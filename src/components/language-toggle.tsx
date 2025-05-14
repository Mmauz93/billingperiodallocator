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
  const { i18n, t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Ensure hydration works properly
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (lang: string) => {
    // Don't do anything if the language is already set to the target language
    if (i18n.language === lang) {
      setOpen(false);
      return;
    }
    
    // Save language in localStorage for persistence
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    // Set cookie for middleware persistence
    setCookie('NEXT_LOCALE', lang, 365); 
    
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
        newPath = pathname.replace(`/${currentLang}`, `/${lang}`);
      } else {
        // If no language in URL, add it
        // This case should ideally not happen if all pages are under /en or /de
        newPath = `/${lang}${pathname}`;
      }
      
      // Use router navigation for all pages
      // The NEXT_LOCALE cookie will be used by the server to render the correct language
      router.push(newPath);

    } else {
      // If no pathname available, just change the language (fallback, less ideal)
      // This might still rely on client-side changeLanguage if no navigation occurs.
      // For full SC compatibility, a navigation is preferred.
      // Consider if this case is still needed or can be removed if pathname is always available.
      changeLanguage(lang); 
    }
  };

  if (!mounted) return <div className="w-10 h-10" />;

  const isEnglish = i18n.language === "en";
  const isGerman = i18n.language === "de";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("LanguageToggle.toggleLanguage")} className="text-foreground hover:text-primary relative w-10 h-10">
          <div className="relative w-[1.2rem] h-[1.2rem] overflow-hidden flex items-center justify-center pointer-events-none">
            <Globe className="h-[1.2rem] w-[1.2rem] pointer-events-none" />
          </div>
          <span className="sr-only">{t("LanguageToggle.toggleLanguage")}</span>
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
                  className={`!cursor-pointer hover:text-primary ${isEnglish ? "font-medium" : ""}`}
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
                    className="pointer-events-none"
                  />
                  <span className={`${isEnglish ? "font-bold" : ""} pointer-events-none`}>English</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleLanguageChange("de")}
                  className={`!cursor-pointer hover:text-primary ${isGerman ? "font-medium" : ""}`}
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
                    className="pointer-events-none"
                  />
                  <span className={`${isGerman ? "font-bold" : ""} pointer-events-none`}>Deutsch</span>
                </DropdownMenuItem>
              </motion.div>
            </DropdownMenuContent>
          )}
        </AnimatePresence>
      </LazyMotion>
    </DropdownMenu>
  );
}
