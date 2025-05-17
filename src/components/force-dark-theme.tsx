"use client";

import React, { useEffect } from "react";

import { useTheme } from "next-themes";

/**
 * This component forces a dark theme by using the next-themes library's
 * setTheme method to ensure proper integration with the theme management system.
 * It preserves the user's original theme preference and restores it when unmounted.
 *
 * It should be used on pages that need to override the user's
 * selected theme or system theme, specifically for dark mode.
 */
interface ForceDarkThemeProps {
  children: React.ReactNode;
}

export const ForceDarkTheme: React.FC<ForceDarkThemeProps> = ({ children }) => {
  const { setTheme, theme } = useTheme();

  // Store the original theme to restore it on unmount
  const [originalTheme, setOriginalTheme] = React.useState<string | null>(null);

  useEffect(() => {
    // Save the current theme before overriding it
    if (!originalTheme && theme) {
      setOriginalTheme(theme);
    }

    // Force dark theme
    setTheme("dark");

    // Cleanup function to restore the original theme
    return () => {
      if (originalTheme) {
        setTheme(originalTheme);
      }
    };
  }, [originalTheme, setTheme, theme]);

  return <>{children}</>;
};
