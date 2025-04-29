"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CalculationInput,
  CalculationResult,
  CalculationStepDetails,
} from "@/lib/calculations";
import { Card, CardContent } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { de, enUS } from 'date-fns/locale';

import { AppSettings } from "@/context/settings-context";
import { SettingsModal } from "@/components/settings-modal";
import { format } from "date-fns";
import { useSettings } from "@/context/settings-context";
import { useTranslation } from "react-i18next";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Interface inherits members via Pick
interface InputDataForDisplay
  extends Pick<
    CalculationInput,
    "startDate" | "endDate" | "includeEndDate" | "amounts" | "splitPeriod"
  > {}

interface ResultsDisplayProps {
  results: CalculationResult;
  inputData: InputDataForDisplay;
}

// --- Formatting Helpers ---

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function roundValue(value: number, precision: number): number {
  if (!precision || precision <= 0) return value; // No rounding if precision is invalid
  return Math.round(value / precision) * precision;
}

// Formats a number according to locale and decimal places settings
function formatNumber(
  value: number | undefined | null,
  locale: string,
  settings: Omit<AppSettings, "locale">,
): string {
  if (value === undefined || value === null || isNaN(value)) return "";

  let formattedString = new Intl.NumberFormat(locale, {
    minimumFractionDigits: settings.decimalPlaces,
    maximumFractionDigits: settings.decimalPlaces,
    useGrouping: true,
  }).format(value);

  // Apply custom thousands separator if needed
  const defaultSeparator = locale.startsWith("de") ? "." : ",";

  if (
    settings.thousandsSeparator &&
    settings.thousandsSeparator !== defaultSeparator
  ) {
    // Replace the default separator with the custom one
    formattedString = formattedString.replace(
      new RegExp(`\\${defaultSeparator}`, "g"),
      settings.thousandsSeparator,
    );
  }

  return formattedString;
}

// Formats a percentage according to locale and decimal places settings
function formatPercent(
  value: number | undefined | null,
  locale: string,
): string {
  if (value === undefined || value === null || isNaN(value)) return "";
  const percentageValue = value * 100;
  return (
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(percentageValue) + "%"
  );
}

// Formats a date string (yyyy-MM-dd) according to locale
function formatDateLocale(
  dateString: string | undefined | null,
  locale: string,
): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString + "T00:00:00Z"); // Treat as UTC date
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).format(date);
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString; // Fallback to original string on error
  }
}

// --- Period Formatting Helper ---
function formatPeriodIdentifier(
  identifier: string,
  periodType: 'yearly' | 'quarterly' | 'monthly',
  locale: string
): string {
  switch (periodType) {
    case 'monthly':
      // Identifier is YYYY-MM
      try {
        const [year, month] = identifier.split('-');
        // Create a date object just to format the month name
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return format(date, 'MMMM yyyy', { locale: locale === 'de' ? de : enUS }); // Use date-fns locale
      } catch { 
        // Handle error silently and return original identifier
        return identifier; 
      }
    case 'quarterly':
      // Identifier is YYYY-Qn
      return identifier; // Keep as is, or potentially localize 'Q'
    case 'yearly':
    default:
      // Identifier is YYYY
      return identifier;
  }
}

