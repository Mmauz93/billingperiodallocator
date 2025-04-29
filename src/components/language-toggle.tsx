"use client";

import * as React from "react";

import { AnimatePresence, motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { changeLanguage } from "@/i18n-client";
import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  // Ensure hydration works properly
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (lng: string) => {
    changeLanguage(lng);
    setOpen(false);
  };

  if (!mounted) return null;

  const isEnglish = i18n.language === "en";
  const isGerman = i18n.language === "de";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="flex items-center">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <AnimatePresence>
        {open && (
          <DropdownMenuContent align="end" side="top" sideOffset={4} asChild forceMount>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <DropdownMenuItem onClick={() => handleLanguageChange("en")}>
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
              <DropdownMenuItem onClick={() => handleLanguageChange("de")}>
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
