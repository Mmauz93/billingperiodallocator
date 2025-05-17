import { AppSettings } from "@/context/settings-context";
import { formatDateForDisplay } from "./date-utils";

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
  settings: Omit<AppSettings, "locale">,
): string {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: settings.decimalPlaces,
      maximumFractionDigits: settings.decimalPlaces,
    }).format(value);
  } catch (error) {
    console.error("Error formatting number:", error);
    // Fallback to simple formatting
    return value.toFixed(settings.decimalPlaces);
  }
}

/**
 * Formats a date according to locale. Accepts either a Date object or a string in YYYY-MM-DD format.
 * @param dateInput Date as a string in 'yyyy-MM-dd' format or as a Date object.
 * @param locale Locale string (e.g., 'en', 'de').
 * @returns Formatted date string.
 */
export function formatDateLocale(
  dateInput: string | Date | undefined,
  locale: string,
): string {
  // Use the improved date formatting function from date-utils.ts
  return formatDateForDisplay(dateInput, locale);
}

/**
 * Formats a percentage value according to locale.
 * @param value The percentage value (0 to 1).
 * @param locale The locale string.
 * @returns Formatted percentage string.
 */
export function formatPercent(value: number, locale: string): string {
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
