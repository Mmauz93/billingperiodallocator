"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import LanguageToggle from "@/components/language-toggle";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { getLanguageFromPath } from "@/lib/language-service";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/translations";

export function Header() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const langFromPathInitial = getLanguageFromPath(pathname) || 'en';
  const effectiveLang = mounted ? (i18n.language || langFromPathInitial) : langFromPathInitial;
  
  const rawPathname = pathname || '';
  const normalizedPathname = rawPathname.length > 1 && rawPathname.endsWith('/') ? rawPathname.slice(0, -1) : rawPathname;

  const isOnAppPage = normalizedPathname.endsWith('/app');
  
  const showGetStartedButton = !isOnAppPage;
  const showThemeToggle = !rawPathname.includes('/legal/privacy-policy');

  const appPath = `/${effectiveLang}/app`;

  const buttonText = effectiveLang === 'de' ? "Rechnung aufteilen" : "Split Invoice";

  return (
    <header className="fixed top-0 z-[var(--z-sticky)] w-full border-b border-border/40 bg-background/95 dark:bg-background/90 backdrop-blur-sm will-change-transform transition-all duration-300 ease-in-out">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <Link 
            href={`/${effectiveLang}`}
            className="flex items-center cursor-pointer select-none"
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
          </div>
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
