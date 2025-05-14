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

  // We'll handle translation in a way that avoids hydration mismatches
  // Instead of using the dynamic translation during server rendering,
  // we'll use a static default and only apply translation after mount
  const { t } = useTranslation();
  
  // Save the translated string only after component is mounted
  const toggleLabel = mounted 
    ? t("ThemeToggle.toggleTheme", { defaultValue: "Toggle theme" })
    : "Toggle theme"; // Static fallback for server rendering
    
  const lightLabel = mounted 
    ? t("ThemeToggle.light", { defaultValue: "Light" })
    : "Light";
    
  const darkLabel = mounted 
    ? t("ThemeToggle.dark", { defaultValue: "Dark" })
    : "Dark";
    
  const systemLabel = mounted 
    ? t("ThemeToggle.system", { defaultValue: "System" })
    : "System";

  // Immediately check if we're mounted on the client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle theme changes
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  // On server or during hydration, show a simplified button
  // with a predetermined icon that won't change during hydration
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        className="header-toggle-button relative w-10 h-10 text-foreground focus-visible:ring-0"
        style={{ border: 'none' }}
      >
        <div className="h-5 w-5 flex items-center justify-center">
          <Moon className="h-5 w-5" />
        </div>
      </Button>
    );
  }

  // Only on the client after hydration, render the full component
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={toggleLabel}
          className="header-toggle-button relative w-10 h-10 text-foreground focus-visible:ring-0"
          style={{ border: 'none' }}
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
      <DropdownMenuContent align="end" side="top" sideOffset={4} className="bg-popover border border-border">
        <DropdownMenuItem
          onClick={() => handleThemeChange("light")}
          className={`header-dropdown-item ${theme === "light" ? "font-medium" : ""}`}
        >
          {lightLabel}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("dark")}
          className={`header-dropdown-item ${theme === "dark" ? "font-medium" : ""}`}
        >
          {darkLabel}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("system")}
          className={`header-dropdown-item ${theme === "system" ? "font-medium" : ""}`}
        >
          {systemLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
