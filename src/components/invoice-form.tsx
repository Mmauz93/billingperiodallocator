"use client";

import { AlertCircle, CalendarIcon, CheckCircle, Loader2, PlusCircle, XCircle } from "lucide-react";
import { CalculationError, CalculationInput, CalculationResult, ERROR_CODES, InputValidationError, calculateInvoiceSplit } from "@/lib/calculations";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { de, enUS } from 'date-fns/locale';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { debounce } from 'lodash';
import { format } from "date-fns";
import { parseDate } from "@/lib/date-utils";
import { useTranslation } from '@/translations';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Constants for date formats
const DATE_FORMAT_ISO = "yyyy-MM-dd";
const DATE_FORMAT_DE = "dd.MM.yyyy";
const DATE_FORMAT_US = "MM/dd/yyyy";
const DATE_FORMAT_DOTS = "dd.MM.yy";
const DATE_FORMAT_SLASHES = "MM/dd/yy";
const DATE_FORMAT_DASHES = "dd-MM-yyyy";

// Define a constant for default form values
const DEFAULT_FORM_VALUES: FormSchemaType = {
    startDateString: '',
    endDateString: '',
    includeEndDate: true,
    splitPeriod: 'yearly' as const,
    amounts: [{ value: '' }]
};

// List of all supported date formats for parsing
const supportedDateFormats = [
    DATE_FORMAT_ISO,
    DATE_FORMAT_DE,
    DATE_FORMAT_US,
    DATE_FORMAT_DOTS,
    DATE_FORMAT_SLASHES,
    DATE_FORMAT_DASHES
];

// Function to try parsing a date string with multiple formats
const tryParseDate = (value: string): Date | null => {
    if (!value) return null;

    // Use our new parseDate function that handles timezone consistently
    return parseDate(value, supportedDateFormats);
};

// Update CalculationInput type to include splitPeriod
declare module '@/lib/calculations' {
    interface CalculationInput {
        splitPeriod?: 'yearly' | 'quarterly' | 'monthly';
    }
}

// Update the error type definition to match invoice-calculator-client.tsx
type CalculationErrorType = string | Error | CalculationError | { message?: string; [key: string]: unknown } | null | undefined;

// Schema for form validation
const formSchema = (t: ReturnType<typeof useTranslation>['t']) => z
    .object({
        startDateString: z.string().optional(),
        endDateString: z.string().optional(),
        includeEndDate: z.boolean(),
        splitPeriod: z.enum(['yearly', 'quarterly', 'monthly']),
        amounts: z.array(z.object({
            value: z.string()
                .min(1, { message: t('InvoiceForm.errorAmountValueRequired') })
                .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
                    message: t('InvoiceForm.errorAmountPositive'),
                })
        })).min(1, t('InvoiceForm.errorAmountRequired'))
    })
    .refine((data) => {
        const startDate = tryParseDate(data.startDateString || '');
        return !!startDate;
    }, {
        message: t('InvoiceForm.errorStartDateRequired'),
        path: ["startDateString"],
    })
    .refine((data) => {
        const endDate = tryParseDate(data.endDateString || '');
        return !!endDate;
    }, {
        message: t('InvoiceForm.errorEndDateRequired'),
        path: ["endDateString"],
    })
    .refine((data) => {
        const startDate = tryParseDate(data.startDateString || '');
        const endDate = tryParseDate(data.endDateString || '');
        return !startDate || !endDate || endDate >= startDate;
    }, {
        message: t('InvoiceForm.errorEndDateBeforeStart'),
        path: ["endDateString"],
    });

// Form data type
type FormSchemaType = z.infer<ReturnType<typeof formSchema>>;

// Data passed back to parent on calculation
export type CalculationCallbackData = {
    startDate: Date;
    endDate: Date;
    includeEndDate: boolean;
    splitPeriod: 'yearly' | 'quarterly' | 'monthly';
    amounts: number[];
} | null;

