"use client";

import { AlertCircle, CalendarIcon, CheckCircle, Loader2, PlusCircle, XCircle } from "lucide-react"; // Import icons
import {
    FormLabel as BaseFormLabel,
    FormMessage as BaseFormMessage,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
} from "@/components/ui/form";
import { CalculationInput, CalculationResult, calculateInvoiceSplit } from "@/lib/calculations";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ChangeEvent, useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form"; // Import useFieldArray
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { de, enUS } from 'date-fns/locale'; // Import locales
import { format, isValid, parse, startOfDay } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next'; // Import hook
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Constants for date formats
const DATE_FORMAT_ISO = "yyyy-MM-dd";
const DATE_FORMAT_DE = "dd.MM.yyyy";

// Updated Zod schema - Remove translation function dependency
const formSchema = (t: ReturnType<typeof useTranslation>['t']) => z
    .object({
        startDate: z.date({
            invalid_type_error: t('InvoiceForm.errorDateFormat'),
        }).optional(),
        endDate: z.date({
            invalid_type_error: t('InvoiceForm.errorDateFormat'),
        }).optional(),
        includeEndDate: z.boolean(),
        amounts: z.array(z.object({
            value: z.string()
                .min(1, { message: t('InvoiceForm.errorAmountValueRequired') })
                .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
                    message: t('InvoiceForm.errorAmountPositive'),
                })
        })).min(1, t('InvoiceForm.errorAmountRequired'))
    })
    .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
        message: t('InvoiceForm.errorEndDateBeforeStart'),
        path: ["endDate"],
    })
    .refine((data) => data.startDate !== undefined, { 
        message: t('InvoiceForm.errorStartDateRequired'),
        path: ["startDate"],
    })
    .refine((data) => data.endDate !== undefined, { 
        message: t('InvoiceForm.errorEndDateRequired'),
        path: ["endDate"],
    });

// FormData will now infer optional dates
type FormData = z.infer<ReturnType<typeof formSchema>>;

// Updated CalculationCallbackData - Adjust if calculation needs defined dates
type CalculationCallbackData = {
    startDate: Date; // Keep required for now, handle undefined check before calling onCalculate
    endDate: Date;   // Keep required for now, handle undefined check before calling onCalculate
    includeEndDate: boolean;
    amounts: number[];
}

interface InvoiceFormProps {
    onCalculateAction: (formData: CalculationCallbackData, results: CalculationResult | null, error?: string) => void;
}

// Custom FormLabel that never turns red
const FormLabel = ({ children, ...props }: React.ComponentProps<typeof BaseFormLabel>) => (
    <BaseFormLabel {...props} style={{ color: 'var(--foreground)', fontWeight: 500 }}>
        {children}
    </BaseFormLabel>
);

// Custom FormMessage with proper alignment
const FormMessage = ({ className, ...props }: React.ComponentProps<typeof import("@/components/ui/form").FormMessage>) => (
    <BaseFormMessage className={cn("pl-3", className)} {...props} />
);

