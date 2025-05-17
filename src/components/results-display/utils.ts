import { formatNumber, formatPercent } from "@/lib/math-utils";

import { AppSettings } from "@/context/settings-context";
import { de } from "date-fns/locale/de";
import { enUS } from "date-fns/locale/en-US";
import { format } from "date-fns";
import { formatDateForDisplay as formatDateLocale } from "@/lib/date-formatter";

// --- Period Formatting Helper ---
export function formatPeriodIdentifier(
  identifier: string,
  periodType: "yearly" | "quarterly" | "monthly",
  locale: string,
): string {
  switch (periodType) {
    case "monthly":
      try {
        const [year, month] = identifier.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return format(date, "MMMM yyyy", {
          locale: locale === "de" ? de : enUS,
        });
      } catch {
        return identifier;
      }
    case "quarterly":
      return identifier;
    case "yearly":
    default:
      return identifier;
  }
}

// Function to get appropriate header for the allocation table
export function getPeriodHeader(
  splitPeriodUsed: "yearly" | "quarterly" | "monthly",
  t: (key: string, options?: { defaultValue?: string; values?: Record<string, string | number> }) => string,
): string {
  switch (splitPeriodUsed) {
    case "monthly":
      return t("ResultsDisplay.monthHeader");
    case "quarterly":
      return t("ResultsDisplay.quarterHeader");
    case "yearly":
    default:
      return t("ResultsDisplay.yearHeader");
  }
}

// Default settings if none provided
const DEFAULT_SETTINGS: Omit<AppSettings, "locale"> = {
  decimalPlaces: 2,
  roundingPrecision: 0.01,
  thousandsSeparator: ",",
};

// Formatting utility wrapper functions
export function formatNumForDisplay(
  value: number | undefined,
  locale: string,
  settings?: Omit<AppSettings, "locale">,
): string {
  return value !== undefined ? formatNumber(value, locale, settings || DEFAULT_SETTINGS) : "";
}

export function formatPctForDisplay(
  value: number | undefined,
  locale: string,
): string {
  return value !== undefined ? formatPercent(value, locale) : "";
}

export function formatDateForDisplay(
  dateObj: Date | string | undefined,
  locale: string,
): string {
  return dateObj ? formatDateLocale(dateObj, locale) : "";
}

export function formatPeriodIdForDisplay(
  id: string,
  splitPeriodUsed: "yearly" | "quarterly" | "monthly" | undefined,
  locale: string,
): string {
  return formatPeriodIdentifier(id, splitPeriodUsed || "yearly", locale);
}
