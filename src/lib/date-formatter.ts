/**
 * Date Formatter Module
 * 
 * This module centralizes all date-related functionality including:
 * - Date format constants
 * - Date parsing functions
 * - Date formatting functions
 * - Date validation utilities
 * 
 * Timezone Strategy:
 * 1. Input Parsing: Dates are parsed to midnight UTC for timezone consistency
 * 2. Calculations: All processing uses UTC-normalized dates
 * 3. Display: Dates are formatted with UTC timezone for display
 */

import { format, isValid, parse } from "date-fns";

// ----------------------------------------------------------------------------
// Date Format Constants
// ----------------------------------------------------------------------------

/**
 * Standard format constants for date handling throughout the application
 */
export const DATE_FORMATS = {
  ISO: "yyyy-MM-dd", // International standard ISO-8601
  DE: "dd.MM.yyyy",  // German format
  US: "MM/dd/yyyy",  // US format
  DOTS: "dd.MM.yy",  // Short format with dots
  SLASHES: "MM/dd/yy", // Short format with slashes
  DASHES: "dd-MM-yyyy", // Format with dashes
  API: "yyyy-MM-dd'T'HH:mm:ss'Z'", // API format (ISO with time)
  DISPLAY: {
    SHORT: "short", // For Intl.DateTimeFormat "short" option
    MEDIUM: "medium", // For Intl.DateTimeFormat "medium" option
    LONG: "long", // For Intl.DateTimeFormat "long" option
  }
};

/**
 * List of supported date formats for user input
 */
export const SUPPORTED_DATE_FORMATS = [
  DATE_FORMATS.ISO,
  DATE_FORMATS.DE,
  DATE_FORMATS.US,
  DATE_FORMATS.DOTS,
  DATE_FORMATS.SLASHES,
  DATE_FORMATS.DASHES,
];

// ----------------------------------------------------------------------------
// Core Date Utilities
// ----------------------------------------------------------------------------

/**
 * Creates a Date object that's timezone-agnostic by setting time to midnight UTC.
 * This ensures consistent behavior regardless of user's timezone.
 *
 * @param dateStr - A date string in the format YYYY-MM-DD
 * @returns A Date object set to midnight UTC
 */
export function createUTCDate(dateStr: string): Date {
  // Append T00:00:00Z to ensure UTC timezone
  return new Date(`${dateStr}T00:00:00Z`);
}

/**
 * Parse a date from various formats with timezone consistency.
 * The returned date will be normalized to midnight UTC time.
 *
 * @param dateStr - A date string in various supported formats
 * @param formats - An array of formats to try (date-fns format patterns)
 * @returns A Date object or null if parsing fails
 */
export function parseDate(
  dateStr: string,
  formats: string[] = [DATE_FORMATS.ISO, DATE_FORMATS.DE],
): Date | null {
  if (!dateStr) return null;

  // Try direct ISO parsing first
  if (dateStr.includes("T")) {
    const date = new Date(dateStr);
    if (isValid(date)) {
      // Normalize to midnight UTC
      return createUTCDate(format(date, DATE_FORMATS.ISO));
    }
  }

  // Try each format
  for (const formatPattern of formats) {
    try {
      const parsedDate = parse(dateStr, formatPattern, new Date());
      if (isValid(parsedDate)) {
        // Normalize to midnight UTC
        return createUTCDate(format(parsedDate, DATE_FORMATS.ISO));
      }
    } catch {
      // Continue to next format
    }
  }

  return null;
}

/**
 * Helper function to determine if a string can be parsed as a valid date
 * 
 * @param dateStr - The date string to validate
 * @param formats - Optional array of format strings to try
 * @returns true if the string can be parsed as a valid date
 */
export function isValidDateString(
  dateStr: string,
  formats: string[] = SUPPORTED_DATE_FORMATS,
): boolean {
  return parseDate(dateStr, formats) !== null;
}

// ----------------------------------------------------------------------------
// Date Formatting Functions
// ----------------------------------------------------------------------------

/**
 * Format a date for display, taking into account the locale
 *
 * @param date - A Date object or ISO date string
 * @param locale - The locale to use for formatting (e.g., 'en', 'de')
 * @param formatStyle - Optional style for Intl.DateTimeFormat
 * @returns A formatted date string
 */
