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
import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import type { CellHookData } from 'jspdf-autotable';
import { SettingsModal } from "@/components/settings-modal";
import { format } from "date-fns";
import type { jsPDF } from 'jspdf';
import { useSettings } from "@/context/settings-context";
import { useTranslation } from "react-i18next";

// Define a type for the jsPDF internal object with just the properties we need
type JsPDFWithInternal = jsPDF & {
  internal: {
    getNumberOfPages: () => number;
    pageSize: {
      width: number;
      height: number;
    }
  };
  // Add lastAutoTable property for autoTable plugin
  lastAutoTable?: {
    finalY: number;
  };
};

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
                      ({t("ResultsDisplay.adjustedInYearLabel", { defaultValue: "Applied in Year" })}{" "}
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
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const currentLocale = i18n.language;

  // Ensure we use the splitPeriod from the inputData if available
  const splitPeriodUsed = inputData.splitPeriod || 'yearly';

  // Memoized formatting functions based on current settings and locale
  const formatNum = (value: number | undefined) =>
    value !== undefined ? formatNumber(value, currentLocale, settings) : "";
  const formatPct = (value: number | undefined) => 
    value !== undefined ? formatPercent(value, currentLocale) : "";
  const formatDateForDisplay = (date: Date | undefined) =>
    date ? formatDateLocale(format(date, "yyyy-MM-dd"), currentLocale) : "";
  const formatPeriodId = (id: string) => formatPeriodIdentifier(id, splitPeriodUsed, currentLocale);

  // Function to get appropriate header for the allocation table
  const getPeriodHeader = () => {
      switch (splitPeriodUsed) {
        case 'monthly': return t('ResultsDisplay.monthHeader');
          case 'quarterly': return t('ResultsDisplay.quarterHeader');
          case 'yearly':
          default: return t('ResultsDisplay.yearHeader');
      }
  };

  // Calculate derived values with checks
  const totalDurationDays = results.calculationSteps?.totalDuration?.days ?? 0;
  const totalInputAmount = inputData.amounts.reduce((sum, val) => sum + (isNaN(val) ? 0 : val), 0);
  // Assuming AggregatedPeriodSplit has totalSplitAmount based on previous potential structure
  const totalAggregatedAmount = results.aggregatedSplits?.reduce((sum, s) => sum + (s.totalSplitAmount ?? 0), 0) ?? 0;

  // Export functions (keep implementations as they were)
  function handleExportExcel() { 
      import('xlsx').then(XLSX => {
          // Create multiple sheets for comprehensive data
          const workbook = XLSX.utils.book_new();
          
          // 1. Summary Sheet
          const summaryData = [
              [t("ResultsDisplay.summaryTitle", { defaultValue: "Summary" })],
              [],
              [t("ResultsDisplay.periodLabel"), `${formatDateForDisplay(inputData.startDate)} - ${formatDateForDisplay(inputData.endDate)}`],
              [t("ResultsDisplay.totalDurationLabel", { defaultValue: "Total Duration (days)" }), `${totalDurationDays} ${t("ResultsDisplay.daysLabel")}`],
              [t("InvoiceForm.includeEndDateLabel", { defaultValue: "Include Final Day in Service Period?" }), inputData.includeEndDate ? t("ResultsDisplay.yesLabel", { defaultValue: "Yes" }) : t("ResultsDisplay.noLabel", { defaultValue: "No" })],
              [t("InvoiceForm.splitPeriodLabel", { defaultValue: "Split Period" }), splitPeriodUsed === 'yearly' ? t('InvoiceForm.periodYearly') : splitPeriodUsed === 'quarterly' ? t('InvoiceForm.periodQuarterly') : t('InvoiceForm.periodMonthly')],
              [t("ResultsDisplay.originalTotalLabel", { defaultValue: "Total Input Amount:" }), formatNum(totalInputAmount)]
          ];
          const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
          XLSX.utils.book_append_sheet(workbook, summarySheet, t("ResultsDisplay.inputSummarySheetName", { defaultValue: "Input Summary" }));

          // 2. Allocation Results Sheet
          const excelData = [
              [getPeriodHeader(), t("ResultsDisplay.daysHeader"), t("ResultsDisplay.proportionHeader"), t("ResultsDisplay.amountHeader")],
              ...(results.aggregatedSplits?.map(split => [
                  formatPeriodId(split.periodIdentifier),
                  split.daysInPeriod, // Assuming daysInPeriod exists
                  split.proportion,
                  split.totalSplitAmount // Assuming totalSplitAmount exists
              ]) || []),
              [t("ResultsDisplay.totalLabel", { defaultValue: "Total" }), totalDurationDays, 1, totalAggregatedAmount]
          ];
          const worksheet = XLSX.utils.aoa_to_sheet(excelData);
          
          // Add null check for worksheet['!ref']
          const sheetRef = worksheet['!ref'];
          if (sheetRef) {
            const range = XLSX.utils.decode_range(sheetRef);
            for (let R = range.s.r + 1; R <= range.e.r -1; ++R) { 
                const propCellRef = XLSX.utils.encode_cell({ c: 2, r: R });
                if (worksheet[propCellRef]) {
                    worksheet[propCellRef].t = 'n'; 
                    worksheet[propCellRef].z = '0.00%';
                }
                const amtCellRef = XLSX.utils.encode_cell({ c: 3, r: R });
                if (worksheet[amtCellRef]) {
                    worksheet[amtCellRef].t = 'n';
                    worksheet[amtCellRef].z = `#,##0.${ '0'.repeat(settings.decimalPlaces || 2)}`;
                }
            }
             const totalAmtCellRef = XLSX.utils.encode_cell({ c: 3, r: range.e.r });
             if (worksheet[totalAmtCellRef]) {
                 worksheet[totalAmtCellRef].t = 'n';
                 worksheet[totalAmtCellRef].z = `#,##0.${ '0'.repeat(settings.decimalPlaces || 2)}`;
             }
          }
          
          XLSX.utils.book_append_sheet(workbook, worksheet, t("ResultsDisplay.aggregatedSheetName", { defaultValue: "Aggregated Results" }));
          
          // 3. Detailed Calculation Sheet
          if (results.calculationSteps) {
              const steps = results.calculationSteps;
              const { periodSegments, amountCalculations } = steps;
              const detailsData = [];
              
              // a. Add title
              detailsData.push([t('ResultsDisplay.calculationStepsTitle', { defaultValue: "View Full Split Calculation" })]);
              detailsData.push([]);
              
              // b. Add total duration section
              detailsData.push([t('ResultsDisplay.totalDuration')]);
              detailsData.push([
                  t('ResultsDisplay.periodLabel'), 
                  `${formatDateLocale(steps.totalDuration.start, currentLocale)} - ${formatDateLocale(steps.totalDuration.end, currentLocale)}`
              ]);
              detailsData.push([
                  t('ResultsDisplay.totalDays'),
                  `${steps.totalDuration.days} ${steps.totalDuration.included ? t('ResultsDisplay.inclusiveLabel') : t('ResultsDisplay.exclusiveLabel')}`
              ]);
              detailsData.push([]);

              // c. Add proportion calculation
              detailsData.push([t('ResultsDisplay.proportionCalculation')]);
              for (const segment of periodSegments) {
                  detailsData.push([
                      formatPeriodIdentifier(segment.periodIdentifier, splitPeriodUsed as 'yearly' | 'quarterly' | 'monthly', currentLocale),
                      `${segment.days} / ${steps.totalDuration.days} = ${formatPercent(segment.proportion, currentLocale)}`
                  ]);
              }
              detailsData.push([]);
              
              // d. Add amount calculations
              detailsData.push([t('ResultsDisplay.splitCalculation')]);
              for (let i = 0; i < amountCalculations.length; i++) {
                  const amtCalc = amountCalculations[i];
                  detailsData.push([`${t("ResultsDisplay.inputAmountLabel")} #${i + 1}:`, formatNum(amtCalc.originalAmount)]);
                  
                  for (const split of amtCalc.periodSplits) {
                      const periodSeg = periodSegments.find(s => s.periodIdentifier === split.periodIdentifier);
                      detailsData.push([
                          formatPeriodIdentifier(split.periodIdentifier, splitPeriodUsed as 'yearly' | 'quarterly' | 'monthly', currentLocale),
                          `${formatNum(amtCalc.originalAmount)} × ${periodSeg?.proportion.toFixed(6)} = ${split.rawSplit.toFixed(6)} → ${formatNum(split.roundedSplit)}`
                      ]);
                      
                      if (split.adjustment !== 0) {
                          detailsData.push([
                              t("ResultsDisplay.adjustmentLabel"),
                              formatNum(split.adjustment)
                          ]);
                      }
                  }
                  
                  detailsData.push([
                      t("ResultsDisplay.discrepancyLabel"),
                      formatNum(amtCalc.discrepancy)
                  ]);
                  
                  if (amtCalc.adjustmentAppliedToPeriod) {
                      detailsData.push([
                          t("ResultsDisplay.adjustedInYearLabel", { defaultValue: "Applied in Year" }),
                          formatPeriodIdentifier(amtCalc.adjustmentAppliedToPeriod, splitPeriodUsed as 'yearly' | 'quarterly' | 'monthly', currentLocale)
                      ]);
                  }
                  
                  detailsData.push([
                      t("ResultsDisplay.finalSumLabel"),
                      formatNum(amtCalc.finalSum)
                  ]);
                  
                  detailsData.push([]);
              }
              
              const detailsSheet = XLSX.utils.aoa_to_sheet(detailsData);
              XLSX.utils.book_append_sheet(workbook, detailsSheet, t("ResultsDisplay.detailedSheetName", { defaultValue: "Detailed Breakdown" }));
          }
          
          const filename = `InvoiceSplit_${format(new Date(), 'yyyyMMdd')}.xlsx`;
          XLSX.writeFile(workbook, filename);
      }).catch(error => {
          console.error("Failed to load xlsx library or export Excel:", error);
          alert("Failed to export Excel. Please try again.");
      });
  }

  function handleExportPdf() {
      Promise.all([
          import('jspdf'),
          import('jspdf-autotable')
      ]).then(([{ jsPDF }, { default: autoTable }]) => {
          try {
              const doc = new jsPDF();
              // Track the current Y position for content placement
              let yPos = 20;
              
              // --- 1. Summary Section ---
              doc.setFontSize(14);
              doc.text(t("ResultsDisplay.summaryTitle"), 14, yPos);
              yPos += 10;
              doc.setFontSize(10);
              doc.text(`${t("ResultsDisplay.periodLabel")}: ${formatDateForDisplay(inputData.startDate)} - ${formatDateForDisplay(inputData.endDate)}`, 14, yPos);
              yPos += 5;
              doc.text(`${t("ResultsDisplay.totalDurationLabel", { defaultValue: "Total Duration (days)" })}: ${totalDurationDays} ${t("ResultsDisplay.daysLabel")}`, 14, yPos);
              yPos += 5;
              doc.text(`${t("InvoiceForm.includeEndDateLabel", { defaultValue: "Include Final Day in Service Period?" })}: ${inputData.includeEndDate ? t("ResultsDisplay.yesLabel", { defaultValue: "Yes" }) : t("ResultsDisplay.noLabel", { defaultValue: "No" })}`, 14, yPos);
              yPos += 5;
              doc.text(`${t("InvoiceForm.splitPeriodLabel", { defaultValue: "Split Period" })}: ${splitPeriodUsed === 'yearly' ? t('InvoiceForm.periodYearly') : splitPeriodUsed === 'quarterly' ? t('InvoiceForm.periodQuarterly') : t('InvoiceForm.periodMonthly')}`, 14, yPos);
              yPos += 5;
              doc.text(`${t("ResultsDisplay.originalTotalLabel", { defaultValue: "Total Input Amount:" })}: ${formatNum(totalInputAmount)}`, 14, yPos);
              yPos += 15;
              
              // --- 2. Allocation Table Section ---
              doc.setFontSize(14);
              doc.text(t("ResultsDisplay.aggregatedTitle", { defaultValue: "Allocation per Period" }), 14, yPos);
              yPos += 5;
              const tableColumn = [getPeriodHeader(), t("ResultsDisplay.daysHeader"), t("ResultsDisplay.proportionHeader"), t("ResultsDisplay.amountHeader")];
              const tableRows = results.aggregatedSplits?.map(split => [
                  formatPeriodId(split.periodIdentifier),
                  split.daysInPeriod, // Assuming daysInPeriod exists
                  formatPct(split.proportion),
                  formatNum(split.totalSplitAmount) // Assuming totalSplitAmount exists
              ]) || [];
              const tableFooter = [
                  t("ResultsDisplay.totalLabel", { defaultValue: "Total" }),
                  totalDurationDays,
                  formatPct(1),
                  formatNum(totalAggregatedAmount)
              ];
              // Apply the autoTable plugin to the document
              autoTable(doc, {
                  head: [tableColumn],
                  body: tableRows,
                  foot: [tableFooter],
                  startY: yPos, 
                  theme: 'grid', 
                  headStyles: { fillColor: [46, 90, 140] }, 
                  footStyles: { fillColor: [240, 240, 240], textColor: 40, fontStyle: 'bold' },
                  didParseCell: function (data: CellHookData) { 
                      if (data.column.index !== undefined && [1, 2, 3].includes(data.column.index)) {
                          data.cell.styles.halign = 'right';
                      }
                  }
              });
              
              // --- 3. Full Calculation Details Section ---
              if (results.calculationSteps) {
                  const steps = results.calculationSteps;
                  const { periodSegments, amountCalculations } = steps;
                  
                  // Get final Y position after the table
                  const docWithInternal = doc as unknown as JsPDFWithInternal;
                  yPos = docWithInternal.lastAutoTable?.finalY ? docWithInternal.lastAutoTable.finalY + 15 : yPos + 50;
                  
                  // Add section title
                  doc.setFontSize(14);
                  doc.text(t('ResultsDisplay.calculationStepsTitle', { defaultValue: "View Full Split Calculation" }), 14, yPos);
                  yPos += 10;
                  
                  // a. Total Duration section
                  doc.setFontSize(12);
                  doc.text(t('ResultsDisplay.totalDuration'), 14, yPos);
                  yPos += 7;
                  doc.setFontSize(10);
                  doc.text(`${t('ResultsDisplay.periodLabel')}: ${formatDateLocale(steps.totalDuration.start, currentLocale)} - ${formatDateLocale(steps.totalDuration.end, currentLocale)}`, 20, yPos);
                  yPos += 5;
                  doc.text(`${t('ResultsDisplay.totalDays')}: ${steps.totalDuration.days} ${steps.totalDuration.included ? t('ResultsDisplay.inclusiveLabel') : t('ResultsDisplay.exclusiveLabel')}`, 20, yPos);
                  yPos += 10;
                  
                  // b. Proportion Calculation section
                  doc.setFontSize(12);
                  doc.text(t('ResultsDisplay.proportionCalculation'), 14, yPos);
                  yPos += 7;
                  doc.setFontSize(10);
                  
                  // Check if we need a new page for the proportion calculations
                  if (yPos > docWithInternal.internal.pageSize.height - 50) {
                      doc.addPage();
                      yPos = 20;
                  }
                  
                  for (const segment of periodSegments) {
                      doc.text(`${formatPeriodIdentifier(segment.periodIdentifier, splitPeriodUsed as 'yearly' | 'quarterly' | 'monthly', currentLocale)}: ${segment.days} / ${steps.totalDuration.days} = ${formatPercent(segment.proportion, currentLocale)}`, 20, yPos);
                      yPos += 5;
                      
                      // Add a new page if needed
                      if (yPos > docWithInternal.internal.pageSize.height - 30) {
                          doc.addPage();
                          yPos = 20;
                      }
                  }
                  yPos += 5;
                  
                  // c. Per-Amount Calculations section
                  doc.setFontSize(12);
                  doc.text(t('ResultsDisplay.splitCalculation'), 14, yPos);
                  yPos += 7;
                  
                  for (let i = 0; i < amountCalculations.length; i++) {
                      const amtCalc = amountCalculations[i];
                      
                      // Check if we need a new page for this amount calculation
                      if (yPos > docWithInternal.internal.pageSize.height - 70) {
                          doc.addPage();
                          yPos = 20;
                      }
                      
                      doc.setFontSize(11);
                      doc.text(`${t("ResultsDisplay.inputAmountLabel")} #${i + 1}: ${formatNum(amtCalc.originalAmount)}`, 20, yPos);
                      yPos += 7;
                      doc.setFontSize(10);
                      
                      for (const split of amtCalc.periodSplits) {
                          const periodSeg = periodSegments.find(s => s.periodIdentifier === split.periodIdentifier);
                          doc.text(`${formatPeriodIdentifier(split.periodIdentifier, splitPeriodUsed as 'yearly' | 'quarterly' | 'monthly', currentLocale)}:`, 25, yPos);
                          yPos += 5;
                          doc.text(`${formatNum(amtCalc.originalAmount)} × ${periodSeg?.proportion.toFixed(6)} = ${split.rawSplit.toFixed(6)}`, 30, yPos);
                          yPos += 5;
                          doc.text(`→ ${t("ResultsDisplay.roundedLabel")}: ${formatNum(split.roundedSplit)}`, 30, yPos);
                          yPos += 5;
                          
                          if (split.adjustment !== 0) {
                              doc.text(`${t("ResultsDisplay.adjustmentLabel")}: ${formatNum(split.adjustment)}`, 30, yPos);
                              yPos += 5;
                          }
                          
                          // Add a new page if needed
                          if (yPos > docWithInternal.internal.pageSize.height - 40) {
                              doc.addPage();
                              yPos = 20;
                          }
                      }
                      
                      doc.text(`${t("ResultsDisplay.discrepancyLabel")}: ${formatNum(amtCalc.discrepancy)}`, 25, yPos);
                      yPos += 5;
                      
                      if (amtCalc.adjustmentAppliedToPeriod) {
                          doc.text(`${t("ResultsDisplay.adjustedInYearLabel", { defaultValue: "Applied in Year" })}: ${formatPeriodIdentifier(amtCalc.adjustmentAppliedToPeriod, splitPeriodUsed as 'yearly' | 'quarterly' | 'monthly', currentLocale)}`, 25, yPos);
                          yPos += 5;
                      }
                      
                      doc.text(`${t("ResultsDisplay.finalSumLabel")}: ${formatNum(amtCalc.finalSum)}`, 25, yPos);
                      yPos += 10;
                      
                      // Add a new page if needed
                      if (yPos > docWithInternal.internal.pageSize.height - 50 && i < amountCalculations.length - 1) {
                          doc.addPage();
                          yPos = 20;
                      }
                  }
              }
              
              // Cast to unknown first, then to our specific type to avoid direct type conversion errors
              const docWithInternal = doc as unknown as JsPDFWithInternal;
              const pageCount = docWithInternal.internal.getNumberOfPages();
              doc.setFontSize(8);
              for (let i = 1; i <= pageCount; i++) {
                  doc.setPage(i);
                  doc.text(`Generated by BillSplitter - ${format(new Date(), 'PPpp')}`, 14, docWithInternal.internal.pageSize.height - 10);
                  doc.text(`Page ${i} of ${pageCount}`, docWithInternal.internal.pageSize.width - 35, docWithInternal.internal.pageSize.height - 10);
              }
              const filename = `InvoiceSplit_${format(new Date(), 'yyyyMMdd')}.pdf`;
              doc.save(filename);
          } catch (error) {
              console.error("Error generating PDF:", error);
              alert("Failed to generate PDF. Please try again.");
          }
      }).catch(error => {
          console.error("Failed to load PDF generation libraries:", error);
          alert("Failed to load PDF generation libraries. Please try again.");
      });
  }

                  return (
    <div className="w-full animate-fadeIn">
      {/* Wrap everything except the modal in a single card */}
      <Card className="shadow-lg border border-border/50 overflow-hidden">
        <CardContent className="p-6 space-y-8">
          <Card className="shadow-md border border-border/40 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-semibold text-primary">
                  {t("ResultsDisplay.summaryTitle")}
                </h3>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={t("ResultsDisplay.settingsLabel")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>{t("ResultsDisplay.periodLabel")}</span>
                  <span className="font-medium text-foreground">
                    {formatDateForDisplay(inputData.startDate)} - {" "}
                    {formatDateForDisplay(inputData.endDate)}
                  </span>
            </div>
                <div className="flex justify-between">
                  <span>{t("ResultsDisplay.totalDurationLabel", { defaultValue: "Total Duration (days)" })}</span>
                  <span className="font-medium text-foreground">
                    {totalDurationDays} {t("ResultsDisplay.daysLabel")}
                  </span>
              </div>
                <div className="flex justify-between">
                  <span>{t("InvoiceForm.includeEndDateLabel", { defaultValue: "Include Final Day in Service Period?" })}</span>
                  <span className="font-medium text-foreground">
                    {inputData.includeEndDate ? t("ResultsDisplay.yesLabel", { defaultValue: "Yes" }) : t("ResultsDisplay.noLabel", { defaultValue: "No" })}
                </span>
                </div>
                <div className="flex justify-between">
                  <span>{t("InvoiceForm.splitPeriodLabel", { defaultValue: "Split Period" })}</span>
                  <span className="font-medium text-foreground">
                     {splitPeriodUsed === 'yearly' && t('InvoiceForm.periodYearly')}
                     {splitPeriodUsed === 'quarterly' && t('InvoiceForm.periodQuarterly')}
                     {splitPeriodUsed === 'monthly' && t('InvoiceForm.periodMonthly')}
                </span>
                  </div>
                 <div className="flex justify-between pt-2 border-t border-border/30">
                  <span className="font-semibold text-foreground">{t("ResultsDisplay.originalTotalLabel", { defaultValue: "Total Input Amount:" })}</span>
                  <span className="font-semibold text-foreground">
                    {formatNum(totalInputAmount)}
                </span>
              </div>
            </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-border/40 overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6 pb-4 border-b text-primary">
                {t("ResultsDisplay.aggregatedTitle", { defaultValue: "Allocation per Period" })}
              </h3>
          <Table>
            <TableHeader>
              <TableRow>
                    <TableHead>{getPeriodHeader()}</TableHead>
                <TableHead className="text-right">{t("ResultsDisplay.daysHeader")}</TableHead>
                <TableHead className="text-right">{t("ResultsDisplay.proportionHeader")}</TableHead>
                    <TableHead className="text-right">{t("ResultsDisplay.amountHeader")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                  {results.aggregatedSplits?.map((split, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-foreground whitespace-nowrap">
                        {formatPeriodId(split.periodIdentifier)}
                  </TableCell>
                      {/* Assuming AggregatedPeriodSplit has daysInPeriod */}
                      <TableCell className="text-right text-muted-foreground">{split.daysInPeriod}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatPct(split.proportion)}</TableCell>
                      {/* Assuming AggregatedPeriodSplit has totalSplitAmount */}
                      <TableCell className="text-right font-medium text-foreground">{formatNum(split.totalSplitAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
                  <TableRow>
                    <TableCell>{t("ResultsDisplay.totalLabel", { defaultValue: "Total" })}</TableCell>
                    <TableCell className="text-right font-semibold text-foreground">{totalDurationDays}</TableCell>
                    <TableCell className="text-right font-semibold text-foreground">{formatPct(1)}</TableCell>
                    <TableCell className="text-right font-semibold text-foreground">{formatNum(totalAggregatedAmount)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
            </CardContent>
          </Card>

          {/* Calculation Details Accordion */}
          <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border rounded-lg shadow-md bg-card overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-primary hover:bg-muted/40">
                      {t('ResultsDisplay.calculationStepsTitle', { defaultValue: "View Full Split Calculation" })}
            </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 bg-background border-t">
                      {results.calculationSteps ? (
                          <CalculationStepsDisplay steps={results.calculationSteps} settings={settings} splitPeriodUsed={splitPeriodUsed}/>
                      ) : (
                          <p>{t('ResultsDisplay.noStepsAvailable')}</p>
                      )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

          {/* Export Buttons Section */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-border/30">
            <Button
                variant="outline"
                onClick={handleExportExcel}
                className="w-full sm:w-auto"
            >
                 <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                </svg>
                {t('ResultsDisplay.exportExcelButton')}
            </Button>
            <Button
                variant="outline"
                onClick={handleExportPdf}
                className="w-full sm:w-auto"
            >
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                </svg>
                {t('ResultsDisplay.exportPdfButton')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Modal remains outside the main card */}
      <SettingsModal isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}

// Wrapper component to provide context
export function ResultsDisplay(props: ResultsDisplayProps) {
  // Provide Settings context if it's not already provided higher up
  // This assumes ResultsDisplay might be used where context isn't available
  // but in this app, SettingsProvider is in layout.tsx, so it's likely redundant
  // const { settings } = useSettings();
  // if (!settings) { 
  //  return <SettingsProvider><ResultsDisplayComponent {...props} /></SettingsProvider>
  // }
  return (
    //<SettingsProvider> Remove if already provided in layout
      <ResultsDisplayComponent {...props} />
    //</SettingsProvider>
  );
}
