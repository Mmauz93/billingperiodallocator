"use client";

import * as React from "react";

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
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  // Add effect to detect system preference on first load
  React.useEffect(() => {
    setIsMounted(true);

    // Add transition styles to html element for smooth theme transitions
    const html = document.documentElement;
    html.style.transition = "background-color 0.5s, color 0.5s";

    // Debug info
    console.log('Theme state:', { theme, resolvedTheme });
    console.log('HTML dataset theme:', html.dataset.theme);
    console.log('HTML classList contains dark:', html.classList.contains('dark'));

    return () => {
      // Clean up transition styles when component unmounts
      html.style.transition = "";
    };
  }, [theme, resolvedTheme]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  // Determine the label text, use default English on server/pre-mount
  const toggleLabel = isMounted ? t("ThemeToggle.toggleTheme") : "Toggle theme";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={toggleLabel}
          className="text-foreground hover:text-primary"
        >
          <AccessibleIcon label={toggleLabel}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </AccessibleIcon>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" sideOffset={4} className="rounded-lg shadow-md">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