export function InvoiceForm({ onCalculateAction }: InvoiceFormProps) {
    const { t, i18n } = useTranslation();
    const [mounted, setMounted] = useState(false); // Mounted state
    const [isCalculating, setIsCalculating] = useState(false); // Add loading state
    const [buttonText, setButtonText] = useState(''); // Dynamic button text
    const [showSuccessGlow, setShowSuccessGlow] = useState(false); // Success indicator

    const currentFormSchema = formSchema(t);
    
    // Determine date formats and locale based on i18n language
    const currentLocale = i18n.language.startsWith('de') ? de : enUS;
    const displayDateFormat = i18n.language.startsWith('de') ? DATE_FORMAT_DE : DATE_FORMAT_ISO;
    const internalDateFormat = DATE_FORMAT_ISO;

    const form = useForm<FormData>({
        resolver: zodResolver(currentFormSchema),
        defaultValues: {
            startDate: undefined,
            endDate: undefined,
            includeEndDate: false,
            amounts: [{ value: "" }],
        },
        mode: "onChange",
    });

    // Setup useFieldArray for amounts
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "amounts"
    });

    // Initialize local string state from potentially existing defaultValues (Date objects)
    const [startDateString, setStartDateString] = useState<string>(
        form.getValues("startDate") ? format(form.getValues("startDate")!, internalDateFormat) : ""
    );
    const [endDateString, setEndDateString] = useState<string>(
        form.getValues("endDate") ? format(form.getValues("endDate")!, internalDateFormat) : ""
    );

    // State for popover visibility
    const [isStartDatePopoverOpen, setIsStartDatePopoverOpen] = useState(false);
    const [isEndDatePopoverOpen, setIsEndDatePopoverOpen] = useState(false);

    // Effect to set mounted state on client
    useEffect(() => {
        setMounted(true);
        setButtonText(t('InvoiceForm.calculateButton'));
    }, [t]);

    // Effect to update input strings when language changes
    useEffect(() => {
        const newDisplayFormat = i18n.language.startsWith('de') ? DATE_FORMAT_DE : DATE_FORMAT_ISO;
        const currentStartDate = form.getValues("startDate");
        const currentEndDate = form.getValues("endDate");
        
        // Reformat start date string if date exists
        if (currentStartDate) {
            try {
                 setStartDateString(format(currentStartDate, newDisplayFormat));
             } catch (e) { console.error("Error formatting start date on lang change:", e); }
        } else {
             setStartDateString(""); // Ensure empty if no date
        }
        
        // Reformat end date string if date exists
        if (currentEndDate) {
             try {
                 setEndDateString(format(currentEndDate, newDisplayFormat));
             } catch (e) { console.error("Error formatting end date on lang change:", e); }
        } else {
             setEndDateString(""); // Ensure empty if no date
        }

    }, [i18n.language, form, mounted]); // Add form to dependencies

    const handleDateInputChange = (
        e: ChangeEvent<HTMLInputElement>,
        field: 'startDate' | 'endDate'
    ) => {
        const value = e.target.value;
        if (field === 'startDate') setStartDateString(value);
        if (field === 'endDate') setEndDateString(value);

        // Attempt parsing with the *display* format first for better UX
        let parsedDate = parse(value, displayDateFormat, new Date());
        
        // If display format fails, try internal format (e.g., user pasted ISO)
        if (!isValid(parsedDate)) {
            parsedDate = parse(value, internalDateFormat, new Date());
        }

        if (isValid(parsedDate)) {
            form.setValue(field, startOfDay(parsedDate), { shouldValidate: true });
        } else {
            form.setValue(field, undefined, { shouldValidate: true }); 
        }
    };

    function onSubmit(values: FormData) {
        // Temporarily disable button and show loading state
        setIsCalculating(true);
        setButtonText(t('InvoiceForm.calculatingButton'));
        
        // Zod refinement ensures dates are defined here if validation passed
        if (values.startDate === undefined || values.endDate === undefined) {
            // This should technically not happen if Zod validation is working
            // but good practice to guard
            console.error("Form submitted with undefined dates despite validation");
            setIsCalculating(false);
            setButtonText(t('InvoiceForm.calculateButton'));
            return; 
        }

        const amountsNum = values.amounts.map(amount => Number(amount.value));

        const formDataForCallback: CalculationCallbackData = {
            startDate: values.startDate, // Now guaranteed non-undefined
            endDate: values.endDate,     // Now guaranteed non-undefined
            includeEndDate: values.includeEndDate,
            amounts: amountsNum,
        };

        onCalculateAction(formDataForCallback, null);

        const calculationInput: CalculationInput = {
            startDate: values.startDate, // Guaranteed non-undefined
            endDate: values.endDate,     // Guaranteed non-undefined
            includeEndDate: values.includeEndDate,
            amounts: amountsNum,
        };

        console.log("Calculating with input:", calculationInput);

        try {
            const results = calculateInvoiceSplit(calculationInput);
            console.log("Calculation Results:", results);

            // Simulate a brief calculation delay for UX
            setTimeout(() => {
            // Updated error checking:
            if (results.calculationSteps?.error) {
                    onCalculateAction(formDataForCallback, null, results.calculationSteps.error);
                    setButtonText(t('InvoiceForm.calculateButton'));
            } else if (!results.aggregatedSplits || results.aggregatedSplits.length === 0) {
                 // Handle cases where calculation might succeed but produce no splits unexpectedly
                    onCalculateAction(formDataForCallback, null, "Calculation completed but resulted in no splits.");
                    setButtonText(t('InvoiceForm.calculateButton'));
            } else {
                    onCalculateAction(formDataForCallback, results);
                    // Show success state
                    setButtonText(t('InvoiceForm.calculationComplete', { defaultValue: 'Calculation Complete ✅' }));
                    setShowSuccessGlow(true);
                    
                    // Reset button text after 2 seconds
                    setTimeout(() => {
                        setButtonText(t('InvoiceForm.calculateButton'));
                        setShowSuccessGlow(false);
                    }, 2000);
                }
                setIsCalculating(false);
            }, 500); // Add a slight delay for better UX feedback
            
        } catch (error) {
             console.error("Calculation Error:", error);
             const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during calculation.";
            onCalculateAction(formDataForCallback, null, errorMessage);
            
            // Reset button state
            setTimeout(() => {
                setIsCalculating(false);
                setButtonText(t('InvoiceForm.calculateButton'));
            }, 500);
        }
    }

    // Update handler for react-day-picker's onSelect (passes Date | undefined)
    const onSelectStartDate = (date: Date | undefined) => {
        if (date) {
            const day = startOfDay(date)
            form.setValue('startDate', day, { shouldValidate: true });
            setStartDateString(format(day, displayDateFormat)); // Use display format after selection
        } else {
            form.setValue('startDate', undefined, { shouldValidate: true });
            setStartDateString("");
        }
        setIsStartDatePopoverOpen(false);
    };

    // Update handler for react-day-picker's onSelect (passes Date | undefined)
    const onSelectEndDate = (date: Date | undefined) => {
        if (date) {
             const day = startOfDay(date)
            form.setValue('endDate', day, { shouldValidate: true });
            setEndDateString(format(day, displayDateFormat)); // Use display format after selection
        } else {
            form.setValue('endDate', undefined, { shouldValidate: true });
            setEndDateString("");
        }
        setIsEndDatePopoverOpen(false);
    };

    // Render a minimal skeleton or null before mount
    if (!mounted) {
        // Return a basic structure or null to avoid hydration errors on translated labels
        return <div className="space-y-8 h-[400px]"></div>; // Simple placeholder div
    }

    // Render full form after mount
    return (
        <Card className="w-full">
            <CardContent className="pt-6 px-6">
        <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-8">{t('InvoiceForm.title')}</h2>
                        </div>
                        
                {/* Date Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Start Date Field */}
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                        <FormLabel>
                                            {t('InvoiceForm.startDateLabel')}
                                        </FormLabel>
                                <Popover open={isStartDatePopoverOpen} onOpenChange={setIsStartDatePopoverOpen}>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder={displayDateFormat}
                                                value={startDateString}
                                                onChange={(e) => handleDateInputChange(e, 'startDate')}
                                                        className={`pr-10 transition-transform duration-150 focus:scale-[1.01] ${
                                                            form.formState.errors.startDate 
                                                            ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20" 
                                                            : "focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                        }`}
                                                        autoFocus
                                                    />
                                                    
                                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                                        {field.value && !form.formState.errors.startDate && (
                                                            <div className="flex items-center justify-center h-5 w-5">
                                                                <CheckCircle className="h-4 w-4 text-green-500 animate-fadeIn" />
                                                            </div>
                                                        )}
                                                        {form.formState.errors.startDate && (
                                                            <div className="flex items-center justify-center h-5 w-5">
                                                                <AlertCircle className="h-4 w-4 text-destructive animate-fadeIn" />
                                                            </div>
                                                        )}
                                                    </div>
                                            <PopoverTrigger asChild>
                                                        <Button 
                                                            type="button"
                                                            variant="ghost" 
                                                            className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 flex items-center justify-center" 
                                                            tabIndex={-1}
                                                            aria-label="Pick a date"
                                                        >
                                                            <CalendarIcon className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                        </div>
                                    </FormControl>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={onSelectStartDate}
                                                    initialFocus
                                            locale={currentLocale}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* End Date Field */}
                    <FormField
                         control={form.control}
                         name="endDate"
                         render={({ field }) => (
                            <FormItem className="flex flex-col">
                                        <FormLabel>
                                            {t('InvoiceForm.endDateLabel')}
                                        </FormLabel>
                                <Popover open={isEndDatePopoverOpen} onOpenChange={setIsEndDatePopoverOpen}>
                                    <FormControl>
                                         <div className="relative">
                                            <Input
                                                placeholder={displayDateFormat}
                                                value={endDateString}
                                                onChange={(e) => handleDateInputChange(e, 'endDate')}
                                                        className={`pr-10 transition-transform duration-150 focus:scale-[1.01] ${
                                                            form.formState.errors.endDate 
                                                            ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20" 
                                                            : "focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                        }`}
                                                    />
                                                    
                                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                                        {field.value && !form.formState.errors.endDate && (
                                                            <div className="flex items-center justify-center h-5 w-5">
                                                                <CheckCircle className="h-4 w-4 text-green-500 animate-fadeIn" />
                                                            </div>
                                                        )}
                                                        {form.formState.errors.endDate && (
                                                            <div className="flex items-center justify-center h-5 w-5">
                                                                <AlertCircle className="h-4 w-4 text-destructive animate-fadeIn" />
                                                            </div>
                                                        )}
                                                    </div>
                                            <PopoverTrigger asChild>
                                                        <Button 
                                                            type="button"
                                                            variant="ghost" 
                                                            className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 flex items-center justify-center" 
                                                            tabIndex={-1} 
                                                            aria-label="Pick a date"
                                                        >
                                                            <CalendarIcon className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                        </div>
                                    </FormControl>
                                    <PopoverContent className="w-auto p-0" align="start">
                                         <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={onSelectEndDate}
                                                    initialFocus
                                            locale={currentLocale}
                                         />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                         )}
                     />
                </div>

                        {/* Include End Date Switch */}
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
                                                                className="focus:border-primary focus:ring-2 focus:ring-primary/20 transition-transform duration-150 focus:scale-[1.01] pr-8"
                                                     {...field}
                                                 />
                                             </FormControl>
                                                        {/* Validation indicator */}
                                                        <div className="absolute right-2 top-0 h-full flex items-center justify-center">
                                                            {field.value && !isNaN(parseFloat(field.value)) && parseFloat(field.value) > 0 && (
                                                                <div className="flex items-center justify-center h-5 w-5">
                                                                    <CheckCircle className="h-4 w-4 text-green-500 animate-fadeIn" />
                                                                </div>
                                                            )}
                                                            {form.formState.errors.amounts?.[index]?.value && (
                                                                <div className="flex items-center justify-center h-5 w-5">
                                                                    <AlertCircle className="h-4 w-4 text-destructive animate-fadeIn" />
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
                                // Focus the new input after a short delay to allow DOM to update
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
                    </form>
                </FormProvider>
            </CardContent>
            <CardFooter className="flex justify-start px-6 py-6">
                <Button 
                    type="submit" 
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={form.formState.isSubmitting || isCalculating}
                    className={`bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] px-6 py-2 h-11 font-medium rounded-md shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 ${showSuccessGlow ? 'animate-success-glow' : ''}`}
                >
                    {isCalculating ? (
                        <span className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {buttonText}
                        </span>
                    ) : buttonText}
                </Button>
            </CardFooter>
        </Card>
    );
}

// Need to wrap with TooltipProvider at a higher level if using tooltips inside 
