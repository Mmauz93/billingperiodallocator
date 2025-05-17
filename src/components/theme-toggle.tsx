"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        disabled
        className={cn(
          "header-toggle-button focus-visible:ring-0 focus:outline-none border-none rounded-sm",
          "relative bg-transparent transition-colors duration-200 ease-in-out disabled:opacity-100",
          "opacity-0 transition-opacity duration-150 ease-in-out",
        )}
      >
        <Sun className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "header-toggle-button focus-visible:ring-0 focus:outline-none border-none relative rounded-sm",
        "hover:bg-primary hover:text-primary-foreground",
        "bg-transparent transition-colors duration-200 ease-in-out disabled:opacity-100",
        "opacity-0 transition-opacity duration-150 ease-in-out",
      )}
    >
      {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      <span className="sr-only">
        {isDark ? "Switch to light theme" : "Switch to dark theme"}
      </span>
    </Button>
  );
}
