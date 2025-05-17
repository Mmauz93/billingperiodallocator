"use client";

import { Button } from "./button";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";

export interface ThemeAwareButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof Button> {
  hideUntilThemeLoaded?: boolean;
}

/**
 * A button that handles theme initialization visibility
 * Replaces the .header-toggle-button opacity rule from components.css
 */
const ThemeAwareButton = forwardRef<HTMLButtonElement, ThemeAwareButtonProps>(
  ({ className, hideUntilThemeLoaded = true, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          // Initially hidden, will be shown when data-theme-initialized="true" is added to html
          hideUntilThemeLoaded && "opacity-0 transition-opacity duration-200",
          hideUntilThemeLoaded && "header-toggle-button", // Keep the class for the [data-theme-initialized="true"] selector to work
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
ThemeAwareButton.displayName = "ThemeAwareButton";

export { ThemeAwareButton }; 
