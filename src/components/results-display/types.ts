import {
  CalculationResult as BaseCalculationResult,
  CalculationInput,
  CalculationStepDetails,
} from "@/lib/calculations";

import { AppSettings } from "@/context/settings-context";
import { jsPDF } from "jspdf";

// Define a type for the jsPDF internal object with just the properties we need
export type JsPDFWithInternal = jsPDF & {
  internal: {
    getNumberOfPages: () => number;
    pageSize: {
      width: number;
      height: number;
    };
  };
  // Add lastAutoTable property for autoTable plugin
  lastAutoTable?: {
    finalY: number;
  };
};

// Extended CalculationResult with detailedSplits
export interface CalculationResult extends BaseCalculationResult {
  detailedSplits?: Array<{
    splits: Array<{
      periodIdentifier: string;
      daysInPeriod: number;
      proportion: number;
      splitAmount: number;
    }>;
  }>;
}

// Interface inherits members via Pick
export interface InputDataForDisplay
  extends Pick<
    CalculationInput,
    "startDate" | "endDate" | "includeEndDate" | "amounts" | "splitPeriod"
  > {
  descriptions?: string[]; // Add descriptions property for invoice line items
}

export interface ResultsDisplayProps {
  results: CalculationResult;
  inputData: InputDataForDisplay;
}

export interface CalculationStepsDisplayProps {
  steps: CalculationStepDetails;
  settings?: Omit<AppSettings, "locale">;
  splitPeriodUsed?: "yearly" | "quarterly" | "monthly";
  locale?: string; // Add locale property
  t: (key: string, options?: Record<string, string | number | boolean> | string) => string; // Add translation function with specific type
}
