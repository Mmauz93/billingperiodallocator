import {
  CalculationInput,
  CalculationResult,
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Interface inherits members via Pick
export interface InputDataForDisplay
  extends Pick<
    CalculationInput,
    "startDate" | "endDate" | "includeEndDate" | "amounts" | "splitPeriod"
  > {}

export interface ResultsDisplayProps {
  results: CalculationResult;
  inputData: InputDataForDisplay;
}

export interface CalculationStepsDisplayProps {
  steps: CalculationStepDetails;
  settings: Omit<AppSettings, "locale">;
  splitPeriodUsed: "yearly" | "quarterly" | "monthly";
}
