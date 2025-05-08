"use client";

import { AlertCircle, CalendarIcon, CheckCircle, Loader2, PlusCircle, XCircle } from "lucide-react"; // Removed Info import
import {
    FormLabel as BaseFormLabel,
    FormMessage as BaseFormMessage,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
} from "@/components/ui/form";
import { CalculationInput, CalculationResult, calculateInvoiceSplit } from "@/lib/calculations";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form"; // Import FormProvider and useFieldArray
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components
import { de, enUS } from 'date-fns/locale'; // Import locales
import { format, isValid, parse, startOfDay } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton import
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { debounce } from 'lodash'; // Re-add debounce
import { useTranslation } from 'react-i18next'; // Import hook
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Constants for date formats - Define all supported formats
const DATE_FORMAT_ISO = "yyyy-MM-dd";
const DATE_FORMAT_DE = "dd.MM.yyyy";
const DATE_FORMAT_US = "MM/dd/yyyy";
const DATE_FORMAT_DOTS = "dd.MM.yy";
const DATE_FORMAT_SLASHES = "MM/dd/yy";
const DATE_FORMAT_DASHES = "dd-MM-yyyy";

// List of all supported date formats for parsing
const supportedDateFormats = [
    DATE_FORMAT_ISO,    // yyyy-MM-dd
    DATE_FORMAT_DE,     // dd.MM.yyyy
    DATE_FORMAT_US,     // MM/dd/yyyy
    DATE_FORMAT_DOTS,   // dd.MM.yy
    DATE_FORMAT_SLASHES, // MM/dd/yy
    DATE_FORMAT_DASHES  // dd-MM-yyyy
];

// Function to try parsing a date string with multiple formats
const tryParseDate = (value: string): Date | null => {
    if (!value) return null;

    // Trim the input
    const trimmedValue = value.trim();
    
    // Basic format check before attempting parsing - require separators
    // This will reject inputs like "200000" that don't have date separators
    const hasDateSeparators = /[\.\-\/]/.test(trimmedValue);
    if (!hasDateSeparators) {
        return null;
    }
    
    // Validate against common date patterns to ensure complete dates
    // This enforces proper format with 4-digit years or complete date parts
    const validDatePattern = /^(\d{4}-\d{2}-\d{2}|\d{2}\.\d{2}\.\d{4}|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4})$/;
    if (!validDatePattern.test(trimmedValue)) {
        return null;
    }
    
    // Attempt parsing with supported formats
    for (const format of supportedDateFormats) {
        const attemptedParse = parse(trimmedValue, format, new Date());
        if (isValid(attemptedParse)) {
            return startOfDay(attemptedParse);
        }
    }

    // No JavaScript Date fallback - we only accept explicitly supported formats
    return null;
};

// Also update CalculationInput type to include splitPeriod if needed
declare module '@/lib/calculations' {
    interface CalculationInput {
        splitPeriod?: 'yearly' | 'quarterly' | 'monthly';
    }
}

// Updated Zod schema to include splitPeriod, removed default here
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

// FormData type now includes splitPeriod implicitly from schema inference
type FormSchemaType = z.infer<ReturnType<typeof formSchema>>;

// Updated CalculationCallbackData - includes splitPeriod
export type CalculationCallbackData = {
    startDate: Date;
    endDate: Date;
    includeEndDate: boolean;
    splitPeriod: 'yearly' | 'quarterly' | 'monthly';
    amounts: number[];
} | null;

interface InvoiceFormProps {
    // Allow null for the first argument if validation/parsing fails before calculation
    onCalculateAction: (formData: CalculationCallbackData, results: CalculationResult | null, error?: string) => void;
}

// Custom FormLabel that never turns red
const FormLabel = ({ children, ...props }: React.ComponentProps<typeof BaseFormLabel>) => (
    <BaseFormLabel {...props} style={{ color: 'var(--foreground)', fontWeight: 500 }}>
        {children}
    </BaseFormLabel>
);

