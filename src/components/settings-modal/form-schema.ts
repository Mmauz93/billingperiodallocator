import { ValidationResult } from "./types";

// Default separator
export const DEFAULT_SEPARATOR = ",";

// Validation functions
export function validateDecimalPlaces(value: string): ValidationResult {
  const decimalPlaces = Number(value);
  if (isNaN(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 6) {
    return {
      valid: false,
      message: "Decimal places must be between 0 and 6",
    };
  }
  return { valid: true };
}

export function validateRoundingPrecision(value: string): ValidationResult {
  const normalized = value.replace(",", ".");
  const roundingPrecision = Number(normalized);
  if (
    isNaN(roundingPrecision) ||
    roundingPrecision < 0.0001 ||
    roundingPrecision > 100
  ) {
    return {
      valid: false,
      message: "Rounding precision must be between 0.0001 and 100",
    };
  }
  return { valid: true };
}
