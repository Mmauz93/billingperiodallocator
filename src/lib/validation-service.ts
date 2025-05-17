/**
 * Validation Service
 * 
 * This module provides centralized, reusable validation functions for forms and inputs.
 * It includes:
 * - Input validation (strings, numbers, dates, emails)
 * - Form field validation with standardized error messages
 * - Custom validation factories for complex requirements
 */

import { tryParseDate, validateDateInput } from "./date-formatter";

import { parseNumeric } from "./math-utils";

/**
 * Standard validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  message: string;
  value?: unknown; // Optionally include the validated/transformed value
}

/**
 * Validates that a value is not empty
 */
export function validateRequired(
  value: unknown, 
  fieldName: string,
  customMessage?: string
): ValidationResult {
  const isEmpty = 
    value === undefined || 
    value === null || 
    value === '' || 
    (Array.isArray(value) && value.length === 0);
    
  return {
    valid: !isEmpty,
    message: isEmpty ? (customMessage || `${fieldName} is required`) : '',
    value
  };
}

/**
 * Validates a numeric value against constraints
 */
export function validateNumber(
  value: unknown,
  options?: {
    required?: boolean;
    fieldName?: string;
    min?: number;
    max?: number;
    positive?: boolean;
    integer?: boolean;
    customMessages?: {
      required?: string;
      min?: string;
      max?: string;
      positive?: string;
      integer?: string;
      invalid?: string;
    }
  }
): ValidationResult {
  const fieldName = options?.fieldName || 'Value';
  const customMessages = options?.customMessages || {};
  
  // Handle empty values
  if (value === undefined || value === null || value === '') {
    return options?.required
      ? { 
          valid: false, 
          message: customMessages.required || `${fieldName} is required`,
          value: null
        }
      : { valid: true, message: '', value: null };
  }
  
  // Parse the value
  const numberValue = parseNumeric(value, NaN);
  
  // Check if valid number
  if (isNaN(numberValue)) {
    return {
      valid: false,
      message: customMessages.invalid || `${fieldName} must be a valid number`,
      value
    };
  }
  
  // Check integer constraint
  if (options?.integer && !Number.isInteger(numberValue)) {
    return {
      valid: false,
      message: customMessages.integer || `${fieldName} must be a whole number`,
      value: numberValue
    };
  }
  
  // Check positive constraint
  if (options?.positive && numberValue <= 0) {
    return {
      valid: false,
      message: customMessages.positive || `${fieldName} must be positive`,
      value: numberValue
    };
  }
  
  // Check minimum value
  if (options?.min !== undefined && numberValue < options.min) {
    return {
      valid: false,
      message: customMessages.min || `${fieldName} must be at least ${options.min}`,
      value: numberValue
    };
  }
  
  // Check maximum value
  if (options?.max !== undefined && numberValue > options.max) {
    return {
      valid: false,
      message: customMessages.max || `${fieldName} must be at most ${options.max}`,
      value: numberValue
    };
  }
  
  // All validation passed
  return {
    valid: true,
    message: '',
    value: numberValue
  };
}

/**
 * Validates email format
 */
export function validateEmail(
  value: string,
  options?: {
    required?: boolean;
    fieldName?: string;
    customMessages?: {
      required?: string;
      invalid?: string;
    }
  }
): ValidationResult {
  const fieldName = options?.fieldName || 'Email';
  const customMessages = options?.customMessages || {};
  
  // Handle empty values
  if (!value || value.trim() === '') {
    return options?.required
      ? { 
          valid: false, 
          message: customMessages.required || `${fieldName} is required`,
          value
        }
      : { valid: true, message: '', value };
  }
  
  // Basic email validation using regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValid = emailRegex.test(value);
  
  return {
    valid: isValid,
    message: isValid ? '' : (customMessages.invalid || `Please enter a valid email address`),
    value
  };
}

/**
 * Validates min/max length for strings
 */
