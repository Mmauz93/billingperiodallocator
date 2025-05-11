"use client";

import { SUPPORTED_LANGUAGES, getCurrentLanguage, getLanguageFromPath } from "@/translations";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import LanguageToggle from "@/components/language-toggle";
import Link from "next/link";
// import { MainNav } from "@/components/main-nav"; // TODO: Resolve path or remove if not used
// import { MobileNav } from "@/components/mobile-nav"; // TODO: Resolve path or remove if not used
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/translations";

export function Header() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>('');
  
  // Mount effect
  useEffect(() => {
    setMounted(true);
    
    // Initial language setup from URL path
    const pathLanguage = getLanguageFromPath(pathname || '');
    const initialLang = pathLanguage || i18n.language || getCurrentLanguage();
    
    setCurrentLang(initialLang);
    
    // Ensure i18n is in sync with URL
    if (pathLanguage && i18n.language !== pathLanguage) {
      i18n.changeLanguage(pathLanguage);
    }
  }, [i18n, pathname]);

  // Effect to track path/language changes
  useEffect(() => {
    if (!mounted) return;
    
    const pathLanguage = getLanguageFromPath(pathname || '');
    if (pathLanguage) {
      setCurrentLang(pathLanguage);
      
      // Update i18n language if needed
      if (i18n.language !== pathLanguage) {
        i18n.changeLanguage(pathLanguage);
      }
    }
  }, [pathname, mounted, i18n]);
  
  // Listen for language changes from outside this component
  useEffect(() => {
    if (!mounted) return;
    
    const handleLanguageChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newLang = customEvent.detail?.language || customEvent.detail;
      
      if (newLang && typeof newLang === 'string' && SUPPORTED_LANGUAGES.includes(newLang)) {
        setCurrentLang(newLang);
        
        // Sync i18n if needed
        if (i18n.language !== newLang) {
          i18n.changeLanguage(newLang);
        }
      }
    };
    
    document.addEventListener('languageChanged', handleLanguageChanged);
    
    return () => {
      document.removeEventListener('languageChanged', handleLanguageChanged);
    };
  }, [mounted, i18n]);
  
  // Track i18n language changes directly
  useEffect(() => {
    if (!mounted) return;
    
    // Update local state when i18n language changes
    if (i18n.language && currentLang !== i18n.language) {
      setCurrentLang(i18n.language);
    }
  }, [i18n.language, mounted, currentLang]);
  
  const rawPathname = pathname || '';
  // Normalize pathname: remove trailing slash if it's not the root itself
  const normalizedPathname = rawPathname.length > 1 && rawPathname.endsWith('/') ? rawPathname.slice(0, -1) : rawPathname;

  // Check if user is already on the app page to avoid showing the button if they're already there
  const isOnAppPage = normalizedPathname.endsWith('/app');
  
  // Always show the get started button unless user is already on the app page
  const showGetStartedButton = !isOnAppPage;
  const showThemeToggle = !rawPathname.includes('/legal/privacy-policy');

  // Don't render until we're mounted and currentLang state is set (for links etc.)
  if (!mounted || !currentLang) return null;

  // Ensure linkLang is valid for the Link href
  const linkLangForButton = currentLang || getCurrentLanguage();
  
  // Compute paths once
  const homePath = `/${linkLangForButton}/`;
  const appPath = `/${linkLangForButton}/app/`;

  return (
    <header className="fixed top-0 z-[100] w-full border-b border-border/40 bg-background/95 backdrop-blur-sm will-change-transform">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          {/* Simple Link for logo navigation */}
          <Link 
            href={homePath}
            className="flex items-center cursor-pointer"
          >
            <Image
              src="/images/logo.svg"
              alt="BillSplitter Logo"
              width={180}
              height={40}
              priority
              className="h-10"
            />
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* <CommandMenu /> */}
          </div>
          {/* <MainNav /> */}
          {/* <MobileNav /> */}
          <nav className="flex items-center space-x-2">
          {showGetStartedButton && (
            <Button 
              asChild
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
            >
              <Link href={appPath}>
                {t("General.getStarted", { defaultValue: "Split Invoice" })}
              </Link>
            </Button>
          )}
          <LanguageToggle />
          {showThemeToggle && <ThemeToggle />}
        </nav>
        </div>
      </div>
    </header>
  );
} 
