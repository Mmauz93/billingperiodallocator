"use client";

import { getCurrentLanguage, getLanguageFromPath } from "@/translations";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import LanguageToggle from "@/components/language-toggle";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/translations";

// Import components directly instead of using dynamic imports

export function Header() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>(() => getCurrentLanguage());
  
  // Determine language for initial render (hydration) based on pathname
  let initialLangFromPath = 'en'; // Default language
  if (pathname) {
    const pathSegments = pathname.split('/');
    if (pathSegments.length > 1 && (pathSegments[1] === 'de' || pathSegments[1] === 'en')) {
      initialLangFromPath = pathSegments[1];
    }
  }

  // Mark component as mounted and update language when needed
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      // On initial mount, ensure our state matches path language
      if (pathname) {
        const pathLang = getLanguageFromPath(pathname);
        if (pathLang && currentLang !== pathLang) {
          setCurrentLang(pathLang);
        }
      }
    }
  }, [mounted, pathname, currentLang]);

  // Track i18n language changes
  useEffect(() => {
    if (mounted && i18n.language && currentLang !== i18n.language) {
      setCurrentLang(i18n.language);
    }
  }, [mounted, i18n.language, currentLang]);
  
  // After mount, the language from hooks is the source of truth
  // For initial render (mounted === false), use initialLangFromPath for consistency
  const effectiveLang = mounted ? (i18n.language || currentLang) : initialLangFromPath;
  
  const rawPathname = pathname || '';
  // Normalize pathname: remove trailing slash if it's not the root itself
  const normalizedPathname = rawPathname.length > 1 && rawPathname.endsWith('/') ? rawPathname.slice(0, -1) : rawPathname;

  // Check if user is already on the app page to avoid showing the button if they're already there
  const isOnAppPage = normalizedPathname.endsWith('/app');
  
  // Always show the get started button unless user is already on the app page
  const showGetStartedButton = !isOnAppPage;
  const showThemeToggle = !rawPathname.includes('/legal/privacy-policy');

  // Compute paths using effectiveLang to ensure consistency
  const homePath = `/${effectiveLang}/`;
  const appPath = `/${effectiveLang}/app/`;

  // Compute the button text based on the effective language
  const buttonText = effectiveLang === 'de' ? "Rechnung aufteilen" : "Split Invoice";

  return (
    <header className="fixed top-0 z-[100] w-full border-b border-border/40 bg-background/95 dark:bg-background/90 backdrop-blur-sm will-change-transform">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          {/* Use server-side rendering friendly approach with static links */}
          <a 
            href={homePath}
            className="flex items-center cursor-pointer"
          >
            <Image
              src="/images/logo.svg"
              alt="BillSplitter Logo"
              width={180}
              height={40}
              priority
              style={{ width: 'auto' }}
            />
          </a>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* <CommandMenu /> */}
          </div>
          {/* <MainNav /> */}
          {/* <MobileNav /> */}
          <nav className="flex items-center space-x-2">
          {showGetStartedButton && (
            mounted ? (
              <Button 
                asChild
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-primary border-primary hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors cursor-pointer"
              >
                <Link href={appPath}>
                  {t("General.getStarted", { defaultValue: "Split Invoice" })}
                </Link>
              </Button>
            ) : (
              // Server-side non-interactive version with identical styling
              <Button 
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-primary border-primary hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors cursor-pointer !opacity-100"
                disabled
              >
                {buttonText}
              </Button>
            )
          )}
          <LanguageToggle />
          {showThemeToggle && <ThemeToggle />}
        </nav>
        </div>
      </div>
    </header>
  );
} 
