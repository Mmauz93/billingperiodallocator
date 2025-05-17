/**
 * Custom hook for form persistence and initialization.
 * Provides a unified pattern for React Hook Form with localStorage persistence,
 * demo data handling, and form state management.
 */

import { FieldValues, UseFormReturn, useWatch } from "react-hook-form";
import { useCallback, useEffect, useRef, useState } from "react";

interface PersistentFormOptions<TFormValues extends FieldValues> {
  /**
   * The React Hook Form instance
   */
  form: UseFormReturn<TFormValues>;
  
  /**
   * Key to use for localStorage persistence
   */
  storageKey: string;
  
  /**
   * Optional initial demo data to populate the form
   */
  initialDemoData?: TFormValues | null;
  
  /**
   * Optional callback to run when demo data is applied
   */
  onDemoDataApplied?: () => void;
  
  /**
   * Optional validation function to run before saving to localStorage
   */
  validateBeforeSave?: (data: TFormValues) => TFormValues;
  
  /**
   * Optional callback to run on form submission
   */
  onSubmit?: (values: TFormValues) => void;
  
  /**
   * Debounce time for localStorage saves in milliseconds
   */
  debounceTime?: number;
  
  /**
   * Whether to auto-submit when demo data is loaded
   */
  autoSubmitWithDemoData?: boolean;
}

/**
 * Hook to manage form persistence, initialization, and state
 */
export function usePersistentForm<TFormValues extends FieldValues>({
  form,
  storageKey,
  initialDemoData,
  onDemoDataApplied,
  validateBeforeSave,
  onSubmit,
  debounceTime = 800,
  autoSubmitWithDemoData = true
}: PersistentFormOptions<TFormValues>) {
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const initRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Save form data to localStorage
   */
  const saveFormData = useCallback((dataToSave: TFormValues) => {
    if (mounted && initRef.current) {
      try {
        // Apply validation if provided
        const sanitizedData = validateBeforeSave 
          ? validateBeforeSave(dataToSave) 
          : dataToSave;

        // Save data to localStorage
        console.log(`[PersistentForm] Saving form data to localStorage (${storageKey})`);
        localStorage.setItem(
          storageKey,
          JSON.stringify(sanitizedData),
        );
      } catch (error) {
        console.error(
          `[PersistentForm] Failed to save form data to localStorage (${storageKey}):`,
          error,
        );
      }
    }
  }, [mounted, storageKey, validateBeforeSave]);

  /**
   * Debounced function to save form data to localStorage
   */
  const debouncedSaveFunction = useCallback((dataToSave: TFormValues) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      saveFormData(dataToSave);
    }, debounceTime);
  }, [saveFormData, debounceTime]);

  // Function to cancel any pending save operations
  const cancelDebounce = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Watch for form value changes to trigger saves
  const formValues = useWatch({ control: form.control });

  // Effect to trigger debounced save when form values change
  useEffect(() => {
    if (!mounted || !initRef.current) {
      return;
    }

    if (formValues) {
      debouncedSaveFunction(form.getValues());
    }
  }, [formValues, debouncedSaveFunction, form, mounted]);

  // Cleanup function
  useEffect(() => {
    return () => {
      cancelDebounce();
      console.log(
        `[PersistentForm] Component unmounting, cancelled pending save operations (${storageKey}).`,
      );
    };
  }, [cancelDebounce, storageKey]);

  /**
   * Initialize form data from various sources (demo data, URL params, localStorage)
   */
  const initializeFormData = useCallback(() => {
    if (!mounted || initRef.current) {
      return;
    }

    initRef.current = true;
    console.log(`[PersistentForm] Initializing form data (${storageKey})...`);

    try {
      // Initialization priority:
      // 1. Demo data from props
      // 2. Clean URL parameter
      // 3. Cached data from localStorage
      // 4. Default values (already set in useForm)

      // Check if demo data is provided
      if (initialDemoData) {
        console.log("[PersistentForm] Using demo data from prop:", initialDemoData);

        // Apply demo data to form
        form.reset(initialDemoData as TFormValues);

        // Save demo data to localStorage
        localStorage.setItem(
          storageKey,
          JSON.stringify(initialDemoData),
        );

        // Notify parent that demo data was processed
        if (onDemoDataApplied) {
          console.log(
            "[PersistentForm] Notifying parent that demo data was applied",
          );
          onDemoDataApplied();
        }

        // Auto-submit the form after a short delay if enabled
        if (autoSubmitWithDemoData && onSubmit) {
          setTimeout(() => {
            form.trigger().then((isValid) => {
              if (isValid) {
                console.log("[PersistentForm] Form is valid, auto-submitting");
                form.handleSubmit((values) => {
                  if (onSubmit) onSubmit(values);
                })();
              } else {
                console.warn(
                  "[PersistentForm] Auto-submit cancelled - validation failed:",
                  form.formState.errors,
                );
              }
            });
          }, 350);
        }

        return; // Exit early if demo data was applied
      }

      // Check for clean URL parameter
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const forceClean = urlParams.get("clean") === "true";

        if (forceClean) {
          console.log(
            `[PersistentForm] 'clean=true' parameter detected, clearing cache (${storageKey})`,
          );
          localStorage.removeItem(storageKey);
          return; // Form already has default values
        }
      }

      // Try loading from cache
      const cachedDataString = localStorage.getItem(storageKey);
      if (cachedDataString) {
        console.log(`[PersistentForm] Loading data from localStorage cache (${storageKey})`);
        try {
          const parsedCache = JSON.parse(cachedDataString) as TFormValues;
          
          // Apply validation if provided
          const sanitizedData = validateBeforeSave 
            ? validateBeforeSave(parsedCache) 
            : parsedCache;
            
          form.reset(sanitizedData as TFormValues);
        } catch (error) {
          console.error(`[PersistentForm] Error parsing cached data (${storageKey}):`, error);
          localStorage.removeItem(storageKey);
          // Form already has default values
        }
      } else {
        console.log(`[PersistentForm] No cached data found (${storageKey}), using defaults`);
        // Form already has default values
      }
    } catch (error) {
      // Fallback if there are any errors accessing localStorage
      console.error(`[PersistentForm] Error during initialization (${storageKey}):`, error);
      localStorage.removeItem(storageKey);
      // Form already has default values
    }
  }, [
    mounted, 
    form, 
    storageKey, 
    initialDemoData, 
    onDemoDataApplied, 
    validateBeforeSave, 
    onSubmit, 
    autoSubmitWithDemoData
  ]);
  
  /**
   * Handle form submission with animation and loading state
   */
  const handleSubmit = useCallback((callback?: (values: TFormValues) => void) => {
    return async (values: TFormValues) => {
      setIsProcessing(true);
      
      try {
        // Call the provided onSubmit or callback
        const handler = callback || onSubmit;
        if (handler) {
          await handler(values);
        }
        
        // Show success animation
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 1500);
      } catch (error) {
        console.error('[PersistentForm] Error during form submission:', error);
      } finally {
        setIsProcessing(false);
      }
    };
  }, [onSubmit]);

  // First time effect: Set component as mounted
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Effect to initialize form data once component is mounted
  useEffect(() => {
    if (mounted && !initRef.current) {
      initializeFormData();
    }
  }, [mounted, initializeFormData]);
  
  return {
    mounted,
    isProcessing,
    showSuccessAnimation,
    handleSubmit,
    cancelSave: cancelDebounce,
  };
} 
