/**
 * Augment library types or add project-specific types
 */

// Extend calculation types to support both string and Date types for proper TypeScript typing
declare module "@/lib/calculations" {
  interface CalculationStepDetails {
    totalDuration: {
      days: number;
      start: string;
      end: string;
      included: boolean;
    };
  }
}

// Export your own project-specific types here
export {};

// Type for the translation function used throughout the application
export type TranslationFn = (
  key: string,
  options?: {
    defaultValue?: string;
    values?: Record<string, string | number>;
  } | string
) => string;

// Add any other shared types below
