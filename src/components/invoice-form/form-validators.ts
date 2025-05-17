/**
 * Invoice Form Validators
 * 
 * This module contains specialized validators for the invoice form.
 * These validators leverage the core validation service but are specific to the form's needs.
 */

import {
  ValidationResult,
  validateDate,
  validateDateRange,
  validateNumber
} from "@/lib/validation-service";

import { FormSchemaType } from "./form-schema";
import { tryParseDate } from "@/lib/date-formatter";

/**
 * Validate start date input
 */
export function validateStartDate(
  value: string,
  t: (key: string, options?: { defaultValue?: string }) => string,
  endDateValue?: string,
): ValidationResult {
  // Validate date format
  const result = validateDate(value, {
    required: true,
    fieldName: t("InvoiceForm.startDateLabel", { defaultValue: "Start Date" }),
    customMessages: {
      required: t("InvoiceForm.errorStartDateRequired", { 
        defaultValue: "Start date is required" 
      }),
      invalid: t("InvoiceForm.supportedDateFormats", {
        defaultValue: "Supported formats: YYYY-MM-DD, DD.MM.YYYY"
      })
    }
  });

  // If valid and we have an end date, check range
  if (result.valid && endDateValue) {
    const rangeResult = validateDateRange(
      value,
      endDateValue,
      {
        allowEqual: true,
        customMessage: t("InvoiceForm.errorStartDateAfterEnd", {
          defaultValue: "Start date must be before or equal to end date"
        })
      }
    );
    
    // Only return the range error if it's invalid
    if (!rangeResult.valid) {
      return rangeResult;
    }
  }

  return result;
}

/**
 * Validate end date input
 */
export function validateEndDate(
  value: string,
  t: (key: string, options?: { defaultValue?: string }) => string,
  startDateValue?: string,
): ValidationResult {
  // Validate date format
  const result = validateDate(value, {
    required: true,
    fieldName: t("InvoiceForm.endDateLabel", { defaultValue: "End Date" }),
    customMessages: {
      required: t("InvoiceForm.errorEndDateRequired", { 
        defaultValue: "End date is required" 
      }),
      invalid: t("InvoiceForm.supportedDateFormats", {
        defaultValue: "Supported formats: YYYY-MM-DD, DD.MM.YYYY"
      })
    }
  });

  // If valid and we have a start date, check range
  if (result.valid && startDateValue) {
    const startDate = tryParseDate(startDateValue);
    
    if (startDate && result.value) {
      // Check that end date is not before start date
      if (result.value < startDate) {
        return {
          valid: false,
          message: t("InvoiceForm.errorEndDateBeforeStart", {
            defaultValue: "End date cannot be before start date"
          }),
          value: result.value
        };
      }
    }
  }

  return result;
}

/**
 * Validate numeric amount input
 */
export function validateAmount(
  value: string,
  t: (key: string, options?: { defaultValue?: string }) => string,
  index: number = 0,
): ValidationResult {
  return validateNumber(value, {
    required: true,
    fieldName: t(index === 0 ? "InvoiceForm.amountLabel" : "InvoiceForm.additionalAmountLabel", {
      defaultValue: index === 0 ? "Amount" : `Amount ${index + 1}`
    }),
    positive: true,
    customMessages: {
      required: t("InvoiceForm.errorAmountValueRequired", {
        defaultValue: "Amount is required"
      }),
      positive: t("InvoiceForm.errorAmountPositive", {
        defaultValue: "Amount must be a positive number"
      }),
      invalid: t("InvoiceForm.errorAmountInvalid", {
        defaultValue: "Amount must be a valid number"
      })
    }
  });
}

/**
 * Helper function to validate form data
 */
export function validateFormData(
  data: FormSchemaType,
  t: (key: string, options?: { defaultValue?: string }) => string,
): { 
  isValid: boolean; 
  errors: Record<string, { message: string }> 
} {
  const errors: Record<string, { message: string }> = {};

  // Validate start date
  const startDateResult = validateStartDate(
    data.startDateString || "",
    t,
    data.endDateString
  );
  if (!startDateResult.valid) {
    errors.startDateString = { message: startDateResult.message };
  }

  // Validate end date
  const endDateResult = validateEndDate(
    data.endDateString || "",
    t,
    data.startDateString
  );
  if (!endDateResult.valid) {
    errors.endDateString = { message: endDateResult.message };
  }

  // Validate amounts (if any)
  if (!data.amounts || data.amounts.length === 0) {
    errors.amounts = { message: t("InvoiceForm.errorAmountRequired", {
      defaultValue: "At least one amount is required"
    }) };
  } else {
    // Check each amount
    data.amounts.forEach((amount, index) => {
      const amountResult = validateAmount(amount.value, t, index);
      if (!amountResult.valid) {
        if (!errors.amounts) {
          errors.amounts = { message: "" };
        }
        if (!errors[`amounts.${index}.value`]) {
          errors[`amounts.${index}.value`] = { message: amountResult.message };
        }
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
} 
