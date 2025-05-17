/**
 * Application logger for consistent logging across the application
 * Supports different log levels and environments
 */

// Log levels in order of severity
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Environment-based configuration
const isProduction = process.env.NODE_ENV === 'production';
// Uncomment these if needed in the future
// const isDevelopment = process.env.NODE_ENV === 'development';
// const isTest = process.env.NODE_ENV === 'test';

// Default minimum log level based on environment
const DEFAULT_MIN_LEVEL = isProduction ? LogLevel.WARN : LogLevel.DEBUG;

// Current minimum log level (can be changed at runtime)
let currentMinLevel = DEFAULT_MIN_LEVEL;

/**
 * Sets the minimum log level
 * @param level The minimum level to display logs for
 */
export function setLogLevel(level: LogLevel): void {
  currentMinLevel = level;
}

/**
 * Base logging function
 * @param level The log level
 * @param message The message to log
 * @param data Optional data to include in the log
 */
function log(level: LogLevel, message: string, data?: unknown): void {
  // Skip if below minimum level
  if (level < currentMinLevel) return;
  
  // Format timestamp for logging
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}]`;
  
  // Format data for logging
  const formattedData = data ? 
    (typeof data === 'object' ? JSON.stringify(data, null, 2) : data) 
    : '';
  
  // Browser console colors
  let consoleMethod: 'debug' | 'info' | 'warn' | 'error' | 'log';
  
  switch (level) {
    case LogLevel.DEBUG:
      consoleMethod = 'debug';
      break;
    case LogLevel.INFO:
      consoleMethod = 'info';
      break;
    case LogLevel.WARN:
      consoleMethod = 'warn';
      break;
    case LogLevel.ERROR:
      consoleMethod = 'error';
      break;
    default:
      consoleMethod = 'info'; // Use 'info' as a safe fallback
  }
  
  // Use the appropriate console method
  if (formattedData) {
    console[consoleMethod](`${prefix} ${message}`, formattedData);
  } else {
    console[consoleMethod](`${prefix} ${message}`);
  }
  
  // Optional: In production, you might want to send logs to a service
  if (isProduction && level >= LogLevel.ERROR) {
    // Example: sendToLogService(level, message, data);
  }
}

/**
 * Debug level logging
 * @param message The message to log
 * @param data Optional data to include
 */
export function debug(message: string, data?: unknown): void {
  log(LogLevel.DEBUG, message, data);
}

/**
 * Info level logging
 * @param message The message to log
 * @param data Optional data to include
 */
export function info(message: string, data?: unknown): void {
  log(LogLevel.INFO, message, data);
}

/**
 * Warning level logging
 * @param message The message to log
 * @param data Optional data to include
 */
export function warn(message: string, data?: unknown): void {
  log(LogLevel.WARN, message, data);
}

/**
 * Error level logging
 * @param message The message to log
 * @param error Optional error or data to include
 */
export function error(message: string, error?: unknown): void {
  // Special handling for Error objects
  if (error instanceof Error) {
    log(LogLevel.ERROR, message, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      // First convert to unknown, then to Record for safe spreading
      ...((error as unknown) as Record<string, unknown>),
    });
  } else {
    log(LogLevel.ERROR, message, error);
  }
}

/**
 * Measure execution time of a function
 * @param fn The function to measure
 * @param fnName Optional name for the function
 * @returns A wrapped function that logs execution time
 */
export function withPerformanceLogging<T extends (...args: unknown[]) => unknown>(
  fn: T, 
  fnName = fn.name || 'anonymous'
): (...args: Parameters<T>) => ReturnType<T> {
  return function(this: unknown, ...args: Parameters<T>): ReturnType<T> {
    if (currentMinLevel > LogLevel.DEBUG) {
      return fn.apply(this, args) as ReturnType<T>;
    }
    
    const start = performance.now();
    try {
      const result = fn.apply(this, args);
      
      // Handle promises
      if (result instanceof Promise) {
        return result.finally(() => {
          const end = performance.now();
          debug(`[PERF] ${fnName} took ${(end - start).toFixed(2)}ms`);
        }) as ReturnType<T>;
      }
      
      const end = performance.now();
      debug(`[PERF] ${fnName} took ${(end - start).toFixed(2)}ms`);
      return result as ReturnType<T>;
    } catch (e) {
      const end = performance.now();
      debug(`[PERF] ${fnName} failed after ${(end - start).toFixed(2)}ms`);
      throw e;
    }
  };
}

// Create a named logger object and export it as default
const logger = {
  setLogLevel,
  debug,
  info,
  warn,
  error,
  withPerformanceLogging,
};

export default logger; 
