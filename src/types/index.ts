/**
 * Augment library types or add project-specific types
 */

// Extend calculation types to support both string and Date types for proper TypeScript typing
declare module '@/lib/calculations' {
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
