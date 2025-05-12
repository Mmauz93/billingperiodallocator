"use client";

import { AlertCircle, CalendarIcon, CheckCircle, Loader2, PlusCircle, XCircle } from "lucide-react";
import { CalculationInput, CalculationResult, calculateInvoiceSplit } from "@/lib/calculations";
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
import { cn, safeText } from "@/lib/utils";
import { de, enUS } from 'date-fns/locale';
import { format, isValid, parse, startOfDay } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { debounce } from 'lodash';
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

    // Trim the input
    const trimmedValue = value.trim();
    
    // Basic format check before attempting parsing - require separators
    const hasDateSeparators = /[\.\-\/]/.test(trimmedValue);
    if (!hasDateSeparators) {
        return null;
    }
    
    // Validate against common date patterns to ensure complete dates
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

    return null;
};

// Update CalculationInput type to include splitPeriod
declare module '@/lib/calculations' {
    interface CalculationInput {
        splitPeriod?: 'yearly' | 'quarterly' | 'monthly';
    }
}

// Define the error type to match invoice-calculator-client.tsx
type CalculationErrorType = string | Error | { message?: string; [key: string]: unknown } | null | undefined;

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
        defaultValues: {
            startDateString: '',
            endDateString: '',
            includeEndDate: true,
            splitPeriod: 'yearly' as const,
            amounts: [{ value: '' }]
        },
        mode: "onBlur",
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "amounts"
    });

    // MOVED: Debounced function to save data to localStorage (BEFORE the effects that use it)
    const debouncedSaveFunction = useMemo(
        () => debounce((dataToSave: FormSchemaType) => {
            if (mounted) {
                try {
                    // Don't save during initial load or auto-submit
                    if (initRef.current) {
                        const amountsToSave = dataToSave.amounts?.length > 0
                            ? dataToSave.amounts
                            : [{ value: '' }];
                        const saveData = { ...dataToSave, amounts: amountsToSave };
                        
                        console.log("[InvoiceForm] Saving form data to localStorage:", saveData);
                        localStorage.setItem(storageKey, JSON.stringify(saveData));
                    }
                } catch (error) {
                    console.error("[InvoiceForm] Failed to save form data to localStorage:", error);
                }
            }
        }, 500),
        [mounted] // Only depends on mounted state
    );
    
    // Effect to trigger debounced save when form values change
    const watchedFields = useWatch({ control: form.control });
    useEffect(() => {
        if (mounted) {
            debouncedSaveFunction(form.getValues());
        }
    }, [watchedFields, debouncedSaveFunction, form, mounted]);
    
    // Cleanup function in a separate effect
    useEffect(() => {
        return () => {
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
        if (!startDate || !endDate) {
            onCalculateAction(null, null, t('Errors.unexpectedError')); 
            setIsCalculating(false);
            setButtonText(t('InvoiceForm.calculateButton', { defaultValue: 'Calculate Split' }));
            return; 
        }
        const amountsNum = values.amounts.map(amount => Number(amount.value));
        const splitPeriod = values.splitPeriod || 'yearly';
        const validFormData: CalculationCallbackData = {
            startDate, endDate, includeEndDate: values.includeEndDate, splitPeriod, amounts: amountsNum,
        };
        onCalculateAction(validFormData, null, undefined);
        const calculationInput: CalculationInput = {
            startDate, endDate, includeEndDate: values.includeEndDate, amounts: amountsNum, splitPeriod,
        };
        try {
            const results = calculateInvoiceSplit(calculationInput);
            setTimeout(() => {
                if (results.calculationSteps?.error) {
                    onCalculateAction(validFormData, null, safeText(results.calculationSteps.error));
                } else if (!results.aggregatedSplits || results.aggregatedSplits.length === 0) {
                    onCalculateAction(validFormData, null, "Calculation completed but resulted in no splits.");
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
            }, 300);
        } catch (error) {
            // Improved error handling to properly format errors
            let errorMessage: CalculationErrorType;
            
            if (error instanceof Error) {
                // Use Error object directly, don't convert to string
                errorMessage = error;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error && typeof error === 'object') {
                // Pass the object as is, let the parent component handle stringification
                errorMessage = error as { [key: string]: unknown };
            } else {
                // Fallback for unknown error types
                errorMessage = t('Errors.unexpectedError');
            }
            
            onCalculateAction(validFormData, null, errorMessage);
            setTimeout(() => {
                setIsCalculating(false);
                setButtonText(t('InvoiceForm.calculateButton', { defaultValue: 'Calculate Split' }));
            }, 300);
        }
    }, [t, onCalculateAction, setIsCalculating, setButtonText, setShowSuccessGlow]);

    // Effect for Initial Data Loading - ONE EFFECT TO RULE THEM ALL
    useEffect(() => {
        // Set mounted state and button text
        if (!mounted) {
            setMounted(true);
            setButtonText(t('InvoiceForm.calculateButton', { defaultValue: 'Calculate Split' }));
            console.log("[InvoiceForm] Component mounted");
        }

        console.log("[InvoiceForm] Initializing form data...", { initialDemoData });
        let autoSubmit = false;

        // 1. If initialDemoData is provided, use it with highest priority
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
            try {
                console.log("[InvoiceForm] Saving demo data to localStorage:", demoFormData);
                localStorage.setItem(storageKey, JSON.stringify(demoFormData));
            } catch (error) {
                console.error("[InvoiceForm] Error saving demo data to localStorage:", error);
            }
            
            // Notify parent that demo data was processed
            if (onDemoDataApplied) {
                console.log("[InvoiceForm] Notifying parent that demo data was applied");
                onDemoDataApplied();
            }
            
            autoSubmit = true;
            // Mark as initialized to prevent further loading from cache
            initRef.current = true;
        } 
        // Only try to load from cache if we haven't loaded demo data
        else if (!initRef.current) {
            initRef.current = true; // Mark as initialized
            
            // 2. Check for clean URL parameter
            const urlParams = new URLSearchParams(window.location.search);
            const forceClean = urlParams.get('clean') === 'true';
            
            if (forceClean) {
                console.log("[InvoiceForm] 'clean=true' parameter detected, clearing cache");
                localStorage.removeItem(storageKey);
                form.reset({
                    startDateString: '',
                    endDateString: '',
                    includeEndDate: true,
                    splitPeriod: 'yearly' as const,
                    amounts: [{ value: '' }]
                });
            } 
            // 3. Otherwise try loading from cache
            else {
                const cachedDataString = localStorage.getItem(storageKey);
                if (cachedDataString) {
                    console.log("[InvoiceForm] Loading data from localStorage cache:", cachedDataString);
                    try {
                        const parsedCache = JSON.parse(cachedDataString) as FormSchemaType;
                        if (!parsedCache.amounts || parsedCache.amounts.length === 0) {
                            parsedCache.amounts = [{ value: '' }];
                        }
                        form.reset(parsedCache);
                    } catch (error) {
                        console.error("[InvoiceForm] Error parsing cached data:", error);
                        localStorage.removeItem(storageKey);
                        form.reset({
                            startDateString: '',
                            endDateString: '',
                            includeEndDate: true,
                            splitPeriod: 'yearly' as const,
                            amounts: [{ value: '' }]
                        });
                    }
                } else {
                    console.log("[InvoiceForm] No cached data found, using defaults");
                    form.reset({
                        startDateString: '',
                        endDateString: '',
                        includeEndDate: true,
                        splitPeriod: 'yearly' as const,
                        amounts: [{ value: '' }]
                    });
                }
            }
        }
        
        // Auto-submit if using demo data
        if (autoSubmit) {
            console.log("[InvoiceForm] Scheduling auto-submit");
            const timer = setTimeout(() => {
                form.trigger().then(isValid => {
                    if (isValid) {
                        console.log("[InvoiceForm] Form is valid, auto-submitting");
                        form.handleSubmit(onSubmit)();
                    } else {
                        console.warn("[InvoiceForm] Auto-submit cancelled - validation failed:", form.formState.errors);
                    }
                });
            }, 350);
            
            return () => clearTimeout(timer);
        }
        
    // Include initialDemoData in dependencies so this effect re-runs when it changes
    }, [t, onSubmit, initialDemoData, onDemoDataApplied, form, mounted]);
    
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
        form.setValue("startDateString", value, { shouldValidate: true });
        form.trigger("startDateString").then(() => {
            const parsedDate = tryParseDate(value);
            if (value && !parsedDate) {
                form.setError("startDateString", {
                    type: "manual",
                    message: getDateHelpText()
                });
            }
        });
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        form.setValue("endDateString", value, { shouldValidate: false });
        const parsedDate = tryParseDate(value);
        const startDateValue = form.getValues("startDateString") || '';
        const startDate = tryParseDate(startDateValue);
        form.clearErrors("endDateString");
        if (value && !parsedDate) {
            form.setError("endDateString", {
                type: "manual",
                message: getDateHelpText()
            });
        } 
        else if (parsedDate && startDate && parsedDate < startDate) {
            form.setError("endDateString", {
                type: "manual",
                message: t('InvoiceForm.errorEndDateBeforeStart')
            });
        }
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
                                                className={`w-full pr-10 ${form.formState.errors.startDateString ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20" : ""}`} 
                                                autoFocus 
                                                id="startDateString"
                                                name="startDateString"
                                            />
                                            {field.value && !form.formState.errors.startDateString && (
                                                <div className="absolute inset-y-0 right-10 flex items-center z-[1]">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                </div>
                                            )}
                                            {form.formState.errors.startDateString && (
                                                <div className="absolute inset-y-0 right-10 flex items-center z-[1]">
                                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                                </div>
                                            )}
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-[1]">
                                                <PopoverTrigger asChild>
                                                    <Button type="button" variant="ghost" className="h-7 w-7 p-0" aria-label="Pick a date">
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
                                <FormMessage className="text-xs mt-1">{form.formState.errors.startDateString?.message}</FormMessage>
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
                                                className={`w-full pr-10 ${form.formState.errors.endDateString ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20" : ""}`} 
                                                id="endDateString"
                                                name="endDateString"
                                            />
                                            {field.value && !form.formState.errors.endDateString && (
                                                <div className="absolute inset-y-0 right-10 flex items-center z-[1]">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                </div>
                                            )}
                                            {form.formState.errors.endDateString && (
                                                <div className="absolute inset-y-0 right-10 flex items-center z-[1]">
                                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                                </div>
                                            )}
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-[1]">
                                                <PopoverTrigger asChild>
                                                    <Button type="button" variant="ghost" className="h-7 w-7 p-0" aria-label="Pick a date">
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
                                                const startDate = tryParseDate(form.watch("startDateString") ?? ''); 
                                                return startDate ? date < startDate : false; 
                                            }} 
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage className="text-xs mt-1">{form.formState.errors.endDateString?.message}</FormMessage>
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
                                <Switch 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange}
                                    id="includeEndDate"
                                    name="includeEndDate"
                                />
                            </FormControl>
                        </FormItem>
                    )} 
                />
                <FormField 
                    control={form.control} 
                    name="splitPeriod" 
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5 pr-4">
                                <FormLabel htmlFor="splitPeriod" className="text-base">{t('InvoiceForm.splitPeriodLabel', { defaultValue: 'Split Period' })}</FormLabel>
                                <FormDescription>{t('InvoiceForm.splitPeriodDescription', { defaultValue: 'Choose how to split the invoice amounts.' })}</FormDescription>
                            </div>
                            <div className="min-w-[120px]">
                                <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                    value={field.value}
                                    name={field.name}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full" id="splitPeriod">
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem key="yearly" value="yearly">
                                            {`${t('InvoiceForm.periodYearly', { defaultValue: 'Yearly' })}`}
                                        </SelectItem>
                                        <SelectItem key="quarterly" value="quarterly">
                                            {`${t('InvoiceForm.periodQuarterly', { defaultValue: 'Quarterly' })}`}
                                        </SelectItem>
                                        <SelectItem key="monthly" value="monthly">
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
                    disabled={form.formState.isSubmitting || isCalculating} 
                    className={`w-full bg-[#4a90e2] text-white hover:bg-[#4a90e2]/90 hover:scale-[1.02] px-6 py-2 h-11 font-medium rounded-md shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-[#4a90e2]/20 ${showSuccessGlow ? 'animate-success-glow' : ''}`}
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
