"use client";

import { Button } from "./button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { type VariantProps } from "class-variance-authority";

export interface CalendarButtonProps extends React.ComponentProps<"button">, VariantProps<typeof Button> {
  isOpen?: boolean;
}

/**
 * A specialized button for opening date pickers
 * Replaces custom CSS from calendar.css with Tailwind utilities
 */
const CalendarButton = forwardRef<HTMLButtonElement, CalendarButtonProps>(
  ({ className, isOpen, children, ...props }, ref) => {
    return (
      <Button
        variant="outline"
        size="icon"
        ref={ref}
        aria-label="Pick a date"
        className={cn(
          "transition-all duration-200",
          "hover:bg-primary hover:text-primary-foreground",
          "active:scale-95 active:transform", 
          isOpen && "bg-primary text-primary-foreground",
          className
        )}
        {...props}
      >
        {children || <CalendarIcon className="h-5 w-5" />}
      </Button>
    );
  }
);
CalendarButton.displayName = "CalendarButton";

export { CalendarButton }; 
