import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes using clsx and tailwind-merge
 * Handles conditional class application and removes duplicates
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely converts any value to a string to prevent React error #418
 * This helps when displaying dynamic content that might be objects
 */
export function safeText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "[Object]";
    }
  }

  return String(value);
}

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
 * Extracts query parameters from a URL
 * @param url The URL to parse
 * @returns An object with key-value pairs of query parameters
 */
export function getQueryParams(url?: string): Record<string, string> {
  const urlToUse = url || (typeof window !== 'undefined' ? window.location.href : '');
  const params: Record<string, string> = {};
  if (!urlToUse) return params;

  const searchParams = new URL(urlToUse).searchParams;
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  return params;
}

/**
 * Debounces a function to limit how often it can be called
 * @param fn The function to debounce
 * @param ms The debounce delay in milliseconds
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function(this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Safely parses JSON with error handling
 * @param jsonString The JSON string to parse
 * @param fallback Optional fallback value if parsing fails
 * @returns The parsed object or the fallback
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
}
