"use client";

import {
  ControllerRenderProps,
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { DATE_FORMAT_DE, DATE_FORMAT_ISO } from "./date-formats";
import {
  DEFAULT_FORM_VALUES,
  FormSchemaType,
  formSchema,
  tryParseDate,
} from "./form-schema";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  INVOICE_FORM_STORAGE_KEY,
  initializeFormData,
} from "./form-initialization";
import { Loader2, PlusCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { de, enUS } from "date-fns/locale";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AmountField } from "./amount-field";
import { Button } from "@/components/ui/button";
import { DateField } from "./date-field";
import { InvoiceFormProps } from "./types";
import { InvoiceFormSkeleton } from "./form-loading-skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";
import { processCalculation } from "./calculate-logic";
import { useTranslation } from "@/translations";
import { zodResolver } from "@hookform/resolvers/zod";

export function InvoiceForm({
  onCalculateAction,
  initialDemoData,
  onDemoDataApplied,
}: InvoiceFormProps) {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [buttonText, setButtonText] = useState("");
  const [showSuccessGlow, setShowSuccessGlow] = useState(false);
  const initRef = useRef(false);

  const currentLocale = i18n.language.startsWith("de") ? de : enUS;
  const displayDateFormat = i18n.language.startsWith("de")
    ? DATE_FORMAT_DE
    : DATE_FORMAT_ISO;
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

  // Debounced function to save data to localStorage
  const debouncedSaveFunction = useMemo(
    () =>
      debounce((dataToSave: FormSchemaType) => {
        if (mounted && initRef.current) {
          try {
            // Ensure amounts is properly formatted
            const amountsToSave =
              dataToSave.amounts?.length > 0
                ? dataToSave.amounts
                : [{ value: "" }];

            // Format and prepare the data for saving
            const saveData = {
              ...dataToSave,
              amounts: amountsToSave,
              // Ensure valid splitPeriod
              splitPeriod: dataToSave.splitPeriod || "yearly",
            };

            // Save data to localStorage
            console.log("[InvoiceForm] Saving form data to localStorage");
            localStorage.setItem(
              INVOICE_FORM_STORAGE_KEY,
              JSON.stringify(saveData),
            );
          } catch (error) {
            console.error(
              "[InvoiceForm] Failed to save form data to localStorage:",
              error,
            );
          }
        }
      }, 800), // Increased debounce to reduce storage operations
    [mounted], // Add mounted flag as dependency
  );

  // Watch for form value changes to trigger saves when needed
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
  }, [formValues, debouncedSaveFunction, form, mounted]);

  // Cleanup function in a separate effect
  useEffect(() => {
    return () => {
      // Cancel any pending save operations
      debouncedSaveFunction.cancel();
      console.log(
        "[InvoiceForm] Component unmounting, cancelled pending save operations.",
      );
    };
  }, [debouncedSaveFunction]);

  const onSubmit = useCallback(
    (values: FormSchemaType) => {
      setIsCalculating(true);
      setButtonText(t("InvoiceForm.calculatingButton"));

      processCalculation(
        values,
        (formData, results, error) => {
          if (results) {
            setShowSuccessGlow(true); // Trigger success animation
            setTimeout(() => setShowSuccessGlow(false), 1500);
          }
          onCalculateAction(formData, results, error);
        },
        t,
      );

      setIsCalculating(false);
      setButtonText(
        t("InvoiceForm.calculateButton", { defaultValue: "Calculate Split" }),
      );
    },
    [onCalculateAction, t],
  );

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
        "[InvoiceForm] Applied default values for missing form fields",
      );
    }
  }, [mounted, form]);

  // Initialization effect
  useEffect(() => {
    if (!mounted) {
      console.log("[InvoiceForm] Component mounting");
      setMounted(true);
      setButtonText(
        t("InvoiceForm.calculateButton", { defaultValue: "Calculate Split" }),
      );
      return;
    }

    // Only run initialization logic once
    if (initRef.current) {
      return;
    }

    initRef.current = true;
    console.log("[InvoiceForm] Initializing form data...");

    initializeFormData(form, initialDemoData, onDemoDataApplied, onSubmit);
  }, [mounted, initialDemoData, onDemoDataApplied, t, form, onSubmit]);

  const getDateHelpText = () => {
    if (i18n.language.startsWith("de")) {
      return t("InvoiceForm.supportedDateFormats", {
        defaultValue: "Unterstützte Formate: TT.MM.JJJJ, JJJJ-MM-TT",
      });
    } else {
      return t("InvoiceForm.supportedDateFormats", {
        defaultValue: "Supported formats: YYYY-MM-DD, DD.MM.YYYY",
      });
    }
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
        message: getDateHelpText(),
      });
    }
    // If this is a valid date, check if end date is now invalid in comparison
    else if (parsedDate) {
      const endDateValue = form.getValues("endDateString");
      const endDate = tryParseDate(endDateValue ?? "");

      // If end date exists and is now before start date, set end date error
      if (endDate && endDate < parsedDate) {
        form.setError("endDateString", {
          type: "manual",
          message: t("InvoiceForm.errorEndDateBeforeStart"),
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
        message: getDateHelpText(),
      });
    }
    // If this is a valid date, check if it's before the start date
    else if (parsedDate) {
      const startDateValue = form.getValues("startDateString");
      const startDate = tryParseDate(startDateValue ?? "");

      // If start date exists and end date is before it, set error
      if (startDate && parsedDate < startDate) {
        form.setError("endDateString", {
          type: "manual",
          message: t("InvoiceForm.errorEndDateBeforeStart"),
        });
      }
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
        onSubmit={form.handleSubmit(onSubmit)}
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
          className={`w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] px-6 py-2 h-11 font-medium rounded-md shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 ${showSuccessGlow ? "animate-success-glow" : ""}`}
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
