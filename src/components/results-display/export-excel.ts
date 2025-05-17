import {
  formatDateForDisplay,
  formatNumForDisplay,
  formatPeriodIdForDisplay,
  getPeriodHeader,
} from "./utils";

import { AppSettings } from "@/context/settings-context";
import { CalculationResult } from "@/lib/calculations";
import { InputDataForDisplay } from "./types";
import { format } from "date-fns";

export async function exportToExcel(
  results: CalculationResult,
  inputData: InputDataForDisplay,
  settings: AppSettings,
  totalInputAmount: number,
  totalDurationDays: number,
  totalAggregatedAmount: number,
  splitPeriodUsed: "yearly" | "quarterly" | "monthly",
  currentLocale: string,
  t: (key: string, options?: { defaultValue?: string; values?: Record<string, string | number> }) => string,
): Promise<void> {
  try {
    const XLSX = await import("xlsx");

    // Create a single consolidated sheet for all data
    const workbook = XLSX.utils.book_new();

    // Prepare all data for a single sheet
    const consolidatedData = [];

    // 1. Title and Summary Section
    consolidatedData.push([
      t("ResultsDisplay.summaryTitle", { defaultValue: "Summary" }),
    ]);
    consolidatedData.push([]);
    consolidatedData.push([
      t("ResultsDisplay.periodLabel"),
      `${formatDateForDisplay(inputData.startDate, currentLocale)} - ${formatDateForDisplay(inputData.endDate, currentLocale)}`,
    ]);
    consolidatedData.push([
      t("ResultsDisplay.totalDurationLabel", {
        defaultValue: "Total Duration (days)",
      }),
      `${totalDurationDays} ${t("ResultsDisplay.daysLabel")}`,
    ]);
    consolidatedData.push([
      t("InvoiceForm.includeEndDateLabel", {
        defaultValue: "Include Final Day in Service Period?",
      }),
      inputData.includeEndDate
        ? t("ResultsDisplay.yesLabel", { defaultValue: "Yes" })
        : t("ResultsDisplay.noLabel", { defaultValue: "No" }),
    ]);
    consolidatedData.push([
      t("InvoiceForm.splitPeriodLabel", { defaultValue: "Split Period" }),
      splitPeriodUsed === "yearly"
        ? t("InvoiceForm.periodYearly")
        : splitPeriodUsed === "quarterly"
          ? t("InvoiceForm.periodQuarterly")
          : t("InvoiceForm.periodMonthly"),
    ]);
    consolidatedData.push([
      t("ResultsDisplay.originalTotalLabel", {
        defaultValue: "Total Input Amount:",
      }),
      formatNumForDisplay(totalInputAmount, currentLocale, settings),
    ]);
    consolidatedData.push([]);

    // 2. Allocation Results Section
    consolidatedData.push([
      t("ResultsDisplay.aggregatedTitle", {
        defaultValue: "Allocation per Period",
      }),
    ]);
    consolidatedData.push([]);
    consolidatedData.push([
      getPeriodHeader(splitPeriodUsed, t),
      t("ResultsDisplay.daysHeader"),
      t("ResultsDisplay.proportionHeader"),
      t("ResultsDisplay.amountHeader"),
    ]);

    results.aggregatedSplits?.forEach((split) => {
      consolidatedData.push([
        formatPeriodIdForDisplay(
          split.periodIdentifier,
          splitPeriodUsed,
          currentLocale,
        ),
        split.daysInPeriod,
        split.proportion,
        split.totalSplitAmount,
      ]);
    });

    consolidatedData.push([
      t("ResultsDisplay.totalLabel", { defaultValue: "Total" }),
      totalDurationDays,
      1,
      totalAggregatedAmount,
    ]);
    consolidatedData.push([]);
    consolidatedData.push([]);

    // 3. Detailed Calculation Section
    if (results.calculationSteps) {
      const steps = results.calculationSteps;
      const { periodSegments, amountCalculations } = steps;

      // a. Add title
      consolidatedData.push([
        t("ResultsDisplay.calculationStepsTitle", {
          defaultValue: "View Full Split Calculation",
        }),
      ]);
      consolidatedData.push([]);

      // b. Add total duration section
      consolidatedData.push([t("ResultsDisplay.totalDuration")]);
      consolidatedData.push([
        t("ResultsDisplay.periodLabel"),
        `${formatDateForDisplay(typeof steps.totalDuration.start === "string" ? new Date(steps.totalDuration.start) : steps.totalDuration.start, currentLocale)} - ${formatDateForDisplay(typeof steps.totalDuration.end === "string" ? new Date(steps.totalDuration.end) : steps.totalDuration.end, currentLocale)}`,
      ]);
      consolidatedData.push([
        t("ResultsDisplay.totalDays"),
        `${steps.totalDuration.days} ${steps.totalDuration.included ? t("ResultsDisplay.inclusiveLabel") : t("ResultsDisplay.exclusiveLabel")}`,
      ]);
      consolidatedData.push([]);

      // c. Add proportion calculation
      consolidatedData.push([t("ResultsDisplay.proportionCalculation")]);
      for (const segment of periodSegments) {
        const formattedProportion = segment.proportion.toLocaleString(
          currentLocale,
          {
            style: "percent",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          },
        );
        consolidatedData.push([
          formatPeriodIdForDisplay(
            segment.periodIdentifier,
            splitPeriodUsed,
            currentLocale,
          ),
          `${segment.days} / ${steps.totalDuration.days} = ${formattedProportion}`,
        ]);
      }
      consolidatedData.push([]);

      // d. Add amount calculations
      consolidatedData.push([t("ResultsDisplay.splitCalculation")]);
      consolidatedData.push([]);

      for (let i = 0; i < amountCalculations.length; i++) {
        const amtCalc = amountCalculations[i];
        consolidatedData.push([
          `${t("ResultsDisplay.inputAmountLabel")} #${i + 1}:`,
          formatNumForDisplay(amtCalc.originalAmount, currentLocale, settings),
        ]);

        for (const split of amtCalc.periodSplits) {
          const periodSeg = periodSegments.find(
            (s) => s.periodIdentifier === split.periodIdentifier,
          );
          consolidatedData.push([
            formatPeriodIdForDisplay(
              split.periodIdentifier,
              splitPeriodUsed,
              currentLocale,
            ),
            `${formatNumForDisplay(amtCalc.originalAmount, currentLocale, settings)} × ${periodSeg?.proportion.toFixed(6)} = ${split.rawSplit.toFixed(6)} → ${formatNumForDisplay(split.roundedSplit, currentLocale, settings)}`,
          ]);

          if (split.adjustment !== 0) {
            consolidatedData.push([
              `  ${t("ResultsDisplay.adjustmentLabel")}:`,
              formatNumForDisplay(split.adjustment, currentLocale, settings),
            ]);
          }
        }

        consolidatedData.push([
          t("ResultsDisplay.discrepancyLabel"),
          formatNumForDisplay(amtCalc.discrepancy, currentLocale, settings),
        ]);

        if (amtCalc.adjustmentAppliedToPeriod) {
          consolidatedData.push([
            t("ResultsDisplay.adjustedInYearLabel", {
              defaultValue: "Applied in Year",
            }),
            formatPeriodIdForDisplay(
              amtCalc.adjustmentAppliedToPeriod,
              splitPeriodUsed,
              currentLocale,
            ),
          ]);
        }

        consolidatedData.push([
          t("ResultsDisplay.finalSumLabel"),
          formatNumForDisplay(amtCalc.finalSum, currentLocale, settings),
        ]);

        consolidatedData.push([]);
      }
    }

    // Create the consolidated worksheet with all data
    const consolidatedSheet = XLSX.utils.aoa_to_sheet(consolidatedData);

    // Apply cell formatting for numbers and percentages
    // Find the row range for the allocation results table (skip headers)
    const allocationTableStartRow = 12; // 0-based index for the first data row after headers
    const allocationTableEndRow =
      allocationTableStartRow + (results.aggregatedSplits?.length || 0);

    // Format proportion column (index 2) as percentage
    for (let R = allocationTableStartRow; R < allocationTableEndRow; R++) {
      const propCellRef = XLSX.utils.encode_cell({ c: 2, r: R });
      if (consolidatedSheet[propCellRef]) {
        consolidatedSheet[propCellRef].t = "n";
        consolidatedSheet[propCellRef].z = "0.00%";
      }
    }

    // Format amount column (index 3) with proper decimal places
    for (let R = allocationTableStartRow; R < allocationTableEndRow + 1; R++) {
      // +1 to include total row
      const amtCellRef = XLSX.utils.encode_cell({ c: 3, r: R });
      if (consolidatedSheet[amtCellRef]) {
        consolidatedSheet[amtCellRef].t = "n";
        consolidatedSheet[amtCellRef].z =
          `#,##0.${"0".repeat(settings.decimalPlaces || 2)}`;
      }
    }

    // Add the consolidated sheet to the workbook with a meaningful name
    XLSX.utils.book_append_sheet(
      workbook,
      consolidatedSheet,
      t("ResultsDisplay.consolidatedSheetName", {
        defaultValue: "Invoice Split Report",
      }),
    );

    const filename = `InvoiceSplit_${format(new Date(), "yyyyMMdd")}.xlsx`;
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error("Failed to load xlsx library or export Excel:", error);
    throw new Error("Failed to export Excel. Please try again.");
  }
}
