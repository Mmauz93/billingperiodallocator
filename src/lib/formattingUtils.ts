import { AppSettings } from "@/context/settings-context";

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
 * Rounds a number based on the specified rounding precision factor.
 * @param value The number to round.
 * @param precision The rounding factor (e.g., 0.01, 0.05, 1). Must be > 0.
 * @returns Rounded number.
 */
export function roundValue(value: number, precision: number): number {
  if (precision <= 0) {
    console.warn(`Invalid rounding precision: ${precision}. Using 0.01.`);
    precision = 0.01;
  }
  const multiplier = 1 / precision;
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Formats a date according to locale. Accepts either a Date object or a string in YYYY-MM-DD format.
 * @param dateInput Date as a string in 'yyyy-MM-dd' format or as a Date object.
 * @param locale Locale string (e.g., 'en', 'de').
 * @returns Formatted date string.
 */
export function formatDateLocale(dateInput: string | Date | undefined, locale: string): string {
  if (!dateInput) return 'N/A';
  
  try {
    let date: Date;
    
    if (typeof dateInput === 'string') {
      // If it's already in ISO format with time, use it directly
      if (dateInput.includes('T')) {
        date = new Date(dateInput);
      } else {
        // Add UTC time for date-only strings
        date = new Date(dateInput + 'T00:00:00Z');
      }
    } else {
      // It's already a Date
      date = dateInput;
    }
    
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return typeof dateInput === 'string' ? dateInput : dateInput.toISOString().split('T')[0]; // Fallback
  }
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
