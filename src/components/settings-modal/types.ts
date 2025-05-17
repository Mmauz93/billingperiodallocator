"use client";

import * as z from "zod";

import { Button } from "@/components/ui/button";

// Re-export FormSchema from here to avoid circular dependencies
export const FormSchema = z.object({
  decimalPlaces: z.string().nonempty("Decimal places is required"),
  roundingPrecision: z.string().nonempty("Rounding precision is required"),
  thousandsSeparator: z.string(),
  locale: z.string(),
});

// Form values type
export type FormValues = z.infer<typeof FormSchema>;

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Props for the SettingsModal component
 */
export interface SettingsModalProps {
  /** If provided, controls the open state of the modal */
  isOpen?: boolean;
  /** Callback when the open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Variant of the button - only used when not controlled externally */
  variant?: React.ComponentProps<typeof Button>["variant"];
  /** Size of the button - only used when not controlled externally */
  size?: React.ComponentProps<typeof Button>["size"];
  /** Additional class name to apply to the button */
  className?: string;
} 