export function formatDateForDisplay(
  date: Date | string | undefined,
  locale: string,
  formatStyle: "short" | "medium" | "long" = "medium",
): string {
  if (!date) return "N/A";

  try {
    const dateObj =
      typeof date === "string"
        ? date.includes("T")
          ? new Date(date)
          : createUTCDate(date)
        : date;

    // Format in UTC to display the date as it is, ignoring local timezone
    // conversion for date parts
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: formatStyle === "short" ? "numeric" : formatStyle === "medium" ? "short" : "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    // Fallback should also ideally respect UTC if possible
    if (typeof date === "string") {
      // Attempt to return YYYY-MM-DD if it's a simple date string
      return date.match(/^\d{4}-\d{2}-\d{2}$/) ? date : "Invalid Date";
    }
    return date.toISOString().split("T")[0]; // This gives YYYY-MM-DD from UTC date
  }
}

/**
 * Formats a date to the specified format using date-fns.
 * 
 * @param date - Date to format
 * @param formatPattern - Format pattern from DATE_FORMATS
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | null | undefined,
  formatPattern: string = DATE_FORMATS.ISO,
): string {
  if (!date) return "";

  try {
    const dateObj =
      typeof date === "string"
        ? date.includes("T")
          ? new Date(date)
          : createUTCDate(date)
        : date;
        
    if (!isValid(dateObj)) return "";
    return format(dateObj, formatPattern);
  } catch (error) {
    console.error("Error in formatDate:", error);
    return "";
  }
}

// ----------------------------------------------------------------------------
// Date Validation Functions
// ----------------------------------------------------------------------------

/**
 * Validates a date string against supported formats and constraints
 */
export interface DateValidationResult {
  valid: boolean;
  message: string;
  parsedDate: Date | null;
}

/**
 * Validates a date string against supported formats and constraints
 * 
 * @param dateStr - The date string to validate 
 * @param options - Optional validation constraints
 * @returns Validation result object
 */
export function validateDateInput(
  dateStr: string,
  options?: {
    minDate?: Date;
    maxDate?: Date;
    isEndDate?: boolean;
    compareDateStr?: string;
    formats?: string[];
  }
): DateValidationResult {
  const formats = options?.formats || SUPPORTED_DATE_FORMATS;
  
  // Empty is valid if not required (return early)
  if (!dateStr.trim()) {
    return {
      valid: true,
      message: "",
      parsedDate: null,
    };
  }
  
  const parsedDate = parseDate(dateStr, formats);
  
  // Basic format validation
  if (!parsedDate) {
    return {
      valid: false,
      message: `Invalid date format. Please use one of the supported formats (e.g., ${DATE_FORMATS.ISO}, ${DATE_FORMATS.DE})`,
      parsedDate: null,
    };
  }
  
  // Min date validation
  if (options?.minDate && parsedDate < options.minDate) {
    return {
      valid: false,
      message: `Date cannot be before ${formatDate(options.minDate, DATE_FORMATS.ISO)}`,
      parsedDate,
    };
  }
  
  // Max date validation
  if (options?.maxDate && parsedDate > options.maxDate) {
    return {
      valid: false,
      message: `Date cannot be after ${formatDate(options.maxDate, DATE_FORMATS.ISO)}`,
      parsedDate,
    };
  }
  
  // Compare to another date (e.g., end date vs start date)
  if (options?.isEndDate && options?.compareDateStr) {
    const compareDate = parseDate(options.compareDateStr, formats);
    if (compareDate && parsedDate < compareDate) {
      return {
        valid: false,
        message: "End date cannot be before start date",
        parsedDate,
      };
    }
  }
  
  return {
    valid: true,
    message: "",
    parsedDate,
  };
}

/**
 * Parses a date string and returns a Date object or null
 * Convenience function for the most common use case
 * 
 * @param dateStr - The date string to parse
 * @returns A Date object or null if parsing fails
 */
export function tryParseDate(dateStr: string): Date | null {
  return parseDate(dateStr, SUPPORTED_DATE_FORMATS);
} 
