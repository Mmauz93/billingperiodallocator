/**
 * Math Utility Functions
 * 
 * This module contains all number-related utility functions including:
 * - Rounding and precision functions
 * - Number formatting for display
 * - Percentage formatting
 * 
 * All numerical operations that require consistent behavior should use these functions.
 */

import { AppSettings } from "@/context/settings-context";

/**
 * Rounds a number to a specific number of decimal places
 * @param value The number to round
 * @param decimals The number of decimal places
 * @returns The rounded number
 */
export function roundToDecimals(value: number, decimals: number): number {
  return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
}

/**
 * Rounds a number based on the specified rounding precision factor.
 * @param value The number to round.
 * @param precision The rounding factor (e.g., 0.01, 0.05, 1). Must be > 0.
 * @returns Rounded number.
 */
export function roundToPrecision(value: number, precision: number): number {
  if (precision <= 0) {
    console.warn(`Invalid rounding precision: ${precision}. Using 0.01.`);
    precision = 0.01;
  }
  const multiplier = 1 / precision;
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Formats a number according to the application settings using Intl.NumberFormat.
 * @param value The number to format.
 * @param locale The locale string.
 * @param settings The current application settings.
 * @returns Formatted number string.
 */
export function formatNumber(
  value: number,
  locale: string,
  settings?: Omit<AppSettings, "locale">,
): string {
  if (isNaN(value)) {
    console.warn("Attempted to format NaN value");
    return "NaN";
  }
  
  // Default settings if none provided
  const decimalPlaces = settings?.decimalPlaces ?? 2;
  
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(value);
  } catch (error) {
    console.error("Error formatting number:", error);
    // Fallback to simple formatting
    return value.toFixed(decimalPlaces);
  }
}

/**
 * Formats a percentage value according to locale.
 * @param value The percentage value (0 to 1).
 * @param locale The locale string.
 * @returns Formatted percentage string.
 */
export function formatPercent(value: number, locale: string): string {
  if (isNaN(value)) {
    console.warn("Attempted to format NaN percentage value");
    return "NaN%";
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: "percent",
      minimumFractionDigits: 2, // Usually keep 2 decimals for percentages
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    console.error("Error formatting percent:", error);
    // Fallback
    return (value * 100).toFixed(2) + "%";
  }
}

/**
 * Safely parses a numeric input (string or number) to a number
 * @param input The input to parse 
 * @param defaultValue Optional default value if parsing fails
 * @returns The parsed number or default value
 */
export function parseNumeric(input: unknown, defaultValue: number = 0): number {
  if (input === null || input === undefined) {
    return defaultValue;
  }
  
  if (typeof input === 'number') {
    return isNaN(input) ? defaultValue : input;
  }
  
  if (typeof input === 'string') {
    // Handle different number formats (commas, periods)
    const normalized = input.replace(/[^\d.-]/g, '')
                            .replace(/,/g, '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  
  return defaultValue;
} 
