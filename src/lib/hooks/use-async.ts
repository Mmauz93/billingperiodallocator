/**
 * useAsync Hook
 * 
 * A React hook for handling asynchronous operations with proper loading,
 * error handling, and retry capabilities.
 */

import { useCallback, useEffect, useReducer, useRef } from 'react';

type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

type AsyncAction<T> =
  | { type: 'pending' }
  | { type: 'success'; payload: T }
  | { type: 'error'; error: Error }
  | { type: 'reset' };

function asyncReducer<T>(state: AsyncState<T>, action: AsyncAction<T>): AsyncState<T> {
  switch (action.type) {
    case 'pending':
      return {
        ...state,
        status: 'pending',
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null
      };
    case 'success':
      return {
        status: 'success',
        data: action.payload,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false
      };
    case 'error':
      return {
        ...state,
        status: 'error',
        error: action.error,
        isLoading: false,
        isSuccess: false,
        isError: true
      };
    case 'reset':
      return {
        ...state,
        status: 'idle',
        isLoading: false,
        isSuccess: false,
        isError: false,
        error: null
      };
    default:
      return state;
  }
}

/**
 * Options for the useAsync hook
 */
interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onSettled?: (data: T | null, error: Error | null) => void;
  initialData?: T | null;
  autoExecute?: boolean;
  retry?: {
    maxRetries: number;
    retryDelay?: number | ((retryAttempt: number) => number);
  };
}

/**
 * Hook for handling async operations with loading state and error handling
 * 
 * @example
 * ```tsx
 * const { execute, data, isLoading, error } = useAsync(
 *   async () => {
 *     const response = await fetch('/api/data');
 *     if (!response.ok) throw new Error('Failed to fetch');
 *     return response.json();
 *   },
 *   { 
 *     onSuccess: (data) => console.log('Success:', data),
 *     onError: (error) => console.error('Error:', error),
 *     autoExecute: true, // Runs when component mounts
 *     retry: { maxRetries: 3 } // Automatically retry 3 times
 *   }
 * );
 * ```
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    onSettled,
    initialData = null,
    autoExecute = false,
    retry = { maxRetries: 0 }
  } = options;

  const initialState: AsyncState<T> = {
    status: 'idle',
    data: initialData,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false
  };

  const [state, dispatch] = useReducer(asyncReducer<T>, initialState);
  const retryCount = useRef(0);
  const isMounted = useRef(true);

  // Function to calculate retry delay
  const getRetryDelay = useCallback((attempt: number): number => {
    if (typeof retry.retryDelay === 'function') {
      return retry.retryDelay(attempt);
    }
    return retry.retryDelay || Math.min(1000 * 2 ** attempt, 30000); // Exponential backoff with 30s max
  }, [retry]);

  // Keep the async function reference stable with useRef
  const asyncFunctionRef = useRef(asyncFunction);
  useEffect(() => {
    asyncFunctionRef.current = asyncFunction;
  }, [asyncFunction]);

  // The execute function is stable across renders
  const execute = useCallback(async (): Promise<T | undefined> => {
    dispatch({ type: 'pending' });
    
    try {
      const result = await asyncFunctionRef.current();
      
      // Only update state if the component is still mounted
      if (isMounted.current) {
        dispatch({ type: 'success', payload: result });
        onSuccess?.(result);
        onSettled?.(result, null);
        retryCount.current = 0;
        return result;
      }
    } catch (error) {
      // Only update state if the component is still mounted
      if (isMounted.current) {
        const err = error instanceof Error ? error : new Error(String(error));
        dispatch({ type: 'error', error: err });
        
        // Handle retry logic
        if (retryCount.current < retry.maxRetries) {
          const currentRetry = retryCount.current;
          retryCount.current += 1;
          
          console.log(`Retrying (${currentRetry + 1}/${retry.maxRetries})...`);
          
          // Schedule retry with delay
          setTimeout(() => {
            if (isMounted.current) {
              execute();
            }
          }, getRetryDelay(currentRetry));
        } else {
          onError?.(err);
          onSettled?.(null, err);
        }
      }
    }
    return undefined;
  }, [onSuccess, onError, onSettled, getRetryDelay, retry]);

  const reset = useCallback(() => {
    dispatch({ type: 'reset' });
    retryCount.current = 0;
  }, []);

  // Auto-execute if configured
  useEffect(() => {
    if (autoExecute) {
      execute();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [execute, autoExecute]);

  return {
    ...state,
    execute,
    reset
  };
}

/**
 * Hook for handling multiple async operations concurrently
 */
export function useAsyncBatch<T>(
  asyncFunctions: (() => Promise<T>)[],
  options: UseAsyncOptions<T[]> = {}
) {
  const executeAll = useCallback(async (): Promise<T[]> => {
    return Promise.all(asyncFunctions.map(fn => fn()));
  }, [asyncFunctions]);

  return useAsync(executeAll, options);
} 
