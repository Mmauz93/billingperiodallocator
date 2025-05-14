"use client";

import * as React from "react";

import { AnimatePresence, LazyMotion, domAnimation, motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useTranslation } from "@/translations";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Add effect to detect system preference on first load
  useEffect(() => {
    setIsMounted(true);

    // Add a class when transitioning to prevent multiple layout shifts
    if (theme !== undefined) {
      document.documentElement.classList.add('transitioning');
      
      // Remove the class after transition completes
      const transitionTimeout = setTimeout(() => {
        document.documentElement.classList.remove('transitioning');
      }, 500); // Match this to your transition duration
      
      return () => {
        clearTimeout(transitionTimeout);
        document.documentElement.classList.remove('transitioning');
      };
    }

    // Debug info
    console.log('Theme state:', { theme, resolvedTheme });
    console.log('HTML dataset theme:', document.documentElement.dataset.theme);
    console.log('HTML classList contains dark:', document.documentElement.classList.contains('dark'));
  }, [theme, resolvedTheme]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setOpen(false); // Close dropdown after selection
    
    // Remove focus from button to reset its visual state
    if (buttonRef.current) {
      buttonRef.current.blur();
    }
  };

  // Determine the label text, use default English on server/pre-mount
  const toggleLabel = isMounted ? t("ThemeToggle.toggleTheme") : "Toggle theme";

  // Render the full button structure even before mounting, but disable interactivity
  if (!isMounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        aria-label="Toggle theme"
        className="header-toggle-button relative w-10 h-10 text-foreground !opacity-100"
      >
        <div className="relative w-[1.2rem] h-[1.2rem] overflow-hidden flex items-center justify-center pointer-events-none">
          <Sun className="h-[1.2rem] w-[1.2rem] absolute pointer-events-none text-foreground" />
        </div>
      </Button>
    );
  }

  // Render the full dropdown menu once mounted
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          ref={buttonRef}
          aria-label={toggleLabel}
          className="header-toggle-button relative w-10 h-10 text-foreground"
          onClick={(e) => {
            // Prevent event propagation to avoid layout shifts
            e.stopPropagation();
          }}
        >
          <div className="relative w-[1.2rem] h-[1.2rem] overflow-hidden flex items-center justify-center pointer-events-none">
            {/* <AccessibleIcon label={toggleLabel}> */}
              <Sun 
                className="h-[1.2rem] w-[1.2rem] absolute rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0 pointer-events-none" 
              />
              <Moon className="h-[1.2rem] w-[1.2rem] absolute rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100 pointer-events-none" />
            {/* </AccessibleIcon> */}
          </div>
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
          onClick={() => handleThemeChange("light")}
          className={`header-dropdown-item ${theme === "light" ? "font-medium" : ""}`}
          style={{ cursor: 'pointer' }}
        >
          <span className="pointer-events-none" style={{ cursor: 'pointer' }}>{t("ThemeToggle.light")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("dark")}
          className={`header-dropdown-item ${theme === "dark" ? "font-medium" : ""}`}
          style={{ cursor: 'pointer' }}
        >
          <span className="pointer-events-none" style={{ cursor: 'pointer' }}>{t("ThemeToggle.dark")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("system")}
          className={`header-dropdown-item ${theme === "system" ? "font-medium" : ""}`}
          style={{ cursor: 'pointer' }}
        >
          <span className="pointer-events-none" style={{ cursor: 'pointer' }}>{t("ThemeToggle.system")}</span>
        </DropdownMenuItem>
              </motion.div>
            </DropdownMenuContent>
          )}
        </AnimatePresence>
      </LazyMotion>
    </DropdownMenu>
  );
}
