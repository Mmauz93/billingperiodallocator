import {
  DEFAULT_FORM_VALUES,
  DemoDataType,
  FormSchemaType,
} from "./form-schema";

import { UseFormReturn } from "react-hook-form";

export const INVOICE_FORM_STORAGE_KEY = "invoiceFormDataCache";

export function initializeFormData(
  form: UseFormReturn<FormSchemaType>,
  initialDemoData: DemoDataType | null | undefined,
  onDemoDataApplied: (() => void) | undefined,
  onSubmit: (values: FormSchemaType) => void,
): void {
  try {
    // Initialization priority:
    // 1. Demo data from props
    // 2. Clean URL parameter
    // 3. Cached data from localStorage
    // 4. Default values

    // Check if demo data is provided
    if (initialDemoData) {
      console.log("[InvoiceForm] Using demo data from prop:", initialDemoData);

      const demoFormData = {
        startDateString: initialDemoData.startDateString || "",
        endDateString: initialDemoData.endDateString || "",
        includeEndDate: initialDemoData.includeEndDate === true,
        splitPeriod: initialDemoData.splitPeriod || "yearly",
        amounts: [
          {
            value: initialDemoData.amount ? String(initialDemoData.amount) : "",
          },
        ],
      };

      // Apply demo data to form
      form.reset(demoFormData);

      // Save demo data to localStorage
      localStorage.setItem(
        INVOICE_FORM_STORAGE_KEY,
        JSON.stringify(demoFormData),
      );

      // Notify parent that demo data was processed
      if (onDemoDataApplied) {
        console.log(
          "[InvoiceForm] Notifying parent that demo data was applied",
        );
        onDemoDataApplied();
      }

      // Auto-submit the form after a short delay
      setTimeout(() => {
        form.trigger().then((isValid) => {
          if (isValid) {
            console.log("[InvoiceForm] Form is valid, auto-submitting");
            form.handleSubmit(onSubmit)();
          } else {
            console.warn(
              "[InvoiceForm] Auto-submit cancelled - validation failed:",
              form.formState.errors,
            );
          }
        });
      }, 350);

      return; // Exit early if demo data was applied
    }

    // Check for clean URL parameter
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const forceClean = urlParams.get("clean") === "true";

      if (forceClean) {
        console.log(
          "[InvoiceForm] 'clean=true' parameter detected, clearing cache",
        );
        localStorage.removeItem(INVOICE_FORM_STORAGE_KEY);
        form.reset(DEFAULT_FORM_VALUES);
        return; // Exit early if clean mode was requested
      }
    }

    // Try loading from cache
    const cachedDataString = localStorage.getItem(INVOICE_FORM_STORAGE_KEY);
    if (cachedDataString) {
      console.log("[InvoiceForm] Loading data from localStorage cache");
      try {
        const parsedCache = JSON.parse(cachedDataString) as FormSchemaType;

        // Ensure amounts is not empty
        if (!parsedCache.amounts || parsedCache.amounts.length === 0) {
          parsedCache.amounts = [{ value: "" }];
        }

        // Ensure splitPeriod has a valid value
        if (
          !parsedCache.splitPeriod ||
          !["yearly", "quarterly", "monthly"].includes(parsedCache.splitPeriod)
        ) {
          parsedCache.splitPeriod = "yearly";
        }

        form.reset(parsedCache);
      } catch (error) {
        console.error("[InvoiceForm] Error parsing cached data:", error);
        resetToDefaultValues(form);
      }
    } else {
      console.log("[InvoiceForm] No cached data found, using defaults");
      // No need to reset - form already has default values
    }
  } catch (error) {
    // Fallback if there are any errors accessing localStorage
    console.error("[InvoiceForm] Error during initialization:", error);
    resetToDefaultValues(form);
  }
}

// Helper function to reset to default values
export function resetToDefaultValues(
  form: UseFormReturn<FormSchemaType>,
): void {
  // Clear any invalid data from storage
  try {
    localStorage.removeItem(INVOICE_FORM_STORAGE_KEY);
  } catch {} // Ignore errors

  // Reset form to default values
  form.reset(DEFAULT_FORM_VALUES);
}