// Type definition for demo data
type DemoDataType = {
  startDateString?: string;
  endDateString?: string;
  amount?: string;
  includeEndDate?: boolean;
  splitPeriod?: 'yearly' | 'quarterly' | 'monthly';
  isDemo?: boolean;
} | null;

interface InvoiceFormProps {
    onCalculateAction: (formData: CalculationCallbackData, results: CalculationResult | null, error?: CalculationErrorType) => void;
    initialDemoData?: DemoDataType | null;
    onDemoDataApplied?: () => void;
}

export function InvoiceForm({ 
    onCalculateAction, 
    initialDemoData,
    onDemoDataApplied 
}: InvoiceFormProps) {
    const { t, i18n } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [buttonText, setButtonText] = useState('');
    const [showSuccessGlow, setShowSuccessGlow] = useState(false);
    const initRef = useRef(false);

    const currentLocale = i18n.language.startsWith('de') ? de : enUS;
    const displayDateFormat = i18n.language.startsWith('de') ? DATE_FORMAT_DE : DATE_FORMAT_ISO;
    const dateExamplePlaceholder = i18n.language.startsWith('de') ? 'z.B. 31.12.2023' : 'e.g. 2023-12-31';
    const storageKey = 'invoiceFormDataCache';
    
    // State for popover visibility
    const [isStartDatePopoverOpen, setIsStartDatePopoverOpen] = useState(false);
    const [isEndDatePopoverOpen, setIsEndDatePopoverOpen] = useState(false);

    const currentFormSchema = formSchema(t);
    const form = useForm<FormSchemaType>({
        resolver: zodResolver(currentFormSchema),
        defaultValues: DEFAULT_FORM_VALUES,
        mode: "onBlur",
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "amounts"
    });

    // Debounced function to save data to localStorage
    const debouncedSaveFunction = useMemo(
        () => debounce((dataToSave: FormSchemaType) => {
            if (mounted && initRef.current) {
                try {
                    // Ensure amounts is properly formatted
                    const amountsToSave = dataToSave.amounts?.length > 0
                        ? dataToSave.amounts
                        : [{ value: '' }];
                    
                    // Format and prepare the data for saving
                    const saveData = { 
                        ...dataToSave, 
                        amounts: amountsToSave,
                        // Ensure valid splitPeriod
                        splitPeriod: dataToSave.splitPeriod || 'yearly'
                    };
                    
                    // Log and save data to localStorage
                    console.log("[InvoiceForm] Saving form data to localStorage");
                    localStorage.setItem(storageKey, JSON.stringify(saveData));
                } catch (error) {
                    console.error("[InvoiceForm] Failed to save form data to localStorage:", error);
                }
            }
        }, 800), // Increased debounce to reduce storage operations
        [mounted, storageKey] // Add the storage key and mounted flag as dependencies
    );
    
    // Only watch for form value changes to trigger saves when needed
    const formValues = useWatch({ control: form.control });
    
    // Effect to trigger debounced save when form values change
    useEffect(() => {
        // Skip saving during initial render or when component is not mounted
        if (!mounted || !initRef.current) {
            return;
        }
        
        // Only save if we have real form values
        if (formValues) {
            debouncedSaveFunction(form.getValues());
        }
    }, [formValues, debouncedSaveFunction, form, mounted, initRef]);

    // Cleanup function in a separate effect
    useEffect(() => {
        return () => {
            // Cancel any pending save operations
            debouncedSaveFunction.cancel();
            
            // Close any open popovers to ensure proper cleanup
            setIsStartDatePopoverOpen(false);
            setIsEndDatePopoverOpen(false);
            
            console.log("[InvoiceForm] Component unmounting, cancelled pending save operations.");
            // DO NOT set mounted=false here, as it will cause re-renders in StrictMode
        };
    }, [debouncedSaveFunction]);

    const onSubmit = useCallback((values: FormSchemaType) => {
        setIsCalculating(true);
        setButtonText(t('InvoiceForm.calculatingButton'));
        const startDate = tryParseDate(values.startDateString || '');
        const endDate = tryParseDate(values.endDateString || '');

        // Prepare callbackFormData early, ensure amounts are parsed.
        // Schema validation should ensure amounts are valid numbers, but parseFloat is still needed.
        const parsedAmounts = values.amounts.map(a => parseFloat(a.value));

        const callbackFormData: CalculationCallbackData = {
            startDate: startDate!, // Will be checked for null below
            endDate: endDate!,   // Will be checked for null below
            includeEndDate: values.includeEndDate,
            splitPeriod: values.splitPeriod,
            amounts: parsedAmounts.filter(a => !isNaN(a)) // Use only validly parsed amounts for the callback
        };

        if (!startDate || !endDate) {
            const error = new InputValidationError(
                t('InvoiceForm.errorInvalidDatesMessages', { defaultValue: 'Valid start and end dates are required.' }),
                ERROR_CODES.INVALID_DATES,
                {
                    startDateString: values.startDateString,
                    endDateString: values.endDateString
                }
            );
            onCalculateAction(callbackFormData, null, error);
            setIsCalculating(false);
            setButtonText(t('InvoiceForm.calculateButton', { defaultValue: 'Calculate Split' }));
            return;
        }
        
        // Additional check for NaN amounts after parseFloat, though schema should catch most.
        if (parsedAmounts.some(isNaN)) {
             const error = new InputValidationError(
                t('InvoiceForm.errorAmountPositive'), 
                ERROR_CODES.INVALID_AMOUNT, 
                { invalidAmounts: values.amounts.filter(a => isNaN(parseFloat(a.value))).map(a => a.value) }
            );
            // Pass amounts that were attempted, even if some failed parsing, for callback context
            onCalculateAction(callbackFormData, null, error);
            setIsCalculating(false);
            setButtonText(t('InvoiceForm.calculateButton', { defaultValue: 'Calculate Split' }));
            return;
        }

        const inputData: CalculationInput = {
            startDate, // Already confirmed not null
            endDate,   // Already confirmed not null
            includeEndDate: values.includeEndDate,
            splitPeriod: values.splitPeriod,
            amounts: parsedAmounts, // Use the successfully parsed amounts
        };

        // Call the refactored calculateInvoiceSplit
        const result = calculateInvoiceSplit(inputData);

        if (result.success) {
            // Success case: result is CalculateInvoiceSplitSuccess
            // Construct the CalculationResult object for the callback
            const successResultForCallback: CalculationResult = {
                totalDays: result.totalDays,
                originalTotalAmount: result.originalTotalAmount,
                adjustedTotalAmount: result.adjustedTotalAmount,
                resultsPerAmount: result.resultsPerAmount,
                aggregatedSplits: result.aggregatedSplits,
                calculationSteps: result.calculationSteps, // This is Omit<CalculationStepDetails, 'error'> & { error?: undefined }
                splitPeriodUsed: result.splitPeriodUsed,
            };
            onCalculateAction(callbackFormData, successResultForCallback, undefined);
            setShowSuccessGlow(true); // Trigger success animation
            setTimeout(() => setShowSuccessGlow(false), 1500);
        } else {
            // Error case: result is CalculateInvoiceSplitFailure
            // The error object is result.error (which is CalculationError)
            // Pass the error and null for results.
            // The callbackFormData can still be useful for context.
            onCalculateAction(callbackFormData, null, result.error);
        }

        setIsCalculating(false);
        setButtonText(t('InvoiceForm.calculateButton', { defaultValue: 'Calculate Split' }));
    }, [onCalculateAction, t]);

    // Effect to ensure all form fields have valid values
    useEffect(() => {
        // Skip during initial render or when component is not mounted
        if (!mounted) {
            return;
        }
        
        // Get current values
        const currentValues = form.getValues();
        let updatedValues = false;
        
        // Ensure splitPeriod has a valid value
        if (!currentValues.splitPeriod || !['yearly', 'quarterly', 'monthly'].includes(currentValues.splitPeriod)) {
            form.setValue('splitPeriod', 'yearly');
            updatedValues = true;
        }
        
        // Ensure includeEndDate is a boolean
        if (typeof currentValues.includeEndDate !== 'boolean') {
            form.setValue('includeEndDate', true);
            updatedValues = true;
        }
        
        // Ensure amounts array is valid
        if (!currentValues.amounts || currentValues.amounts.length === 0) {
            form.setValue('amounts', [{ value: '' }]);
            updatedValues = true;
        }
        
        // Log if we had to make any corrections
        if (updatedValues) {
            console.log('[InvoiceForm] Applied default values for missing form fields');
        }
    }, [mounted, form]);

    // Single useEffect for initialization and theme handling
    useEffect(() => {
        if (!mounted) {
            console.log("[InvoiceForm] Component mounting");
            setMounted(true);
            setButtonText(t('InvoiceForm.calculateButton', { defaultValue: 'Calculate Split' }));
            
            // Don't try to access localStorage until component is mounted
            return;
        }
        
        // Only run initialization logic once
        if (initRef.current) {
            return;
        }
        
        initRef.current = true;
        console.log("[InvoiceForm] Initializing form data...");
        
        // Separate method for initialization, extracted for readability
        const initializeFormData = () => {
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
                        startDateString: initialDemoData.startDateString || '',
                        endDateString: initialDemoData.endDateString || '',
                        includeEndDate: initialDemoData.includeEndDate === true,
                        splitPeriod: initialDemoData.splitPeriod || 'yearly',
                        amounts: [{ value: initialDemoData.amount ? String(initialDemoData.amount) : '' }]
                    };

                    // Apply demo data to form
                    form.reset(demoFormData);
                    
                    // Save demo data to localStorage
                    localStorage.setItem(storageKey, JSON.stringify(demoFormData));
                    
                    // Notify parent that demo data was processed
                    if (onDemoDataApplied) {
                        console.log("[InvoiceForm] Notifying parent that demo data was applied");
                        onDemoDataApplied();
                    }
                    
                    // Auto-submit the form after a short delay
                    setTimeout(() => {
                        form.trigger().then(isValid => {
                            if (isValid) {
                                console.log("[InvoiceForm] Form is valid, auto-submitting");
                                form.handleSubmit(onSubmit)();
                            } else {
                                console.warn("[InvoiceForm] Auto-submit cancelled - validation failed:", form.formState.errors);
                            }
                        });
                    }, 350);
                    
                    return; // Exit early if demo data was applied
                }
                
                // Check for clean URL parameter
                if (typeof window !== 'undefined') {
                    const urlParams = new URLSearchParams(window.location.search);
                    const forceClean = urlParams.get('clean') === 'true';
                    
                    if (forceClean) {
                        console.log("[InvoiceForm] 'clean=true' parameter detected, clearing cache");
                        localStorage.removeItem(storageKey);
                        form.reset(DEFAULT_FORM_VALUES);
                        return; // Exit early if clean mode was requested
                    }
                }
                
                // Try loading from cache
                const cachedDataString = localStorage.getItem(storageKey);
                if (cachedDataString) {
                    console.log("[InvoiceForm] Loading data from localStorage cache");
                    try {
                        const parsedCache = JSON.parse(cachedDataString) as FormSchemaType;
                        
                        // Ensure amounts is not empty
                        if (!parsedCache.amounts || parsedCache.amounts.length === 0) {
                            parsedCache.amounts = [{ value: '' }];
                        }
                        
                        // Ensure splitPeriod has a valid value
                        if (!parsedCache.splitPeriod || !['yearly', 'quarterly', 'monthly'].includes(parsedCache.splitPeriod)) {
                            parsedCache.splitPeriod = 'yearly';
                        }
                        
                        form.reset(parsedCache);
                    } catch (error) {
                        console.error("[InvoiceForm] Error parsing cached data:", error);
                        resetToDefaultValues();
                    }
                } else {
                    console.log("[InvoiceForm] No cached data found, using defaults");
                    // No need to reset - form already has default values
                }
            } catch (error) {
                // Fallback if there are any errors accessing localStorage
                console.error("[InvoiceForm] Error during initialization:", error);
                resetToDefaultValues();
            }
        };
        
        // Helper function to reset to default values
        const resetToDefaultValues = () => {
            // Clear any invalid data from storage
            try {
                localStorage.removeItem(storageKey);
            } catch {} // Ignore errors
            
            // Reset form to default values
            form.reset(DEFAULT_FORM_VALUES);
        };
        
        // Call initialization
        initializeFormData();
        
    }, [mounted, initialDemoData, onDemoDataApplied, t, form, storageKey, onSubmit]);
    
    const getDateHelpText = () => {
        if (i18n.language.startsWith('de')) {
            return t('InvoiceForm.supportedDateFormats', { defaultValue: 'Unterstützte Formate: TT.MM.JJJJ, JJJJ-MM-TT' });
        } else {
            return t('InvoiceForm.supportedDateFormats', { defaultValue: 'Supported formats: YYYY-MM-DD, DD.MM.YYYY' });
        }
    };

    const onSelectStartDate = (date: Date | undefined) => {
        if (date) {
            const formatted = format(date, displayDateFormat);
            form.setValue("startDateString", formatted, { shouldValidate: true });
        }
        setIsStartDatePopoverOpen(false);
    };

    const onSelectEndDate = (date: Date | undefined) => {
        if (date) {
            const formatted = format(date, displayDateFormat);
            form.setValue("endDateString", formatted, { shouldValidate: true });
        }
        setIsEndDatePopoverOpen(false);
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        // Clear any previous errors
        form.clearErrors("startDateString");
        
        // Set the new value
        form.setValue("startDateString", value, { shouldValidate: false });
        
        // Validate the date format
        const parsedDate = tryParseDate(value);
        if (value && !parsedDate) {
            form.setError("startDateString", {
                type: "manual",
                message: getDateHelpText()
            });
        } 
        // If this is a valid date, check if end date is now invalid in comparison
        else if (parsedDate) {
            const endDateValue = form.getValues("endDateString");
            const endDate = tryParseDate(endDateValue ?? '');
            
            // If end date exists and is now before start date, set end date error
            if (endDate && endDate < parsedDate) {
                form.setError("endDateString", {
                    type: "manual",
                    message: t('InvoiceForm.errorEndDateBeforeStart')
                });
            }
        }
        
        // Always trigger validation to update form state
        form.trigger("startDateString");
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        // Clear any previous errors
        form.clearErrors("endDateString");
        
        // Set the new value
        form.setValue("endDateString", value, { shouldValidate: false });
        
        // Validate the date format
        const parsedDate = tryParseDate(value);
        if (value && !parsedDate) {
            form.setError("endDateString", {
                type: "manual",
                message: getDateHelpText()
            });
        } 
        // If this is a valid date, check if it's before the start date
        else if (parsedDate) {
            const startDateValue = form.getValues("startDateString");
            const startDate = tryParseDate(startDateValue ?? '');
            
            // If start date exists and end date is before it, set error
            if (startDate && parsedDate < startDate) {
                form.setError("endDateString", {
                    type: "manual",
                    message: t('InvoiceForm.errorEndDateBeforeStart')
                });
            }
        }
        
        // Always trigger validation to update form state
        form.trigger("endDateString");
    };

    if (!mounted) {
        return (
            <div className="space-y-6">
                {/* Date fields grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                        <div className="h-4 bg-muted/60 rounded-sm animate-pulse w-2/5" />
                        <div className="h-10 bg-muted/60 rounded-md animate-pulse w-full" />
                   </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-muted/60 rounded-sm animate-pulse w-2/5" />
                        <div className="h-10 bg-muted/60 rounded-md animate-pulse w-full" />
                   </div>
                </div>
                
                {/* Include End Date toggle */}
                <div className="h-20 bg-muted/40 rounded-lg animate-pulse border border-muted/30 p-4 flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-4 bg-muted/60 rounded-sm animate-pulse w-40" />
                        <div className="h-3 bg-muted/60 rounded-sm animate-pulse w-56" />
                    </div>
                    <div className="h-6 w-12 bg-muted/60 rounded-full animate-pulse" />
                </div>
                
                {/* Split Period dropdown */}
                <div className="h-20 bg-muted/40 rounded-lg animate-pulse border border-muted/30 p-4 flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-4 bg-muted/60 rounded-sm animate-pulse w-32" />
                        <div className="h-3 bg-muted/60 rounded-sm animate-pulse w-64" />
                    </div>
                    <div className="h-10 w-28 bg-muted/60 rounded-md animate-pulse" />
                </div>
                
                {/* Amounts section */}
                <div className="rounded-lg border border-muted/30 p-6 shadow-xs space-y-4 bg-muted/10">
                    <div className="h-5 bg-muted/60 rounded-sm animate-pulse w-1/4" />
                    <div className="h-4 bg-muted/60 rounded-sm animate-pulse w-3/5 mb-4" />
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="h-3 bg-muted/60 rounded-sm animate-pulse w-8" />
                            <div className="flex gap-2">
                                <div className="h-10 bg-muted/60 rounded-md animate-pulse flex-grow" />
                                <div className="h-10 w-10 bg-muted/60 rounded-md animate-pulse opacity-0" />
                            </div>
                        </div>
                    </div>
                    <div className="h-8 bg-muted/60 rounded-md animate-pulse w-40 mt-6" />
                </div>
              
                {/* Calculate button */}
                <div className="h-11 bg-primary/40 rounded-md animate-pulse w-full" />
            </div>
        );
    }

    return (
        <FormProvider {...form}>
            <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className={cn("space-y-6", mounted && "opacity-100 transition-opacity duration-500 ease-in-out", !mounted && "opacity-0")}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                        control={form.control} 
                        name="startDateString" 
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel htmlFor="startDateString">{t('InvoiceForm.startDateLabel')}</FormLabel>
                                <Popover open={isStartDatePopoverOpen} onOpenChange={setIsStartDatePopoverOpen}>
                                    <FormControl>
                                        <div className="w-full relative">
                                            <Input 
                                                value={field.value} 
                                                onChange={(e) => { 
                                                    field.onChange(e); 
                                                    handleStartDateChange(e); 
                                                }} 
                                                onBlur={() => form.trigger("startDateString")} 
                                                placeholder={dateExamplePlaceholder} 
                                                className={`w-full pr-16 ${form.formState.errors.startDateString ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20" : ""}`} 
                                                autoFocus 
                                                id="startDateString"
                                                name="startDateString"
                                            />
                                            {field.value && !form.formState.errors.startDateString && (
                                                <div className="absolute inset-y-0 right-12 flex items-center z-[1]">
                                                    <CheckCircle className="h-4 w-4 text-success" />
                                                </div>
                                            )}
                                            {form.formState.errors.startDateString && (
                                                <div className="absolute inset-y-0 right-12 flex items-center z-[1]">
                                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                                </div>
                                            )}
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-[1]">
                                                <PopoverTrigger asChild>
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost" 
                                                        className="h-7 w-7 p-0 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors duration-200 cursor-pointer" 
                                                        aria-label="Pick a date"
                                                    >
                                                        <CalendarIcon className="h-4 w-4 transition-colors duration-200" />
                                                    </Button>
                                                </PopoverTrigger>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar 
                                            mode="single" 
                                            selected={tryParseDate(form.watch("startDateString") ?? '') || undefined} 
                                            onSelect={onSelectStartDate} 
                                            initialFocus 
                                            locale={currentLocale}
                                            defaultMonth={tryParseDate(form.watch("startDateString") ?? '') || new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage className="text-xs mt-1 error-message">{form.formState.errors.startDateString?.message}</FormMessage>
                            </FormItem>
                        )} 
                    />
                    <FormField 
                        control={form.control} 
                        name="endDateString" 
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel htmlFor="endDateString">{t('InvoiceForm.endDateLabel')}</FormLabel>
                                <Popover open={isEndDatePopoverOpen} onOpenChange={setIsEndDatePopoverOpen}>
                                    <FormControl>
                                        <div className="w-full relative">
                                            <Input 
                                                value={field.value} 
                                                onChange={(e) => { 
                                                    field.onChange(e); 
                                                    handleEndDateChange(e); 
                                                }} 
                                                onBlur={() => form.trigger("endDateString")} 
                                                placeholder={dateExamplePlaceholder} 
                                                className={`w-full pr-16 ${form.formState.errors.endDateString ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20" : ""}`} 
                                                id="endDateString"
                                                name="endDateString"
                                            />
                                            {field.value && !form.formState.errors.endDateString && (
                                                <div className="absolute inset-y-0 right-12 flex items-center z-[1]">
                                                    <CheckCircle className="h-4 w-4 text-success" />
                                                </div>
                                            )}
                                            {form.formState.errors.endDateString && (
                                                <div className="absolute inset-y-0 right-12 flex items-center z-[1]">
                                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                                </div>
                                            )}
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-[1]">
                                                <PopoverTrigger asChild>
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost" 
                                                        className="h-7 w-7 p-0 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors duration-200 cursor-pointer" 
                                                        aria-label="Pick a date"
                                                    >
                                                        <CalendarIcon className="h-4 w-4 transition-colors duration-200" />
                                                    </Button>
                                                </PopoverTrigger>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar 
                                            mode="single" 
                                            selected={tryParseDate(form.watch("endDateString") ?? '') || undefined} 
                                            onSelect={onSelectEndDate} 
                                            initialFocus 
                                            locale={currentLocale}
                                            defaultMonth={tryParseDate(form.watch("endDateString") ?? '') || tryParseDate(form.watch("startDateString") ?? '') || new Date()}
                                            disabled={(date) => { 
                                                const startDate = tryParseDate(form.watch("startDateString") ?? ''); 
                                                return startDate ? date < startDate : false; 
                                            }} 
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage className="text-xs mt-1 error-message">{form.formState.errors.endDateString?.message}</FormMessage>
                            </FormItem>
                        )} 
                    />
                </div>
                <FormField 
                    control={form.control} 
                    name="includeEndDate" 
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel htmlFor="includeEndDate" className="text-base">{t('InvoiceForm.includeEndDateLabel')}</FormLabel>
                                <FormDescription>{t('InvoiceForm.includeEndDateDescription')}</FormDescription>
                            </div>
                            <FormControl>
                                <div className="flex items-center border-none outline-none">
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        id="includeEndDate"
                                        name="includeEndDate"
                                    />
                                </div>
                            </FormControl>
                        </FormItem>
                    )} 
                />
                <FormField 
                    control={form.control} 
                    name="splitPeriod" 
                    render={({ field }) => (
                        <FormItem className="flex flex-col items-start justify-start rounded-lg border p-4">
                            <div className="space-y-0.5 pr-4 mb-3">
                                <FormLabel htmlFor="splitPeriod" className="text-base">{t('InvoiceForm.splitPeriodLabel', { defaultValue: 'Split Period' })}</FormLabel>
                                <FormDescription>{t('InvoiceForm.splitPeriodDescription', { defaultValue: 'Choose how to split the invoice amounts.' })}</FormDescription>
                            </div>
                            <div className="w-full">
                                <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                    value={field.value}
                                    name={field.name}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full" id="splitPeriod">
                                            <SelectValue placeholder={t('InvoiceForm.periodYearly', { defaultValue: 'Yearly' })} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent 
                                        className="!fixed !z-[9999] !overflow-visible shadow-lg" 
                                        position="popper" 
                                        sideOffset={8}
                                        align="center"
                                        avoidCollisions
                                        collisionPadding={20}
                                    >
                                        <SelectItem 
                                            key="yearly" 
                                            value="yearly" 
                                            className="select-dropdown-item !cursor-pointer"
                                            style={{cursor: 'pointer'}}
                                        >
                                            {`${t('InvoiceForm.periodYearly', { defaultValue: 'Yearly' })}`}
                                        </SelectItem>
                                        <SelectItem 
                                            key="quarterly" 
                                            value="quarterly" 
                                            className="select-dropdown-item !cursor-pointer"
                                            style={{cursor: 'pointer'}}
                                        >
                                            {`${t('InvoiceForm.periodQuarterly', { defaultValue: 'Quarterly' })}`}
                                        </SelectItem>
                                        <SelectItem 
                                            key="monthly" 
                                            value="monthly" 
                                            className="select-dropdown-item !cursor-pointer"
                                            style={{cursor: 'pointer'}}
                                        >
                                            {`${t('InvoiceForm.periodMonthly', { defaultValue: 'Monthly' })}`}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )} 
                />
                <div className="space-y-5 rounded-lg border p-6 shadow-xs">
                    <h3 className="text-base font-medium" id="amounts-section-label">{t('InvoiceForm.amountsLabel')}</h3>
                    <FormDescription>{t('InvoiceForm.amountsDescription')}</FormDescription>
                    <div aria-labelledby="amounts-section-label" className="space-y-4 mt-4">
                    {fields.map((item, index) => (
                        <FormField 
                            control={form.control} 
                            key={item.id} 
                            name={`amounts.${index}.value`} 
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <div className="flex flex-col gap-1">
                                        <FormLabel htmlFor={`amount-${index}`} className="text-sm font-medium">#{index + 1}</FormLabel>
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        step="any" 
                                                        className="focus:border-primary focus:ring-2 focus:ring-primary/20 transition-transform duration-150 pr-8" 
                                                        {...field} 
                                                        id={`amount-${index}`}
                                                        name={`amounts.${index}.value`}
                                                    />
                                                </FormControl>
                                                <div className="absolute right-2 top-0 h-full flex items-center justify-center z-[1]">
                                                    {field.value && !isNaN(parseFloat(field.value)) && parseFloat(field.value) > 0 && (
                                                        <div className="flex items-center justify-center h-5 w-5">
                                                            <CheckCircle className="h-4 w-4 text-success" />
                                                        </div>
                                                    )}
                                                    {form.formState.errors.amounts?.[index]?.value && (
                                                        <div className="flex items-center justify-center h-5 w-5">
                                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {fields.length > 1 && (
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => remove(index)} 
                                                    className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all duration-200 shrink-0" 
                                                    aria-label="Remove amount"
                                                >
                                                    <XCircle className="h-4 w-4 transition-transform duration-150 hover:scale-95" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <FormMessage className="text-xs mt-1 error-message" />
                                </FormItem>
                            )} 
                        />
                    ))}
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => { 
                            append({ value: "" }); 
                            setTimeout(() => { 
                                const ni = document.querySelectorAll('input[type="number"]'); 
                                if (ni.length > 0) (ni[ni.length - 1] as HTMLInputElement).focus(); 
                            }, 10); 
                        }} 
                        className="mt-4"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> {t('InvoiceForm.addAmountButton')}
                    </Button>
                    {form.formState.errors.amounts && !form.formState.errors.amounts.root && form.formState.errors.amounts.message && (
                        <p className="text-sm font-medium text-destructive">{form.formState.errors.amounts.message}</p>
                    )}
                    {form.formState.errors.amounts?.root?.message && (
                        <p className="text-sm font-medium text-destructive">{form.formState.errors.amounts.root.message}</p>
                    )}
                    </div>
                </div>
                <Button 
                    type="submit" 
                    variant="default"
                    className={`w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] px-6 py-2 h-11 font-medium rounded-md shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 ${showSuccessGlow ? 'animate-success-glow' : ''}`}
                    disabled={form.formState.isSubmitting || isCalculating}
                    aria-live="polite"
                >
                    {isCalculating ? (
                        <span className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {buttonText}
                        </span>
                    ) : (
                        buttonText
                    )}
                </Button>
            </form>
        </FormProvider>
    );
}

// Need to wrap with TooltipProvider at a higher level if using tooltips inside 
