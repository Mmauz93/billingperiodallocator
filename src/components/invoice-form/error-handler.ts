import { ERROR_CODES, InputValidationError } from "@/lib/errors";

import { CalculationError } from "@/lib/calculations";
import { CalculationErrorType } from "./types";

type ErrorHandlerProps = {
  error: CalculationErrorType;
  t: (key: string, options?: Record<string, unknown> | string) => string;
};

export function handleCalculationError({
  error,
  t,
}: ErrorHandlerProps): string | null {
  if (!error) return null;

  const baseErrorTitle = t("Errors.calculationErrorTitle");

  if (error instanceof InputValidationError) {
    switch (error.code) {
      case ERROR_CODES.NO_AMOUNTS:
        return baseErrorTitle + ": " + t("InvoiceForm.errorAmountRequired");
      case ERROR_CODES.INVALID_AMOUNT:
        return baseErrorTitle + ": " + t("InvoiceForm.errorAmountPositive");
      case ERROR_CODES.END_BEFORE_START:
        return baseErrorTitle + ": " + t("InvoiceForm.errorEndDateBeforeStart");
      case ERROR_CODES.INVALID_DATES:
        return (
          baseErrorTitle +
          ": " +
          t("InvoiceForm.errorInvalidDates", {
            defaultValue: "Valid start and end dates are required",
          })
        );
      case ERROR_CODES.ZERO_DURATION:
        return (
          baseErrorTitle +
          ": " +
          t("InvoiceForm.errorZeroDuration", {
            defaultValue: "The date range must result in a positive duration",
          })
        );
      default:
        console.warn(`Input validation error: ${error.code}`, error.details);
        return baseErrorTitle + ": " + error.message;
    }
  }

  if (error instanceof CalculationError) {
    console.error(
      `Calculation error: ${error.code} (${error.category})`,
      error.details,
    );
    return baseErrorTitle + ": " + error.message;
  }

  if (typeof error === "string") {
    if (error.includes("At least one amount is required")) {
      return baseErrorTitle + ": " + t("InvoiceForm.errorAmountRequired");
    } else if (error.includes("Start date must be before")) {
      return baseErrorTitle + ": " + t("InvoiceForm.errorEndDateBeforeStart");
    } else {
      return baseErrorTitle + ": " + error;
    }
  }

  if (error instanceof Error) {
    console.error("Error object received:", error);
    return baseErrorTitle + ": " + error.message;
  }

  if (error && typeof error === "object") {
    console.error("Error object received:", error);
    if ("message" in error && typeof error.message === "string") {
      return baseErrorTitle + ": " + error.message;
    } else {
      try {
        const stringifiedError = JSON.stringify(error);
        return (
          baseErrorTitle +
          ": " +
          (stringifiedError !== "{}"
            ? stringifiedError
            : t("Errors.unexpectedError"))
        );
      } catch {
        return baseErrorTitle + ": " + t("Errors.unexpectedError");
      }
    }
  }

  console.error("An unexpected or non-standard error was received:", error);
  return baseErrorTitle + ": " + t("Errors.unexpectedError");
}
