"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FormHelperTextProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * A helper text component for form fields
 * Replaces the .input-helper-text class from forms.css
 */
export function FormHelperText({ children, className, id }: FormHelperTextProps) {
  return (
    <p id={id} className={cn("text-xs text-muted-foreground mt-1", className)}>
      {children}
    </p>
  );
}

export interface FormErrorMessageProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * An error message component for form fields
 * Provides consistent error styling
 */
export function FormErrorMessage({
  children,
  className,
  id,
}: FormErrorMessageProps) {
  return (
    <p
      id={id}
      className={cn("text-xs text-destructive font-medium mt-1", className)}
    >
      {children}
    </p>
  );
} 
