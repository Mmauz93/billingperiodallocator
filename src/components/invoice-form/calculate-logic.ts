import { CalculationCallbackData, CalculationErrorType } from "./types";
import {
  CalculationInput,
  CalculationResult,
  ERROR_CODES,
  InputValidationError,
  calculateInvoiceSplit,
} from "@/lib/calculations";
import { FormSchemaType, tryParseDate } from "./form-schema";

export function processCalculation(
  values: FormSchemaType,
  onCalculateAction: (
    formData: CalculationCallbackData,
    results: CalculationResult | null,
    error?: CalculationErrorType,
  ) => void,
  t: (key: string, options?: { defaultValue?: string; values?: Record<string, string | number> }) => string,
): void {
  const startDate = tryParseDate(values.startDateString || "");
  const endDate = tryParseDate(values.endDateString || "");

  // Prepare callbackFormData early, ensure amounts are parsed.
  // Schema validation should ensure amounts are valid numbers, but parseFloat is still needed.
  const parsedAmounts = values.amounts.map((a) => parseFloat(a.value));

  const callbackFormData: CalculationCallbackData = {
    startDate: startDate!, // Will be checked for null below
    endDate: endDate!, // Will be checked for null below
    includeEndDate: values.includeEndDate,
    splitPeriod: values.splitPeriod,
    amounts: parsedAmounts.filter((a) => !isNaN(a)), // Use only validly parsed amounts for the callback
  };

  if (!startDate || !endDate) {
    const error = new InputValidationError(
      t("InvoiceForm.errorInvalidDatesMessages", {
        defaultValue: "Valid start and end dates are required.",
      }),
      ERROR_CODES.INVALID_DATES,
      {
        startDateString: values.startDateString,
        endDateString: values.endDateString,
      },
    );
    onCalculateAction(callbackFormData, null, error);
    return;
  }

  // Additional check for NaN amounts after parseFloat, though schema should catch most.
  if (parsedAmounts.some(isNaN)) {
    const error = new InputValidationError(
      t("InvoiceForm.errorAmountPositive"),
      ERROR_CODES.INVALID_AMOUNT,
      {
        invalidAmounts: values.amounts
          .filter((a) => isNaN(parseFloat(a.value)))
          .map((a) => a.value),
      },
    );
    // Pass amounts that were attempted, even if some failed parsing, for callback context
    onCalculateAction(callbackFormData, null, error);
    return;
  }

  const inputData: CalculationInput = {
    startDate, // Already confirmed not null
    endDate, // Already confirmed not null
    includeEndDate: values.includeEndDate,
    splitPeriod: values.splitPeriod,
    amounts: parsedAmounts, // Use the successfully parsed amounts
  };

  // Call the refactored calculateInvoiceSplit
  const result = calculateInvoiceSplit(inputData);

  if (result.success) {
    // Success case: result is CalculateInvoiceSplitSuccess
    // Construct the CalculationResult object for the callback
    const successResultForCallback: CalculationResult = {
      totalDays: result.totalDays,
      originalTotalAmount: result.originalTotalAmount,
      adjustedTotalAmount: result.adjustedTotalAmount,
      resultsPerAmount: result.resultsPerAmount,
      aggregatedSplits: result.aggregatedSplits,
      calculationSteps: result.calculationSteps, // This is Omit<CalculationStepDetails, 'error'> & { error?: undefined }
      splitPeriodUsed: result.splitPeriodUsed,
    };
    onCalculateAction(callbackFormData, successResultForCallback, undefined);
  } else {
    // Error case: result is CalculateInvoiceSplitFailure
    // The error object is result.error (which is CalculationError)
    // Pass the error and null for results.
    // The callbackFormData can still be useful for context.
    onCalculateAction(callbackFormData, null, result.error);
  }
}
