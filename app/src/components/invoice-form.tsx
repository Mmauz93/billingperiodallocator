"use client";

import { CalculationInput, CalculationResult, calculateInvoiceSplit } from "@/lib/calculations";
import { CalendarIcon, Info, PlusCircle, XCircle } from "lucide-react"; // Import icons
import { ChangeEvent, useState } from "react";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { FormProvider, useFieldArray, useForm } from "react-hook-form"; // Import useFieldArray
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, isValid, parse, startOfDay } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const DATE_FORMAT = "yyyy-MM-dd";

// Updated numericString: Validates string can be coerced to a positive number
const numericString = z.string()
    .min(1, { message: "Required" })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: "Must be a positive number",
    });

// Updated Zod schema for dynamic amounts
const formSchema = z
    .object({
        // Make dates optional in the schema
        startDate: z.date({
            // required_error: "Start date is required.", // Error handled by optional()
            invalid_type_error: "Invalid date format.",
        }).optional(),
        endDate: z.date({
            // required_error: "End date is required.", // Error handled by optional()
            invalid_type_error: "Invalid date format.",
        }).optional(),
        includeEndDate: z.boolean(), // Keep as required boolean
        // Array of amounts - value is now explicitly a string validated by numericString
        amounts: z.array(z.object({
            value: numericString // Use the updated validator
        })).min(1, "At least one amount is required.")
    })
    // Refine now needs to handle potentially undefined dates
    .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
        message: "End date cannot be earlier than start date.",
        path: ["endDate"],
    })
    // Add refinement to ensure dates are actually provided on submit attempt
    .refine((data) => data.startDate !== undefined, { 
        message: "Start date is required.",
        path: ["startDate"],
    })
    .refine((data) => data.endDate !== undefined, { 
        message: "End date is required.",
        path: ["endDate"],
    });

// FormData will now infer optional dates
type FormData = z.infer<typeof formSchema>;

// Updated CalculationCallbackData - Adjust if calculation needs defined dates
type CalculationCallbackData = {
    startDate: Date; // Keep required for now, handle undefined check before calling onCalculate
    endDate: Date;   // Keep required for now, handle undefined check before calling onCalculate
    includeEndDate: boolean;
    amounts: number[];
}

interface InvoiceFormProps {
    onCalculate: (formData: CalculationCallbackData, results: CalculationResult | null, error?: string) => void;
}

