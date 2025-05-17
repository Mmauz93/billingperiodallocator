import { InputDataForDisplay, JsPDFWithInternal } from "./types";
import { de, enUS } from "date-fns/locale";
import {
  formatDateLocale,
  formatNumber,
  formatPercent,
} from "@/lib/formattingUtils";
import {
  formatPeriodIdForDisplay,
  getPeriodHeader,
} from "./utils";

import { AppSettings } from "@/context/settings-context";
import { CalculationResult } from "@/lib/calculations";
import type { CellHookData } from "jspdf-autotable";
import { format } from "date-fns";

export async function exportToPdf(
  results: CalculationResult,
  inputData: InputDataForDisplay,
  settings: Omit<AppSettings, "locale">,
  totalInputAmount: number,
  totalDurationDays: number,
  totalAggregatedAmount: number,
  splitPeriodUsed: "yearly" | "quarterly" | "monthly",
  currentLocale: string,
  t: (key: string, options?: { defaultValue?: string; values?: Record<string, string | number> }) => string,
): Promise<void> {
  try {
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const doc = new jsPDF() as JsPDFWithInternal;
    let yPos = 20;
    const filename = `InvoiceSplit_${format(new Date(), "yyyyMMdd")}.pdf`;

    // Summary Section
    doc.text(
      `${t("ResultsDisplay.periodLabel")}: ${formatDateLocale(inputData.startDate, currentLocale)} - ${formatDateLocale(inputData.endDate, currentLocale)}`,
      14,
      yPos,
    );
    yPos += 5;
    doc.text(
      `${t("ResultsDisplay.originalTotalLabel", { defaultValue: "Total Input Amount:" })}: ${formatNumber(totalInputAmount, currentLocale, settings)}`,
      14,
      yPos,
    );
    yPos += 15;
    doc.text(
      `${t("ResultsDisplay.totalDurationLabel", { defaultValue: "Total Duration (days)" })}: ${totalDurationDays} ${t("ResultsDisplay.daysLabel")}`,
      14,
      yPos,
    );
    yPos += 5;
    doc.text(
      `${t("InvoiceForm.includeEndDateLabel", { defaultValue: "Include Final Day in Service Period?" })}: ${inputData.includeEndDate ? t("ResultsDisplay.yesLabel", { defaultValue: "Yes" }) : t("ResultsDisplay.noLabel", { defaultValue: "No" })}`,
      14,
      yPos,
    );
    yPos += 5;
    doc.text(
      `${t("InvoiceForm.splitPeriodLabel", { defaultValue: "Split Period" })}: ${splitPeriodUsed === "yearly" ? t("InvoiceForm.periodYearly") : splitPeriodUsed === "quarterly" ? t("InvoiceForm.periodQuarterly") : t("InvoiceForm.periodMonthly")}`,
      14,
      yPos,
    );
    yPos += 5;

    // Allocation Table
    const tableRowsData =
      results.aggregatedSplits?.map((split) => [
        formatPeriodIdForDisplay(
          split.periodIdentifier,
          splitPeriodUsed,
          currentLocale,
        ),
        split.daysInPeriod,
        formatPercent(split.proportion, currentLocale),
        formatNumber(split.totalSplitAmount, currentLocale, settings),
      ]) || [];

    autoTable(doc, {
      head: [
        [
          getPeriodHeader(splitPeriodUsed, t),
          t("ResultsDisplay.daysHeader"),
          t("ResultsDisplay.proportionHeader"),
          t("ResultsDisplay.amountHeader"),
        ],
      ],
      body: tableRowsData,
      foot: [
        [
          t("ResultsDisplay.totalLabel", { defaultValue: "Total" }),
          totalDurationDays,
          formatPercent(1, currentLocale),
          formatNumber(totalAggregatedAmount, currentLocale, settings),
        ],
      ],
      startY: yPos,
      theme: "grid",
      headStyles: {
        // Convert primary color to RGB for PDF
        fillColor: getComputedStyle(document.documentElement)
          .getPropertyValue("--primary")
          .trim()
          .split(" ")
          .map((v, i) => (i === 0 ? parseInt(v) : parseFloat(v) * 2.55))
          .filter((_, i) => i < 3) as [number, number, number],
      },
      footStyles: {
        // Convert muted color to RGB for PDF
        fillColor: getComputedStyle(document.documentElement)
          .getPropertyValue("--muted")
          .trim()
          .split(" ")
          .map((v, i) => (i === 0 ? parseInt(v) : parseFloat(v) * 2.55))
          .filter((_, i) => i < 3) as [number, number, number],
        textColor:
          getComputedStyle(document.documentElement)
            .getPropertyValue("--foreground")
            .trim()
            .split(" ")
            .map((v, i) => (i === 0 ? parseInt(v) : parseFloat(v) * 2.55))
            .filter((_, i) => i < 3)
            .reduce((sum, c) => sum + c, 0) / 3,
        fontStyle: "bold",
      },
      didParseCell: function (data: CellHookData) {
        if (
          data.column.index !== undefined &&
          [1, 2, 3].includes(data.column.index)
        ) {
          data.cell.styles.halign = "right";
        }
      },
    });

    // Calculation Steps Section
    if (results.calculationSteps) {
      const steps = results.calculationSteps;
      const { periodSegments, amountCalculations } = steps;
      yPos = doc.lastAutoTable?.finalY
        ? doc.lastAutoTable.finalY + 15
        : yPos + 50;

      doc.text(
        t("ResultsDisplay.calculationStepsTitle", {
          defaultValue: "View Full Split Calculation",
        }),
        14,
        yPos,
      );
      yPos += 10;

      doc.text(t("ResultsDisplay.totalDuration"), 14, yPos);
      yPos += 7;

      // Use type assertions to handle the string dates from the API
      const startDate = steps.totalDuration.start as string;
      const endDate = steps.totalDuration.end as string;

      doc.text(
        `${t("ResultsDisplay.periodLabel")}: ${formatDateLocale(startDate, currentLocale)} - ${formatDateLocale(endDate, currentLocale)}`,
        20,
        yPos,
      );
      yPos += 5;
      doc.text(
        `${t("ResultsDisplay.totalDays")}: ${steps.totalDuration.days} ${steps.totalDuration.included ? t("ResultsDisplay.inclusiveLabel") : t("ResultsDisplay.exclusiveLabel")}`,
        20,
        yPos,
      );
      yPos += 10;

      doc.text(t("ResultsDisplay.proportionCalculation"), 14, yPos);
      yPos += 7;
      doc.setFontSize(10);

      if (yPos > doc.internal.pageSize.height - 50) {
        doc.addPage();
        yPos = 20;
      }

      for (const segment of periodSegments) {
        doc.text(
          `${formatPeriodIdForDisplay(segment.periodIdentifier, splitPeriodUsed, currentLocale)}: ${segment.days} / ${steps.totalDuration.days} = ${formatPercent(segment.proportion, currentLocale)}`,
          20,
          yPos,
        );
        yPos += 5;
        if (yPos > doc.internal.pageSize.height - 30) {
          doc.addPage();
          yPos = 20;
        }
      }
      yPos += 5;

      doc.text(t("ResultsDisplay.splitCalculation"), 14, yPos);
      yPos += 7;

      for (let i = 0; i < amountCalculations.length; i++) {
        const amtCalc = amountCalculations[i];
        if (yPos > doc.internal.pageSize.height - 70) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(11);
        doc.text(
          `${t("ResultsDisplay.inputAmountLabel")} #${i + 1}: ${formatNumber(amtCalc.originalAmount, currentLocale, settings)}`,
          20,
          yPos,
        );
        yPos += 7;
        doc.setFontSize(10);

        for (const split of amtCalc.periodSplits) {
          const periodSeg = periodSegments.find(
            (s) => s.periodIdentifier === split.periodIdentifier,
          );
          doc.text(
            `${formatPeriodIdForDisplay(split.periodIdentifier, splitPeriodUsed, currentLocale)}:`,
            25,
            yPos,
          );
          yPos += 5;
          doc.text(
            `${formatNumber(amtCalc.originalAmount, currentLocale, settings)} × ${periodSeg?.proportion.toFixed(6)} = ${split.rawSplit.toFixed(6)}`,
            30,
            yPos,
          );
          yPos += 5;
          doc.text(
            `→ ${t("ResultsDisplay.roundedLabel")}: ${formatNumber(split.roundedSplit, currentLocale, settings)}`,
            30,
            yPos,
          );
          yPos += 5;
          if (split.adjustment !== 0) {
            doc.text(
              `${t("ResultsDisplay.adjustmentLabel")}: ${formatNumber(split.adjustment, currentLocale, settings)}`,
              30,
              yPos,
            );
            yPos += 5;
          }
          if (yPos > doc.internal.pageSize.height - 40) {
            doc.addPage();
            yPos = 20;
          }
        }
        doc.text(
          `${t("ResultsDisplay.discrepancyLabel")}: ${formatNumber(amtCalc.discrepancy, currentLocale, settings)}`,
          25,
          yPos,
        );
        yPos += 5;
        if (amtCalc.adjustmentAppliedToPeriod) {
          doc.text(
            `${t("ResultsDisplay.adjustedInYearLabel", { defaultValue: "Applied in Year" })}: ${formatPeriodIdForDisplay(amtCalc.adjustmentAppliedToPeriod, splitPeriodUsed, currentLocale)}`,
            25,
            yPos,
          );
          yPos += 5;
        }
        doc.text(
          `${t("ResultsDisplay.finalSumLabel")}: ${formatNumber(amtCalc.finalSum, currentLocale, settings)}`,
          25,
          yPos,
        );
        yPos += 10;
        if (
          yPos > doc.internal.pageSize.height - 50 &&
          i < amountCalculations.length - 1
        ) {
          doc.addPage();
          yPos = 20;
        }
      }
    }

    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Generated by BillSplitter - ${format(new Date(), "PPpp", { locale: currentLocale === "de" ? de : enUS })}`,
        14,
        doc.internal.pageSize.height - 10,
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 35,
        doc.internal.pageSize.height - 10,
      );
    }
    doc.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
}
