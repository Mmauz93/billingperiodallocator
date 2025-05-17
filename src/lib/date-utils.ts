/**
 * @fileoverview Date Utility Functions
 *
 * Timezone Strategy:
 * 1. Input Parsing: User-entered date strings (e.g., "YYYY-MM-DD") are parsed by `parseDate`
 *    into JavaScript `Date` objects representing **midnight UTC** of that calendar day.
 *    This is achieved by `createUTCDate` which appends 'T00:00:00Z'.
 * 2. Calculations: All core date calculations (e.g., in `calculations.ts`) operate on these
 *    UTC-normalized `Date` objects.
 * 3. Display: Dates are formatted for display by `formatDateForDisplay` using `Intl.DateTimeFormat`
 *    with the `timeZone: 'UTC'` option. This ensures that the displayed day, month, and year
 *    correspond to the UTC date, preventing shifts due to the user's local timezone.
 * 4. General Timestamps: Non-critical timestamps (e.g., "Generated on") may use local time.
 */

import { format, isValid, parse } from "date-fns";

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
  formats: string[] = ["yyyy-MM-dd", "dd.MM.yyyy"],
): Date | null {
  if (!dateStr) return null;

  // Try direct ISO parsing first
  if (dateStr.includes("T")) {
    const date = new Date(dateStr);
    if (isValid(date)) {
      // Normalize to midnight UTC
      return createUTCDate(format(date, "yyyy-MM-dd"));
    }
  }

  // Try each format
  for (const formatPattern of formats) {
    try {
      const parsedDate = parse(dateStr, formatPattern, new Date());
      if (isValid(parsedDate)) {
        // Normalize to midnight UTC
        return createUTCDate(format(parsedDate, "yyyy-MM-dd"));
      }
    } catch {
      // Continue to next format
    }
  }

  return null;
}

/**
 * Format a date for display, taking into account the locale
 *
 * @param date - A Date object or ISO date string
 * @param locale - The locale to use for formatting (e.g., 'en', 'de')
 * @returns A formatted date string
 */
export function formatDateForDisplay(
  date: Date | string | undefined,
  locale: string,
): string {
  if (!date) return "N/A";

  try {
    const dateObj =
      typeof date === "string"
        ? date.includes("T")
          ? new Date(date)
          : createUTCDate(date)
        : date;

    // Format in UTC to display the date as it is, ignoring local timezone conversion for date parts
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    // Fallback should also ideally respect UTC if possible
    if (typeof date === "string") {
      // Attempt to return YYYY-MM-DD if it's a simple date string, otherwise indicate error
      return date.match(/^\d{4}-\d{2}-\d{2}$/) ? date : "Invalid Date String";
    }
    return date.toISOString().split("T")[0]; // This gives YYYY-MM-DD from UTC date
  }
}
