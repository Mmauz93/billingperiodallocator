import {
  CalculationError,
  CalculationResult,
} from "@/lib/calculations";

// Update CalculationInput type to include splitPeriod
declare module "@/lib/calculations" {
  interface CalculationInput {
    splitPeriod?: "yearly" | "quarterly" | "monthly";
  }
}

// Update the error type definition
export type CalculationErrorType =
  | string
  | Error
  | CalculationError
  | { message?: string; [key: string]: unknown }
  | null
  | undefined;

// Data passed back to parent on calculation
export type CalculationCallbackData = {
  startDate: Date;
  endDate: Date;
  includeEndDate: boolean;
  splitPeriod: "yearly" | "quarterly" | "monthly";
  amounts: number[];
} | null;

export interface InvoiceFormProps {
  onCalculateAction: (
    formData: CalculationCallbackData,
    results: CalculationResult | null,
    error?: CalculationErrorType,
  ) => void;
  initialDemoData?: import("./form-schema").DemoDataType | null;
  onDemoDataApplied?: () => void;
}