export function validateLength(
  value: string,
  options?: {
    required?: boolean;
    fieldName?: string;
    minLength?: number;
    maxLength?: number;
    customMessages?: {
      required?: string;
      tooShort?: string;
      tooLong?: string;
    }
  }
): ValidationResult {
  const fieldName = options?.fieldName || 'Input';
  const customMessages = options?.customMessages || {};
  
  // Handle empty values
  if (!value || value === '') {
    return options?.required
      ? { 
          valid: false, 
          message: customMessages.required || `${fieldName} is required`,
          value
        }
      : { valid: true, message: '', value };
  }
  
  // Check minimum length
  if (options?.minLength !== undefined && value.length < options.minLength) {
    return {
      valid: false,
      message: customMessages.tooShort || 
        `${fieldName} must be at least ${options.minLength} character${options.minLength === 1 ? '' : 's'}`,
      value
    };
  }
  
  // Check maximum length
  if (options?.maxLength !== undefined && value.length > options.maxLength) {
    return {
      valid: false,
      message: customMessages.tooLong || 
        `${fieldName} must be at most ${options.maxLength} character${options.maxLength === 1 ? '' : 's'}`,
      value
    };
  }
  
  // All validation passed
  return {
    valid: true,
    message: '',
    value
  };
}

/**
 * Validates a date string using date-formatter's validation functions
 */
export function validateDate(
  value: string,
  options?: {
    required?: boolean;
    fieldName?: string;
    minDate?: Date;
    maxDate?: Date;
    customMessages?: {
      required?: string;
      invalid?: string;
      minDate?: string;
      maxDate?: string;
    }
  }
): ValidationResult {
  const fieldName = options?.fieldName || 'Date';
  const customMessages = options?.customMessages || {};
  
  // Handle empty values
  if (!value || value.trim() === '') {
    return options?.required
      ? { 
          valid: false, 
          message: customMessages.required || `${fieldName} is required`,
          value: null
        }
      : { valid: true, message: '', value: null };
  }
  
  // Use date-formatter's validation
  const result = validateDateInput(value, {
    minDate: options?.minDate,
    maxDate: options?.maxDate
  });
  
  // Handle custom messages
  if (!result.valid) {
    if (result.parsedDate === null && customMessages.invalid) {
      return {
        valid: false,
        message: customMessages.invalid,
        value: null
      };
    }
    if (options?.minDate && result.parsedDate && result.parsedDate < options.minDate && customMessages.minDate) {
      return {
        valid: false,
        message: customMessages.minDate,
        value: result.parsedDate
      };
    }
    if (options?.maxDate && result.parsedDate && result.parsedDate > options.maxDate && customMessages.maxDate) {
      return {
        valid: false,
        message: customMessages.maxDate,
        value: result.parsedDate
      };
    }
  }
  
  return {
    valid: result.valid,
    message: result.message,
    value: result.parsedDate
  };
}

/**
 * Compare two dates and validate their relationship (start date before end date, etc.)
 */
export function validateDateRange(
  startDate: string | Date | null,
  endDate: string | Date | null,
  options?: {
    allowEqual?: boolean;
    customMessage?: string;
  }
): ValidationResult {
  const customMessage = options?.customMessage || 'End date must be after start date';
  
  // Handle empty values
  if (!startDate || !endDate) {
    return { valid: true, message: '' };
  }
  
  // Parse dates if they're strings
  const start = typeof startDate === 'string' ? tryParseDate(startDate) : startDate;
  const end = typeof endDate === 'string' ? tryParseDate(endDate) : endDate;
  
  // If either date couldn't be parsed, don't validate the range
  if (!start || !end) {
    return { valid: true, message: '' };
  }
  
  // Compare dates
  const isValid = options?.allowEqual ? 
    start <= end : 
    start < end;
  
  return {
    valid: isValid,
    message: isValid ? '' : customMessage,
    value: { startDate: start, endDate: end }
  };
}

/**
 * Factory that creates a custom validator function
 */
export function createValidator<T>(validationFn: (value: T) => ValidationResult) {
  return validationFn;
}

/**
 * Combine multiple validators and run them in sequence
 */
export function combineValidators<T>(...validators: ((value: T) => ValidationResult)[]) {
  return (value: T): ValidationResult => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.valid) {
        return result;
      }
    }
    return { valid: true, message: '', value };
  };
} 
