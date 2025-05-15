"use client";

import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useTranslation } from "@/translations";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false); // Control dropdown open state

  const { t } = useTranslation();
  
  const lightLabel = mounted 
    ? t("ThemeToggle.light", { defaultValue: "Light" })
    : "Light";
    
  const darkLabel = mounted 
    ? t("ThemeToggle.dark", { defaultValue: "Dark" })
    : "Dark";
    
  const systemLabel = mounted 
    ? t("ThemeToggle.system", { defaultValue: "System" })
    : "System";

  // Set mounted to true after initial render for client-side only logic
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle theme changes
  const handleThemeChange = (newTheme: string) => {
    setMenuOpen(false); // Close the dropdown menu first
    setTheme(newTheme); // Then set the theme
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative size-10 flex items-center justify-center focus-visible:ring-0 focus:outline-none border-none"
        aria-label="Toggle theme" // Static label for SSR/initial hydration
      >
        {/* Will show both; CSS ensures only one visible based on colorscheme */}
        <Sun className="h-[1.2rem] w-[1.2rem] dark:hidden" />
        <Moon className="h-[1.2rem] w-[1.2rem] hidden dark:block" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative size-10 flex items-center justify-center focus-visible:ring-0 focus:outline-none border-none transition-colors duration-200 ease hover:bg-primary hover:text-primary-foreground ${menuOpen ? 'bg-primary text-primary-foreground' : ''}`}
          aria-label={t("ThemeToggle.toggleTheme", { defaultValue: "Toggle theme" })} // Translated label for client
        >
          <div className="h-5 w-5 flex items-center justify-center">
            {resolvedTheme === 'dark' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="bg-popover border border-border">
        <DropdownMenuItem
          onClick={() => handleThemeChange("light")}
          className={`flex items-center cursor-pointer transition-colors duration-200 hover:bg-primary hover:text-primary-foreground ${theme === "light" ? "font-medium" : ""}`}
        >
          {lightLabel}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("dark")}
          className={`flex items-center cursor-pointer transition-colors duration-200 hover:bg-primary hover:text-primary-foreground ${theme === "dark" ? "font-medium" : ""}`}
        >
          {darkLabel}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("system")}
          className={`flex items-center cursor-pointer transition-colors duration-200 hover:bg-primary hover:text-primary-foreground ${theme === "system" ? "font-medium" : ""}`}
        >
          {systemLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
