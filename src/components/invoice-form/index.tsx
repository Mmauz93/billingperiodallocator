"use client";

import {
  ControllerRenderProps,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { DATE_FORMATS, tryParseDate } from "@/lib/date-formatter";
import {
  DEFAULT_FORM_VALUES,
  FormSchemaType,
  formSchema,
} from "./form-schema";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, PlusCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { de, enUS } from "date-fns/locale";
import { useCallback, useEffect, useMemo, useState } from "react";
import { validateEndDate, validateStartDate } from "./form-validators";

import { AmountField } from "./amount-field";
import { Button } from "@/components/ui/button";
import { DateField } from "./date-field";
import { INVOICE_FORM_STORAGE_KEY } from "./form-initialization";
import { InvoiceFormProps } from "./types";
import { InvoiceFormSkeleton } from "./form-loading-skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { processCalculation } from "./calculate-logic";
import { usePersistentForm } from "@/lib/hooks/use-persistent-form";
import { useTranslation } from "@/translations";
import { zodResolver } from "@hookform/resolvers/zod";

export function InvoiceForm({
  onCalculateAction,
  initialDemoData,
  onDemoDataApplied,
}: InvoiceFormProps) {
  const { t, i18n } = useTranslation();
  const [buttonText, setButtonText] = useState("");

  const currentLocale = i18n.language.startsWith("de") ? de : enUS;
  const displayDateFormat = i18n.language.startsWith("de")
    ? DATE_FORMATS.DE
    : DATE_FORMATS.ISO;
  const dateExamplePlaceholder = i18n.language.startsWith("de")
    ? "z.B. 31.12.2023"
    : "e.g. 2023-12-31";

  const currentFormSchema = formSchema(t);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "amounts",
  });

  // Validate form data before saving to localStorage
  const validateFormData = useCallback((data: FormSchemaType): FormSchemaType => {
    // Ensure amounts is properly formatted
    const amountsToSave =
      data.amounts?.length > 0
        ? data.amounts
        : [{ value: "" }];

    // Format and prepare the data for saving
    return {
      ...data,
      amounts: amountsToSave,
      // Ensure valid splitPeriod
      splitPeriod: data.splitPeriod || "yearly",
    };
  }, []);

  // Submit handler that processes the calculation
  const handleFormSubmit = useCallback((values: FormSchemaType) => {
    setButtonText(t("InvoiceForm.calculatingButton"));

    processCalculation(
      values,
      (formData, results, error) => {
        onCalculateAction(formData, results, error);
      },
      t,
    );

    setButtonText(
      t("InvoiceForm.calculateButton", { defaultValue: "Calculate Split" })
    );
  }, [onCalculateAction, t]);

  // Transform demo data to match FormSchemaType format if needed
  const transformedDemoData = useMemo(() => {
    if (!initialDemoData) return initialDemoData;
    
    return {
      ...initialDemoData,
      // Convert single amount to amounts array if needed
      amounts: initialDemoData.amount 
        ? [{ value: initialDemoData.amount }]
        : [{ value: "" }], // Default empty amount if not provided
      // Ensure other required properties
      splitPeriod: initialDemoData.splitPeriod || "yearly",
      includeEndDate: initialDemoData.includeEndDate ?? true,
    } as FormSchemaType;
  }, [initialDemoData]);

  // Use the persistent form hook
  const {
    mounted,
    isProcessing,
    showSuccessAnimation,
    handleSubmit,
  } = usePersistentForm({
    form,
    storageKey: INVOICE_FORM_STORAGE_KEY,
    initialDemoData: transformedDemoData,
    onDemoDataApplied,
    validateBeforeSave: validateFormData,
    onSubmit: handleFormSubmit,
    autoSubmitWithDemoData: true,
  });

  // Effect to ensure all form fields have valid values
  useEffect(() => {
    // Skip during initial render or when component is not mounted
    if (!mounted) {
      return;
    }

    // Set the button text when component is mounted
    setButtonText(
      t("InvoiceForm.calculateButton", { defaultValue: "Calculate Split" })
    );

    // Get current values
    const currentValues = form.getValues();
    let updatedValues = false;

    // Ensure splitPeriod has a valid value
    if (
      !currentValues.splitPeriod ||
      !["yearly", "quarterly", "monthly"].includes(currentValues.splitPeriod)
    ) {
      form.setValue("splitPeriod", "yearly");
      updatedValues = true;
    }

    // Ensure includeEndDate is a boolean
    if (typeof currentValues.includeEndDate !== "boolean") {
      form.setValue("includeEndDate", true);
      updatedValues = true;
    }

    // Ensure amounts array is valid
    if (!currentValues.amounts || currentValues.amounts.length === 0) {
      form.setValue("amounts", [{ value: "" }]);
      updatedValues = true;
    }

    // Log if we had to make any corrections
    if (updatedValues) {
      console.log(
        "[InvoiceForm] Applied default values for missing form fields"
      );
    }
  }, [mounted, form, t]);

  // Handle start date change with validation
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Clear previous errors and set the new value
    form.clearErrors("startDateString");
    form.setValue("startDateString", value, { shouldValidate: false });
    
    // Validate using the external validator
    const endDateString = form.getValues("endDateString");
    const result = validateStartDate(value, t, endDateString);
    
    // Apply validation result
    if (!result.valid) {
      form.setError("startDateString", {
        type: "manual",
        message: result.message,
      });
    } else if (endDateString) {
      // If start date is valid, make sure end date is still valid in comparison
      const endDateResult = validateEndDate(endDateString, t, value);
      if (!endDateResult.valid) {
        form.setError("endDateString", {
          type: "manual",
          message: endDateResult.message,
        });
      } else {
        form.clearErrors("endDateString");
      }
    }
    
    // Always trigger validation to update form state
    form.trigger("startDateString");
  };

  // Handle end date change with validation
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Clear previous errors and set the new value
    form.clearErrors("endDateString");
    form.setValue("endDateString", value, { shouldValidate: false });
    
    // Validate using the external validator
    const startDateString = form.getValues("startDateString");
    const result = validateEndDate(value, t, startDateString);
    
    // Apply validation result
    if (!result.valid) {
      form.setError("endDateString", {
        type: "manual",
        message: result.message,
      });
    }
    
    // Always trigger validation to update form state
    form.trigger("endDateString");
  };

  if (!mounted) {
    return <InvoiceFormSkeleton />;
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit())}
        className={cn(
          "space-y-6",
          mounted && "opacity-100 transition-opacity duration-500 ease-in-out",
          !mounted && "opacity-0",
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startDateString"
            render={({ field }: { field: ControllerRenderProps<FormSchemaType, "startDateString"> }) => (
              <DateField
                fieldName="startDateString"
                label={t("InvoiceForm.startDateLabel")}
                placeholder={dateExamplePlaceholder}
                field={field}
                form={form}
                onFieldChangeAction={handleStartDateChange}
                displayDateFormat={displayDateFormat}
                locale={currentLocale}
                autoFocus={true}
              />
            )}
          />
          <FormField
            control={form.control}
            name="endDateString"
            render={({ field }: { field: ControllerRenderProps<FormSchemaType, "endDateString"> }) => (
              <DateField
                fieldName="endDateString"
                label={t("InvoiceForm.endDateLabel")}
                placeholder={dateExamplePlaceholder}
                field={field}
                form={form}
                onFieldChangeAction={handleEndDateChange}
                displayDateFormat={displayDateFormat}
                locale={currentLocale}
                disabled={(date) => {
                  const startDate = tryParseDate(
                    form.watch("startDateString") ?? "",
                  );
                  return startDate ? date < startDate : false;
                }}
              />
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="includeEndDate"
          render={({ field }: { field: ControllerRenderProps<FormSchemaType, "includeEndDate"> }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel htmlFor="includeEndDate" className="text-base">
                  {t("InvoiceForm.includeEndDateLabel")}
                </FormLabel>
                <FormDescription>
                  {t("InvoiceForm.includeEndDateDescription")}
                </FormDescription>
              </div>
              <div className="flex items-center border-none outline-none">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="includeEndDate"
                  name="includeEndDate"
                />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="splitPeriod"
          render={({ field }: { field: ControllerRenderProps<FormSchemaType, "splitPeriod"> }) => (
            <FormItem className="flex flex-col items-start justify-start rounded-lg border p-4">
              <div className="space-y-0.5 pr-4 mb-3">
                <FormLabel htmlFor="splitPeriod" className="text-base">
                  {t("InvoiceForm.splitPeriodLabel", {
                    defaultValue: "Split Period",
                  })}
                </FormLabel>
                <FormDescription>
                  {t("InvoiceForm.splitPeriodDescription", {
                    defaultValue: "Choose how to split the invoice amounts.",
                  })}
                </FormDescription>
              </div>
              <div className="w-full">
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  name={field.name}
                >
                  <SelectTrigger className="w-full" id="splitPeriod">
                    <SelectValue
                      placeholder={t("InvoiceForm.periodYearly", {
                        defaultValue: "Yearly",
                      })}
                    />
                  </SelectTrigger>
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
                      style={{ cursor: "pointer" }}
                    >
                      {`${t("InvoiceForm.periodYearly", { defaultValue: "Yearly" })}`}
                    </SelectItem>
                    <SelectItem
                      key="quarterly"
                      value="quarterly"
                      className="select-dropdown-item !cursor-pointer"
                      style={{ cursor: "pointer" }}
                    >
                      {`${t("InvoiceForm.periodQuarterly", { defaultValue: "Quarterly" })}`}
                    </SelectItem>
                    <SelectItem
                      key="monthly"
                      value="monthly"
                      className="select-dropdown-item !cursor-pointer"
                      style={{ cursor: "pointer" }}
                    >
                      {`${t("InvoiceForm.periodMonthly", { defaultValue: "Monthly" })}`}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <div className="space-y-5 rounded-lg border p-6 shadow-xs">
          <h3 className="text-base font-medium" id="amounts-section-label">
            {t("InvoiceForm.amountsLabel")}
          </h3>
          <FormDescription>
            {t("InvoiceForm.amountsDescription")}
          </FormDescription>
          <div
            aria-labelledby="amounts-section-label"
            className="space-y-4 mt-4"
          >
            {fields.map((item, index) => (
              <FormField
                control={form.control}
                key={item.id}
                name={`amounts.${index}.value`}
                render={({ field }: { field: ControllerRenderProps<FormSchemaType, `amounts.${number}.value`> }) => (
                  <AmountField
                    index={index}
                    field={field}
                    canRemove={fields.length > 1}
                    onRemoveAction={() => remove(index)}
                    hasError={!!form.formState.errors.amounts?.[index]?.value}
                    errorMessage={
                      form.formState.errors.amounts?.[index]?.value
                        ?.message as string
                    }
                  />
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
                  if (ni.length > 0)
                    (ni[ni.length - 1] as HTMLInputElement).focus();
                }, 10);
              }}
              className="mt-4"
            >
              <PlusCircle className="mr-2 h-4 w-4" />{" "}
              {t("InvoiceForm.addAmountButton")}
            </Button>
            {form.formState.errors.amounts &&
              !form.formState.errors.amounts.root &&
              form.formState.errors.amounts.message && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.amounts.message}
                </p>
              )}
            {form.formState.errors.amounts?.root?.message && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.amounts.root.message}
              </p>
            )}
          </div>
        </div>
        <Button
          type="submit"
          variant="default"
          className={`w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] px-6 py-2 h-11 font-medium rounded-md shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 ${showSuccessAnimation ? "animate-successGlow" : ""}`}
          disabled={form.formState.isSubmitting || isProcessing}
          aria-live="polite"
        >
          {isProcessing ? (
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
