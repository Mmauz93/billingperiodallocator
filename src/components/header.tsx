"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import LanguageToggle from "@/components/language-toggle";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

export function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isLandingPage = pathname === '/';

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm will-change-transform">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
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
        
        <nav className="flex items-center gap-3">
          {mounted && isLandingPage && (
            <Button 
              asChild 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Link href="/app">
                {t("General.getStarted", { defaultValue: "Get Started" })}
              </Link>
            </Button>
          )}
          <LanguageToggle />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
} 
