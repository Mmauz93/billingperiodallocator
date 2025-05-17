"use client";

import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { SupportedLanguage } from "@/lib/language-service";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/translations";

export default function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleLanguageLabel = mounted
    ? t("LanguageToggle.toggleLanguage", { defaultValue: "Toggle language" })
    : "Toggle language";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    setOpen(false);
    buttonRef.current?.blur();
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle language"
        className={cn(
          "header-toggle-button focus-visible:ring-0 focus:outline-none border-none rounded-sm",
          "relative bg-transparent transition-colors duration-200 ease-in-out disabled:opacity-100",
          "opacity-0 transition-opacity duration-150 ease-in-out",
        )}
      >
        <Globe className="h-5 w-5" />
        <span className="sr-only">Toggle language</span>
      </Button>
    );
  }

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
          className={cn(
            "header-toggle-button focus-visible:ring-0 focus:outline-none border-none rounded-sm",
            "hover:bg-primary hover:text-primary-foreground",
            open && "bg-primary text-primary-foreground",
            "relative bg-transparent transition-colors duration-200 ease-in-out disabled:opacity-100",
            "opacity-0 transition-opacity duration-150 ease-in-out",
          )}
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">{toggleLanguageLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      {open && (
        <DropdownMenuContent
          align="end"
          side="bottom"
          sideOffset={4}
          className="z-[var(--z-popover)]"
        >
          <DropdownMenuItem
            onClick={() => handleLanguageChange("en")}
            className={cn(
              "flex items-center cursor-pointer transition-colors duration-200 hover:bg-primary hover:text-primary-foreground",
              isEnglish && "font-medium",
            )}
          >
            <ReactCountryFlag
              countryCode="GB"
              svg
              className="w-[1.2em] h-[1.2em] mr-2 pointer-events-none"
              title="English"
            />
            <span
              className={cn(isEnglish && "font-bold", "pointer-events-none")}
            >
              English
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleLanguageChange("de")}
            className={cn(
              "flex items-center cursor-pointer transition-colors duration-200 hover:bg-primary hover:text-primary-foreground",
              isGerman && "font-medium",
            )}
          >
            <ReactCountryFlag
              countryCode="DE"
              svg
              className="w-[1.2em] h-[1.2em] mr-2 pointer-events-none"
              title="Deutsch"
            />
            <span
              className={cn(isGerman && "font-bold", "pointer-events-none")}
            >
              Deutsch
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
