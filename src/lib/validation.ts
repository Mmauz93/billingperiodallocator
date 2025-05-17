import { z } from "zod";

/**
 * Common validation patterns and schemas for use across the application
 * This centralizes validation logic for forms, inputs, etc.
 */

// String patterns
export const PATTERNS = {
  // Date patterns
  DATE_YYYY_MM_DD: /^\d{4}-\d{2}-\d{2}$/,
  DATE_DD_MM_YYYY: /^\d{2}\.\d{2}\.\d{4}$/,
  
  // Number patterns
  DECIMAL_NUMBER: /^-?\d*\.?\d*$/,
  POSITIVE_DECIMAL: /^\d*\.?\d*$/,
  POSITIVE_INTEGER: /^\d+$/,
  
  // Currency/monetary patterns
  CURRENCY_AMOUNT: /^-?\d{1,9}(\.\d{1,2})?$/,
  POSITIVE_CURRENCY: /^\d{1,9}(\.\d{1,2})?$/,
  
  // Other common patterns
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// Common Zod schemas
export const SCHEMAS = {
  // Date schemas
  DATE_STRING: z.string().regex(PATTERNS.DATE_YYYY_MM_DD, "Date must be in format YYYY-MM-DD"),
  
  // Number schemas
  POSITIVE_NUMBER: z.number().positive("Number must be positive"),
  POSITIVE_INTEGER: z.number().int().positive("Number must be a positive integer"),
  
  // Monetary schemas
  CURRENCY_AMOUNT: z.number()
    .refine(n => Number.isFinite(n) && Math.abs(n) <= 999999999.99, 
      "Amount must be between -999,999,999.99 and 999,999,999.99")
    .refine(n => /^\d+(\.\d{1,2})?$/.test(n.toFixed(2)), 
      "Amount must have at most 2 decimal places"),
  
  // Decimal places (0-6)
  DECIMAL_PLACES: z.number().int().min(0).max(6),
  
  // Rounding precision
  ROUNDING_PRECISION: z.number()
    .positive("Rounding precision must be positive")
    .refine(val => [0.01, 0.05, 0.1, 0.25, 0.5, 1, 5, 10].includes(val), 
      "Rounding precision must be one of: 0.01, 0.05, 0.1, 0.25, 0.5, 1, 5, 10"),
  
  // Thousands separator
  THOUSANDS_SEPARATOR: z.enum([",", ".", "'", " "], {
    errorMap: () => ({ message: "Separator must be one of: comma, period, apostrophe, or space" }),
  }),
};

/**
 * Validates a date string in specified format(s)
 * @param dateString The date string to validate
 * @param formats Array of accepted formats: 'YYYY-MM-DD' or 'DD.MM.YYYY'
 * @returns True if the date string is valid in any of the formats
 */
export function isValidDateString(
  dateString: string, 
  formats: ('YYYY-MM-DD' | 'DD.MM.YYYY')[] = ['YYYY-MM-DD']
): boolean {
  if (!dateString) return false;
  
  return formats.some(format => {
    if (format === 'YYYY-MM-DD') {
      if (!PATTERNS.DATE_YYYY_MM_DD.test(dateString)) return false;
      
      // Check for valid month/day values
      const [year, month, day] = dateString.split('-').map(Number);
      return isValidDate(year, month, day);
    } 
    else if (format === 'DD.MM.YYYY') {
      if (!PATTERNS.DATE_DD_MM_YYYY.test(dateString)) return false;
      
      // Check for valid month/day values
      const [day, month, year] = dateString.split('.').map(Number);
      return isValidDate(year, month, day);
    }
    
    return false;
  });
}

/**
 * Helper to check if a date is valid
 * @param year The year
 * @param month The month (1-12)
 * @param day The day
 * @returns True if the date is valid
 */
function isValidDate(year: number, month: number, day: number): boolean {
  // Check for valid month/day values and leap years
  if (month < 1 || month > 12) return false;
  
  const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day > 0 && day <= daysInMonth[month - 1];
}

/**
 * Helper to check if a year is a leap year
 * @param year The year to check
 * @returns True if the year is a leap year
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Validates a numeric string for different number formats
 * @param value The string value to check
 * @param type The type of number to validate
 * @returns True if the value is valid for the specified type
 */
export function isValidNumberString(
  value: string,
  type: 'decimal' | 'positive' | 'integer' | 'positive-integer' | 'currency' | 'positive-currency' = 'decimal'
): boolean {
  if (!value) return false;
  
  switch (type) {
    case 'decimal':
      return PATTERNS.DECIMAL_NUMBER.test(value);
    case 'positive':
      return PATTERNS.POSITIVE_DECIMAL.test(value) && parseFloat(value) > 0;
    case 'integer':
      return Number.isInteger(Number(value));
    case 'positive-integer':
      return PATTERNS.POSITIVE_INTEGER.test(value);
    case 'currency':
      return PATTERNS.CURRENCY_AMOUNT.test(value);
    case 'positive-currency':
      return PATTERNS.POSITIVE_CURRENCY.test(value);
    default:
      return false;
  }
} 
