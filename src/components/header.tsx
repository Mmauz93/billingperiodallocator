"use client";

// import { Languages, Moon, Sun } from "lucide-react"; // REMOVED

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import LanguageToggle from "@/components/language-toggle";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { getLanguageFromPath } from "@/lib/language-service";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/translations";

// import { getCurrentLanguage } from "@/lib/language-service"; // REMOVED











// Import components directly instead of using dynamic imports

export function Header() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Mark component as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // For SSR/initial render, get language from path.
  // For client-side after mount, i18n.language is the source of truth.
  // getLanguageFromPath should provide a default if the path language is not recognized.
  const langFromPathInitial = getLanguageFromPath(pathname) || 'en'; // Default for SSR/initial
  const effectiveLang = mounted ? (i18n.language || langFromPathInitial) : langFromPathInitial;
  
  const rawPathname = pathname || '';
  // Normalize pathname: remove trailing slash if it's not the root itself
  const normalizedPathname = rawPathname.length > 1 && rawPathname.endsWith('/') ? rawPathname.slice(0, -1) : rawPathname;

  // Check if user is already on the app page to avoid showing the button if they're already there
  const isOnAppPage = normalizedPathname.endsWith('/app');
  
  // Always show the get started button unless user is already on the app page
  const showGetStartedButton = !isOnAppPage;
  const showThemeToggle = !rawPathname.includes('/legal/privacy-policy');

  // Compute paths using effectiveLang to ensure consistency
  const appPath = `/${effectiveLang}/app`;  // Remove trailing slash for cleaner URLs

  // Compute the button text based on the effective language
  const buttonText = effectiveLang === 'de' ? "Rechnung aufteilen" : "Split Invoice";

  return (
    <header className="fixed top-0 z-[100] w-full border-b border-border/40 bg-background/95 dark:bg-background/90 backdrop-blur-sm will-change-transform">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          {/* Changed from <a> to <Link> for proper client-side navigation */}
          <Link 
            href={`/${effectiveLang}`}
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