export function InvoiceForm({ onCalculate }: InvoiceFormProps) {
    // FormData now allows undefined dates
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startDate: undefined, // This is now valid
            endDate: undefined,   // This is now valid
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
        form.getValues("startDate") ? format(form.getValues("startDate")!, DATE_FORMAT) : ""
    );
    const [endDateString, setEndDateString] = useState<string>(
        form.getValues("endDate") ? format(form.getValues("endDate")!, DATE_FORMAT) : ""
    );

    // State for popover visibility
    const [isStartDatePopoverOpen, setIsStartDatePopoverOpen] = useState(false);
    const [isEndDatePopoverOpen, setIsEndDatePopoverOpen] = useState(false);

    const handleDateInputChange = (
        e: ChangeEvent<HTMLInputElement>,
        field: 'startDate' | 'endDate'
    ) => {
        const value = e.target.value;
        if (field === 'startDate') setStartDateString(value);
        if (field === 'endDate') setEndDateString(value);

        const parsedDate = parse(value, DATE_FORMAT, new Date());

        if (isValid(parsedDate)) {
            form.setValue(field, startOfDay(parsedDate), { shouldValidate: true });
        } else {
            // Setting undefined is now type-correct for optional fields
            form.setValue(field, undefined, { shouldValidate: true }); 
        }
    };

    function onSubmit(values: FormData) {
        // Zod refinement ensures dates are defined here if validation passed
        if (values.startDate === undefined || values.endDate === undefined) {
            // This should technically not happen if Zod validation is working
            // but good practice to guard
            console.error("Form submitted with undefined dates despite validation");
            // You might want to trigger a form error display here
            return; 
        }

        const amountsNum = values.amounts.map(amount => Number(amount.value));

        const formDataForCallback: CalculationCallbackData = {
            startDate: values.startDate, // Now guaranteed non-undefined
            endDate: values.endDate,     // Now guaranteed non-undefined
            includeEndDate: values.includeEndDate,
            amounts: amountsNum,
        };

        onCalculate(formDataForCallback, null);

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

            // Updated error checking:
            if (results.calculationSteps?.error) {
                onCalculate(formDataForCallback, null, results.calculationSteps.error);
            } else if (!results.aggregatedSplits || results.aggregatedSplits.length === 0) {
                 // Handle cases where calculation might succeed but produce no splits unexpectedly
                 onCalculate(formDataForCallback, null, "Calculation completed but resulted in no splits.");
            } else {
                onCalculate(formDataForCallback, results);
            }
        } catch (error) {
             console.error("Calculation Error:", error);
             const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during calculation.";
             onCalculate(formDataForCallback, null, errorMessage);
        }
    }

    const onSelectStartDate = (date: Date | undefined) => {
        if (date) {
            form.setValue('startDate', startOfDay(date), { shouldValidate: true });
            setStartDateString(format(date, DATE_FORMAT));
        } else {
            form.setValue('startDate', undefined, { shouldValidate: true }); // This is now valid
            setStartDateString("");
        }
        setIsStartDatePopoverOpen(false);
    };

    const onSelectEndDate = (date: Date | undefined) => {
        if (date) {
            form.setValue('endDate', startOfDay(date), { shouldValidate: true });
            setEndDateString(format(date, DATE_FORMAT));
        } else {
            form.setValue('endDate', undefined, { shouldValidate: true }); // This is now valid
            setEndDateString("");
        }
        setIsEndDatePopoverOpen(false);
    };

    return (
        <TooltipProvider>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Date Fields (using Input + Popover) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Start Date Field */} 
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Start Date *</FormLabel>
                                    <Popover open={isStartDatePopoverOpen} onOpenChange={setIsStartDatePopoverOpen}>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    placeholder={DATE_FORMAT}
                                                    value={startDateString}
                                                    onChange={(e) => handleDateInputChange(e, 'startDate')}
                                                    className="pr-10"
                                                />
                                                <PopoverTrigger asChild>
                                                     <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground" aria-label="Open start date calendar">
                                                        <CalendarIcon className="h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                            </div>
                                        </FormControl>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value} // Can be Date | undefined
                                                onSelect={onSelectStartDate}
                                                initialFocus
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
                                    <FormLabel>End Date *</FormLabel>
                                    <Popover open={isEndDatePopoverOpen} onOpenChange={setIsEndDatePopoverOpen}>
                                        <FormControl>
                                             <div className="relative">
                                                <Input
                                                    placeholder={DATE_FORMAT}
                                                    value={endDateString}
                                                    onChange={(e) => handleDateInputChange(e, 'endDate')}
                                                    className="pr-10"
                                                />
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground" aria-label="Open end date calendar">
                                                        <CalendarIcon className="h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                            </div>
                                        </FormControl>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value} // Can be Date | undefined
                                                onSelect={onSelectEndDate}
                                                disabled={(date) => {
                                                    const startDate = form.getValues("startDate");
                                                    return startDate ? date < startOfDay(startDate) : false;
                                                }}
                                                initialFocus
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
                                    <FormLabel className="text-base flex items-center">
                                        Include End Date
                                        <Tooltip delayDuration={300}>
                                            <TooltipTrigger asChild><Info className="h-4 w-4 ml-2 cursor-help" /></TooltipTrigger>
                                            <TooltipContent><p>If checked, the end date is included in the calculation (+1 day).</p><p>Example: Jan 1 to Jan 3 (inclusive) = 3 days.</p><p>Example: Jan 1 to Jan 3 (exclusive) = 2 days.</p></TooltipContent>
                                        </Tooltip>
                                    </FormLabel>
                                    <FormDescription>Determines if the last day is counted in the period.</FormDescription>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )}
                    />

                     {/* Dynamic Amount Fields Section */}
                     <div className="space-y-4 rounded-lg border p-4">
                          <FormLabel className="text-base">Amounts *</FormLabel>
                          <FormDescription>Enter one or more amounts to be split.</FormDescription>
                         {fields.map((item, index) => (
                             <FormField
                                 control={form.control}
                                 key={item.id}
                                 name={`amounts.${index}.value`}
                                 render={({ field }) => (
                                     <FormItem>
                                          <div className="flex items-center gap-2">
                                             <FormControl>
                                                 <Input
                                                     type="number"
                                                     step="any"
                                                     placeholder={`Amount #${index + 1}`}
                                                     {...field}
                                                  />
                                              </FormControl>
                                              {fields.length > 1 && (
                                                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive shrink-0" aria-label="Remove amount">
                                                      <XCircle className="h-4 w-4" />
                                                 </Button>
                                              )}
                                         </div>
                                          <FormMessage />
                                     </FormItem>
                                 )}
                             />
                         ))}
                          <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })} className="mt-2">
                              <PlusCircle className="mr-2 h-4 w-4" /> Add Another Amount
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

                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Calculating..." : "Calculate Split"}
                    </Button>
                </form>
            </FormProvider>
        </TooltipProvider>
    );
}

// Need to wrap with TooltipProvider at a higher level if using tooltips inside 
