/**
 * Custom error classes for the application
 * These classes provide structured error handling with error codes and categorization
 */

/**
 * Base calculation error class that all specific calculation errors inherit from
 */
export class CalculationError extends Error {
  code: string;
  category: 'input' | 'calculation' | 'system';
  details?: Record<string, unknown>;

  constructor(
    message: string, 
    code: string, 
    category: 'input' | 'calculation' | 'system' = 'calculation',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CalculationError';
    this.code = code;
    this.category = category;
    this.details = details;
    
    // This is needed for instanceof to work properly with custom errors
    Object.setPrototypeOf(this, CalculationError.prototype);
  }
}

/**
 * Error for invalid input data
 */
export class InputValidationError extends CalculationError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message, code, 'input', details);
    this.name = 'InputValidationError';
    
    // This is needed for instanceof to work properly with custom errors
    Object.setPrototypeOf(this, InputValidationError.prototype);
  }
}

/**
 * Error that occurs during calculation processing
 */
export class CalculationProcessingError extends CalculationError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message, code, 'calculation', details);
    this.name = 'CalculationProcessingError';
    
    // This is needed for instanceof to work properly with custom errors
    Object.setPrototypeOf(this, CalculationProcessingError.prototype);
  }
}

/**
 * System-level errors (unexpected failures)
 */
export class SystemError extends CalculationError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message, code, 'system', details);
    this.name = 'SystemError';
    
    // This is needed for instanceof to work properly with custom errors
    Object.setPrototypeOf(this, SystemError.prototype);
  }
}

// Error codes for consistent identification
export const ERROR_CODES = {
  // Input validation error codes
  NO_AMOUNTS: 'ERR_NO_AMOUNTS',
  INVALID_AMOUNT: 'ERR_INVALID_AMOUNT',
  INVALID_DATES: 'ERR_INVALID_DATES',
  END_BEFORE_START: 'ERR_END_BEFORE_START',
  ZERO_DURATION: 'ERR_ZERO_DURATION',
  
  // Calculation processing error codes
  ROUNDING_ERROR: 'ERR_ROUNDING',
  PERIOD_ALLOCATION_ERROR: 'ERR_PERIOD_ALLOCATION',
  
  // System error codes
  UNEXPECTED_ERROR: 'ERR_UNEXPECTED'
}; 
