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

import { AccessibleIcon } from "@/components/ui/accessible-icon";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "@/translations";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState(false);

  // Add effect to detect system preference on first load
  React.useEffect(() => {
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
  };

  // Determine the label text, use default English on server/pre-mount
  const toggleLabel = isMounted ? t("ThemeToggle.toggleTheme") : "Toggle theme";

  // Render null if not mounted to prevent hydration errors
  if (!isMounted) {
    // Returning a simple div or null ensures no interactive elements mismatch
    return <div className="w-10 h-10" />; // Or return null;
  }

  // Render the full dropdown menu once mounted
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={toggleLabel}
          className="text-foreground hover:text-primary relative w-10 h-10"
          onClick={(e) => {
            // Prevent event propagation to avoid layout shifts
            e.stopPropagation();
          }}
        >
          <div className="relative w-[1.2rem] h-[1.2rem] overflow-hidden flex items-center justify-center">
          <AccessibleIcon label={toggleLabel}>
              <Sun className="h-[1.2rem] w-[1.2rem] absolute rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0" />
              <Moon className="h-[1.2rem] w-[1.2rem] absolute rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100" />
          </AccessibleIcon>
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
          className={`cursor-pointer hover:text-primary ${theme === "light" ? "font-medium" : ""}`}
        >
          {t("ThemeToggle.light")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("dark")}
          className={`cursor-pointer hover:text-primary ${theme === "dark" ? "font-medium" : ""}`}
        >
          {t("ThemeToggle.dark")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("system")}
          className={`cursor-pointer hover:text-primary ${theme === "system" ? "font-medium" : ""}`}
        >
          {t("ThemeToggle.system")}
        </DropdownMenuItem>
              </motion.div>
            </DropdownMenuContent>
          )}
        </AnimatePresence>
      </LazyMotion>
    </DropdownMenu>
  );
}
