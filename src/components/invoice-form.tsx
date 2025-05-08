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
    const [mounted, setMounted] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [buttonText, setButtonText] = useState('');
    const [showSuccessGlow, setShowSuccessGlow] = useState(false);

    const currentLocale = i18n.language.startsWith('de') ? de : enUS;
    const displayDateFormat = i18n.language.startsWith('de') ? DATE_FORMAT_DE : DATE_FORMAT_ISO;
    const dateExamplePlaceholder = i18n.language.startsWith('de') ? 'z.B. 31.12.2023' : 'e.g. 2023-12-31';
    const storageKey = 'invoiceFormDataCache';
    
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
                    onCalculateAction(validFormData, null, results.calculationSteps.error);
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
             const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during calculation.";
            onCalculateAction(validFormData, null, errorMessage);
            setTimeout(() => {
                setIsCalculating(false);
                setButtonText(t('InvoiceForm.calculateButton', { defaultValue: 'Calculate Split' }));
            }, 300);
        }
    }, [t, onCalculateAction, setIsCalculating, setButtonText, setShowSuccessGlow]);

    // Effect for Initial Data Loading (URL Params > Session Storage > Defaults)
    useEffect(() => {
        if (typeof window === 'undefined' || mounted) {
            return; // Run only once on the client after initial mount
        }

        const params = new URLSearchParams(window.location.search);
        const demoStartDateParam = params.get('startDate');
        const demoEndDateParam = params.get('endDate');
        const demoAmountParam = params.get('amount');

        if (demoStartDateParam && demoEndDateParam && demoAmountParam) {
            const demoValues: Partial<FormSchemaType> = {
                includeEndDate: params.get('includeEndDate') === 'true',
                splitPeriod: (params.get('splitPeriod') as FormSchemaType['splitPeriod']) || 'yearly',
                amounts: [{ value: demoAmountParam.replace(/,/g, '') }]
            };

            const parsedStartDate = tryParseDate(demoStartDateParam);
            if (parsedStartDate) {
                demoValues.startDateString = format(parsedStartDate, displayDateFormat);
            }
            const parsedEndDate = tryParseDate(demoEndDateParam);
            if (parsedEndDate) {
                demoValues.endDateString = format(parsedEndDate, displayDateFormat);
            }
            
            // Construct the full object for reset to ensure all fields are considered
            const fullDemoValues: FormSchemaType = {
                startDateString: demoValues.startDateString || '',
                endDateString: demoValues.endDateString || '',
                includeEndDate: demoValues.includeEndDate !== undefined ? demoValues.includeEndDate : true,
                splitPeriod: demoValues.splitPeriod || 'yearly',
                amounts: demoValues.amounts || [{value: ''}]
            };

            form.reset(fullDemoValues);
            sessionStorage.setItem(storageKey, JSON.stringify(fullDemoValues));

            form.trigger().then((isValidAfterTrigger) => {
                if (isValidAfterTrigger) {
                    setTimeout(() => {
                        if (form.formState.isValid) form.handleSubmit(onSubmit)();
                    }, 500);
                }
            });

            if (window.history && window.history.replaceState) {
                const newUrl = window.location.pathname + window.location.hash;
                window.history.replaceState({}, document.title, newUrl);
            }
        } else {
            const savedData = sessionStorage.getItem(storageKey);
            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData) as FormSchemaType;
                    form.reset(parsedData);
                } catch (error) {
                    console.error("Failed to parse cached form data:", error);
                    sessionStorage.removeItem(storageKey);
                }
            }
        }
        setMounted(true);
        setButtonText(t('InvoiceForm.calculateButton', { defaultValue: 'Calculate Split' }));

    }, [form, displayDateFormat, onSubmit, t, storageKey, mounted]);

    // Debounced function to save data to sessionStorage upon user changes
    // Use useMemo to create a stable debounced function instance
    const debouncedSaveFunction = useMemo(
        () => debounce((dataToSave: FormSchemaType) => {
            // Dependencies: mounted, storageKey
            if (mounted) { 
                try {
                    sessionStorage.setItem(storageKey, JSON.stringify(dataToSave));
                } catch (error) {
                    console.error("Failed to save form data to cache:", error);
                }
            }
        }, 500),
        [mounted, storageKey] // Dependencies for the useMemo hook
    );

    // Effect to trigger debounced save when form values change by user interaction
    const watchedFields = useWatch({ control: form.control }); // Watch all fields
    useEffect(() => {
        if (mounted) { // Ensure initial load doesn't immediately overwrite session from defaults if no demo/session data found
            // Call the memoized debounced function
            debouncedSaveFunction(form.getValues());
        }
    // Use the stable debouncedSaveFunction in the dependency array
    }, [watchedFields, debouncedSaveFunction, form, mounted]);
    
    // State for popover visibility
    const [isStartDatePopoverOpen, setIsStartDatePopoverOpen] = useState(false);
    const [isEndDatePopoverOpen, setIsEndDatePopoverOpen] = useState(false);

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
                    <FormField control={form.control} name="startDateString" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>{t('InvoiceForm.startDateLabel')}</FormLabel><Popover open={isStartDatePopoverOpen} onOpenChange={setIsStartDatePopoverOpen}><FormControl><div className="w-full relative"><Input value={field.value} onChange={(e) => { field.onChange(e); handleStartDateChange(e); }} onBlur={() => form.trigger("startDateString")} placeholder={dateExamplePlaceholder} className={`w-full pr-10 ${form.formState.errors.startDateString ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20" : ""}`} autoFocus />{field.value && !form.formState.errors.startDateString && (<div className="absolute inset-y-0 right-10 flex items-center"><CheckCircle className="h-4 w-4 text-green-500" /></div>)}{form.formState.errors.startDateString && (<div className="absolute inset-y-0 right-10 flex items-center"><AlertCircle className="h-4 w-4 text-destructive" /></div>)}<div className="absolute inset-y-0 right-0 pr-3 flex items-center"><PopoverTrigger asChild><Button type="button" variant="ghost" className="h-7 w-7 p-0" aria-label="Pick a date"><CalendarIcon className="h-4 w-4 text-muted-foreground" /></Button></PopoverTrigger></div></div></FormControl><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={tryParseDate(form.watch("startDateString") ?? '') || undefined} onSelect={onSelectStartDate} initialFocus locale={currentLocale} /></PopoverContent></Popover><FormMessage className="text-xs mt-1">{form.formState.errors.startDateString?.message}</FormMessage></FormItem>)} />
                    <FormField control={form.control} name="endDateString" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>{t('InvoiceForm.endDateLabel')}</FormLabel><Popover open={isEndDatePopoverOpen} onOpenChange={setIsEndDatePopoverOpen}><FormControl><div className="w-full relative"><Input value={field.value} onChange={(e) => { field.onChange(e); handleEndDateChange(e); }} onBlur={() => form.trigger("endDateString")} placeholder={dateExamplePlaceholder} className={`w-full pr-10 ${form.formState.errors.endDateString ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20" : ""}`} />{field.value && !form.formState.errors.endDateString && (<div className="absolute inset-y-0 right-10 flex items-center"><CheckCircle className="h-4 w-4 text-green-500" /></div>)}{form.formState.errors.endDateString && (<div className="absolute inset-y-0 right-10 flex items-center"><AlertCircle className="h-4 w-4 text-destructive" /></div>)}<div className="absolute inset-y-0 right-0 pr-3 flex items-center"><PopoverTrigger asChild><Button type="button" variant="ghost" className="h-7 w-7 p-0" aria-label="Pick a date"><CalendarIcon className="h-4 w-4 text-muted-foreground" /></Button></PopoverTrigger></div></div></FormControl><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={tryParseDate(form.watch("endDateString") ?? '') || undefined} onSelect={onSelectEndDate} initialFocus locale={currentLocale} disabled={(date) => { const startDate = tryParseDate(form.watch("startDateString") ?? ''); return startDate ? date < startDate : false; }} /></PopoverContent></Popover><FormMessage className="text-xs mt-1">{form.formState.errors.endDateString?.message}</FormMessage></FormItem>)} />
                </div>
                <FormField control={form.control} name="includeEndDate" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel className="text-base">{t('InvoiceForm.includeEndDateLabel')}</FormLabel><FormDescription>{t('InvoiceForm.includeEndDateDescription')}</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="splitPeriod" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5 pr-4"><FormLabel className="text-base">{t('InvoiceForm.splitPeriodLabel', { defaultValue: 'Split Period' })}</FormLabel><FormDescription>{t('InvoiceForm.splitPeriodDescription', { defaultValue: 'Choose how to split the invoice amounts.' })}</FormDescription></div><div className="min-w-[120px]"><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder={t('InvoiceForm.selectPeriodPlaceholder', { defaultValue: "Select..."})} /></SelectTrigger></FormControl><SelectContent><SelectItem value="yearly">{t('InvoiceForm.periodYearly', { defaultValue: 'Yearly' })}</SelectItem><SelectItem value="quarterly">{t('InvoiceForm.periodQuarterly', { defaultValue: 'Quarterly' })}</SelectItem><SelectItem value="monthly">{t('InvoiceForm.periodMonthly', { defaultValue: 'Monthly' })}</SelectItem></SelectContent></Select><FormMessage /></div></FormItem>)} />
                <div className="space-y-5 rounded-lg border p-6 shadow-xs">
                  <FormLabel className="text-base">{t('InvoiceForm.amountsLabel')}</FormLabel>
                  <FormDescription>{t('InvoiceForm.amountsDescription')}</FormDescription>
                 {fields.map((item, index) => (<FormField control={form.control} key={item.id} name={`amounts.${index}.value`} render={({ field }) => (<FormItem className="mb-3"><div className="flex flex-col gap-1"><FormLabel className="text-sm font-medium">#{index + 1}</FormLabel><div className="flex items-center gap-2"><div className="relative flex-1"><FormControl><Input type="number" step="any" className="focus:border-primary focus:ring-2 focus:ring-primary/20 transition-transform duration-150 pr-8" {...field} /></FormControl><div className="absolute right-2 top-0 h-full flex items-center justify-center">{field.value && !isNaN(parseFloat(field.value)) && parseFloat(field.value) > 0 && (<div className="flex items-center justify-center h-5 w-5"><CheckCircle className="h-4 w-4 text-green-500" /></div>)}{form.formState.errors.amounts?.[index]?.value && (<div className="flex items-center justify-center h-5 w-5"><AlertCircle className="h-4 w-4 text-destructive" /></div>)}</div></div>{fields.length > 1 && (<Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all duration-200 shrink-0" aria-label="Remove amount"><XCircle className="h-4 w-4 transition-transform duration-150 hover:scale-95" /></Button>)}</div></div><FormMessage /></FormItem>)} />))}
                    <Button type="button" variant="outline" size="sm" onClick={() => { append({ value: "" }); setTimeout(() => { const ni = document.querySelectorAll('input[type="number"]'); if (ni.length > 0) (ni[ni.length - 1] as HTMLInputElement).focus(); }, 10); }} className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" /> {t('InvoiceForm.addAmountButton')}
              </Button>
              {form.formState.errors.amounts && !form.formState.errors.amounts.root && form.formState.errors.amounts.message && (<p className="text-sm font-medium text-destructive">{form.formState.errors.amounts.message}</p>)}
              {form.formState.errors.amounts?.root?.message && (<p className="text-sm font-medium text-destructive">{form.formState.errors.amounts.root.message}</p>)}
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting || isCalculating} className={`w-full bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] px-6 py-2 h-11 font-medium rounded-md shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 ${showSuccessGlow ? 'animate-success-glow' : ''}`}>
                {isCalculating ? (<span className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />{buttonText}</span>) : (buttonText )}
            </Button>
        </form>
    </FormProvider>
);
}

// Need to wrap with TooltipProvider at a higher level if using tooltips inside 
