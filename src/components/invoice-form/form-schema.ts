import { parseDate } from "@/lib/date-utils";
import { supportedDateFormats } from "./date-formats";
import { z } from "zod";

export const tryParseDate = (value: string): Date | null => {
  if (!value) return null;
  return parseDate(value, supportedDateFormats);
};

// Type for passed in demo data
export type DemoDataType = {
  startDateString?: string;
  endDateString?: string;
  amount?: string;
  includeEndDate?: boolean;
  splitPeriod?: "yearly" | "quarterly" | "monthly";
  isDemo?: boolean;
} | null;

// Define a constant for default form values
export const DEFAULT_FORM_VALUES: FormSchemaType = {
  startDateString: "",
  endDateString: "",
  includeEndDate: true,
  splitPeriod: "yearly" as const,
  amounts: [{ value: "" }],
};

// Schema for form validation
export const formSchema = (t: (key: string, options?: { defaultValue?: string; values?: Record<string, string | number> }) => string) =>
  z
    .object({
      startDateString: z.string().optional(),
      endDateString: z.string().optional(),
      includeEndDate: z.boolean(),
      splitPeriod: z.enum(["yearly", "quarterly", "monthly"]),
      amounts: z
        .array(
          z.object({
            value: z
              .string()
              .min(1, { message: t("InvoiceForm.errorAmountValueRequired") })
              .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
                message: t("InvoiceForm.errorAmountPositive"),
              }),
          }),
        )
        .min(1, t("InvoiceForm.errorAmountRequired")),
    })
    .refine(
      (data) => {
        const startDate = tryParseDate(data.startDateString || "");
        return !!startDate;
      },
      {
        message: t("InvoiceForm.errorStartDateRequired"),
        path: ["startDateString"],
      },
    )
    .refine(
      (data) => {
        const endDate = tryParseDate(data.endDateString || "");
        return !!endDate;
      },
      {
        message: t("InvoiceForm.errorEndDateRequired"),
        path: ["endDateString"],
      },
    )
    .refine(
      (data) => {
        const startDate = tryParseDate(data.startDateString || "");
        const endDate = tryParseDate(data.endDateString || "");
        return !startDate || !endDate || endDate >= startDate;
      },
      {
        message: t("InvoiceForm.errorEndDateBeforeStart"),
        path: ["endDateString"],
      },
    );

// Form data type
export type FormSchemaType = z.infer<ReturnType<typeof formSchema>>;

// Need to add import for parseDate