// --- Calculation Steps Renderer Component ---
const CalculationStepsDisplay = ({
  steps,
  settings,
  splitPeriodUsed,
}: {
  steps: CalculationStepDetails;
  settings: Omit<AppSettings, "locale">;
  splitPeriodUsed: 'yearly' | 'quarterly' | 'monthly';
}) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language;

  if (steps.error) {
    return <p className="text-destructive">{steps.error}</p>;
  }

  const { periodSegments, amountCalculations } = steps;

  const fmtNum = (num: number) => formatNumber(num, currentLocale, settings);
  const fmtPeriod = (id: string) => formatPeriodIdentifier(id, splitPeriodUsed, currentLocale);

  return (
    <div className="text-sm space-y-6">
       {/* Total Duration and Period Breakdown Section */}
      <section className="bg-muted/40 rounded-lg p-4 space-y-4">
        <h4 className="font-semibold text-foreground">{t('ResultsDisplay.totalDuration')}</h4>
        <div className="grid grid-cols-2 gap-2 text-xs border-b pb-2 mb-2">
          <div>{t('ResultsDisplay.periodLabel')}</div> <div className="text-right">{formatDateLocale(steps.totalDuration.start, currentLocale)} - {formatDateLocale(steps.totalDuration.end, currentLocale)}</div>
          <div>{t('ResultsDisplay.totalDays')}</div> <div className="text-right">{steps.totalDuration.days} ({steps.totalDuration.included ? t('ResultsDisplay.inclusiveLabel') : t('ResultsDisplay.exclusiveLabel')})</div>
        </div>
        <h4 className="font-semibold text-foreground">{t('ResultsDisplay.proportionCalculation')}</h4>
        <div className="space-y-1">
          {periodSegments.map((seg) => (
            <div key={seg.periodIdentifier} className="grid grid-cols-3 gap-2 text-xs">
              <div className="font-medium">{fmtPeriod(seg.periodIdentifier)}:</div>
              <div className="text-muted-foreground text-center">{seg.days} / {steps.totalDuration.days} {t('ResultsDisplay.daysLabel')}</div>
              <div className="text-muted-foreground text-right">{formatPercent(seg.proportion, currentLocale)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Split Calculation per Input Amount Section */}
      <section className="bg-muted/40 rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-4">{t('ResultsDisplay.splitCalculation')}</h4>
        <div className="space-y-6">
          {amountCalculations.map((amtCalc, index) => (
            <div
              key={index}
              className="rounded-md border bg-background p-4 space-y-2 transition-shadow hover:shadow-md"
            >
              <div className="font-bold text-[15px] text-primary mb-3 pb-1 border-b border-primary/20 bg-primary/[0.08] -mx-4 px-4 py-2 rounded-t-md">
                {t("ResultsDisplay.inputAmountLabel")} #{index + 1}:{" "}
                {fmtNum(amtCalc.originalAmount)}
              </div>
              <div className="space-y-3">
                {amtCalc.periodSplits.map((ps, periodIndex) => (
                  <div
                    key={ps.periodIdentifier}
                    className={`pl-2 text-xs space-y-0.5 ${periodIndex < amtCalc.periodSplits.length - 1 ? "border-b border-muted/30 pb-2" : ""}`}
                  >
                    <div className="font-medium shrink-0 text-foreground">
                      {fmtPeriod(ps.periodIdentifier)}:
                    </div>
                    <div className="text-muted-foreground ml-2">
                      <span>
                        {fmtNum(amtCalc.originalAmount)} *{" "}
                        {periodSegments
                          .find((s) => s.periodIdentifier === ps.periodIdentifier)
                          ?.proportion.toFixed(6)}
                      </span>
                      <span className="block sm:inline">
                        {" "}
                        = {ps.rawSplit.toFixed(6)}
                      </span>
                    </div>
                    <div className="ml-2 flex items-center gap-x-2">
                      <span>→</span>
                      <span className="font-medium text-foreground">
                        {t("ResultsDisplay.roundedLabel")}:{" "}
                        {fmtNum(ps.roundedSplit)}
                      </span>
                      {ps.adjustment !== 0 && (
                        <span className="text-muted-foreground text-xs">
                          ({t("ResultsDisplay.adjustmentLabel")}:{" "}
                          {fmtNum(ps.adjustment)})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-2 space-y-1 text-xs">
                <p>
                  <span className="font-medium text-foreground">
                    {t("ResultsDisplay.discrepancyLabel")}:
                  </span>
                  <span
                    className={`${Math.abs(amtCalc.discrepancy) > 0.001 ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground/70"}`}
                  >
                    {" "}
                    {fmtNum(amtCalc.discrepancy)}
                  </span>
                  {amtCalc.adjustmentAppliedToPeriod && (
                    <span className="text-muted-foreground">
                      ({t("ResultsDisplay.adjustedInYearLabel")}{/* Consider adjusting this label based on period */}{" "}
                      {fmtPeriod(amtCalc.adjustmentAppliedToPeriod)})
                    </span>
                  )}
                </p>
                <p className="font-semibold text-sm text-foreground pt-1">
                  {t("ResultsDisplay.finalSumLabel")}:{" "}
                  <span className="text-primary">
                    {fmtNum(amtCalc.finalSum)}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
// --- End Calculation Steps Renderer ---

// Original component function
function ResultsDisplayComponent({ results, inputData }: ResultsDisplayProps) {
  const { settings } = useSettings();
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language;
  const {
    totalDays,
    originalTotalAmount,
    adjustedTotalAmount,
    resultsPerAmount,
    aggregatedSplits,
    calculationSteps,
    splitPeriodUsed,
  } = results;

  // State to force re-render when settings change
  const [, setForceUpdate] = useState(0);

  // Listen for settings changes and trigger re-render
  useEffect(() => {
    const handleSettingsChange = () => {
      // Force re-render by updating state
      setForceUpdate((prev) => prev + 1);
    };

    window.addEventListener("settingsChanged", handleSettingsChange);

    return () => {
      window.removeEventListener("settingsChanged", handleSettingsChange);
    };
  }, []);

  // Formatters using settings and locale
  const formatNum = (value: number) =>
    formatNumber(value, currentLocale, settings);
  const formatPct = (value: number) => formatPercent(value, currentLocale);
  const formatDateForDisplay = (date: Date) =>
    formatDateLocale(format(date, "yyyy-MM-dd"), currentLocale);
  const formatPeriodId = (id: string) => formatPeriodIdentifier(id, splitPeriodUsed, currentLocale);

  // Helper to get the correct period header based on split type
  const getPeriodHeader = () => {
      switch (splitPeriodUsed) {
          case 'monthly': return t('ResultsDisplay.monthHeader', { defaultValue: 'Month' });
          case 'quarterly': return t('ResultsDisplay.quarterHeader');
          case 'yearly':
          default: return t('ResultsDisplay.yearHeader');
      }
  };

  // Calculate if there is a notable discrepancy due to rounding
  const discrepancyThreshold = settings.roundingPrecision / 2 + 0.00001; // Add small epsilon
  const discrepancyExists =
    Math.abs(originalTotalAmount - adjustedTotalAmount) > discrepancyThreshold;

  // Add success message component at the top
  const SuccessMessage = () => (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md p-3 mb-6 flex items-center text-green-700 dark:text-green-400 animate-fadeIn">
      <span className="mr-2 text-lg">✅</span>
      <span>
        {t("ResultsDisplay.successMessage", {
          defaultValue:
            "Split completed successfully! Your detailed allocation is ready.",
        })}
      </span>
    </div>
  );

  // Use export functions for handleExportExcel and handleExportPdf even if not currently used
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleExportExcel() {
    // Implementation
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleExportPdf() {
    // Implementation
  }

  return (
    <div className="space-y-6 transition-opacity duration-300 ease-in-out">
      <SuccessMessage />

      {/* --- Summary Card --- */}
      <Card className="overflow-hidden shadow-md border border-border transition-all duration-300 animate-fadeIn">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between border-b pb-2 mb-3">
            <h3 className="text-lg font-semibold text-primary">{t("ResultsDisplay.summaryTitle")}</h3>
            <SettingsModal />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div className="font-medium text-muted-foreground">{t("ResultsDisplay.periodLabel")}</div>
            <div className="text-right font-medium">{formatDateForDisplay(inputData.startDate)} - {formatDateForDisplay(inputData.endDate)}</div>
            
            <div className="font-medium text-muted-foreground">{t("ResultsDisplay.totalDurationLabel")}</div>
            <div className="text-right font-medium">{totalDays} {t("ResultsDisplay.daysLabel")}</div>
            
            <div className="font-medium text-muted-foreground">{t("InvoiceForm.includeEndDateLabel")}</div>
            <div className="text-right font-medium">{inputData.includeEndDate ? t("ResultsDisplay.yesLabel") : t("ResultsDisplay.noLabel")}</div>

            <div className="font-medium text-muted-foreground">{t("InvoiceForm.splitPeriodLabel")}</div>
            <div className="text-right font-medium">
              {splitPeriodUsed === 'yearly' ? t("InvoiceForm.periodYearly") : 
               splitPeriodUsed === 'quarterly' ? t("InvoiceForm.periodQuarterly") : 
               t("InvoiceForm.periodMonthly")}
            </div>

            <div className="font-medium text-muted-foreground">{t("ResultsDisplay.originalTotalLabel")}</div>
            <div className="text-right font-medium text-primary">{formatNum(originalTotalAmount)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Merged Allocation Table */}
      <div className="transition-all duration-300">
        <h3 className="text-lg font-semibold mb-2">
          {t("ResultsDisplay.aggregatedTitle")}
        </h3>

        {/* Stacked View for Mobile (Visible below md breakpoint) */}
        <div className="block md:hidden space-y-3 transition-all duration-300">
          {aggregatedSplits.map((split, index) => (
            <div
              key={`mobile-${split.periodIdentifier}`}
              className="border rounded-md p-3 text-sm bg-muted/20 transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="font-semibold text-base mb-1">{formatPeriodId(split.periodIdentifier)}</div>
              <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
                <span className="text-muted-foreground">
                  {t("ResultsDisplay.daysHeader")}:
                </span>
                <span className="text-right">{split.daysInPeriod}</span>
                <span className="text-muted-foreground">
                  {t("ResultsDisplay.proportionHeader")}:
                </span>
                <span className="text-right">
                  <div className="relative inline-block min-w-[100px] px-2 py-0.5">
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-primary/20 rounded-sm"
                      style={{
                        width: `${split.proportion * 100}%`,
                        maxWidth: "100%",
                      }}
                    />
                    <span className="relative z-10">
                      {formatPct(split.proportion)}
                    </span>
                  </div>
                </span>

                {/* Add all amount columns */}
                {resultsPerAmount.map((amtResult, index) => {
                  const splitAmount = amtResult.splits[split.periodIdentifier]?.splitAmount || 0;
                  return (
                    <React.Fragment key={index}>
                      <span className="text-muted-foreground">
                        {`${t("ResultsDisplay.amountHeader")} #${index + 1}`}:
                      </span>
                      <span className="text-right">
                        {formatNum(splitAmount)}
                      </span>
                    </React.Fragment>
                  );
                })}

                <span className="text-muted-foreground">
                  {t("ResultsDisplay.yearTotalHeader")}:
                </span>
                <span className="text-right font-medium">
                  {formatNum(split.totalSplitAmount)}
                </span>
              </div>
            </div>
          ))}
          {/* Mobile Totals: align as a single card like desktop */}
          <div className="border-t pt-3 mt-3 text-sm transition-all duration-300">
            <div className="border rounded-md p-3 bg-muted/20 font-semibold">
              <div className="font-semibold text-base mb-1">
                {t("ResultsDisplay.totalHeader")}
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
                <span className="text-muted-foreground">
                  {t("ResultsDisplay.daysHeader")}:
                </span>
                <span className="text-right">{totalDays}</span>
                <span className="text-muted-foreground">
                  {t("ResultsDisplay.proportionHeader")}:
                </span>
                <span className="text-right">
                  <div className="relative inline-block min-w-[100px] px-2 py-0.5">
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-primary/20 rounded-sm"
                      style={{
                        width: "100%",
                        maxWidth: "100%",
                      }}
                    />
                    <span className="relative z-10">{formatPct(1)}</span>
                  </div>
                </span>

                {/* Add all amount totals */}
                {resultsPerAmount.map((amtResult, index) => (
                  <React.Fragment key={index}>
                    <span className="text-muted-foreground">
                      {`${t("ResultsDisplay.amountHeader")} #${index + 1}`}:
                    </span>
                    <span className="text-right">
                      {formatNum(amtResult.adjustedTotalAmount)}
                    </span>
                  </React.Fragment>
                ))}

                <span className="text-muted-foreground">
                  {t("ResultsDisplay.yearTotalHeader")}:
                </span>
                <span className="text-right">
                  {formatNum(adjustedTotalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Table View for Desktop (Hidden below md breakpoint) */}
        <div className="hidden md:block overflow-x-auto relative border rounded-md transition-all duration-300">
          <Table>
            <TableHeader>
              <TableRow>
                {/* Use dynamic headers based on split period */}
                <TableHead className="w-[150px]">{getPeriodHeader()}</TableHead>
                <TableHead className="text-right">{t("ResultsDisplay.daysHeader")}</TableHead>
                <TableHead className="text-right">{t("ResultsDisplay.proportionHeader")}</TableHead>
                <TableHead className="text-right">{t("ResultsDisplay.totalSplitAmountHeader")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Map over aggregatedSplits */}
              {aggregatedSplits.map((split) => (
                <TableRow key={split.periodIdentifier}>
                  <TableCell className="font-medium">{formatPeriodId(split.periodIdentifier)}</TableCell>
                  <TableCell className="text-right">{split.daysInPeriod}</TableCell>
                  <TableCell className="text-right">
                      {/* Inline progress bar for proportion */}
                      <div className="relative px-3 py-1 h-8 flex items-center justify-end">
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-primary/20 rounded-sm"
                            style={{
                              width: `${split.proportion * 100}%`,
                              maxWidth: "100%",
                            }}
                          />
                          <span className="relative z-10">{formatPct(split.proportion)}</span>
                      </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatNum(split.totalSplitAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              {/* Use the same headers/structure for the total row */}
              <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                <TableCell className="font-bold">{t("ResultsDisplay.totalHeader")}</TableCell>
                <TableCell className="text-right font-bold">{totalDays}</TableCell>
                <TableCell className="text-right font-bold">
                    {/* Total proportion bar */}
                    <div className="relative px-3 py-1 h-8 flex items-center justify-end">
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-primary/20 rounded-sm"
                          style={{ width: "100%" }}
                        />
                        <span className="relative z-10">{formatPct(1)}</span>
                    </div>
                </TableCell>
                <TableCell className="text-right font-bold text-primary">{formatNum(adjustedTotalAmount)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
        {discrepancyExists && (
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 transition-colors duration-300">
            {t("ResultsDisplay.roundingNote")}
          </p>
        )}
      </div>

      {/* Calculation Steps Accordion */}
      {calculationSteps && (
        <Accordion type="single" collapsible className="w-full space-y-4 transition-all duration-300">
          {/* Detailed Allocation Per Amount (Still defaults to Yearly) */}
          <AccordionItem value="calculation-steps" className="bg-card rounded-lg border border-border shadow-md transition-all duration-300">
            <AccordionTrigger className="px-6 text-base font-semibold text-primary hover:no-underline">
              {t("ResultsDisplay.calculationStepsTitle")}
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-2">
              <CalculationStepsDisplay
                steps={calculationSteps}
                settings={settings}
                splitPeriodUsed={splitPeriodUsed}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}

// Export the memoized version
export const ResultsDisplay = React.memo(ResultsDisplayComponent);