// Custom FormMessage with improved error visibility and conditional rendering
const FormMessage = ({ className, ...props }: React.ComponentProps<typeof import("@/components/ui/form").FormMessage>) => {
    // Check if there is an actual error message
    const hasError = props.children && typeof props.children === 'string' && props.children.length > 0;
    
    // If no error, render nothing
    if (!hasError) {
        return null;
    }
    
    // If there is an error, render the message with styling
    return (
        <BaseFormMessage 
            className={cn(
                "pl-3 flex items-center", 
                "py-1 px-2 rounded text-destructive font-medium", // Only apply error styles
                className
            )}
            {...props} 
        >
            <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
            <span>{props.children}</span>
        </BaseFormMessage>
    );
};

export function InvoiceForm({ onCalculateAction }: InvoiceFormProps) {
    const { t, i18n } = useTranslation();
    const [mounted, setMounted] = useState(false); // Mounted state
    const [isCalculating, setIsCalculating] = useState(false); // Add loading state
    const [buttonText, setButtonText] = useState(''); // Dynamic button text
    const [showSuccessGlow, setShowSuccessGlow] = useState(false); // Success indicator

    // Add helper text function inside component
    const getDateHelpText = () => {
        if (i18n.language.startsWith('de')) {
            return t('InvoiceForm.supportedDateFormats', { defaultValue: 'Unterstützte Formate: TT.MM.JJJJ, JJJJ-MM-TT' });
        } else {
            return t('InvoiceForm.supportedDateFormats', { defaultValue: 'Supported formats: YYYY-MM-DD, DD.MM.YYYY' });
        }
    };

    const currentFormSchema = formSchema(t);
    
    // Determine date formats and locale based on i18n language - only for display and calendar
    const currentLocale = i18n.language.startsWith('de') ? de : enUS;
    const displayDateFormat = i18n.language.startsWith('de') ? DATE_FORMAT_DE : DATE_FORMAT_ISO;
    const dateExamplePlaceholder = i18n.language.startsWith('de') ? 'z.B. 31.12.2023' : 'e.g. 2023-12-31';
    
    const form = useForm<FormSchemaType>({
        resolver: zodResolver(currentFormSchema),
        defaultValues: {
            startDateString: '',
            endDateString: '',
            includeEndDate: true, // Set default to true
            splitPeriod: 'yearly' as const, // Default to yearly
            amounts: [{ value: '' }] // Start with one empty amount
        },
        mode: "onBlur", // Validate on blur to give immediate feedback
    });

    // Initialize button text on component mount
    useEffect(() => {
        if (mounted) {
            setButtonText(t('InvoiceForm.calculateButton', { defaultValue: 'Calculate Split' }));
        }
    }, [t, mounted]);

    // Wrap onSubmit in useCallback to prevent recreating the function on each render
    const onSubmit = useCallback((values: FormSchemaType) => {
        setIsCalculating(true);
        setButtonText(t('InvoiceForm.calculatingButton'));

        const startDate = tryParseDate(values.startDateString || '');
        const endDate = tryParseDate(values.endDateString || '');

        if (!startDate || !endDate) {
            console.error("Parsed dates are invalid despite passing Zod validation.");
            onCalculateAction(null, null, t('Errors.unexpectedError')); 
            setIsCalculating(false);
            // Reset button text correctly
            setButtonText(t('InvoiceForm.calculateButton', { defaultValue: 'Calculate Split' }));
            return; 
        }

        const amountsNum = values.amounts.map(amount => Number(amount.value));
        const splitPeriod = values.splitPeriod || 'yearly';

        const validFormData: CalculationCallbackData = {
            startDate: startDate,
            endDate: endDate,
            includeEndDate: values.includeEndDate,
            splitPeriod: splitPeriod,
            amounts: amountsNum,
        };

        onCalculateAction(validFormData, null, undefined); // Clear previous results/errors immediately

        const calculationInput: CalculationInput = {
            startDate: startDate,
            endDate: endDate,
            includeEndDate: values.includeEndDate,
            amounts: amountsNum,
            splitPeriod: splitPeriod,
        };

        console.log("Calculating with input:", calculationInput);

        try {
            const results = calculateInvoiceSplit(calculationInput);
            console.log("Calculation Results:", results);

            // Simulate a brief calculation delay for UX feedback
            setTimeout(() => {
                if (results.calculationSteps?.error) {
                    onCalculateAction(validFormData, null, results.calculationSteps.error);
                     setButtonText(t('InvoiceForm.calculateButton', { defaultValue: 'Calculate Split' }));
                } else if (!results.aggregatedSplits || results.aggregatedSplits.length === 0) {
                    onCalculateAction(validFormData, null, "Calculation completed but resulted in no splits.");
                    setButtonText(t('InvoiceForm.calculateButton', { defaultValue: 'Calculate Split' }));
                } else {
                    onCalculateAction(validFormData, results);
                    setButtonText(t('InvoiceForm.calculationComplete', { defaultValue: 'Split completed successfully!' }));
                    setShowSuccessGlow(true);
                    
                    setTimeout(() => {
                        setButtonText(t('InvoiceForm.calculateButton', { defaultValue: 'Calculate Split' }));
                        setShowSuccessGlow(false);
                    }, 2000);
                }
                setIsCalculating(false);
            }, 300); // Slightly shorter delay
            
        } catch (error) {
             console.error("Calculation Error:", error);
             const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during calculation.";
             // Pass validFormData even on error for context if needed
            onCalculateAction(validFormData, null, errorMessage);
            
            setTimeout(() => {
                setIsCalculating(false);
                setButtonText(t('InvoiceForm.calculateButton', { defaultValue: 'Calculate Split' }));
            }, 300);
        }
    }, [t, setIsCalculating, setButtonText, onCalculateAction, setShowSuccessGlow]);

    // Parse URL parameters for demo data when the component mounts
    useEffect(() => {
        // Only run on client side after mounting
        if (typeof window !== 'undefined' && mounted) {
            const params = new URLSearchParams(window.location.search);
            
            // Check if we have URL parameters to pre-fill the form
            const startDate = params.get('startDate');
            const endDate = params.get('endDate');
            const amount = params.get('amount');
            const includeEndDate = params.get('includeEndDate');
            const splitPeriod = params.get('splitPeriod');
            
            // Only pre-fill if we have at least some of the parameters
            if (startDate || endDate || amount) {
                // Format and set dates based on the current locale
                if (startDate) {
                    const parsedDate = tryParseDate(startDate);
                    if (parsedDate) {
                        const formattedDate = format(parsedDate, displayDateFormat);
                        form.setValue('startDateString', formattedDate);
                    }
                }
                
                if (endDate) {
                    const parsedDate = tryParseDate(endDate);
                    if (parsedDate) {
                        const formattedDate = format(parsedDate, displayDateFormat);
                        form.setValue('endDateString', formattedDate);
                    }
                }
                
                // Set include end date if provided
                if (includeEndDate) {
                    form.setValue('includeEndDate', includeEndDate === 'true');
                }
                
                // Set split period if provided and valid
                if (splitPeriod && ['yearly', 'quarterly', 'monthly'].includes(splitPeriod)) {
                    form.setValue('splitPeriod', splitPeriod as 'yearly' | 'quarterly' | 'monthly');
                }
                
                // Set amount if provided
                if (amount) {
                    const amountValue = amount.replace(/,/g, ''); // Remove any commas
                    form.setValue('amounts', [{ value: amountValue }]);
                }
                
                // Validate the form after setting values
                form.trigger();
                
                // Automatically submit the form with demo data after a short delay
                // to allow user to see the pre-filled values
                setTimeout(() => {
                    if (form.formState.isValid) {
                        form.handleSubmit(onSubmit)();
                    }
                }, 1000);
                
                // Clear URL parameters after pre-filling to avoid re-filling on refresh
                // Only if browser supports history API
                if (window.history && window.history.replaceState) {
                    const newUrl = window.location.pathname + window.location.hash;
                    window.history.replaceState({}, document.title, newUrl);
                }
            }
        }
    }, [mounted, form, displayDateFormat, onSubmit]);
    
    // --- Form Field Watching Logic ---
    // Create a watch subscription for fields we want to save
    const watchedFields = useWatch({
        control: form.control,
        name: ["startDateString", "endDateString", "includeEndDate", "amounts", "splitPeriod"]
    });

    // --- Session Storage Logic --- 
    const storageKey = 'invoiceFormDataCache';

    // Setup useFieldArray for amounts
    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "amounts"
    });

    // Effect to load data from sessionStorage on mount
    useEffect(() => {
        // Default values if no valid cache exists
        const defaultValues: FormSchemaType = {
            startDateString: undefined,
            endDateString: undefined,
            includeEndDate: false,
            splitPeriod: 'yearly',
            amounts: [{ value: "" }],
        };

        const savedData = sessionStorage.getItem(storageKey);
        let loadedSuccessfully = false;

        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                // Perform the same robust validation as before
                if (parsedData && 
                    typeof parsedData === 'object' && 
                    typeof parsedData.startDateString !== 'undefined' && 
                    typeof parsedData.endDateString !== 'undefined' && 
                    typeof parsedData.includeEndDate === 'boolean' &&
                    ['yearly', 'quarterly', 'monthly'].includes(parsedData.splitPeriod) && 
                    Array.isArray(parsedData.amounts) && 
                    parsedData.amounts.length > 0 && 
                    parsedData.amounts.every((a: { value: unknown }) => 
                        typeof a === 'object' && a !== null && typeof a.value === 'string'
                    )
                ) {
                    // Separate amounts from the rest of the data
                    const { amounts: cachedAmounts, ...restOfData } = parsedData as FormSchemaType;
                    
                    // Reset the main form fields first
                    form.reset(restOfData);
                    
                    // Then, specifically replace the amount fields
                    replace(cachedAmounts); 
                    
                    loadedSuccessfully = true;
                } else {
                    console.warn("Cached data structure is invalid, using defaults.");
                    sessionStorage.removeItem(storageKey); // Clear invalid data
                }
            } catch (error) {
                console.error("Failed to parse cached form data:", error);
                sessionStorage.removeItem(storageKey); // Clear invalid data
            }
        }
        
        // If loading failed, reset with default values
        if (!loadedSuccessfully) {
            form.reset(defaultValues);
            // Ensure useFieldArray is also reset if needed (replace with default)
            replace(defaultValues.amounts); 
        }
        
        setMounted(true); // Set mounted after resetting form
        setButtonText(t('InvoiceForm.calculateButton', { defaultValue: 'Calculate Split' }));
    }, [t, form, replace, onCalculateAction]); // Include all dependencies

    // Debounced function to save data to sessionStorage
    const saveToStorage = useMemo(() => 
        debounce((data: FormSchemaType) => {
            try {
                 // Only save if component is mounted to avoid saving initial undefined state
                 if (mounted) {
                     sessionStorage.setItem(storageKey, JSON.stringify(data));
                 }       
            } catch (error) {
                console.error("Failed to save form data to cache:", error);
            }
        }, 500), // Debounce saving by 500ms
    [mounted]); // Depend on mounted state

    // Use the memoized debounced function in a simple callback
    const debouncedSave = useCallback((dataToSave: FormSchemaType) => {
        saveToStorage(dataToSave);
    }, [saveToStorage]);

    // Effect to trigger debounced save when watched fields change
    useEffect(() => {
        // The watchedFields object itself changes on every render if amounts array changes.
        // Pass the current form values directly to ensure we save the latest state.
        debouncedSave(form.getValues());
    }, [watchedFields, debouncedSave, form]); // Depend on watched fields object and the save function
    // --- End Session Storage Logic ---

    // State for popover visibility
    const [isStartDatePopoverOpen, setIsStartDatePopoverOpen] = useState(false);
    const [isEndDatePopoverOpen, setIsEndDatePopoverOpen] = useState(false);

    // Removed effect for language change date reformatting for now to simplify
    // It might conflict with loading from session storage. Re-evaluate if needed.

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

    // Handlers for input changes to trigger validation immediately
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        form.setValue("startDateString", value, { shouldValidate: true });
        
        // Force trigger validation immediately and ensure the error is displayed
        form.trigger("startDateString").then(() => {
            // Check if date is valid and show visual feedback as user types
            const parsedDate = tryParseDate(value);
            if (value && !parsedDate) {
                // Show error immediately if format is invalid
                form.setError("startDateString", {
                    type: "manual",
                    message: getDateHelpText()
                });
            }
        });
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        form.setValue("endDateString", value, { shouldValidate: false }); // Don't validate yet
        
        // First check if the date is valid
        const parsedDate = tryParseDate(value);
        const startDateValue = form.getValues("startDateString") || ''; // Add default empty string
        const startDate = tryParseDate(startDateValue);
        
        // Clear previous errors before setting new ones
        form.clearErrors("endDateString");
        
        // Only proceed with validation if we have a valid date
        if (value && !parsedDate) {
            // Set error for invalid format
            form.setError("endDateString", {
                type: "manual",
                message: getDateHelpText()
            });
        } 
        // If both dates are valid, check if end date is before start date
        else if (parsedDate && startDate && parsedDate < startDate) {
            // Set error for end date before start date
            form.setError("endDateString", {
                type: "manual",
                message: t('InvoiceForm.errorEndDateBeforeStart')
            });
        }
        
        // Finally trigger validation to update form state
        form.trigger("endDateString");
    };

    // Render skeleton loader before mount
    if (!mounted) {
        return (
            <div className="space-y-6 animate-pulse">
                <Skeleton className="h-8 w-3/4 mb-8" /> {/* Title */}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <Skeleton className="h-4 w-1/4" /> {/* Label */}
                     <Skeleton className="h-10 w-full" /> {/* Input */}
                   </div>
                    <div className="space-y-2">
                     <Skeleton className="h-4 w-1/4" /> {/* Label */}
                     <Skeleton className="h-10 w-full" /> {/* Input */}
                   </div>
                </div>
                
                <Skeleton className="h-20 w-full p-4" /> {/* Switch */}
                <Skeleton className="h-20 w-full p-4" /> {/* Select */}

                <div className="space-y-5 rounded-lg border p-6 shadow-xs">
                  <Skeleton className="h-5 w-1/3 mb-2" /> {/* Label */}
                  <Skeleton className="h-4 w-3/4 mb-4" /> {/* Description */}
                   <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="h-10 flex-1" /> {/* Amount Input */}
                        <Skeleton className="h-8 w-8" /> {/* Remove Button placeholder */}
                    </div>
                  <Skeleton className="h-9 w-36" /> {/* Add Amount Button */}
                </div>
              
                <Skeleton className="h-11 w-full" /> {/* Submit Button */}
            </div>
        );
    }

    // Render full form after mount with fade-in
    return (
        <FormProvider {...form}>
            {/* Apply fade-in transition based on mounted state */}
            <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className={cn(
                    "space-y-6",
                    "opacity-0 transition-opacity duration-500 ease-in-out", // Base opacity and transition
                    mounted && "opacity-100" // Fade in when mounted
                )}
            >
                <div>
                    <h2 className="text-xl font-semibold mb-8">{t('InvoiceForm.title')}</h2>
                </div>
                
                {/* Date Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Start Date Field */}
                    <FormField
                        control={form.control}
                        name="startDateString"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>
                                    {t('InvoiceForm.startDateLabel')}
                                </FormLabel>
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
                                                className={`w-full pr-10 ${
                                                    form.formState.errors.startDateString 
                                                    ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20" 
                                                    : ""
                                                }`}
                                                autoFocus
                                            />
                                            {field.value && !form.formState.errors.startDateString && (
                                                <div className="absolute inset-y-0 right-10 flex items-center">
                                                    <CheckCircle className="h-4 w-4 text-green-500" /> 
                                                </div>
                                            )}
                                            {form.formState.errors.startDateString && (
                                                <div className="absolute inset-y-0 right-10 flex items-center">
                                                    <AlertCircle className="h-4 w-4 text-destructive" /> 
                                                </div>
                                            )}
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <PopoverTrigger asChild>
                                                    <Button 
                                                        type="button"
                                                        variant="ghost" 
                                                        className="h-7 w-7 p-0" 
                                                        aria-label="Pick a date"
                                                    >
                                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
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
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage className="text-xs mt-1">
                                    {form.formState.errors.startDateString?.message}
                                </FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* End Date Field */}
                    <FormField
                         control={form.control}
                         name="endDateString"
                         render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>
                                    {t('InvoiceForm.endDateLabel')}
                                </FormLabel>
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
                                                className={`w-full pr-10 ${
                                                    form.formState.errors.endDateString 
                                                    ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20" 
                                                    : ""
                                                }`}
                                            />
                                            {field.value && !form.formState.errors.endDateString && (
                                                <div className="absolute inset-y-0 right-10 flex items-center">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                </div>
                                            )}
                                            {form.formState.errors.endDateString && (
                                                <div className="absolute inset-y-0 right-10 flex items-center">
                                                    <AlertCircle className="h-4 w-4 text-destructive" /> 
                                                </div>
                                            )}
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <PopoverTrigger asChild>
                                                    <Button 
                                                        type="button"
                                                        variant="ghost" 
                                                        className="h-7 w-7 p-0" 
                                                        aria-label="Pick a date"
                                                    >
                                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
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
                                            disabled={(date) => {
                                                // Ensure we pass string or empty string to tryParseDate
                                                const startDate = tryParseDate(form.watch("startDateString") ?? '');
                                                return startDate ? date < startDate : false;
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage className="text-xs mt-1">
                                    {form.formState.errors.endDateString?.message}
                                </FormMessage>
                            </FormItem>
                         )}
                     />
                </div>

                {/* Include Final Day Switch - Should be first */}
                <FormField
                    control={form.control}
                    name="includeEndDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    {t('InvoiceForm.includeEndDateLabel')}
                                </FormLabel>
                                <FormDescription>
                                    {t('InvoiceForm.includeEndDateDescription')}
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                
                {/* Split Period Selection using Select - Updated Items */}
                <FormField
                    control={form.control}
                    name="splitPeriod" 
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5 pr-4">
                                <FormLabel className="text-base">{t('InvoiceForm.splitPeriodLabel', { defaultValue: 'Split Period' })}</FormLabel>
                                <FormDescription>{t('InvoiceForm.splitPeriodDescription', { defaultValue: 'Choose how to split the invoice amounts.' })}</FormDescription>
                            </div>
                            <div className="min-w-[120px]"> 
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full"> 
                                            <SelectValue placeholder={t('InvoiceForm.selectPeriodPlaceholder', { defaultValue: "Select..."})} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="yearly">{t('InvoiceForm.periodYearly', { defaultValue: 'Yearly' })}</SelectItem>
                                        <SelectItem value="quarterly">{t('InvoiceForm.periodQuarterly', { defaultValue: 'Quarterly' })}</SelectItem>
                                        <SelectItem value="monthly">{t('InvoiceForm.periodMonthly', { defaultValue: 'Monthly' })}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage /> 
                            </div>
                        </FormItem>
                    )}
                />

                {/* Dynamic Amount Fields Section */}
                <div className="space-y-5 rounded-lg border p-6 shadow-xs">
                  <FormLabel className="text-base">{t('InvoiceForm.amountsLabel')}</FormLabel>
                  <FormDescription>{t('InvoiceForm.amountsDescription')}</FormDescription>
                 {fields.map((item, index) => (
                     <FormField
                         control={form.control}
                         key={item.id}
                         name={`amounts.${index}.value`}
                         render={({ field }) => (
                            <FormItem className="mb-3">
                                 <div className="flex flex-col gap-1">
                                     <FormLabel className="text-sm font-medium">
                                         #{index + 1}
                                     </FormLabel>
                                     <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    className="focus:border-primary focus:ring-2 focus:ring-primary/20 transition-transform duration-150 pr-8"
                                                    {...field}
                                                />
                                            </FormControl>
                                            {/* Validation indicator */}
                                            <div className="absolute right-2 top-0 h-full flex items-center justify-center">
                                                {field.value && !isNaN(parseFloat(field.value)) && parseFloat(field.value) > 0 && (
                                                    <div className="flex items-center justify-center h-5 w-5">
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
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
                                 <FormMessage />
                            </FormItem>
                         )}
                     />
                 ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => {
                        append({ value: "" });
                        // Focus the new input after a short delay
                        setTimeout(() => {
                            const newInputs = document.querySelectorAll('input[type="number"]');
                            if (newInputs.length > 0) {
                                (newInputs[newInputs.length - 1] as HTMLInputElement).focus();
                            }
                        }, 10);
                    }} className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" /> {t('InvoiceForm.addAmountButton')}
              </Button>
              {/* Display top-level error message for the amounts array */}
              {form.formState.errors.amounts && !form.formState.errors.amounts.root && form.formState.errors.amounts.message && (
                <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.amounts.message}
                </p>
                )}
                  {/* Display root error if exists (e.g., min length) */}
                  {form.formState.errors.amounts?.root?.message && (
                   <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.amounts.root.message}
                   </p>
               )}
            </div>
              
            {/* Submit Button */}
            <Button 
                type="submit" 
                disabled={form.formState.isSubmitting || isCalculating}
                className={`w-full bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] px-6 py-2 h-11 font-medium rounded-md shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 ${showSuccessGlow ? 'animate-success-glow' : ''}`}
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
